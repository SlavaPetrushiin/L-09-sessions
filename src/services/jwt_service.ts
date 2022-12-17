import { AuthSessionsRepository } from './../repositories/auth-devises-sessions';
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
import { add, getUnixTime } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { ApiTypes } from '../types/types';
dotenv.config();

const JWT_SECRET = process.env.ACCESS_JWT_SECRET || 'sdfwpsvd';
const EXPIRES_ACCESS_TIME = "1h" //'10s';
const EXPIRES_REFRESH_TIME = "2h" //'20s';

export interface TokenInterface {
	userId: string;
}

export interface IRefreshTokenPayload extends jwt.JwtPayload {
	userId: string;
	deviceID: string;
}

export class ServiceJWT {
	static async createSessionWithToken(userId: string, ipAddress: string,): Promise<{ accessToken: string, refreshToken: string } | null> {
		try {
			const deviceID = uuidv4();
			const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: EXPIRES_ACCESS_TIME });
			const refreshToken = jwt.sign({ userId, deviceID: deviceID }, process.env.REFRESH_JWT_SECRET!, { expiresIn: EXPIRES_REFRESH_TIME });
			const decodedRefreshToken = <IRefreshTokenPayload>jwt.decode(refreshToken);

			const authDeviceSession: ApiTypes.IAuthDevicesSessions = {
				iat: decodedRefreshToken.iat!,
				exp: decodedRefreshToken.exp!,
				deviceID: deviceID,
				ipAddress: ipAddress,
				userId: userId,
			}

			const result = await AuthSessionsRepository.createOrUpdateSession(authDeviceSession);

			if (!result) {
				return null;
			}

			return { accessToken, refreshToken };
		} catch (error) {
			return null;
		}
	}

	static async updateSessionWithToken(authSession: ApiTypes.IAuthDevicesSessions, ipAddress: string,): Promise<{ accessToken: string, refreshToken: string } | null> {
		try {
			const accessToken = jwt.sign({ userId: authSession.userId }, JWT_SECRET, { expiresIn: EXPIRES_ACCESS_TIME });
			const refreshToken = jwt.sign({ userId: authSession.userId, deviceID: authSession.deviceID }, process.env.REFRESH_JWT_SECRET!, { expiresIn: EXPIRES_REFRESH_TIME });
			const decodedRefreshToken = <IRefreshTokenPayload>jwt.decode(refreshToken);

			const authDeviceSession: ApiTypes.IAuthDevicesSessions = {
				iat: decodedRefreshToken.iat!,
				exp: decodedRefreshToken.exp!,
				deviceID: authSession.deviceID,
				ipAddress: ipAddress,
				userId: authSession.userId,
			}

			const result = await AuthSessionsRepository.createOrUpdateSession(authDeviceSession);

			if (!result) {
				return null;
			}

			return { accessToken, refreshToken };
			return null
		} catch (error) {
			return null;
		}
	}

	static async removeRefreshToken(authSession: ApiTypes.IAuthDevicesSessions): Promise<boolean> {
		let { deviceID, userId } = authSession;
		return AuthSessionsRepository.removeSession(userId, deviceID);
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

