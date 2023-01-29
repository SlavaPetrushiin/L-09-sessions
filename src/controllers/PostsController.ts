import { Request, Response } from 'express';
import { ApiTypes } from '../types/types';
import { IViewInputModel, PostService } from '../services/posts_service';
import { IQueryBlogsAndPosts } from '../utils/checkQueryPostsAndBlogs';
import { QueryRepository } from '../repositories/query-db-repository';
import { dictionary as D } from '../types/dictionary';

class PostsController {
	postService: PostService;

	constructor() {
		this.postService = new PostService();
	}

	async getPosts(req: Request<{}, {}, {}, IQueryBlogsAndPosts>, res: Response) {
		let { pageNumber, pageSize, sortBy, sortDirection } = req.query;
		// let posts = await QueryRepository.getPosts({
		// 	pageNumber: pageNumber!,
		// 	pageSize: pageSize!,
		// 	sortBy: sortBy!,
		// 	sortDirection: sortDirection!
		// });
		let userId = req.userId;
		let posts = await this.postService.getPosts({
			pageNumber: pageNumber!,
			pageSize: pageSize!,
			sortBy: sortBy!,
			sortDirection: sortDirection!
		}, userId)

		res.send(posts);
	}

	async getPost(req: Request<{ id: string }>, res: Response<ApiTypes.IPost | boolean>) {
		let id = req.params.id;
		let userId = req.userId;
		let foundedPost = await this.postService.getPost(id, userId);
		if (!foundedPost) {
			return res.sendStatus(404);
		}

		res.send(foundedPost);
	}

	async createPost(req: Request<{}, {}, ApiTypes.ICreateAndUpdateBlogParams>, res: Response<IViewInputModel | null>) {
		let { blogId, content, shortDescription, title } = req.body;
		let newPost = await this.postService.createPost({ blogId, content, shortDescription, title });
		if (!newPost) {
			return res.sendStatus(404);
		}
		res.status(201).send(newPost);
	}

	async updatePost(req: Request<{ id: string }, {}, ApiTypes.ICreateAndUpdateBlogParams>, res: Response) {
		let { blogId, content, shortDescription, title } = req.body;
		let { id } = req.params;
		let isUpdatedBPost = await this.postService.updatePost({ id, blogId, content, shortDescription, title });
		if (!isUpdatedBPost) {
			return res.sendStatus(404);
		}

		res.sendStatus(204);
	}

	async deletePost(req: Request<{ id: string }>, res: Response) {
		let { id } = req.params;
		let isDeletesPost = await this.postService.deletePost(id);
		if (!isDeletesPost) {
			return res.sendStatus(404);
		}

		res.sendStatus(204);
	}

	async addLikeOrDislike(req: Request<{ id: string }, {}, { likeStatus: D.StatusLike }>, res: Response) {
		let postId = req.params.id;
		let likeStatus = req.body.likeStatus;
		let user = req.user;

		let result = await this.postService.addLikeOrDislike(postId, likeStatus, user!);

		if (!result) {
			return res.sendStatus(404);
		}

		res.sendStatus(204);
	}
}

export const postsController = new PostsController();