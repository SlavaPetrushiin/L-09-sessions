import { ClientsRepository } from './../repositories/clients-db-repository';
import { ServiceJWT } from './../services/jwt_service';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

export const checkAccessToken = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.headers.authorization) {	
		return next();
	}
	let token = req.headers.authorization!.split(" ")[1] || "";
	const userId = await ServiceJWT.getUserIdByToken(token, process.env.ACCESS_JWT_SECRET!); 

	if(!userId){
		return next();
	}

	let user = await ClientsRepository.getUSerByID(userId);

	if(!user){
		return next();
	}

	req.user = {email: user?.email!, login: user?.login!, userId: user?.id!};	

	next();
}