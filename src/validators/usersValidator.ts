import { ClientsRepository } from './../repositories/clients-db-repository';
import { body } from "express-validator";

const checkEmail = (email: string) => {
	let pattern = new RegExp('^[\w\.]+@([\w-]+\.)+[\w-]{2,4}$');
	return pattern.test(email);
}

const checkEmailOrLogin = async (emailOrLogin: string) => {
	let client = await ClientsRepository.getClientByEmailOrLogin(emailOrLogin);
	if (client) {
		console.log("ERROR-checkEmailOrLogin: ", emailOrLogin);
		return Promise.reject();
	}
}

export const loginValidator = [
	body("loginOrEmail").isString().isLength({ min: 3, max: 10 }).withMessage("Указан невалидный логин или пароль"),
	body("password").isString().isLength({ min: 6, max: 20 }).withMessage("Указан невалидный логин или пароль"),
]

export const userValidator = [
	body("login")
		.isString()
		.isLength({ min: 3, max: 10 })
		.withMessage("login должен быть от 3 до 10 символов")
		.custom(checkEmailOrLogin)
		.withMessage("Пользователь с таким логином существует"),
	body("password").isString().isLength({ min: 6, max: 20 }).withMessage("Пароль должен быть от 6 до 20 символов"),
	body("email")
		.isString()
		.isEmail()
		.withMessage("Укажите валидный email")
		.custom(checkEmailOrLogin)
		.withMessage("Пользователь с таким email существует"),
];