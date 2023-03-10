import { authDevicesSessions, logCollection } from './../repositories/db';
import { AuthSessionsRepository } from '../repositories/auth-devises-sessions';
import { verifyRefreshToken } from './../utils/verifyRefreshToken';
import express, { Request, Response } from "express";

export const routerSecurity = express.Router();

routerSecurity.get("/devices", verifyRefreshToken, async (req: Request, res: Response) => {
	let authSession = req.authDeviceSession;
	let allSessions = await AuthSessionsRepository.getSessions(authSession.userId);

	res.send(allSessions);
})

routerSecurity.delete("/devices", verifyRefreshToken, async (req: Request, res: Response) => {
	let authSession = req.authDeviceSession;
	await AuthSessionsRepository.removeAllSessionsUserNotCurrent(authSession.userId, authSession.deviceId);

	res.sendStatus(204);
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


	let isDeletedSessions = await AuthSessionsRepository.removeSession(authSession.userId, deviceId);
	if (!isDeletedSessions) {
		return res.sendStatus(401);
	}

	res.sendStatus(204);
})

