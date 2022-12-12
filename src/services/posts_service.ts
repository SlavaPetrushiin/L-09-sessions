import { QueryRepository } from './../repositories/query-db-repository';
import { createAndUpdateBlogValidator } from './../validators/blogsValidator';
import { PostsRepository } from './../repositories/posts-db-repository';
import { ApiTypes } from "../types/types";
import { BlogsService } from './blogs_service';

export interface IUpdatePostParams extends ApiTypes.ICreateAndUpdateBlogParams {
	id: string
}

export class PostService {
	static async createPost(params: ApiTypes.ICreateAndUpdateBlogParams): Promise<ApiTypes.IPost | boolean> {
		try {
			let { blogId, content, shortDescription, title } = params;
			let foundedBlog = await QueryRepository.getOneBlog(blogId);

			if (!foundedBlog) {
				return false;
			}

			let newPost: ApiTypes.IPost = {
				id: (new Date().getMilliseconds()).toString(),
				title,
				shortDescription,
				content,
				blogId,
				blogName: foundedBlog.name,
				createdAt: new Date().toISOString()
			}

			const result = await PostsRepository.createPost({ ...newPost });

			if (!result) return false;
			return newPost;

		} catch (error) {
			console.error(error);
			return false;
		}
	}

	static async updatePost(params: IUpdatePostParams): Promise<boolean> {
		try {
			let { blogId, id } = params;
			let foundedPost = await QueryRepository.getOnePost(id);
			let foundedBlog = await QueryRepository.getOneBlog(blogId);

			if (!foundedBlog || !foundedPost) {
				return false;
			}

			return await PostsRepository.updatePost(params);

		} catch (error) {
			console.error(error);
			return false;
		}
	}

	static async deletePost(id: string): Promise<boolean> {
		return PostsRepository.deletePost(id);
	}

	static async deleteAllBPosts(): Promise<void> {
		await PostsRepository.deleteAllBPosts();
	}

	static async removeAllPostsAndBlog(blogId: string): Promise<void> {
		await PostsRepository.removeAllPostsDeletedBlog(blogId);
	}
}