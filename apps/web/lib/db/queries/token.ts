import { eq } from "drizzle-orm";
import { refreshTokens } from "@apiaas/db/schema";
import { db } from "..";
import { REFRESH_TOKEN_EXPIRY } from "@apiaas/auth";

export async function deleteRefreshToken(token: string) {
	return db.delete(refreshTokens).where(eq(refreshTokens.token, token));
}

export async function createRefreshToken(token: string, userId: number) {
	return db.insert(refreshTokens).values({
			token,
			userId,
			expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY),
		})
		.returning({ token: refreshTokens.token });
}

export async function getRefreshToken(token: string) {
	return db.query.refreshTokens.findFirst({
		where: eq(refreshTokens.token, token),
	});
}

export async function getRefreshTokenByUserId(userId: number) {
	return db.query.refreshTokens.findFirst({
		where: eq(refreshTokens.userId, userId),
	});
}
