import { ApiTypes } from "../types/types";
import * as dotenv from 'dotenv';
import mongoose, { model, Schema } from "mongoose";
dotenv.config();

const url = process.env.MONGODB_URI;

if(!url){
	throw new Error('Not connect DB')
}

//const client = new MongoClient(url);
//const dbName = process.env.DB_NAME || 'mongodb://127.0.0.1:27017/test';
//export const db = client.db(dbName);

const blogsSchema = new Schema<ApiTypes.IBlog>({
  name: {type: String, required: true},
	id: {type: String, required: true},
	websiteUrl: {type: String, required: true},
	createdAt: {type: String, required: true},
	description: {type: String, required: true},
});

const postsSchema = new Schema<ApiTypes.IPost>({
	id: {type: String, required: true},
	title: {type: String, required: true},
	shortDescription: {type: String, required: true},
	content: {type: String, required: true},
	blogId: {type: String, required: true},
	blogName: {type: String, required: true},
	createdAt: {type: String, required: true},
})

const commentsSchema = new Schema<ApiTypes.ICommentModel>({
	id: {type: String, required: true},
	content: {type: String, required: true},
	userId: {type: String, required: true},
	userLogin: {type: String, required: true},
	createdAt: {type: String, required: true},
	postId: {type: String, required: true},
})

const clientsSchema = new Schema<ApiTypes.IClientDB>({
	email: {type: String, required: true},
	login: {type: String, required: true},
	id: {type: String, required: true},
	createdAt: {type: String, required: true},
	hasPassword: {type: String, required: true},
	emailConfirmation: {
		code: {type: String, required: true},
		expirationData: {type: Date, required: true},
		isConfirmed: {type: Boolean, required: true},
	}
})

const refreshTokensSchema = new Schema<ApiTypes.IRefreshToken>({
	user: {type: String, required: true},
	token: {type: String, required: true},
	createdByIp: {type: String, required: true},
})

const authDevicesSchema = new Schema<ApiTypes.IAuthDevicesSessions>({
	ip: {type: String, required: true},
	title: {type: String, required: true},
	lastActiveDate: {type: String, required: true},
	exp: {type: String, required: true},
	deviceId: {type: String, required: true},
	userId: {type: String, required: true},
})

const badPracticeSchema = new Schema<ApiTypes.IBadPractice>({
	ip: {type: String, required: true},
	connectionUrl: {type: String, required: true},
	connectionDate: {type: Date, required: true},
})

const passwordRecoverySchema = new Schema<ApiTypes.IPasswordRecovery>({
	email:{type: String, required: true},
  recoveryCode: {type: String, required: true},
	dateExpired: {type: Date, required: true},
})

const logsSchema = new Schema<any>()

export const blogsCollection = model<ApiTypes.IBlog>("blogsCollection", blogsSchema) //db.collection<ApiTypes.IBlog>("blogs");
export const postsCollection = model<ApiTypes.IPost>("postsCollection", postsSchema) //db.collection<ApiTypes.IPost>("posts");
export const commentsCollection = model<ApiTypes.ICommentModel>("commentsCollection", commentsSchema) //db.collection<ApiTypes.ICommentModel>("comments");
export const clientsCollection = model<ApiTypes.IClientDB>("clientsCollection", clientsSchema) //db.collection<ApiTypes.IClientDB>("clients");
export const refreshTokensCollection = model<ApiTypes.IRefreshToken>("refreshTokensCollection", refreshTokensSchema)  //db.collection<ApiTypes.IRefreshToken>("refreshToken");
export const authDevicesSessions = model<ApiTypes.IAuthDevicesSessions>("authDevicesSessions", authDevicesSchema) //db.collection<ApiTypes.IAuthDevicesSessions>('authDevicesSessions');
export const badPractice = model<ApiTypes.IBadPractice>("badPractice", badPracticeSchema) //db.collection<ApiTypes.IBadPractice>("badPractice");
export const passwordRecovery =  model<ApiTypes.IPasswordRecovery>("passwordRecovery", passwordRecoverySchema)//db.collection<ApiTypes.IPasswordRecovery>("passwordRecovery");
export const logCollection = model<any>("logCollection", logsSchema) //db.collection<any>('logs');

export async function runDB(){
	try {
		//await client.connect();
		mongoose.set('strictQuery', true);
		await mongoose.connect(url!);
		console.log('Connected successfully to server');
	} catch (error) {
		console.error(error);
		//await client.close();
	}
}