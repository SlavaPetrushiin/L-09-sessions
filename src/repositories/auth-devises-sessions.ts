import { ApiTypes } from "../types/types";
import { authDevicesSessions } from "./db";


interface IPramsForUpdateRefreshToken {
	oldLastActiveDate: string;
	lastActiveDate: string;
	exp: string;
} 
class AuthDevicesSessions {
	public async createSession(dataSession: ApiTypes.IAuthDevicesSessions): Promise<boolean> {
		try {
			let result = await authDevicesSessions.insertOne(dataSession);
			return result.acknowledged;
		} catch (error) {
			console.error(`Error => Not create Session: ${dataSession}`);
			return false;
		}
	}

	public async getSession(iat: string, userId: string, deviceID: string): Promise<ApiTypes.IAuthDevicesSessions | null> {
		try {
			return authDevicesSessions.findOne({lastActiveDate: iat, userId, deviceID }, { projection: { _id: false } });
		} catch (error) {
			console.error(`Error => Not Session for userId: ${userId} and deviceID: ${deviceID}`);
			return null;
		}
	}

	public async removeSession (userId: string, deviceID: string): Promise<boolean>{
		try {
			let res = await  authDevicesSessions.deleteOne({userId, deviceID});
			return res.deletedCount > 0 ? true : false;
		} catch (error) {
			console.error(`Error => Not Remove Session for userId: ${userId} and deviceID: ${deviceID}`);
			return false;
		}
	}

	public async removeAllSessionsUserNotCurrent (userId: string, deviceID: string): Promise<boolean>{
		try {
			let res = await  authDevicesSessions.deleteMany({userId,  deviceID: {$ne: deviceID} });
			return res.deletedCount > 0 ? true : false;
		} catch (error) {
			console.error(`Error => Not Remove user sessions for userId: ${userId} and deviceID: ${deviceID}`);
			return false;
		}
	}

	public async updateSession(params: IPramsForUpdateRefreshToken){
		try {
			let res = await  authDevicesSessions.updateOne({lastActiveDate: params.oldLastActiveDate}, {$set: {lastActiveDate: params.lastActiveDate, exp: params.exp}});
			if (res.matchedCount == 0) {
				return false;
			}
			return true;
		} catch (error) {
			console.error(`Error => Not update refresh token`);
			return false;
		}
	}

	public async getDevice(deviceID: string): Promise<ApiTypes.IAuthDevicesSessions | null>{
		return await  authDevicesSessions.findOne({deviceID});
	}
}

export const AuthSessionsRepository = new AuthDevicesSessions();