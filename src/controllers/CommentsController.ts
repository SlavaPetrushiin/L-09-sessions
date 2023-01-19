import { QueryRepository } from './../repositories/query-db-repository';
import { CommentsService } from './../services/comments_service';
import  { Request, Response } from 'express';
import {  ICommentsByPostID } from '../utils/checkQueryCommentsByPostID';

export class CommentsController {
	CommentsService: CommentsService;

	constructor() {
		this.CommentsService = new CommentsService()
	}

	async getComments(req: Request<{ id: string }>, res: Response) {
		let comments = await QueryRepository.getComments();
		if (!comments) {
			return res.sendStatus(404);
		}
		res.send(comments);
	}

	async getComment(req: Request<{ id: string }>, res: Response) {
		let id = req.params.id;
		let comment = await QueryRepository.getOneComment(id);
		if (!comment) {
			return res.sendStatus(404)
		}
		res.send(comment);
	}

	async updateComment(req: Request<{ commentId: string }, {}, { content: string }>, res: Response){
		let commentId = req.params.commentId;
		let content = req.body.content;
	
		let comment = await QueryRepository.getOneComment(commentId);
	
		if (!comment) {
			return res.sendStatus(404);
		}
	
		if (comment.userId != req.user!.userId) {
			return res.sendStatus(403);
		}
	
		let isUpdatedComment = this.CommentsService.updateComment(commentId, content, req.user!);
	
		if (!isUpdatedComment) {
			return res.sendStatus(404);
		}
	
		res.sendStatus(204);
	}

	async deleteComment(req: Request<{ commentId: string }>, res: Response){
		let commentId = req.params.commentId;
		let comment = await QueryRepository.getOneComment(commentId);
	
		if (!comment) {
			return res.sendStatus(404);
		}
	
		if (comment.userId != req.user!.userId) {
			return res.sendStatus(403);
		}
	
		let isDeleted = await this.CommentsService.deleteComment(commentId);
	
		if (!isDeleted) {
			return res.sendStatus(404);
		}
	
		res.sendStatus(204);
	}

	async getCommentByPostId(req: Request<{ postId: string }, {}, {}, ICommentsByPostID>, res: Response) {
		let { postId } = req.params;
		let { pageNumber, pageSize, sortBy, sortDirection } = req.query;
	
		let foundedPost = await QueryRepository.getOnePost(postId);
	
		if (!foundedPost) {
			return res.sendStatus(404);
		}
	
		let comments = await QueryRepository.getCommentsByPostID({ pageNumber: pageNumber!, pageSize: pageSize!, sortBy: sortBy!, sortDirection: sortDirection! }, postId);
	
		res.status(200).send(comments);
	}

	async createCommentByPostId (req: Request<{ postId: string }, {}, { content: string }>, res: Response) {
		let { postId } = req.params;
		let { content } = req.body;
	
		let user = req.user;
	
		let foundedPost = await QueryRepository.getOnePost(postId);
	
		if (!foundedPost) {
			return res.sendStatus(404);
		}
		
		let createdComment = await this.CommentsService.createComments(user!, content, postId);
		if (!createdComment) {
			return res.sendStatus(404);
		}
	
	
		res.status(201).send(createdComment);
	}
}

export const commentsController = new CommentsController();