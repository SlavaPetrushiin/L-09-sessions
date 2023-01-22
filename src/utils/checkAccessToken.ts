import jwt from 'jsonwebtoken';
import { IRefreshTokenPayload } from './../services/jwt_service';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

export const getUserByCookie = async (req: Request, res: Response, next: NextFunction) => {
	try {
		let refreshToken = req.cookies.refreshToken;
		console.log(refreshToken);
		console.log(req.cookies);

		if (!refreshToken) {
			return next();
		};

		let decoded = await <IRefreshTokenPayload>jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET!);
		let { userId } = decoded;

		console.log("userId: ", userId);
		req.userId = userId;

		next();
	} catch (error) {
		console.error("Not refreshToken in cookies");
		return res.sendStatus(401);
	}
}