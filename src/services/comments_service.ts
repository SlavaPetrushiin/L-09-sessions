import { QueryRepository } from './../repositories/query-db-repository';
import { ApiTypes } from "../types/types";
import { CommentsRepository } from '../repositories/comments-db-repository';

interface ICreatePost {
	email: string;
	login: string;
	userId: string;
}

export class CommentsService {
	CommentsRepository: CommentsRepository

	constructor(){
		this.CommentsRepository = new CommentsRepository();
	}

	public async createComments(user: ICreatePost, comment: string, postId: string) {
		const newComments: ApiTypes.ICommentModel = {
			id: (new Date().getMilliseconds()).toString(),
			content: comment,
			userId: user.userId,
			userLogin: user.login,
			createdAt: new Date().toISOString(),
			postId
		}
		let result = await this.CommentsRepository.createComments(newComments);

		return result
			? {
				id: newComments.id,
				content: newComments.content,
				userId: newComments.userId,
				userLogin: newComments.userLogin,
				createdAt: newComments.createdAt
			}
			: false;
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
}
