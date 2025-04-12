import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { signToken } from "@apiaas/auth";
import { comparePasswords } from "@apiaas/auth";
import { database } from "@apiaas/db";
import { users } from "@apiaas/db/schema";
import type { Env, Variables } from "@/types";

const authRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

authRoute.get("/", (c) => {
	return c.json({
		success: "true"
	})
})

authRoute.post(
	"/",
	zValidator("json", loginSchema, (result, c) => {
		if (!result.success) {
			return c.json(
				{
					success: false,
					error: result.error.format(),
				},
				400,
			);
		}
	}),
	async (c) => {
		try {
			const { email, password } = await c.req.valid("json");

			const db = database(c.env.DATABASE_URL);

			const user = await db.query.users.findFirst({
				columns: {
					id: true,
					name: true,
					email: true,
					role: true,
					password: true,
				},
				where: eq(users.email, email),
			});

			if (!user) {
				return c.json(
					{
						success: false,
						error: "Invalid credentials",
					},
					401,
				);
			}

			const isPasswordValid = await comparePasswords(password, user.password);

			if (!isPasswordValid) {
				return c.json(
					{
						success: false,
						error: "Invalid credentials",
					},
					401,
				);
			}

			const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
			const session = {
				user: {
					id: user.id,
					role: user.role,
				},
				expires: expiresInOneDay.toISOString(),
			};

			const token = await signToken(session, c.env.AUTH_SECRET);

			return c.json({
				success: true,
				data: {
					token,
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						role: user.role,
					},
				},
			});
		} catch (error) {
			console.error("Login error:", error);
			return c.json(
				{
					success: false,
					error: error instanceof Error ? error.message : "Failed to login",
				},
				500,
			);
		}
	},
);

export default authRoute;
