import { body, } from "express-validator";

export const commentValidator = [
	body("content").isString().trim().isLength({min: 20, max: 300}).withMessage("Контент не валидный"),
];


