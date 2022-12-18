import { Request, Response, NextFunction } from 'express';
import { badPractice } from '../repositories/db';
import { ApiTypes } from '../types/types';
import { add } from 'date-fns';

const DURING_SECONDS = 3600;
const MAX_COUNT = 5;

export const verifyNumberAttempts = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const ipAddress = req.ip;	
		const iat = new Date().getTime();
		const exp = add(iat, {hours: 1}).getTime() //iat + DURING_SECONDS;
		const currentDate = new Date().getTime();
		console.log("ipAddress: ", ipAddress);

		console.log("iat: ", iat);
		console.log("exp: ", exp);
		console.log("currentDate: ", currentDate);
	
		const foundedBadPractice = await badPractice.findOne({ipAddress});
		console.log("ipAddress: ", foundedBadPractice);

		if(!foundedBadPractice){
			const newBadPractice: ApiTypes.IBadPractice = { iat, exp, count: 1, ipAddress };
			await badPractice.insertOne(newBadPractice);
			return next();
		}
		
		//Founded BadPractice
		if(foundedBadPractice.count < MAX_COUNT && currentDate < foundedBadPractice.exp){
			await badPractice.updateOne({ipAddress}, {$inc: {count: 1}});
			return next();
		}

		if(foundedBadPractice.count < MAX_COUNT && currentDate > foundedBadPractice.exp){
			const newBadPractice: ApiTypes.IBadPractice = { iat, exp, count: 1, ipAddress };
			await badPractice.insertOne(newBadPractice);
			return next();
		}

		if(foundedBadPractice.count >= MAX_COUNT && currentDate < foundedBadPractice.exp){
			return res.sendStatus(429);
		}
		
	} catch (error) {
		console.error("Error: VerifyNumberAttempts");
		return res.sendStatus(429);
	}
}