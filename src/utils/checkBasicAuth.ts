import { Request, Response, NextFunction } from 'express';

const credentials = { secretName: "admin", secretPassword: "qwerty" };

export const checkBasicAuth = (req: Request, res: Response, next: NextFunction) => {
	if (!req.headers.authorization) {
		res.sendStatus(401);
	}
	let typeAuth = req.headers.authorization!.split(" ")[0] || "";
	let params = req.headers.authorization!.split(" ")[1] || "";

	let [name, password] = Buffer.from(params, 'base64').toString().split(':');
	


	if (typeAuth == 'Basic' && name === credentials.secretName && password === credentials.secretPassword) {
		return next();
	}

	return res.sendStatus(401);
}