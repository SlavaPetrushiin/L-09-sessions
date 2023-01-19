import { checkError } from './../utils/checkError';
import { checkBearerAuth } from './../utils/checkBearerAuth';
import express from 'express';
import { commentValidator } from '../validators/commentValidator';
import { checkQueryCommentsByPostID, } from '../utils/checkQueryCommentsByPostID';
import { commentsController } from '../controllers/CommentsController';

export const routerComments = express.Router();

routerComments.get(
	'/',
	commentsController.getComments
);

routerComments.get(
	'/:id',
	commentsController.getComment
);

routerComments.put(
	'/:commentId',
	checkBearerAuth,
	commentValidator,
	checkError,
	commentsController.updateComment
);

routerComments.delete(
	'/:commentId',
	checkBearerAuth,
	commentsController.deleteComment
);
