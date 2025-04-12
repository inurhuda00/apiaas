import { verifyToken } from "@apiaas/auth";
import type { Context, Next } from "hono";
import type { Env, Variables } from "@/types";

// Middleware autentikasi umum tanpa pemeriksaan role
export function AuthMiddleware() {
	return async (
		c: Context<{ Bindings: Env; Variables: Variables }>,
		next: Next,
	) => {
		const authHeader = c.req.header("Authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
				},
				401,
			);
		}

		try {
			const token = authHeader.replace("Bearer ", "");
			const session = await verifyToken(token, c.env.AUTH_SECRET);

			// Check if session is null (invalid token)
			if (!session) {
				return c.json(
					{
						success: false,
						error: "Invalid token",
					},
					401,
				);
			}

			// Add user data to context for use in route handlers
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

// Middleware dengan pemeriksaan role
export function AuthRoleMiddleware(allowedRoles: string[]) {
	return async (
		c: Context<{ Bindings: Env; Variables: Variables }>,
		next: Next,
	) => {
		const authHeader = c.req.header("Authorization");

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return c.json(
				{
					success: false,
					error: "Unauthorized",
				},
				401,
			);
		}

		try {
			const token = authHeader.replace("Bearer ", "");
			const session = await verifyToken(token, c.env.AUTH_SECRET);

			// Check if session is null (invalid token)
			if (!session) {
				return c.json(
					{
						success: false,
						error: "Invalid token",
					},
					401,
				);
			}

			// Check if user has one of the allowed roles
			if (!allowedRoles.includes(session.user.role)) {
				return c.json(
					{
						success: false,
						error: `Forbidden: Required roles: ${allowedRoles.join(", ")}`,
					},
					403,
				);
			}

			// Add user data to context for use in route handlers
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
