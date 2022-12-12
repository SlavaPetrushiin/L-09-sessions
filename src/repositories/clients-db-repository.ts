import { ModifyResult } from 'mongodb';
import { ApiTypes } from './../types/types';
import { clientsCollection } from "./db";

class ClientsRepositoryModel {
	public async createClient(user: ApiTypes.IClientDB): Promise<boolean> {
		try {
			let result = await clientsCollection.insertOne(user);
			return result.acknowledged;
		} catch (error) {
			return false;
		}
	}

	public async getClientByCode(code: string):Promise<ApiTypes.IClientDB | null>{
		try {
			return await clientsCollection.findOne({'emailConfirmation.code': code}, {projection: { _id: false }});
		} catch (error) {
			console.error(`ClientsRepositoryModel, Not found client by code: ${code}`);
			return null;
		}
	}

	public async updateConfirmation(clientID: string): Promise<ModifyResult<ApiTypes.IClientDB> | null>{
		try {
			return await clientsCollection.findOneAndUpdate({id: clientID}, {$set: {'emailConfirmation.isConfirmed': true}});
		} catch (error) {
			console.error(`ClientsRepositoryModel, Not found client by clientID: ${clientID}`);
			return null;
		}
	}

	public async 	getClientByEmailOrLogin(emailOrLogin: string, email?: string): Promise<ApiTypes.IClientDB | null>{
		try {
			if(email){
				return await clientsCollection.findOne({$or: [ {login: emailOrLogin}, {email: email}]} );
			}

			return await clientsCollection.findOne({$or: [ {login: emailOrLogin}, {email: emailOrLogin}]} );
		} catch (error) {
			console.error(`ClientsRepositoryModel, Not found client by emailOrLogin: ${emailOrLogin}`);
			return null;
		}
	}

	public async 	updateClient(id: string, code: string, expirationData: Date): Promise<ModifyResult<ApiTypes.IClientDB> | null>{
		try {
			console.log(id, code,expirationData);
			return await clientsCollection.findOneAndUpdate({id}, {$set: {'emailConfirmation.code': code, 'emailConfirmation.expirationData': expirationData}} );
		} catch (error) {
			console.error(`ClientsRepositoryModel, Not updateClient: `, error);
			return null;
		}
	}

	public async deleteUser(id: string): Promise<boolean> {
		try {
			let result = await clientsCollection.deleteOne({ id });
			return result.deletedCount > 0 ? true : false;
		} catch (error) {
			return false;
		}
	}

	public async deleteUsers(): Promise<boolean> {
		try {
			let result = await clientsCollection.deleteMany({});
			return result.deletedCount > 0 ? true : false;
		} catch (error) {
			return false;
		}
	}

	public async getUSerByID(id: string):Promise<ApiTypes.IClientDB | null>{
		try {
			return await clientsCollection.findOne({id})
		} catch (error) {
			return null;
		}
	}
}

export const ClientsRepository = new ClientsRepositoryModel();