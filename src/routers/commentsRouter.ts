import { getUserIdByAccessToken } from './../utils/getUserIdByAccessToken';
import { checkError } from './../utils/checkError';
import { checkBearerAuth } from './../utils/checkBearerAuth';
import express from 'express';
import { commentValidator } from '../validators/commentValidator';
import { checkQueryCommentsByPostID, } from '../utils/checkQueryCommentsByPostID';
import { commentsController } from '../controllers/CommentsController';
import { likeStatusValidator } from '../validators/likesValidator';

export const routerComments = express.Router();

routerComments.get(
	'/',
	commentsController.getComments.bind(commentsController)
);

routerComments.get(
	'/:id',
	getUserIdByAccessToken,
	commentsController.getComment.bind(commentsController)
);

routerComments.put(
	'/:commentId',
	checkBearerAuth,
	commentValidator,
	checkError,
	commentsController.updateComment.bind(commentsController)
);

routerComments.put(
	'/:commentId/like-status',
	checkBearerAuth,
	likeStatusValidator,
	checkError,
	commentsController.addLikeOrDislike.bind(commentsController)
);

routerComments.delete(
	'/:commentId',
	checkBearerAuth,
	commentsController.deleteComment.bind(commentsController)
);
