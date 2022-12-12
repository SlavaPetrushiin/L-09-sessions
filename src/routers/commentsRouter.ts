import { checkError } from './../utils/checkError';
import { QueryRepository } from './../repositories/query-db-repository';
import { CommentsService } from './../services/comments_service';
import { checkBearerAuth } from './../utils/checkBearerAuth';
import express, {Request, Response} from 'express';
import { commentValidator } from '../validators/commentValidator';

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



