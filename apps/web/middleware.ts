import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { type SessionData, signAccessToken, verifyToken } from "@apiaas/auth";
import { env } from "./env";
import { setAccessToken } from "./lib/auth/session";

const ACCESS_TOKEN_NAME = "session";
const REFRESH_TOKEN_NAME = "refresh";

const AUTH_SECRET = env.AUTH_SECRET;

const protectedRoutes = new Set([
	"/overview",
	"/settings",
	"/settings/general",
	"/settings/security",
	"/upload",
	"/files",
]);

const signInRoutes = new Set(["/sign-in"]);

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	console.info(`Middleware processing request for: ${pathname}`);

	const cookieStore = request.cookies;

	// Get user from session or refresh token
	const loggedInUser = await getAuthenticatedUser(cookieStore);

	// Redirect authenticated users away from sign-in pages
	if (loggedInUser && signInRoutes.has(pathname)) {
		console.info(
			`Redirecting authenticated user from ${pathname} to /overview`,
		);
		return NextResponse.redirect(new URL("/overview", request.url));
	}

	// Handle protected routes
	if (protectedRoutes.has(pathname)) {
		console.info(`Checking access to protected route: ${pathname}`);
		if (!loggedInUser) {
			console.warn(`Access denied to ${pathname}, redirecting to sign-in`);
			// Clear any invalid tokens and redirect to sign-in
			await clearAuthTokens(cookieStore);
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
		console.info(`Access granted to ${pathname}`);
	}

	console.info(`Middleware completed for ${pathname}`);
	return NextResponse.next();
}

async function getAuthenticatedUser(cookieStore: NextRequest["cookies"]) {
	// Try access token first
	const sessionCookie = cookieStore.get(ACCESS_TOKEN_NAME);
	console.info(`Session cookie present: ${!!sessionCookie?.value}`);

	if (sessionCookie?.value) {
		try {
			console.info("Verifying access token...");
			const sessionData = await verifyToken(sessionCookie.value, AUTH_SECRET);
			if (sessionData?.expires && new Date(sessionData.expires) < new Date()) {
				console.warn("Access token expired");
				return null;
			}

			if (!sessionData?.user) {
				console.warn("Invalid user data in access token");
				return null;
			}

			console.info(`Access token valid for user ID: ${sessionData.user.id}`);
			return sessionData.user;
		} catch (error) {
			console.error("Error verifying access token:", error);
		}
	}

	// Fall back to refresh token
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

		if (!refreshData?.user) {
			console.warn("Invalid user data in refresh token");
			return null;
		}

		console.info(`Refresh token valid for user ID: ${refreshData.user.id}`);

		const session: SessionData = {
			user: {
				id: refreshData.user.id,
				role: refreshData.user.role,
			},
		};

		const accessToken = await signAccessToken(session, AUTH_SECRET);
		await setAccessToken(accessToken);

		return refreshData.user;
	} catch (error) {
		console.error("Error verifying refresh token:", error);
		return null;
	}
}

async function clearAuthTokens(cookieStore: NextRequest["cookies"]) {
	cookieStore.delete(ACCESS_TOKEN_NAME);
	cookieStore.delete(REFRESH_TOKEN_NAME);
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
