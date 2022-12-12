import { QueryRepository } from './../repositories/query-db-repository';
import { PostsRepository } from './../repositories/posts-db-repository';
import { BlogsRepository } from './../repositories/blogs-db-repository';
import { ApiTypes } from "../types/types";

export class BlogsService {
	static async createBlog(name: string, description: string, websiteUrl: string): Promise<ApiTypes.IBlog | boolean> {
		try {
			const newBLog: ApiTypes.IBlog = {
				id: (new Date().getMilliseconds()).toString(),
				name,
				websiteUrl,
				description,
				createdAt: new Date().toISOString()
			}

			let result = await BlogsRepository.createBlog({...newBLog});
			return result ? newBLog : false;
			
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	static async updateBlog(blog: ApiTypes.IBlog ): Promise<boolean> {
		return BlogsRepository.updateBlog(blog);
	}

	static async deleteBlog(id: string): Promise<boolean> {
		return await BlogsRepository.deleteBlog(id);
	}

	static async deleteAllBlogs(): Promise<boolean>{
		return BlogsRepository.deleteAllBlogs();
	}
}
