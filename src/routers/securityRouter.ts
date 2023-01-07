import { logCollection } from './../repositories/db';
import { AuthSessionsRepository } from '../repositories/auth-devises-sessions';
import { verifyRefreshToken } from './../utils/verifyRefreshToken';
import express, { Request, Response } from "express";

export const routerSecurity = express.Router();

routerSecurity.get("/devices", verifyRefreshToken, async (req: Request, res: Response) => {
	logCollection.insertOne({
		url: "/devices",
		authSession: req.authDeviceSession
	})
	let authSession = req.authDeviceSession;
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
	let foundedDevice = await AuthSessionsRepository.getDevice(deviceId, authSession.userId, authSession.ip);
	console.log("deviceId: ", deviceId);
	console.log("authSession: ", authSession);
	console.log("foundedDevice: ", foundedDevice);
	if (!foundedDevice) {
		return res.sendStatus(404);
	}
	if (authSession.userId != foundedDevice.userId) {
		console.log(`NOT authSession: ${authSession.userId} != ${foundedDevice.userId}`);
		return res.sendStatus(403);
	}
	console.log("authSession.userId: ", authSession.userId);
	console.log("authSession.deviceId: ", authSession.deviceId);
	let isDeletedSessions = await AuthSessionsRepository.removeSession(authSession.userId, authSession.deviceId);
	if (!isDeletedSessions) {
		return res.sendStatus(401);
	}

	res.sendStatus(204);
})

