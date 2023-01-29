import { ILikesSchema, LikesModel } from './../repositories/schemas/LikesSchema';
import { postsCollection } from './../repositories/db';
import { QueryRepository } from './../repositories/query-db-repository';
import { createAndUpdateBlogValidator } from './../validators/blogsValidator';
import { PostsRepository } from './../repositories/posts-db-repository';
import { ApiTypes } from "../types/types";
import { BlogsService } from './blogs_service';
import { dictionary as D, } from '../types/dictionary';

export interface IUpdatePostParams extends ApiTypes.ICreateAndUpdateBlogParams {
	id: string
}

interface IUserDTO {
	userId: string;
	login: string;
	email: string
}

interface IReqAllPosts {
	pageNumber: string;
	pageSize: string;
	sortBy: string;
	sortDirection: string;
}

export interface IViewInputModel extends Omit<ApiTypes.IPost, "likes" | "dislikes"> {
	extendedLikesInfo: {
		likesCount: number,
		dislikesCount: number,
		myStatus: D.StatusLike,
		newestLikes: ApiTypes.IExtendedLikesInfo[]
	}
}

const DEFAULT_PROJECTION = {_id :0, __v:0}; 

export class PostService {
	async getPosts(queries: IReqAllPosts, userId: string | null = null, blogId: string | null = null) {
		let { pageNumber, pageSize, sortBy, sortDirection } = queries;
		let skip = (+pageNumber - 1) * +pageSize;
		let postFilter: any = {};


		if (blogId) {
			postFilter.blogId = blogId;
		}

		let posts = await postsCollection.find(postFilter, DEFAULT_PROJECTION)
			.skip(+skip)
			.limit(+pageSize)
			.sort({ [sortBy]: sortDirection == "asc" ? 1 : -1 })
			.lean();
		let totalCount = await postsCollection.countDocuments(postFilter, {});
		let pageCount = Math.ceil(totalCount / +pageSize);



		let likes = await LikesModel
			.find({}, DEFAULT_PROJECTION)
			.sort({ addedAt: -1 })
			.lean();

		let emptyLikes = {
			likesCount: 0,
			dislikesCount: 0,
			myStatus: D.StatusLike.None,
		}

		let preparePosts = posts.map(post => {
			let filteredLikes = likes.filter(like => like.parentId === post.id);
			let onlyLikes = filteredLikes.filter(like => like.status === D.StatusLike.Like);
			let lustThreeLikes: ILikesSchema[] = (JSON.parse(JSON.stringify(onlyLikes))).sort((a: any, b: any) => new Date(a.addedAt) > new Date(b.addedAt));

			if (lustThreeLikes.length > 3) {
				lustThreeLikes.length = 3
			}

			let countLikesAndDislikes = filteredLikes.reduce((acc, cur) => {
				return {
					likesCount: cur.status === D.StatusLike.Like ? acc.likesCount + 1 : acc.likesCount,
					dislikesCount: cur.status === D.StatusLike.Dislike ? acc.dislikesCount + 1 : acc.dislikesCount,
					myStatus: cur.userId === userId ? acc.myStatus = cur.status : acc.myStatus
				}
			}, emptyLikes)

			return {
				...post,
				extendedLikesInfo: {
					likesCount: countLikesAndDislikes.likesCount,
					dislikesCount: countLikesAndDislikes.dislikesCount,
					myStatus: countLikesAndDislikes.myStatus,
					newestLikes: lustThreeLikes.map(like => ({
						addedAt: like.addedAt,
						userId: like.userId,
						login: like.userLogin
					}))
				}
			}
		})

		return {
			pagesCount: pageCount,
			page: +pageNumber,
			pageSize: +pageSize,
			totalCount: totalCount,
			items: preparePosts
		}
	}

	async getPost(postId: string, userId: string | null) {
		try {
			let foundedPost = await postsCollection.findOne({ id: postId }, DEFAULT_PROJECTION).lean();

			if (!foundedPost) {
				return null;
			}

			let likes = await LikesModel
				.find({}, DEFAULT_PROJECTION)
				.sort({ addedAt: -1 })
				.lean();

			let emptyLikes = {
				likesCount: 0,
				dislikesCount: 0,
				myStatus: D.StatusLike.None,
			}


			let filteredLikes = likes.filter(like => like.parentId === postId);
			let lustThreeLikes: ILikesSchema[] = (JSON.parse(JSON.stringify(filteredLikes))).sort((a: any, b: any) => new Date(a.addedAt) > new Date(b.addedAt));

			if (lustThreeLikes.length > 3) {
				lustThreeLikes.length = 3;
			}

			let countLikesAndDislikes = filteredLikes.reduce((acc, cur) => {
				return {
					likesCount: cur.status === D.StatusLike.Like ? acc.likesCount + 1 : acc.likesCount,
					dislikesCount: cur.status === D.StatusLike.Dislike ? acc.dislikesCount + 1 : acc.dislikesCount,
					myStatus: cur.userId === userId ? acc.myStatus = cur.status : acc.myStatus
				}
			}, emptyLikes)

			let preparedPost = {
				...foundedPost,
				extendedLikesInfo: {
					likesCount: countLikesAndDislikes.likesCount,
					dislikesCount: countLikesAndDislikes.dislikesCount,
					myStatus: countLikesAndDislikes.myStatus,
					newestLikes: lustThreeLikes.map(like => ({
						addedAt: like.addedAt,
						userId: like.userId,
						login: like.userLogin
					})
					)
				}
			}

			return preparedPost;
		} catch (error) {
			return null;
		}
	}

	async createPost(params: ApiTypes.ICreateAndUpdateBlogParams): Promise<IViewInputModel | null> {
		try {
			let { blogId, content, shortDescription, title } = params;
			let foundedBlog = await QueryRepository.getOneBlog(blogId);

			if (!foundedBlog) {
				return null;
			}

			const createdAt = new Date().toISOString();

			let newPost: ApiTypes.IPost = {
				id: (new Date().getMilliseconds()).toString(),
				title,
				shortDescription,
				content,
				blogId,
				blogName: foundedBlog.name,
				createdAt
			}

			const result = await PostsRepository.createPost({ ...newPost });

			if (!result) {
				return null;
			};

			let createdPost: IViewInputModel = {
				id: newPost.id,
				title: newPost.title,
				shortDescription: newPost.shortDescription,
				content: newPost.content,
				blogId: newPost.blogId,
				blogName: newPost.blogName,
				createdAt,
				extendedLikesInfo: {
					dislikesCount: 0,
					likesCount: 0,
					myStatus: D.StatusLike.None,
					newestLikes: []
				}
			}

			return createdPost;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	async updatePost(params: IUpdatePostParams): Promise<boolean> {
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

	async deletePost(id: string): Promise<boolean> {
		return PostsRepository.deletePost(id);
	}

	async deleteAllBPosts(): Promise<void> {
		await PostsRepository.deleteAllBPosts();
	}

	async removeAllPostsAndBlog(blogId: string): Promise<void> {
		await PostsRepository.removeAllPostsDeletedBlog(blogId);
	}

	async addLikeOrDislike(postId: string, likeStatus: D.StatusLike, user: IUserDTO) {
		try {
			let foundedPost = await postsCollection.findOne({ id: postId }, );
			let { userId, login } = user;

			if (!foundedPost) {
				return null;
			}

			let foundedLike = await LikesModel.findOne({ parentId: postId, userId });
			let addedAt = new Date().toISOString();

			if (!foundedLike) {
				foundedLike = new LikesModel({
					addedAt,
					userId,
					parentId: postId,
					status: likeStatus,
					userLogin: login
				})
			} else {
				foundedLike.addedAt = addedAt,
					foundedLike.status = likeStatus;
			}

			let result = await foundedLike.save();
			return !!result;
		} catch (error) {
			console.log("Not created/edit like for pPost");
			return null;
		}
	}
}