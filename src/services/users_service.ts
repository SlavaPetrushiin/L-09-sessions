import { ClientsRepository } from './../repositories/clients-db-repository';
import { QueryRepository } from './../repositories/query-db-repository';
import { ApiTypes } from "../types/types";
const bcrypt = require('bcrypt');

type ResponseCreateUser = Promise<Omit<ApiTypes.IUserDB, 'hasPassword'> | null>;

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
		return await bcrypt.compare(password, hash);
	} catch (error) {
		console.error(error);
	}

	return false;
}

export class UsersService {
	static async login(login: string, password: string): Promise<ApiTypes.IUserDB | null> {
		let user = await QueryRepository.getUser({ login });
		if (!user) {
			return null;
		}

		let isValidPass = await comparePassword(password, user.hasPassword);

		if (!isValidPass) {
			return null;
		}

		return user;
	}

	static async createUser(email: string, login: string, password: string): ResponseCreateUser {
		const id = new Date().getMilliseconds().toString();
		const createdAt = new Date().toISOString();
		const hasPass = await hasPassword(password);

		if (!hasPass) {
			return null;
		}

		const newUser: ApiTypes.IClientDB = {
			email,
			login,
			id,
			createdAt,
			hasPassword: hasPass,
			emailConfirmation: {
				code: "",
				expirationData: new Date(),
				isConfirmed: false
			}
		};

		const isCreatedUser = await ClientsRepository.createClient(newUser);
		return isCreatedUser ? { email, login, id, createdAt } : null;
	}

	static async deleteUser(id: string): Promise<boolean> {
		return ClientsRepository.deleteUser(id);
	}

	static async deleteUsers(): Promise<boolean> {
		return ClientsRepository.deleteUsers();
	}
}