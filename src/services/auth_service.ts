import { ModifyResult } from 'mongodb';
import { ApiTypes } from "../types/types";
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';
import { ClientsRepository } from '../repositories/clients-db-repository';
import { Email } from '../lib/email';
import { PasswordRecoveryRepository } from '../repositories/password-recovery-repository';
const bcrypt = require('bcrypt');

type TypeUrlMessage = "registration" | "recoveryCode";
const URL_TEXT = {
	registration: {
		title: "Thank for your registration",
		text: "To finish registration please follow the link below:",
		textLink: "complete registration"
	},
	recoveryCode: {
		title: "Password recovery",
		text: "To finish password recovery please follow the link below:",
		textLink: "recovery password"
	}
}

function getUrlWithCode(url: string, code: string, typeMessage: TypeUrlMessage): string {
	return `
			<h1>${URL_TEXT[typeMessage].title}</h1>
			<p>${URL_TEXT[typeMessage].text}
				<a href='https://somesite.com/${url}=${code}'>${URL_TEXT[typeMessage].textLink}</a>
		</p>
	`;
}

async function hasPassword(password: string): Promise<string | null> {
	try {
		const salt = await bcrypt.genSalt(10)
		return await bcrypt.hash(password, salt);
	} catch (error) {
		console.error(error);
	}
	return null;
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
	try {
		return bcrypt.compare(password, hash);
	} catch (error) {
		console.error(error);
		return false;
	}
}

type RegistrationResponse = Omit<ApiTypes.IClientDB, 'hasPassword' | 'emailConfirmation'> | null;
export class AuthService {
	static async login(loginOrEmail: string, password: string): Promise<ApiTypes.IClientDB | null> {
		let user = await ClientsRepository.getClientByEmailOrLogin(loginOrEmail);
		if (!user) {
			return null;
		}

		let isValidPass = await comparePassword(password, user.hasPassword);

		if (!isValidPass) {
			return null;
		}
		return user;
	}

	static async registration(login: string, email: string, password: string): Promise<RegistrationResponse> {
		let isFoundedCandidate = await ClientsRepository.getClientByEmailOrLogin(login, email);

		if (isFoundedCandidate) {
			return null;
		}

		const passwordHash = await hasPassword(password);
		const id = new Date().getMilliseconds().toString();
		const createdAt = new Date().toISOString();
		if (!passwordHash) {
			return null;
		}
		const code = uuidv4()

		let client: ApiTypes.IClientDB = {
			email,
			login,
			id,
			createdAt,
			hasPassword: passwordHash,
			emailConfirmation: {
				code: code,
				expirationData: add(new Date(), { hours: 1, minutes: 3 }),
				isConfirmed: false
			}
		}

		let isCreatedClient = await ClientsRepository.createClient(client);

		if (!isCreatedClient) {
			return null;
		}
		let url = getUrlWithCode('confirm-email?code', code, "registration");
		const isSentEmail = await Email.sendEmail(client.email, url);

		return {
			id: client.id,
			login: client.login,
			email: client.email,
			createdAt: client.createdAt
		};
	}

	static async confirmCode(code: string): Promise<ModifyResult<ApiTypes.IClientDB> | null> {
		let client = await ClientsRepository.getClientByCode(code);
		if (!client) return null;
		if (client.emailConfirmation.code != code) return null;
		if (client.emailConfirmation.isConfirmed) return null;
		if (new Date() > client.emailConfirmation.expirationData) return null;

		let isUpdateConfirm = await ClientsRepository.updateConfirmation(client.id);

		if (!isUpdateConfirm) {
			return null;
		}

		return isUpdateConfirm;
	}

	static async confirmResending(emailOrLogin: string): Promise<ModifyResult<ApiTypes.IClientDB> | null> {
		let client = await ClientsRepository.getClientByEmailOrLogin(emailOrLogin);
		if (!client) return null;
		if (client.emailConfirmation.isConfirmed) return null;

		let newCode = uuidv4();
		let newExpirationData = add(new Date(), { hours: 1, minutes: 3 });
		let isUpdatedClient = await ClientsRepository.updateClient(client.id, newCode, newExpirationData);

		if (!isUpdatedClient) {
			return null;
		}

		let url = getUrlWithCode('confirm-registration?code', newCode, "registration");
		await Email.sendEmail(client.email, url);

		// if (!isResendingCode) {
		// 	return null;
		// }

		return isUpdatedClient;
	}

	static async passwordRecovery(email: string) {
		let recoveryCode = uuidv4();
		let dateExpired = add(new Date(), { hours: 1 })
		let isCreatedRecovery = await PasswordRecoveryRepository.createPasswordRecovery(recoveryCode, email, dateExpired);

		if (!isCreatedRecovery) {
			return null;
		}

		let url = getUrlWithCode('password-recovery?recoveryCode', recoveryCode, "recoveryCode");
		await Email.sendEmail(email, url);
		return isCreatedRecovery;
	}

	static async updatePassword(newPassword: string, recoveryCode: string): Promise<ModifyResult<ApiTypes.IClientDB> | null> {
			let foundedRecoveryObject = await PasswordRecoveryRepository.getRecoveryPassword(recoveryCode);
			if (!foundedRecoveryObject) {
				return null;
			}
			if (new Date() > foundedRecoveryObject.dateExpired) {
				return null;
			}

			let user = await ClientsRepository.getClientByEmailOrLogin(foundedRecoveryObject.email);
			if (!user) {
				return null;
			}

			const passwordHash = await hasPassword(newPassword);

			if(!passwordHash){
				return null;
			}

			const isUpdatedPassword = await  ClientsRepository.updatePassword(user.id, passwordHash);

			if(!isUpdatedPassword){
				return null;
			}

			return isUpdatedPassword
	}
}