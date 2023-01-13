import { ApiTypes } from "../types/types";
import { passwordRecovery } from "./db";

class PasswordRecovery {
	public async createPasswordRecovery(recoveryCode: string, email: string, dateExpired: Date): Promise<boolean> {
		try {
			const query = { email};
			const update = { $set: { recoveryCode, dateExpired } };
			const options = { upsert: true };
			let result = await passwordRecovery.updateOne(query, update, options);
			return result.acknowledged;
		} catch (error) {
			console.error("Cannot created recovery password");
			return false;
		}
	}

	public async getRecoveryPassword(recoveryCode: string): Promise<ApiTypes.IPasswordRecovery | null> {
		try {
			return passwordRecovery.findOne({recoveryCode});
		} catch (error) {
			return null;
		}
	}
}

export const PasswordRecoveryRepository = new PasswordRecovery();
