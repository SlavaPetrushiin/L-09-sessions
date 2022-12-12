import { RefreshTokensRepository } from './../repositories/refreshToken-db-repository';
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.ACCESS_JWT_SECRET || 'sdfwpsvd';
const EXPIRES_ACCESS_TIME = '10s';
const EXPIRES_REFRESH_TIME = '20s';

export interface TokenInterface {
	userId: string;
}

export class ServiceJWT {
	static async addJWT(userId: string): Promise<string | null> {
		try {
			let token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: EXPIRES_ACCESS_TIME });
			return token;
		} catch (error) {
			return null;
		}
	}


	static async updateRefreshToken(userId: string, ipAddress: string): Promise<{ accessToken: string, refreshToken: string } | null> {
		try {
			const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: EXPIRES_ACCESS_TIME });
			const token = jwt.sign({ userId }, process.env.REFRESH_JWT_SECRET!, { expiresIn: EXPIRES_REFRESH_TIME })
			const refreshToken = {
				user: userId,
				token: token,
				createdByIp: ipAddress
			}

			await RefreshTokensRepository.updateRefreshToken(refreshToken);

			return { accessToken, refreshToken: refreshToken.token };
		} catch (error) {
			return null;
		}
	}

	// async testUpdate

	static async getUserIdByToken(token: string, secretKey: string): Promise<string | null> {
		try {
			const decoded = jwt.verify(token, secretKey) as TokenInterface;
			return decoded.userId;
		} catch (error) {
			return null;
		}
	}

	static async removeRefreshToken(userId: string) {
		return RefreshTokensRepository.removeRefreshTokenByUserID(userId);
	}

}

