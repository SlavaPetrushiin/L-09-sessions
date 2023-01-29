import jwt from 'jsonwebtoken';
import { IRefreshTokenPayload, ServiceJWT } from '../services/jwt_service';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { ClientsRepository } from '../repositories/clients-db-repository';
dotenv.config();

export const getUserIdByAccessToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		
		if (!req.headers.authorization) {
			req.userId = null;
			return next();
		}
		;
		let accessToken = req.headers.authorization!.split(" ")[1] || "";
		const userId = await ServiceJWT.getUserIdByToken(accessToken, process.env.ACCESS_JWT_SECRET!); 
		
		if(!userId){
			req.userId = null;
			return next();
		}
		
		let user = await ClientsRepository.getUSerByID(userId);

		if (!user) {
			req.userId = null;
			return next();
		}

		req.userId = userId;
		req.user = {userId: userId, email: user.email, login: user.login}
		next();
	} catch (error) {
		console.error("Not refreshToken in cookies");
		return res.sendStatus(401);
	}
}