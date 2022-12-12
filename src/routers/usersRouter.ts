import { IUsersDBModel, QueryRepository } from './../repositories/query-db-repository';
import { checkBasicAuth } from '../utils/checkBasicAuth';
import { UsersService } from './../services/users_service';
import { checkError } from './../utils/checkError';
import express, { Request, Response } from 'express';
import { userValidator } from '../validators/usersValidator';
import { checkQueryUsers, IQueryUsers } from '../utils/checkQueryUsers';
import { AuthService } from '../services/auth_service';

interface ICreateUserInput {
	login: string;
	password: string;
	email: string;
}

export const routerUsers = express.Router();

routerUsers.get("/", checkBasicAuth, checkQueryUsers, async (req: Request<{}, {}, {}, IQueryUsers>, res: Response<IUsersDBModel>) => {
	let { pageNumber, pageSize, searchEmailTerm, searchLoginTerm, sortBy, sortDirection } = req.query;

	let users = await QueryRepository.getUsers({
		pageNumber: pageNumber!,
		pageSize: pageSize!,
		searchEmailTerm: searchEmailTerm!,
		searchLoginTerm: searchLoginTerm!,
		sortBy: sortBy!,
		sortDirection: sortDirection!
	});

	if(!users){
		res.sendStatus(404);
		return
	}

	res.send(users);
})

routerUsers.post("/", checkBasicAuth, userValidator, checkError, async (req: Request<{}, {}, ICreateUserInput>, res: Response) => {
	let { email, login, password } = req.body;

	let newUser = await AuthService.registration(login, email, password);
	if (!newUser) {
		return res.sendStatus(404);
	}
	return res.status(201).send(newUser);
})


routerUsers.delete("/", checkBasicAuth, async (req, res) => {
	UsersService.deleteUsers();
	res.sendStatus(204);
})

routerUsers.delete("/:id", checkBasicAuth, async (req: Request<{ id: string }>, res: Response) => {
	let { id } = req.params;
	let isDeleted = await UsersService.deleteUser(id);

	if (!isDeleted) {
		return res.sendStatus(404);
	}
	return res.sendStatus(204);
})
