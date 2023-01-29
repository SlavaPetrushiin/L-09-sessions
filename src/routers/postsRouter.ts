import express from 'express';
import { postsController } from './../controllers/PostsController';
import { getUserIdByAccessToken } from '../utils/getUserIdByAccessToken';
import { checkBasicAuth } from '../utils/checkBasicAuth';
import { checkError } from '../utils/checkError';
import { createAndUpdatePostsValidator } from '../validators/postsValidator';
import { checkQueryPostsAndBlogs } from '../utils/checkQueryPostsAndBlogs';
import { checkQueryCommentsByPostID } from '../utils/checkQueryCommentsByPostID';
import { commentsController } from '../controllers/CommentsController';
import { checkBearerAuth } from '../utils/checkBearerAuth';
import { commentValidator } from '../validators/commentValidator';
import { likeStatusValidator } from '../validators/likesValidator';

export const routerPosts = express.Router();

routerPosts.get('/', getUserIdByAccessToken, checkQueryPostsAndBlogs, postsController.getPosts.bind(postsController));
routerPosts.get('/:id', getUserIdByAccessToken, postsController.getPost.bind(postsController));
routerPosts.post('/', checkBasicAuth, createAndUpdatePostsValidator, checkError, postsController.createPost.bind(postsController));
routerPosts.put('/:id', checkBasicAuth, createAndUpdatePostsValidator, checkError, postsController.updatePost.bind(postsController));
routerPosts.delete('/:id', checkBasicAuth, postsController.deletePost);

routerPosts.put(
	'/:id/like-status',
	checkBearerAuth,
	likeStatusValidator,
	checkError, 
	postsController.addLikeOrDislike.bind(postsController)
);

routerPosts.get(
	'/:postId/comments',
	getUserIdByAccessToken,
	checkQueryCommentsByPostID,
	commentsController.getCommentByPostId.bind(commentsController)
);

routerPosts.post(
	'/:postId/comments',
	checkBearerAuth,
	commentValidator,
	checkError,
	commentsController.createCommentByPostId.bind(commentsController)
);
