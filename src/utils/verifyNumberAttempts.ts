import { Request, Response, NextFunction } from 'express';
import { badPractice } from '../repositories/db';
import { ApiTypes } from '../types/types';
import { add } from 'date-fns';

const DURING_SECONDS = 10;
const MAX_COUNT = 5;

export const verifyNumberAttempts = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const ipAddress = req.ip;	
		const iat = new Date().getTime();
		const exp = add(iat, {seconds: DURING_SECONDS}).getTime() //iat + DURING_SECONDS;
		const currentDate = new Date().getTime();

	
		const foundedBadPractice = await badPractice.findOne({ipAddress});

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

		console.log("WEEEEEEE WWWWWWWW");
		next();		
	} catch (error) {
		console.error("Error: VerifyNumberAttempts");
		return res.sendStatus(429);
	}
}