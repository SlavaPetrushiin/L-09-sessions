export namespace ApiTypes {
	export interface IBlog {
		id: string;
		name: string;
		websiteUrl: string;
		createdAt: string;
		description: string;
	}

	export interface IPost {
		id: string;
		title: string;
		shortDescription: string;
		content: string;
		blogId: string;
		blogName: string;
		createdAt: string;
	}

	export interface IFieldError {
		message: string;
		field: string;
	}

	export type ParamsCreateAndUpdateBlog = Omit<ApiTypes.IBlog, 'id'>
	export type ParamsCreatePost = Omit<ApiTypes.IPost, 'id' | 'blogName'>
	export type ParamsUpdatePost = Omit<ApiTypes.IPost, 'blogName'>

	export interface ICreateAndUpdateBlogParams {
		title: string;
		shortDescription: string;
		content: string;
		blogId: string;
	}

	export interface IBlogPost {
		title: string;
		shortDescription: string;
		content: string;
	}

	export interface IUserDB {
		email: string;
		login: string;
		id: string;
		createdAt: string;
		hasPassword: string
	}

	export interface ICommentModel {
		id: string;
		content: string
		userId: string;
		userLogin: string;
		createdAt: string;
		postId: string;
	}

	export interface IClientDB {
		email: string;
		login: string;
		id: string;
		createdAt: string;
		hasPassword: string;
		emailConfirmation: {
			code: string;
			expirationData: Date;
			isConfirmed: boolean;
		}
	}

	export interface IRefreshToken{
		user: string;
		token: string;
		//expiresIn: number;
		createdByIp: string;
	}
}