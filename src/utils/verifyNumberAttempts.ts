import { Request, Response, NextFunction } from 'express';
import { badPractice } from '../repositories/db';
import { ApiTypes } from '../types/types';
import { add, addSeconds } from 'date-fns';

const DURING_SECONDS = 10;
const MAX_COUNT = 5;

export const verifyNumberAttempts = async (req: Request, res: Response, next: NextFunction) => {
	const ip = req.ip
	const connectionUrl = req.url
	const connectionDate = new Date()

	const secsToBlock = 10
	const connectionsLimit = 5
	const blockTimeout = addSeconds(connectionDate, -secsToBlock)

	const attemptsCount = await badPractice.countDocuments({ip, connectionUrl, connectionDate: {$gte: blockTimeout}})

	if (attemptsCount + 1 > connectionsLimit) {
		return res.sendStatus(429)
	}
	await badPractice.insertOne({ip, connectionUrl, connectionDate})
	return next()
	// try {
	// 	const ipAddress = req.ip;
	// 	const iat = new Date().getTime();
	// 	const exp = add(iat, { seconds: DURING_SECONDS }).getTime() //iat + DURING_SECONDS;
	// 	const timeClearBadPractice =  add(iat, { seconds: DURING_SECONDS * 2 }).getTime();
	// 	const currentDate = new Date().getTime();

	// 	const foundedBadPractice = await badPractice.findOne({ ipAddress });

	// 	if (!foundedBadPractice) {
	// 		const newBadPractice: ApiTypes.IBadPractice = { iat, exp, count: 1, ipAddress };
	// 		await badPractice.insertOne(newBadPractice);
	// 		return next();
	// 	}

	// 	if (currentDate > foundedBadPractice.exp) {
	// 		await badPractice.updateOne({ ipAddress }, { $set: { iat, exp, count: 1 } });
	// 		return next();
	// 	}

	// 	//Founded BadPractice
	// 	let nextCount = foundedBadPractice.count + 1;

	// 	if (nextCount <= MAX_COUNT) { 
	// 		await badPractice.updateOne({ ipAddress }, { $inc: { count: 1 } });
	// 		return next();
	// 	}

	// 	if (nextCount > MAX_COUNT) {			// && exp < timeClearBadPractice
	// 		await badPractice.deleteOne({ ipAddress });
	// 		return res.sendStatus(429);
	// 	}

	// 	next();
	// } catch (error) {
	// 	console.error("Error: VerifyNumberAttempts");
	// 	return res.sendStatus(429);
	// }
}