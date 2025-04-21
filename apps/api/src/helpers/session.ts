import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME, verifyToken, signAccessToken, ACCESS_TOKEN_EXPIRY } from "@apiaas/auth";
import type { Context } from "hono";
import type { Env, Variables } from "@/types";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { database } from "@apiaas/db";
import { eq } from "drizzle-orm";
import { refreshTokens } from "@apiaas/db/schema";

export async function getAuthenticatedUser(c: Context<{ Bindings: Env; Variables: Variables }>) {
	// Try to authenticate with access token first
	const accessToken = getCookie(c, ACCESS_TOKEN_NAME);
	if (accessToken) {
		try {
			console.info("API - Verifying access token...");
			const sessionData = await verifyToken(accessToken, c.env.AUTH_SECRET);
			if (sessionData?.user && (!sessionData.expires || new Date(sessionData.expires) >= new Date())) {
				console.info(`API - Access token valid for user ID: ${sessionData.user.id}`);
				return sessionData.user;
			}
			console.warn("API - Access token invalid or expired");
		} catch (error) {
			console.error("API - Error verifying access token:", error);
		}
	} else {
		console.info("API - No access token present");
	}

	// Try to authenticate with refresh token
	const refreshToken = getCookie(c, REFRESH_TOKEN_NAME);
	if (!refreshToken) {
		console.info("API - No refresh token present");
		return null;
	}

	try {
		console.info("API - Verifying refresh token...");
		const refreshData = await verifyToken(refreshToken, c.env.AUTH_SECRET);

		// Validate refresh token data
		if (
			!refreshData?.user?.id ||
			typeof refreshData.user.id !== "number" ||
			(refreshData.expires && new Date(refreshData.expires) < new Date())
		) {
			console.warn("API - Invalid or expired refresh token");
			return null;
		}

		// Verify token exists in database
		const db = database(c.env.DATABASE_URL);
		const storedToken = await db.query.refreshTokens.findFirst({
			where: eq(refreshTokens.token, refreshToken),
		});

		if (!storedToken) {
			console.warn("API - Refresh token not found in database");
			return null;
		}

		console.info(`API - User authenticated via refresh token: ${refreshData.user.id}`);

		// Issue new access token
		const session = {
			user: {
				id: refreshData.user.id,
				role: refreshData.user.role,
			},
		};

		const newAccessToken = await signAccessToken(session, c.env.AUTH_SECRET);
		setCookie(c, ACCESS_TOKEN_NAME, newAccessToken, {
			expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRY),
			httpOnly: true,
			secure: true,
			sameSite: "Lax",
			path: "/",
			domain: c.env.SESSION_DOMAIN,
		});

		return refreshData.user;
	} catch (error) {
		console.error("API - Error verifying refresh token:", error);
		return null;
	}
}

export async function deleteSession(c: Context<{ Bindings: Env }>) {
	const refreshToken = getCookie(c, REFRESH_TOKEN_NAME);
	if (refreshToken) {
		const db = database(c.env.DATABASE_URL);
		await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
	}

	deleteCookie(c, ACCESS_TOKEN_NAME, {
		path: "/",
		secure: c.env.NODE_ENV === "production",
		sameSite: "Lax",
		domain: c.env.SESSION_DOMAIN,
	});

	deleteCookie(c, REFRESH_TOKEN_NAME, {
		path: "/",
		secure: c.env.NODE_ENV === "production",
		sameSite: "Lax",
		domain: c.env.SESSION_DOMAIN,
	});
}
