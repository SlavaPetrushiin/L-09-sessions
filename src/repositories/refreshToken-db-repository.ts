import { ApiTypes } from './../types/types';
import { refreshTokensCollection } from "./db";

class RefreshTokenModel {
	public async addRefreshToken(refreshToken: ApiTypes.IRefreshToken):Promise<boolean>{
		try {
			let result = await refreshTokensCollection.insertOne(refreshToken);
			return result.acknowledged;
		} catch (error) {
			console.error('Not create RefreshToken');
			return false;
		}
	}

	public async updateRefreshToken(refreshToken: ApiTypes.IRefreshToken): Promise<boolean>{
		try {
			let {user, token, createdByIp} = refreshToken;
			await refreshTokensCollection.updateOne({ user }, { $set: { token,  createdByIp}}, {upsert: true});
			return true;
		} catch (error) {
			console.log('Not updated RefreshToken');
			return false;
		}
	}

	public async getRefreshTokenByUSerID(userID: string): Promise<ApiTypes.IRefreshToken | null>{
		try {
			return refreshTokensCollection.findOne({id: userID}, {projection: {_id: false}});
		} catch (error) {
			return null;
		}
	}

	public async checkRefreshTokenInDB (token: string): Promise<ApiTypes.IRefreshToken | null> {
		try {
			return refreshTokensCollection.findOne({token}, {projection: {_id: false}});
		} catch (error) {
			return null;
		}
	}

	public async removeRefreshTokenByUserID(userID: string): Promise<boolean>{
		try {
			let result = await refreshTokensCollection.deleteMany({user: userID});
			return result.deletedCount > 0 ? true : false;
		} catch (error) {
			return false;
		}
	}
}

export const RefreshTokensRepository = new RefreshTokenModel();