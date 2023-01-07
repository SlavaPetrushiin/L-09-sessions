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

	public async getSession(iat: string, userId: string, deviceId: string, ip: string): Promise<ApiTypes.IAuthDevicesSessions | null> {
		try {
			return authDevicesSessions.findOne({lastActiveDate: iat, userId, deviceId, ip }, { projection: { _id: false,  } });
		} catch (error) {
			console.error(`Error => Not Session for userId: ${userId} and deviceId: ${deviceId}`);
			return null;
		}
	}

	public async getSessions(userId: string): Promise<ApiTypes.IAuthDevicesSessions[] | null> {
		try {
			return authDevicesSessions.find({ userId}, { projection: { _id: false,  exp: false, userId: false } }).toArray();
		} catch (error) {
			console.error(`Error => Not Sessions for userId: ${userId}`);
			return null;
		}
	}

	public async removeSession (userId: string, deviceId: string): Promise<boolean>{
		try {
			let res = await  authDevicesSessions.deleteOne({userId, deviceId});
			console.log("REMOVE SESSION!!!: ", res);
			return res.deletedCount > 0 ? true : false;
		} catch (error) {
			console.error(`Error => Not Remove Session for userId: ${userId} and deviceId: ${deviceId}`);
			return false;
		}
	}

	public async removeAllSessionsUserNotCurrent (userId: string, deviceId: string): Promise<boolean>{
		try {
			let res = await  authDevicesSessions.deleteMany({userId,  deviceId: {$ne: deviceId} });
			return res.deletedCount > 0 ? true : false;
		} catch (error) {
			console.error(`Error => Not Remove user sessions for userId: ${userId} and deviceId: ${deviceId}`);
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

	public async getDevice(deviceId: string, userId: string, ip: string): Promise<ApiTypes.IAuthDevicesSessions | null>{
		return await  authDevicesSessions.findOne({deviceId, userId, ip });
	}
}

export const AuthSessionsRepository = new AuthDevicesSessions();