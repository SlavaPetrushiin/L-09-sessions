import { ApiTypes } from "../types/types";
import { authDevicesSessions } from "./db";

class AuthDevicesSessions {
	public async createOrUpdateSession(dataSession: ApiTypes.IAuthDevicesSessions): Promise<boolean> {
		try {
			let result = await authDevicesSessions.updateOne(
				{ userId: dataSession.userId, deviceID: dataSession.deviceID },
				{ $set: { ...dataSession } },
				{ upsert: true }
			);
			return result.acknowledged;
		} catch (error) {
			console.error(`Error => Not create Session: ${dataSession}`);
			return false;
		}
	}

	public async getSession(userId: string, deviceID: string): Promise<ApiTypes.IAuthDevicesSessions | null> {
		try {
			return authDevicesSessions.findOne({ userId, deviceID }, { projection: { _id: false } });
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

	public async getSessions(userId?: string): Promise<ApiTypes.IAuthDevicesSessions[]>{
		let sessions = await  authDevicesSessions.find({userId}).toArray();
		return sessions.filter(s => (new Date().getTime() / 1000) <= s.exp);
	}

	public async getDevice(deviceID: string): Promise<ApiTypes.IAuthDevicesSessions | null>{
		return await  authDevicesSessions.findOne({deviceID});
	}
}

export const AuthSessionsRepository = new AuthDevicesSessions();