import { QueryRepository } from './../repositories/query-db-repository';
import { ApiTypes } from "../types/types";
import { CommentsRepository } from '../repositories/comments-db-repository';
import { dictionary as D } from '../types/dictionary';

interface ICreatePost {
	email: string;
	login: string;
	userId: string;
}

interface ILikesInfo {
	likesCount: number;
	dislikesCount: number;
	myStatus: D.StatusLike
}

export interface IViewCommentModel {
	id: string;
	content: string;
	userId: string;
	userLogin: string;
	createdAt: string;
	likesInfo: ILikesInfo
}

interface IParamsLikeOrDislike {
	likeStatus: D.StatusLike;
	commentId: string;
	userId: string;
}

export class CommentsService {
	CommentsRepository: CommentsRepository;
	Likes: Likes;

	constructor() {
		this.CommentsRepository = new CommentsRepository();
		this.Likes = new Likes(this.CommentsRepository);
	}

	public async createComments(user: ICreatePost, comment: string, postId: string): Promise<IViewCommentModel | null> {
		const newComments: ApiTypes.ICommentModel = {
			id: (new Date().getMilliseconds()).toString(),
			content: comment,
			userId: user.userId,
			userLogin: user.login,
			createdAt: new Date().toISOString(),
			likes: [],
			dislikes: [],
			postId
		}
		let result = await this.CommentsRepository.createComments(newComments);

		if (!result) {
			return null;
		}

		return {
			id: result.id,
			content: result.content,
			userId: result.userId,
			userLogin: result.userLogin,
			createdAt: result.createdAt,
			likesInfo: {
				likesCount: 0,
				dislikesCount: 0,
				myStatus: D.StatusLike.None
			}
		}
	}

	public async updateComment(commentId: string, content: string, user: { email: string; login: string; userId: string; }) {
		let comment = await QueryRepository.getOneComment(commentId);

		if (!comment) {
			return false;
		}

		comment.content = content;

		let isUpdatedComment = await this.CommentsRepository.updateComments(comment);
		return isUpdatedComment;
	}

	public async deleteComment(commentId: string) {
		return this.CommentsRepository.deleteComment(commentId);
	}

	public async deleteAllComments() {
		return this.CommentsRepository.deleteAllComments();
	}

	public async addLikeOrDislikeFactory(paramsLike: IParamsLikeOrDislike): Promise<ApiTypes.ICommentModel | null> {
		let { likeStatus, commentId, userId } = paramsLike;
		let foundedComment = await QueryRepository.getOneComment(commentId);
		console.log("foundedComment: ", foundedComment);
		if (!foundedComment) {
			return null;
		}

		switch (likeStatus) {
			case "Like": {
				return this.Likes.addLike(foundedComment, userId);
			}
			case "Dislike": {
				return this.Likes.addDislike(foundedComment, userId);
			}
			case "None": {
				return this.Likes.addNoneLike(foundedComment, userId);
			}
			default: {
				return null;
			}
		}
	}

	public countingLikesOrDislikes(comment: ApiTypes.ICommentModel, userID: string = ""): IViewCommentModel { //TODO NAME!!!!
		let userStatus = D.StatusLike.None;
		let isStatusLike = comment.likes.find(id => id == userID);
		let isStatusDislike = comment.dislikes.find(id => id == userID);

		if(isStatusLike){
			userStatus = D.StatusLike.Like;
		}

		if(isStatusDislike){
			userStatus = D.StatusLike.Dislike;
		}

		let likesInfo: ILikesInfo = {
			dislikesCount: comment.dislikes.length,
			likesCount: comment.likes.length,
			myStatus: D.StatusLike.None
		};

		return {
			content: comment.content,
			createdAt: comment.createdAt,
			id: comment.id,
			userId: comment.userId,
			userLogin: comment.userLogin,
			likesInfo
		}
	}
}

export class Likes {
	private repository: CommentsRepository;

	constructor(repository: CommentsRepository) {
		this.repository = repository;
	}

	async addLike(comment: ApiTypes.ICommentModel, userID: string) {
		comment.dislikes = comment.dislikes.filter(id => id != userID);

		if (comment.likes.includes(userID)) {
			comment.likes = comment.likes.filter(id => id != userID);
		} else {
			comment.likes.push(userID);
		}

		return this.repository.updateLikeOrDislike(comment);
	}

	async addDislike(comment: ApiTypes.ICommentModel, userID: string) {
		comment.likes = comment.likes.filter(id => id != userID);

		if (comment.dislikes.includes(userID)) {
			comment.dislikes = comment.dislikes.filter(id => id != userID);
		} else {
			comment.dislikes.push(userID);
		}
		return this.repository.updateLikeOrDislike(comment);
	}

	async addNoneLike(comment: ApiTypes.ICommentModel, userID: string) {
		comment.likes = comment.likes.filter(id => id != userID);
		comment.dislikes = comment.dislikes.filter(id => id != userID);
		return this.repository.updateLikeOrDislike(comment);
	}
}
