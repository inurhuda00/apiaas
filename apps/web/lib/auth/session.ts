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
} from "@apiaas/auth";
import { cookies } from "next/headers";
import { env } from "@/env";
import { createRefreshToken, deleteRefreshToken, getRefreshToken as getRefreshTokenFromDb } from "@/lib/db/queries/token";
import { getUserById } from "@/lib/db/queries/user";

const ACCESS_TOKEN_NAME = "session";
const REFRESH_TOKEN_NAME = "refresh";
const AUTH_SECRET = env.AUTH_SECRET;

export type { SessionData };
export { hashPassword, comparePasswords };

export async function getUser() {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get(ACCESS_TOKEN_NAME);

	if (sessionCookie) {
		try {
			const sessionData = await verifyToken(sessionCookie.value, AUTH_SECRET);

			if (sessionData?.user?.id && typeof sessionData.user.id === "number") {
				const user = await getUserById(sessionData.user.id);
				if (user) return user;
			}
		} catch (error) {}
	}

	const refreshCookie = cookieStore.get(REFRESH_TOKEN_NAME);
	if (!refreshCookie) return null;

	try {
		const refreshData = await verifyToken(refreshCookie.value, AUTH_SECRET);
		if (!refreshData?.user?.id || typeof refreshData.user.id !== "number")
			return null;

		const storedToken = await getRefreshTokenFromDb(refreshCookie.value);
		if (!storedToken) return null;

		const session: SessionData = {
			user: {
				id: refreshData.user.id,
				role: refreshData.user.role,
			},
		};

		const accessToken = await signAccessToken(session, AUTH_SECRET);
		cookieStore.set(ACCESS_TOKEN_NAME, accessToken, {
			expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRY),
			httpOnly: true,
			secure: true,
			sameSite: "lax",
		});

		return await getUserById(refreshData.user.id);
	} catch (error) {
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
	cookieStore.delete(ACCESS_TOKEN_NAME);
	cookieStore.delete(REFRESH_TOKEN_NAME);
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

	console.log("setting session", accessToken, refreshToken);

	const refreshTokenDb = await createRefreshToken(refreshToken, user.id);

	console.log("refreshTokenDb", refreshTokenDb);

	console.log("ACCESS_TOKEN_NAME", ACCESS_TOKEN_NAME);
	console.log("REFRESH_TOKEN_NAME", REFRESH_TOKEN_NAME);

	(await cookies()).set(ACCESS_TOKEN_NAME, accessToken, {
		expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRY),
		httpOnly: true,
		secure: true,
		sameSite: "lax",
	});

	(await cookies()).set(REFRESH_TOKEN_NAME, refreshToken, {
		expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
		httpOnly: true,
		secure: true,
		sameSite: "lax",
	});
}
