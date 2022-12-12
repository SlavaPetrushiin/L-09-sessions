import { NextFunction } from 'express';
import { Request, Response } from 'express';

export interface IQueryBlogsAndPosts {
	searchNameTerm?: string;
	pageNumber?: string;
	pageSize?: string;
	sortBy?: string;
	sortDirection?: string;
}

const DEFAULT_QUERY = {
	searchNameTerm: "",
	pageNumber: "1",
	pageSize: "10",
	sortBy: "createdAt",
	sortDirection: "desc"
}

export function checkQueryPostsAndBlogs(req: Request<{}, {}, {}, IQueryBlogsAndPosts>, res: Response, next: NextFunction) {
	let { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection } = req.query;

	if (!searchNameTerm) {
		req.query.searchNameTerm = DEFAULT_QUERY.searchNameTerm;
	}
	if (!pageNumber || isNaN(parseInt(pageNumber, 10))) {
		req.query.pageNumber = DEFAULT_QUERY.pageNumber;
	}
	if (!pageSize || isNaN(parseInt(pageSize, 10))) {
		req.query.pageSize = DEFAULT_QUERY.pageSize;
	}
	if (!sortBy) {
		req.query.sortBy = DEFAULT_QUERY.sortBy;
	}
	if (!sortDirection || sortDirection != "asc" && sortDirection != "desc") {
		req.query.sortDirection = DEFAULT_QUERY.sortDirection;
	}

	next();
}