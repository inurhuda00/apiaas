import { SignJWT, jwtVerify } from "jose";
import type { SessionData } from "./types";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "./constants";

export async function signAccessToken(payload: SessionData, secret: string) {
	const key = new TextEncoder().encode(secret);
	const expiresIn = new Date(Date.now() + ACCESS_TOKEN_EXPIRY);
	return await new SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(expiresIn.getTime() / 1000)
		.sign(key);
}

export async function signRefreshToken(payload: SessionData, secret: string) {
	const key = new TextEncoder().encode(secret);
	const expiresIn = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);
	return await new SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(expiresIn.getTime() / 1000)
		.sign(key);
}

export async function verifyToken(token: string, secret: string) {
	const key = new TextEncoder().encode(secret);
	try {
		const { payload } = await jwtVerify(token, key, {
			algorithms: ["HS256"],
		});
		return payload as SessionData;
	} catch (error) {
		console.error("JWT Verification failed:", error);
		return null;
	}
}
