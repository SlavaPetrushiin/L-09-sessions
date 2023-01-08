import { authDevicesSessions, clientsCollection } from './../repositories/db';
import * as dotenv from 'dotenv';
dotenv.config();
import { AuthSessionsRepository } from './../repositories/auth-devises-sessions';
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import { IRefreshTokenPayload, convertJwtPayloadSecondsToIsoDate } from "../services/jwt_service";
import { ClientsRepository } from '../repositories/clients-db-repository';

export const verifyRefreshToken = async (req: Request<{}, {}, { accessToken: string }>, res: Response, next: NextFunction) => {
	try {
		let refreshToken = req.cookies.refreshToken;


		if (!refreshToken) {
			return res.sendStatus(401);
		};

		let decoded = await <IRefreshTokenPayload>jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET!);
		let { userId, deviceId, iat } = decoded;
		console.log("userId, deviceId, iat: ", userId, deviceId, iat);

		let user = await ClientsRepository.getUSerByID(userId);

		if (!user) {
			return res.sendStatus(401);
		}

		let authSessions = await AuthSessionsRepository.getSession(convertJwtPayloadSecondsToIsoDate(iat!), userId, deviceId);
		const devices = await authDevicesSessions.find({}).toArray()
		// console.log("userId: ", userId)
		// console.log("authSessions: ", authSessions)
		// console.log("devices: ", devices)
		if (!authSessions) {
			return res.sendStatus(401);
		}

		req.authDeviceSession = authSessions;
		next();
	} catch (error) {
		console.error("Not valid refresh token");
		return res.sendStatus(401);
	}
}


let b = [
	'1d673792-6f2b-4201-bd06-c6dec95ab3ff',
	'1e5a9c6b-5061-4ad9-9524-5f579a3b71b6',
	'60e443b6-7ff0-4ec8-8510-11776eefa720',
	'e78ad326-4afa-4e7c-afee-0ec12ad804df'
]

let a = [
	'1e5a9c6b-5061-4ad9-9524-5f579a3b71b6',
	'60e443b6-7ff0-4ec8-8510-11776eefa720',
	'e78ad326-4afa-4e7c-afee-0ec12ad804df'
]