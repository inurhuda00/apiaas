import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, gt } from "drizzle-orm";
import {
	signAccessToken,
	signRefreshToken,
	verifyToken,
	REFRESH_TOKEN_EXPIRY,
	ACCESS_TOKEN_EXPIRY,
	REFRESH_TOKEN_NAME,
	ACCESS_TOKEN_NAME,
} from "@apiaas/auth";
import { comparePasswords } from "@apiaas/auth";
import { database } from "@apiaas/db";
import { users, refreshTokens, type NewRefreshToken } from "@apiaas/db/schema";
import type { Env, Variables } from "@/types";
import { AuthMiddleware } from "../middleware/auth";
import { setCookie, getCookie, deleteCookie } from "hono/cookie";

const authRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

authRoute.post(
	"/login",
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
						error: "Invalid email or password. Please try again.",
					},
					401,
				);
			}

			const isPasswordValid = await comparePasswords(password, user.password);

			if (!isPasswordValid) {
				return c.json(
					{
						success: false,
						error: "Invalid email or password. Please try again.",
					},
					401,
				);
			}

			const sessionPayload = {
				user: {
					id: user.id,
					role: user.role,
				},
			};

			const accessToken = await signAccessToken(sessionPayload, c.env.AUTH_SECRET);

			const refreshToken = await signRefreshToken(sessionPayload, c.env.AUTH_SECRET);

			const newRefreshToken: NewRefreshToken = {
				token: refreshToken,
				userId: user.id,
				expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
			};

			await db.insert(refreshTokens).values(newRefreshToken);

			setCookie(c, REFRESH_TOKEN_NAME, refreshToken, {
				httpOnly: true,
				expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
				path: "/",
				sameSite: "Lax",
				secure: c.env.NODE_ENV === "production",
				domain: c.env.SESSION_DOMAIN,
			});

			setCookie(c, ACCESS_TOKEN_NAME, accessToken, {
				httpOnly: true,
				expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRY),
				path: "/",
				sameSite: "Lax",
				secure: c.env.NODE_ENV === "production",
				domain: c.env.SESSION_DOMAIN,
			});

			return c.json({
				success: true,
				data: {
					accessToken,
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

authRoute.post("/refresh", async (c) => {
	try {
		const currentRefreshToken = getCookie(c, REFRESH_TOKEN_NAME);

		if (!currentRefreshToken) {
			return c.json({ success: false, error: "Refresh token not found" }, 401);
		}

		const decodedPayload = await verifyToken(currentRefreshToken, c.env.AUTH_SECRET);
		if (!decodedPayload || !decodedPayload.user?.id) {
			deleteCookie(c, REFRESH_TOKEN_NAME, { path: "/" });
			return c.json({ success: false, error: "Invalid refresh token" }, 401);
		}

		const db = database(c.env.DATABASE_URL);
		const storedToken = await db.query.refreshTokens.findFirst({
			where: and(
				eq(refreshTokens.token, currentRefreshToken),
				eq(refreshTokens.userId, decodedPayload.user.id),
				gt(refreshTokens.expiresAt, new Date()),
			),
		});

		if (!storedToken) {
			deleteCookie(c, REFRESH_TOKEN_NAME, { path: "/" });
			return c.json({ success: false, error: "Invalid or expired refresh token" }, 401);
		}

		await db.delete(refreshTokens).where(eq(refreshTokens.id, storedToken.id));

		const newSessionPayload = {
			user: { id: decodedPayload.user.id, role: decodedPayload.user.role },
		};
		const newRefreshTokenValue = await signRefreshToken(newSessionPayload, c.env.AUTH_SECRET);

		await db.insert(refreshTokens).values({
			token: newRefreshTokenValue,
			userId: decodedPayload.user.id,
			expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
		});

		setCookie(c, REFRESH_TOKEN_NAME, newRefreshTokenValue, {
			httpOnly: true,
			expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
			path: "/",
			sameSite: "Lax",
			secure: c.env.NODE_ENV === "production",
			domain: c.env.SESSION_DOMAIN,
		});

		const newAccessToken = await signAccessToken(newSessionPayload, c.env.AUTH_SECRET);

		return c.json({ success: true, data: { accessToken: newAccessToken } });
	} catch (error) {
		console.error("Refresh token error:", error);
		deleteCookie(c, REFRESH_TOKEN_NAME, { path: "/" });
		return c.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to refresh token",
			},
			500,
		);
	}
});

authRoute.post("/logout", async (c) => {
	try {
		const currentRefreshToken = getCookie(c, REFRESH_TOKEN_NAME);

		if (currentRefreshToken) {
			const db = database(c.env.DATABASE_URL);
			await db.delete(refreshTokens).where(eq(refreshTokens.token, currentRefreshToken));
		}

		deleteCookie(c, REFRESH_TOKEN_NAME, {
			httpOnly: true,
			path: "/",
			sameSite: "Lax",
			secure: c.env.NODE_ENV === "production",
			domain: c.env.SESSION_DOMAIN,
		});

		return c.json({ success: true, message: "Logged out successfully" });
	} catch (error) {
		console.error("Logout error:", error);
		deleteCookie(c, REFRESH_TOKEN_NAME, { path: "/" });
		return c.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to logout",
			},
			500,
		);
	}
});

authRoute.get("/me", AuthMiddleware(), async (c) => {
	try {
		const user = c.get("user");

		const db = database(c.env.DATABASE_URL);
		const userDetails = await db.query.users.findFirst({
			columns: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
			},
			where: eq(users.id, user.id),
		});

		if (!userDetails) {
			return c.json(
				{
					success: false,
					error: "User not found",
				},
				404,
			);
		}

		return c.json({
			success: true,
			data: userDetails,
		});
	} catch (error) {
		console.error("Get user error:", error);
		return c.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Failed to get user data",
			},
			500,
		);
	}
});

export default authRoute;
