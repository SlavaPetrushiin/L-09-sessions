import { checkBlogID } from './postsValidator';
import { body, CustomValidator, param } from "express-validator";

const  checkUrl: CustomValidator =(url: string) => {
	let pattern = new RegExp('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$');
	return pattern.test(url);
}

export const createAndUpdateBlogValidator = [
	body("name").isString().trim().isLength({min: 1, max: 15}).withMessage("В названии блога должно быть от 1 до 15 символов"),
	body("websiteUrl").isString().trim().isLength({min: 1, max: 100}).custom(checkUrl).withMessage("Укажите валидную ссылку"),
	body("description").isString().trim().isLength({min: 1, max: 500}).withMessage("В описание должно быть не более 500 симвловов")
];

export const checkBlogValidator = [
	body("title").isString().trim().isLength({min: 1, max: 30}).withMessage("В заголовке должно быть от 1 до 30 символов"),
	body("shortDescription").trim().isString().isLength({min: 1, max: 100}).withMessage("В описание должно быть от 1 до 100 символов"),
	body("content").isString().trim().isLength({min: 1, max: 1000}).withMessage("Напишите пост"),
]

export const isExistsBlogValidator = [
	param("id").custom(checkBlogID).withMessage("Блога не существет"),
]
