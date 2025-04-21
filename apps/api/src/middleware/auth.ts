import { ACCESS_TOKEN_NAME, verifyToken } from "@apiaas/auth";
import type { Context, Next } from "hono";
import type { Env, Variables } from "@/types";
import { getCookie } from "hono/cookie";
import { getAuthenticatedUser } from "../helpers/session";

export const extractBearerToken = (c: Context): string | null => {
	const cookieToken = getCookie(c, ACCESS_TOKEN_NAME);
	if (cookieToken) {
		return cookieToken;
	}

	const authHeader = c.req.header("Authorization");
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.replace("Bearer ", "");
	}

	return null;
};

export function AuthMiddleware() {
	return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
		try {
			const user = await getAuthenticatedUser(c);

			if (!user) {
				return c.json(
					{
						success: false,
						error: "Unauthorized",
					},
					401,
				);
			}

			c.set("user", user);
			await next();
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "Authentication failed",
				},
				401,
			);
		}
	};
}

export function AuthRoleMiddleware(allowedRoles: string[]) {
	return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
		try {
			const user = await getAuthenticatedUser(c);

			if (!user) {
				return c.json(
					{
						success: false,
						error: "Unauthorized",
					},
					401,
				);
			}

			if (!allowedRoles.includes(user.role)) {
				return c.json(
					{
						success: false,
						error: `Forbidden: Required roles: ${allowedRoles.join(", ")}`,
					},
					403,
				);
			}

			c.set("user", user);
			await next();
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "Authentication failed",
				},
				401,
			);
		}
	};
}
