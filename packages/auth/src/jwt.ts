import { SignJWT, jwtVerify } from "jose";
import type { SessionData } from "./types";

/**
 * Sign a JWT token with the provided payload and secret
 */
export async function signToken(payload: SessionData, authSecret: string) {
	const key = new TextEncoder().encode(authSecret);
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("1 day from now")
		.sign(key);
}

/**
 * Verify a JWT token using the provided secret
 */
export async function verifyToken(input: string, authSecret: string) {
	const key = new TextEncoder().encode(authSecret);
	try {
		const { payload } = await jwtVerify(input, key, {
			algorithms: ["HS256"],
		});
		return payload as SessionData;
	} catch (error) {
		return null;
	}
}
