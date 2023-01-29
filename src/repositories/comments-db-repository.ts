import { ApiTypes } from "../types/types";
import { commentsCollection } from "./db";

export class CommentsRepository {
	public async createComments(comment: ApiTypes.ICommentModel): Promise<ApiTypes.ICommentModel | null> {
		try {
	
			let result = await commentsCollection.create(comment);

			return result;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	public async updateComments(comment: ApiTypes.ICommentModel): Promise<boolean> {
		try {

			let result = await commentsCollection.updateOne({ id: comment.id }, { $set: { content: comment.content } });

			if (result.matchedCount == 0) {
				return false;
			}
			return true;
		} catch (error) {

			console.error(error);
			return false;
		}
	}

	public async deleteComment(commentId: string) {
		try {
			let result = await commentsCollection.deleteOne({ id: commentId });
			return result.deletedCount > 0 ? true : false;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	public async deleteAllComments() {
		try {
			let result = await commentsCollection.deleteMany({});
			return result.deletedCount > 0 ? true : false;
		} catch (error) {

		}
	}

	public async updateLikeOrDislike(comment: ApiTypes.ICommentModel): Promise<ApiTypes.ICommentModel | null> {
		try {
			return commentsCollection.findOneAndUpdate(
				{ id: comment.id },
				{ likes: comment.likes, dislikes: comment.dislikes },
				{ new: true }
			).lean();
		} catch (error) {
			console.error(`NOt saved like/dislike. Method: updateLikeOrDislike. Text error: ${error}`);
			return null;
		}
	}
}
