import { getUserByCookie } from './../utils/checkAccessToken';
import { checkBasicAuth } from '../utils/checkBasicAuth';
import express, {Request, Response} from 'express';
import { ApiTypes } from '../types/types';
import { checkError } from '../utils/checkError';
import { createAndUpdatePostsValidator } from '../validators/postsValidator';
import { PostService } from '../services/posts_service';
import { checkQueryPostsAndBlogs, IQueryBlogsAndPosts } from '../utils/checkQueryPostsAndBlogs';
import { QueryRepository } from '../repositories/query-db-repository';
import { checkQueryCommentsByPostID } from '../utils/checkQueryCommentsByPostID';
import { commentsController } from '../controllers/CommentsController';
import { checkBearerAuth } from '../utils/checkBearerAuth';
import { commentValidator } from '../validators/commentValidator';

export const routerPosts = express.Router();

routerPosts.get('/', checkQueryPostsAndBlogs,  async (req: Request<{}, {}, {}, IQueryBlogsAndPosts>, res: Response) => {
	let {  pageNumber, pageSize, sortBy, sortDirection } = req.query;
	let posts = await QueryRepository.getPosts({
		pageNumber: pageNumber!,
		pageSize: pageSize!,
		sortBy: sortBy!,
		sortDirection: sortDirection!
	});

	res.send(posts);
})

routerPosts.get('/:id', async (req: Request<{id: string}>, res: Response<ApiTypes.IPost | boolean>) => {
	let id = req.params.id;
	let foundedPost = await QueryRepository.getOnePost(id);
	if(!foundedPost){
		return res.sendStatus(404);
	}

	res.send(foundedPost);
})

routerPosts.post('/', checkBasicAuth, createAndUpdatePostsValidator, checkError, async (req: Request<{}, {}, ApiTypes.ICreateAndUpdateBlogParams>, res: Response<ApiTypes.IPost | boolean>) => {
	let {blogId, content, shortDescription, title} = req.body;
	let newPost = await PostService.createPost({blogId, content, shortDescription, title});

	if(!newPost){
		return res.sendStatus(404);
	}
	res.status(201).send(newPost);
})

routerPosts.put('/:id', checkBasicAuth, createAndUpdatePostsValidator, checkError, async (req: Request<{id: string}, {}, ApiTypes.ICreateAndUpdateBlogParams>, res: Response) => {
	let {blogId,content, shortDescription, title} = req.body;
	let {id} = req.params;
	let isUpdatedBPost = await PostService.updatePost({id, blogId, content, shortDescription, title});
	if(!isUpdatedBPost){
		return res.sendStatus(404);
	}

	res.sendStatus(204);
})

routerPosts.delete('/:id', checkBasicAuth, async (req: Request<{id: string}>, res: Response) => {
	let {id} = req.params;
	let isDeletesPost = await PostService.deletePost(id);
	if(!isDeletesPost){
		return res.sendStatus(404);
	}

	res.sendStatus(204);
})

routerPosts.get(
	'/:postId/comments',
	getUserByCookie,
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
