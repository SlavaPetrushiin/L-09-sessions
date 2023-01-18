import { Request, Response, NextFunction } from 'express';
import { badPractice } from '../repositories/db';
import { addSeconds } from 'date-fns';

const secsToBlock = 10;
const connectionsLimit = 5;

export const verifyNumberAttempts = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const ip = req.ip;
		const connectionUrl = req.url;
		const connectionDate = new Date();
		const blockTimeout = addSeconds(connectionDate, -secsToBlock);

		const attemptsCount = await badPractice.countDocuments({ ip, connectionUrl, connectionDate: { $gte: blockTimeout } });

		if (attemptsCount + 1 > connectionsLimit) {
			return res.sendStatus(429);
		}
		
		await badPractice.create({ ip, connectionUrl, connectionDate });
		return next();
	} catch (error) {
		console.error("Error: VerifyNumberAttempts");
		return res.sendStatus(401);
	}
}