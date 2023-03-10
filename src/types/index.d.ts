import { ApiTypes } from "./types";

declare global {
	declare namespace Express {
		export interface Request {
			user: { email: string; login: string; userId: string; } | null;
			authDeviceSession: ApiTypes.IAuthDevicesSessions;
			userId: string | null;
		}
	}
}