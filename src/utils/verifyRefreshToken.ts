import { RefreshTokensRepository } from './../repositories/refreshToken-db-repository';
import { ClientsRepository } from './../repositories/clients-db-repository';
import { ServiceJWT } from './../services/jwt_service';
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

export const verifyRefreshToken = async (req: Request<{}, {}, { accessToken: string }>, res: Response, next: NextFunction) => {
	let refreshToken = req.cookies.refreshToken;

	if (!refreshToken) {
		return res.sendStatus(401);
	};

	const isRefreshCodeExist = await RefreshTokensRepository.checkRefreshTokenInDB(refreshToken)
	console.log(isRefreshCodeExist)
	if (!isRefreshCodeExist) return res.sendStatus(401)

	const userId = await ServiceJWT.getUserIdByToken(refreshToken, process.env.REFRESH_JWT_SECRET!);

	if (!userId) {
		console.log('token expired');
		return res.sendStatus(401);
	};

	

	let user = await ClientsRepository.getUSerByID(userId);

	if (!user) {
		return res.sendStatus(401);
	}

	req.user = {
		email: user?.email!,
		login: user?.login!,
		userId: user?.id!
	};
	next();
}