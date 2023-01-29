import { AuthSessionsRepository } from './../repositories/auth-devises-sessions';
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
import { add, getUnixTime } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { ApiTypes } from '../types/types';
import { logCollection } from '../repositories/db';
dotenv.config();

const JWT_SECRET = process.env.ACCESS_JWT_SECRET || 'sdfwpsvd';
const EXPIRES_ACCESS_TIME = "10h" //'10s';
const EXPIRES_REFRESH_TIME = "20h" //'20s';

export interface TokenInterface {
	userId: string;
}

export interface IRefreshTokenPayload extends jwt.JwtPayload {
	userId: string;
	deviceId: string;
}

export const convertJwtPayloadSecondsToIsoDate = (value: number): string => {
	return new Date(value * 1000).toISOString();
}

export class ServiceJWT {
	static async createSessionWithToken(userId: string, ipAddress: string, title: string): Promise<{ accessToken: string, refreshToken: string } | null> {
		try {

			const deviceId = uuidv4();
			const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: EXPIRES_ACCESS_TIME });
			const refreshToken = jwt.sign({ userId, deviceId: deviceId }, process.env.REFRESH_JWT_SECRET!, { expiresIn: EXPIRES_REFRESH_TIME });
			const decodedRefreshToken = <IRefreshTokenPayload>jwt.decode(refreshToken);

			const authDeviceSession: ApiTypes.IAuthDevicesSessions = {
				ip: ipAddress,
				title,
				lastActiveDate: convertJwtPayloadSecondsToIsoDate(decodedRefreshToken.iat!),
				exp: convertJwtPayloadSecondsToIsoDate(decodedRefreshToken.exp!),
				deviceId: deviceId,
				userId: userId,
			}
			const result = await AuthSessionsRepository.createSession(authDeviceSession);

			if (!result) {
				return null;
			}

			return { accessToken, refreshToken };
		} catch (error) {

			return null;
		}
	}

	static async updateSessionWithToken(authSession: ApiTypes.IAuthDevicesSessions): Promise<{ accessToken: string, refreshToken: string } | null> {
		try {
			const accessToken = jwt.sign({ userId: authSession.userId }, JWT_SECRET, { expiresIn: EXPIRES_ACCESS_TIME });
			const refreshToken = jwt.sign({ userId: authSession.userId, deviceId: authSession.deviceId }, process.env.REFRESH_JWT_SECRET!, { expiresIn: EXPIRES_REFRESH_TIME });
			const decodedRefreshToken = <IRefreshTokenPayload>jwt.decode(refreshToken);

			const result = await AuthSessionsRepository.updateSession({
				oldLastActiveDate: authSession.lastActiveDate,
				lastActiveDate: convertJwtPayloadSecondsToIsoDate(decodedRefreshToken.iat!),
				exp: convertJwtPayloadSecondsToIsoDate(decodedRefreshToken.exp!),
			});

			if (!result) {
				return null;
			}

			return { accessToken, refreshToken };
		} catch (error) {
			console.error("Not updated refresh token: " + error);
			return null;
		}
	}

	static async removeRefreshToken(authSession: ApiTypes.IAuthDevicesSessions): Promise<boolean> {
		let { deviceId, userId } = authSession;
		return AuthSessionsRepository.removeSession(userId, deviceId);
	}

	static async getUserIdByToken(token: string, secretKey: string): Promise<string | null> {
		try {
			const decoded = jwt.verify(token, secretKey) as TokenInterface;
			return decoded.userId;
		} catch (error) {
			return null;
		}
	}
}

