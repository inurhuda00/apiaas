"use server";

import {
	comparePasswords,
	hashPassword,
	type SessionData,
	signToken,
	verifyToken,
} from "@apiaas/auth";
import { cookies } from "next/headers";
import { env } from "@/env";

// Define cookie name
const COOKIE_NAME = "session";
const AUTH_SECRET = env.AUTH_SECRET;

export type { SessionData };
export { hashPassword, comparePasswords };

export async function getCookieValue() {
	const session = (await cookies()).get(COOKIE_NAME)?.value;
	if (!session) return null;
	return session;
}

export async function getSession() {
	const session = await getCookieValue();
	if (!session) return null;
	return await verifyToken(session, AUTH_SECRET);
}

export async function setSession(user: { id: number; role: string }) {
	const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
	const session: SessionData = {
		user: {
			id: user.id as number,
			role: user.role as string,
		},
		expires: expiresInOneDay.toISOString(),
	};
	const encryptedSession = await signToken(session, AUTH_SECRET);
	(await cookies()).set(COOKIE_NAME, encryptedSession, {
		expires: expiresInOneDay,
		httpOnly: true,
		secure: true,
		sameSite: "lax",
	});
}
