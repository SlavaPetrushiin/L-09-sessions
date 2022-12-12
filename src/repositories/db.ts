import { MongoClient } from "mongodb";
import { ApiTypes } from "../types/types";
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGODB_URI;

if(!url){
	throw new Error('Not connect DB')
}

const client = new MongoClient(url);
const dbName = "blogsAndPosts";
export const db = client.db(dbName);

export const blogsCollection = db.collection<ApiTypes.IBlog>("blogs");
export const postsCollection = db.collection<ApiTypes.IPost>("posts");
export const commentsCollection = db.collection<ApiTypes.ICommentModel>("comments");
export const clientsCollection = db.collection<ApiTypes.IClientDB>("clients");
export const refreshTokensCollection = db.collection<ApiTypes.IRefreshToken>("refreshToken");
export const logCollection = db.collection<any>('logs')

export async function runDB(){
	try {
		await client.connect();
		console.log('Connected successfully to server');
	} catch (error) {
		console.error(error);
		//await client.close();
	}
}