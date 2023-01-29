import { LikesModel } from './schemas/LikesSchema';
export class LikesRepository{

	addLikes(){

	}

	removeLikes(){

	}

	getLikes(){

	}

	findLikeByParentIdAndUserId(parentId: string, userId: string){
		return LikesModel.findOne({parentId, userId});
	}

}