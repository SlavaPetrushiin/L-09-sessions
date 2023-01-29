import { dictionary as D } from './../types/dictionary';
import { body, } from "express-validator";


export const likeStatusValidator = [
	body("likeStatus").isString().custom((status: D.StatusLike) => Object.values(D.StatusLike).includes(status)).withMessage("Не валидный статус лайка/дизлайка")
]