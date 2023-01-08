import { clientsCollection } from './../repositories/db';
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

		let user = await ClientsRepository.getUSerByID(userId);
		let users = await clientsCollection.find({}).toArray();

		if (!user) {
			return res.sendStatus(401);
		}

		let authSessions = await AuthSessionsRepository.getSession(convertJwtPayloadSecondsToIsoDate(iat!), userId, deviceId);
		
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
