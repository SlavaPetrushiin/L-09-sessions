import { emailValidator, passwordValidator } from './../validators/usersValidator';
import { checkBearerAuth } from './../utils/checkBearerAuth';
import { checkError, checkErrorAuth } from './../utils/checkError';
import express, { Request, Response } from 'express';
import { loginValidator, userValidator } from '../validators/usersValidator';
import { ServiceJWT } from '../services/jwt_service';
import { AuthService } from '../services/auth_service';
import { verifyRefreshToken } from '../utils/verifyRefreshToken';
import { verifyNumberAttempts } from '../utils/verifyNumberAttempts';
import { logCollection } from '../repositories/db';
export const routerAuth = express.Router();

interface ILogin {
	password: string;
	loginOrEmail: string;
}

interface IRegistration {
	password: string;
	login: string;
	email: string;
}

const MILLISECONDS_IN_HOUR = 3_600_000;
const MAX_AGE_COOKIE_MILLISECONDS = 20 * MILLISECONDS_IN_HOUR; //MILLISECONDS_IN_HOUR * 20 //20_000;

routerAuth.get('/me', checkBearerAuth, async (req: Request<{}, {}, ILogin>, res: Response) => {
	let user = req.user;
	res.send(user);
})

routerAuth.post('/login', verifyNumberAttempts, async (req: Request<{}, {}, ILogin>, res: Response) => {
	const { loginOrEmail, password } = req.body;
	const ipAddress = req.ip;
	const title = req.headers['user-agent'] || "";
	let user = await AuthService.login(loginOrEmail, password);
	if (!user) {
		return res.sendStatus(401);
	}

	const tokens = await ServiceJWT.createSessionWithToken(user.id, ipAddress, title);

	if (!tokens) {
		return res.sendStatus(401);
	}

	res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, maxAge: MAX_AGE_COOKIE_MILLISECONDS, secure: true })
	return res.status(200).send({ accessToken: tokens.accessToken });
})

routerAuth.post('/password-recovery', verifyNumberAttempts, emailValidator, checkError, async (req: Request<{}, {}, { email: string }>, res: Response) => {
	let email = req.body.email;
	let result = await AuthService.passwordRecovery(email);

	res.sendStatus(204);
})

routerAuth.post('/new-password', verifyNumberAttempts, passwordValidator, checkError, async (req: Request<{}, {}, { newPassword: string, recoveryCode: string }>, res: Response) => {
	let { newPassword, recoveryCode } = req.body;
	let isUpdatedPassword = await await AuthService.updatePassword(newPassword, recoveryCode);

	if (!isUpdatedPassword) {
		return res.status(400).send({
			"errorsMessages": [
				{
					"field": "newPassword",
					"message": "Обновите код"
				}
			]
		});
	}

	res.sendStatus(204);
})

routerAuth.post('/registration', userValidator, checkError, verifyNumberAttempts, async (req: Request<{}, {}, IRegistration>, res: Response) => {
	let { login, password, email } = req.body;
	let result = await AuthService.registration(login, email, password);

	if (!result) {
		res.sendStatus(400);
		return;
	}

	res.sendStatus(204);
})

routerAuth.post('/registration-confirmation', verifyNumberAttempts, async (req: Request<{}, {}, { code: string }>, res: Response) => {
	let { code } = req.body;
	let result = await AuthService.confirmCode(code);
	if (!result) {
		res.status(400).send({
			"errorsMessages": [
				{
					"message": "Не валидный код",
					"field": "code"
				}
			]
		});
		return;
	}

	res.sendStatus(204);
})

routerAuth.post('/registration-email-resending', verifyNumberAttempts, async (req: Request<{}, {}, { email: string }>, res: Response) => {
	let { email } = req.body;
	let result = await AuthService.confirmResending(email);

	if (!result) {
		res.status(400).send({
			"errorsMessages": [
				{
					"message": "Нет такого email",
					"field": "email"
				}
			]
		});
		return;
	}

	res.sendStatus(204);
})

routerAuth.post('/refresh-token', verifyRefreshToken, async (req: Request<{}, {}, { accessToken: string }>, res: Response) => {
	let authSession = req.authDeviceSession;
	let isUpdatedTokens = await ServiceJWT.updateSessionWithToken(authSession);
	if (!isUpdatedTokens) {
		return res.sendStatus(401);
	}

	return res
		.cookie('refreshToken', isUpdatedTokens.refreshToken, { httpOnly: true, maxAge: MAX_AGE_COOKIE_MILLISECONDS, secure: true })
		.status(200)
		.send({ accessToken: isUpdatedTokens.accessToken });
})

routerAuth.post('/logout', verifyRefreshToken, async (req: Request, res: Response) => {
	let authSession = req.authDeviceSession;
	let isLogout = await ServiceJWT.removeRefreshToken(authSession);

	if (!isLogout) {
		return res.sendStatus(401);
	}

	delete req.cookies.refreshToken;
	res.sendStatus(204);
})