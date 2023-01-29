
import { Schema,model, Model  } from 'mongoose';
import { dictionary } from '../../types/dictionary';

export interface ILikesSchema{
	parentId: string;
	status: dictionary.StatusLike;
	userId: string;
	userLogin: string;
	addedAt: string;
}

interface ILikesMethods {
	getPostLikes(userId: string): any;
}

type LikesSchemaModel = Model<ILikesSchema, {}, ILikesMethods>;

const LikesSchema = new Schema<ILikesSchema, LikesSchemaModel, ILikesMethods >({
	parentId:  { type: String, required: true },
	status:  { type: String, enum: dictionary.StatusLike, required: true },
	userId: { type: String, required: true },
	userLogin: { type: String, required: true },
	addedAt: { type: String, required: true },
})

LikesSchema.method("getPostLikes", function(userId: string){
	return this
})

export const LikesModel = model<ILikesSchema, LikesSchemaModel>("LikesModel", LikesSchema);