import { SignJWT, jwtVerify } from "jose";
import type { SessionData } from "./types";

const ACCESS_TOKEN_EXPIRY = "15m"; // e.g., 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // e.g., 7 days

/**
 * Sign an Access Token (JWT) with the provided payload and secret
 */
export async function signAccessToken(
	payload: SessionData,
	authSecret: string,
) {
	const key = new TextEncoder().encode(authSecret);
	return await new SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(ACCESS_TOKEN_EXPIRY)
		.sign(key);
}

/**
 * Sign a Refresh Token (JWT) with the provided payload and secret
 */
export async function signRefreshToken(
	payload: SessionData,
	authSecret: string,
) {
	const key = new TextEncoder().encode(authSecret);
	// Refresh token payload might be simpler, e.g., just { userId: payload.userId }
	// but using the full SessionData is also acceptable.
	return await new SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(REFRESH_TOKEN_EXPIRY)
		.sign(key);
}

/**
 * Verify a JWT token (typically an Access Token) using the provided secret
 */
export async function verifyToken(token: string, authSecret: string) {
	const key = new TextEncoder().encode(authSecret);
	try {
		const { payload } = await jwtVerify(token, key, {
			algorithms: ["HS256"],
		});
		return payload as SessionData;
	} catch (error) {
		// Handle potential errors like expired token, invalid signature etc.
		console.error("JWT Verification failed:", error);
		return null; // Return null or throw a specific error
	}
}
