import { ClientsRepository } from './../repositories/clients-db-repository';
import { QueryRepository } from './../repositories/query-db-repository';
import { UsersService } from './../services/users_service';
import { ServiceJWT } from './../services/jwt_service';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

export const checkBearerAuth = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.headers.authorization) {
		return res.sendStatus(401);
	}

	let token = req.headers.authorization!.split(" ")[1] || "";
	const userId = await ServiceJWT.getUserIdByToken(token, process.env.ACCESS_JWT_SECRET!); 

	if(!userId){
		return res.sendStatus(401);
	}

	let user = await ClientsRepository.getUSerByID(userId);

	if(!user){
		return res.sendStatus(401);
	}

	req.user = {email: user?.email!, login: user?.login!, userId: user?.id!};	

	next();
}