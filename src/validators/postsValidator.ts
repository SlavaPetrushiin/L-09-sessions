import { QueryRepository } from './../repositories/query-db-repository';
import { body, CustomValidator  } from "express-validator";

export const checkBlogID: CustomValidator = async (blogId: string) =>{
	let foundedBlog = await QueryRepository.getOneBlog(blogId);
	if(!foundedBlog){
		console.log("ERROR");
		return Promise.reject();
	}
}

export const createAndUpdatePostsValidator = [
	body("title").isString().trim().isLength({min: 1, max: 30}).withMessage("Укажите заголовок"),
	body("shortDescription").trim().isString().isLength({min: 1, max: 100}).withMessage("Укажите краткое описание"),
	body("content").isString().trim().isLength({min: 1, max: 1000}).withMessage("Напишите пост"),
	body("blogId").isString().trim().custom(checkBlogID).withMessage("Укажите ID блога"),
];