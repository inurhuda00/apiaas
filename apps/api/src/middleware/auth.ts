import { verifyToken } from "@apiaas/auth";
import type { Context, Next } from "hono";
import type { Env, Variables } from "@/types";

export const extractBearerToken = (c: Context): string | null => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return null;
	}
	return authHeader.replace("Bearer ", "");
};

export function AuthMiddleware() {
	return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
		const token = extractBearerToken(c);

		if (!token) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
				},
				401,
			);
		}

		try {
			const session = await verifyToken(token, c.env.AUTH_SECRET);

			if (!session) {
				return c.json(
					{
						success: false,
						error: "Invalid token",
					},
					401,
				);
			}

			c.set("user", session.user);
			await next();
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "Invalid token",
				},
				401,
			);
		}
	};
}

export function AuthRoleMiddleware(allowedRoles: string[]) {
	return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
		const token = extractBearerToken(c);

		if (!token) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
				},
				401,
			);
		}

		try {
			const session = await verifyToken(token, c.env.AUTH_SECRET);

			if (!session) {
				return c.json(
					{
						success: false,
						error: "Invalid token",
					},
					401,
				);
			}

			if (!allowedRoles.includes(session.user.role)) {
				return c.json(
					{
						success: false,
						error: `Forbidden: Required roles: ${allowedRoles.join(", ")}`,
					},
					403,
				);
			}

			c.set("user", session.user);
			await next();
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "Invalid token",
				},
				401,
			);
		}
	};
}
