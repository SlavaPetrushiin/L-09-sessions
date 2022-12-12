import { NextFunction } from 'express';
import { Request, Response } from 'express';

export interface IQueryUsers {
	searchLoginTerm?: string;
	searchEmailTerm?: string;
	pageNumber?: string;
	pageSize?: string;
	sortBy?: string;
	sortDirection?: string;
}

const DEFAULT_QUERY = {
	searchLoginTerm: "",
	searchEmailTerm: "",
	pageNumber: "1",
	pageSize: "10",
	sortBy: "createdAt",
	sortDirection: "desc"
}

enum FIELDS_FOR_SORTBY {
	id = "id",
	login = "login",
	email = "email",
	createdAt = "createdAt"
}


export function checkQueryUsers(req: Request<{}, {}, {}, IQueryUsers>, res: Response, next: NextFunction) {
	let { pageNumber, pageSize, searchEmailTerm, searchLoginTerm, sortBy, sortDirection } = req.query;

	if (!searchEmailTerm) {
		req.query.searchEmailTerm = DEFAULT_QUERY.searchEmailTerm;
	}
	if (!searchLoginTerm) {
		req.query.searchLoginTerm = DEFAULT_QUERY.searchLoginTerm;
	}
	if (!pageNumber || isNaN(parseInt(pageNumber, 10))) {
		req.query.pageNumber = DEFAULT_QUERY.pageNumber;
	}
	if (!pageSize || isNaN(parseInt(pageSize, 10))) {
		req.query.pageSize = DEFAULT_QUERY.pageSize;
	}
	if (!sortBy || !Object.values(FIELDS_FOR_SORTBY).includes(sortBy as FIELDS_FOR_SORTBY)) {
		req.query.sortBy = DEFAULT_QUERY.sortBy;
	}
	if (!sortDirection || sortDirection != "asc" && sortDirection != "desc") {
		req.query.sortDirection = DEFAULT_QUERY.sortDirection;
	}

	next();
}