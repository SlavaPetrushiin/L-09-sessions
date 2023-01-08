import { authDevicesSessions, logCollection } from './../repositories/db';
import { AuthSessionsRepository } from '../repositories/auth-devises-sessions';
import { verifyRefreshToken } from './../utils/verifyRefreshToken';
import express, { Request, Response } from "express";

export const routerSecurity = express.Router();

routerSecurity.get("/devices", verifyRefreshToken, async (req: Request, res: Response) => {
	console.log("GET DEVICES");
	let authSession = req.authDeviceSession;
	console.log("GET DEVICES USER ID: ", authSession.userId);
	let allSessions = await AuthSessionsRepository.getSessions(authSession.userId);


	res.send(allSessions);
})

routerSecurity.delete("/devices", verifyRefreshToken, async (req: Request, res: Response) => {
	let authSession = req.authDeviceSession;
	let allSessions = await AuthSessionsRepository.removeAllSessionsUserNotCurrent(authSession.userId, authSession.deviceId);

	res.send(allSessions);
})

routerSecurity.delete("/devices/:deviceId", verifyRefreshToken, async (req: Request<{ deviceId: string }>, res: Response) => {
	let authSession = req.authDeviceSession;
	let { deviceId } = req.params;
	let foundedDevice = await AuthSessionsRepository.getDevice(deviceId);

	if (!foundedDevice) {
		return res.sendStatus(404);
	}
	if (authSession.userId != foundedDevice.userId) {

		return res.sendStatus(403);
	}

	let devices = await authDevicesSessions.find().toArray();
	console.log("/DEVICES/:deviceId: ", deviceId);
	console.log("BEFORE DEVICES DELETED: ", devices);

	let isDeletedSessions = await AuthSessionsRepository.removeSession(authSession.userId, deviceId);
	console.log("userId: ", authSession.userId);
	console.log("isDeleted: ", isDeletedSessions);
	if (!isDeletedSessions) {
		return res.sendStatus(401);
	}
	
	let delDevices = await authDevicesSessions.find().toArray();
	console.log("AFTER DEVICES DELETED: ", delDevices);

	res.sendStatus(204);
})

