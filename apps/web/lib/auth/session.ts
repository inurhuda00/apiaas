"use server";

import {
	comparePasswords,
	hashPassword,
	type SessionData,
	verifyToken,
	signAccessToken,
	signRefreshToken,
	ACCESS_TOKEN_EXPIRY,
	REFRESH_TOKEN_EXPIRY,
	ACCESS_TOKEN_NAME,
	REFRESH_TOKEN_NAME,
} from "@apiaas/auth";
import { cookies } from "next/headers";
import { env } from "@/env";
import {
	createRefreshToken,
	deleteRefreshToken,
	getRefreshToken as getRefreshTokenFromDb,
} from "@/lib/db/queries/token";
import { getUserById } from "@/lib/db/queries/user";

const AUTH_SECRET = env.AUTH_SECRET;

export type { SessionData };
export { hashPassword, comparePasswords };

export async function getAuthenticatedUser() {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get(ACCESS_TOKEN_NAME);
	console.info(`Session cookie present: ${!!sessionCookie?.value}`);

	if (sessionCookie?.value) {
		try {
			console.info("Verifying access token...");
			const sessionData = await verifyToken(sessionCookie.value, AUTH_SECRET);
			if (sessionData?.expires && new Date(sessionData.expires) < new Date()) {
				console.warn("Access token expired");
				await deleteSession();
				return null;
			}

			if (sessionData?.user) {
				console.info(`Access token valid for user ID: ${sessionData.user.id}`);
				const user = await getUserById(sessionData.user.id);
				if (user) return user;
			}
		} catch (error) {
			console.error("Error verifying access token:", error);
			// Continue to refresh token flow
		}
	}

	console.info("No valid session, checking refresh token...");
	const refreshCookie = cookieStore.get(REFRESH_TOKEN_NAME);
	if (!refreshCookie?.value) {
		console.info("No refresh token present");
		return null;
	}

	try {
		console.info("Verifying refresh token...");
		const refreshData = await verifyToken(refreshCookie.value, AUTH_SECRET);
		if (refreshData?.expires && new Date(refreshData.expires) < new Date()) {
			console.warn("Refresh token expired");
			return null;
		}

		if (!refreshData?.user?.id || typeof refreshData.user.id !== "number") {
			console.warn("Invalid user data in refresh token");
			return null;
		}

		console.info(`Refresh token valid for user ID: ${refreshData.user.id}`);

		// verify refresh token is in database
		const refreshToken = await getRefreshTokenFromDb(refreshCookie.value);

		if (!refreshToken) {
			console.warn("Refresh token not found in database");
			return null;
		}

		const user = await getUserById(refreshData.user.id);
		if (!user) return null;

		console.info(`User authenticated via refresh token: ${refreshData.user.id}`);

		const session: SessionData = {
			user: {
				id: refreshData.user.id,
				role: refreshData.user.role || user.role,
			},
		};

		const accessToken = await signAccessToken(session, AUTH_SECRET);
		await setAccessToken(accessToken);

		return user;
	} catch (error) {
		console.error("Error verifying refresh token:", error);
		await deleteSession();
		return null;
	}
}

export async function getSession() {
	const session = await getAccessToken();
	if (!session) return null;
	return await verifyToken(session, AUTH_SECRET);
}

export async function getRefreshToken() {
	const cookieStore = await cookies();
	return cookieStore.get(REFRESH_TOKEN_NAME)?.value;
}

export async function getAccessToken() {
	const cookieStore = await cookies();
	return cookieStore.get(ACCESS_TOKEN_NAME)?.value;
}

export async function deleteSession() {
	const currentRefreshToken = await getRefreshToken();

	if (currentRefreshToken) {
		await deleteRefreshToken(currentRefreshToken);
	}

	const cookieStore = await cookies();

	// Delete session cookies properly
	// Setting maxAge to 0 expires cookies immediately
	cookieStore.set(ACCESS_TOKEN_NAME, "", {
		domain: env.SESSION_DOMAIN,
		path: "/",
		maxAge: 0,
	});
	cookieStore.set(REFRESH_TOKEN_NAME, "", {
		domain: env.SESSION_DOMAIN,
		path: "/",
		maxAge: 0,
	});
}

export async function setAccessToken(accessToken: string) {
	(await cookies()).set(ACCESS_TOKEN_NAME, accessToken, {
		expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRY),
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		domain: env.SESSION_DOMAIN,
	});
}

export async function setRefreshToken(refreshToken: string) {
	(await cookies()).set(REFRESH_TOKEN_NAME, refreshToken, {
		expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		domain: env.SESSION_DOMAIN,
	});
}

export async function setSession(user: { id: number; role: string }) {
	const session: SessionData = {
		user: {
			id: user.id as number,
			role: user.role as string,
		},
	};

	const accessToken = await signAccessToken(session, AUTH_SECRET);
	const refreshToken = await signRefreshToken(session, AUTH_SECRET);

	await createRefreshToken(refreshToken, user.id);

	await setAccessToken(accessToken);
	await setRefreshToken(refreshToken);
}
