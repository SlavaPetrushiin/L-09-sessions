import { checkError } from './../utils/checkError';
import { QueryRepository } from './../repositories/query-db-repository';
import { CommentsService } from './../services/comments_service';
import { checkBearerAuth } from './../utils/checkBearerAuth';
import express, {Request, Response} from 'express';
import { commentValidator } from '../validators/commentValidator';
import { checkQueryCommentsByPostID, ICommentsByPostID } from '../utils/checkQueryCommentsByPostID';

export const routerComments = express.Router();

routerComments.get('/', async (req: Request<{id: string}>, res) => {
	let comments = await QueryRepository.getComments();
	if(!comments){
		return res.sendStatus(404)
	}

	res.send(comments)
})

routerComments.get('/:id',async (req: Request<{id: string}>, res) => {
	let id = req.params.id;
	let comment = await QueryRepository.getOneComment(id);
	if(!comment){
		return res.sendStatus(404)
	}

	res.send(comment)
})

routerComments.put('/:commentId', checkBearerAuth, commentValidator, checkError, async (req: Request<{commentId: string}, {}, {content: string}>, res: Response) => {
	let commentId = req.params.commentId;
	let content = req.body.content;

	let comment = await QueryRepository.getOneComment(commentId);

	if(!comment){
		return res.sendStatus(404);
	}

	if(comment.userId != req.user!.userId){
		return res.sendStatus(403);
	}

	let isUpdatedComment = CommentsService.updateComment(commentId, content, req.user!);

	if(!isUpdatedComment){
		return res.sendStatus(404);
	}

	res.sendStatus(204);
})

routerComments.delete('/:commentId', checkBearerAuth, async (req: Request<{commentId: string}>, res) => {
	let commentId = req.params.commentId;
	let comment = await QueryRepository.getOneComment(commentId);

	if(!comment){
		return res.sendStatus(404);
	}

	if(comment.userId != req.user!.userId){
		return res.sendStatus(403);
	}

	let isDeleted = await CommentsService.deleteComment(commentId);

	if(!isDeleted){
		return res.sendStatus(404);
	}

	res.sendStatus(204);
})

routerComments.get('/:postId/comments', checkQueryCommentsByPostID,  async (req: Request<{postId: string}, {}, {}, ICommentsByPostID>, res: Response) => {
	let {postId} = req.params;
	let {pageNumber,pageSize, sortBy, sortDirection} = req.query;

	let foundedPost = await QueryRepository.getOnePost(postId);

	if(!foundedPost){
		return res.sendStatus(404);
	}
	
	let comments = await QueryRepository.getCommentsByPostID({pageNumber: pageNumber!, pageSize: pageSize!, sortBy: sortBy!, sortDirection: sortDirection!}, postId)

	res.status(200).send(comments);
})

routerComments.post('/:postId/comments', checkBearerAuth, commentValidator, checkError, async (req: Request<{postId: string}, {}, {content: string}>, res: Response) => {
	let {postId} = req.params;
	let {content} = req.body;

	let user = req.user;
	
	let foundedPost = await QueryRepository.getOnePost(postId);

	if(!foundedPost){
		return res.sendStatus(404);
	}

	let createdComment = await CommentsService.createComments(user!, content, postId);
	if(!createdComment){
		return res.sendStatus(404);
	}
	

	res.status(201).send(createdComment);
})



