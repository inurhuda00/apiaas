import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@apiaas/auth";
import { getUserById } from "./lib/db/queries/user";
import { deleteRefreshToken, getRefreshToken } from "./lib/db/queries/token";
import { env } from "./env";
import { deleteSession } from "./lib/auth/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { refreshTokens } from "@apiaas/db/schema";
import { db } from "./lib/db";
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

function getCachingHeaders(pathname: string, method: string): Map<string, string> | null {
	if (method !== "GET") return null;
	
	const cachablePaths = [
		"/",
		"/about",
		"/pricing",
		"/blog",
	];
	
	const shouldCache = cachablePaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
	
	if (shouldCache) {
		const headers = new Map<string, string>();
		headers.set("Cache-Control", "public, max-age=60, s-maxage=60, stale-while-revalidate=300");
		return headers;
	}
	
	return null;
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	console.info(`Middleware processing request for: ${pathname}`);
	
	const cookieStore = request.cookies;
	
	// Get user from session or refresh token
	const loggedInUser = await getAuthenticatedUser(cookieStore);
	
	// Redirect authenticated users away from sign-in pages
	if (loggedInUser && signInRoutes.has(pathname)) {
		console.info(`Redirecting authenticated user from ${pathname} to /overview`);
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
	
	// Apply caching headers if applicable
	const cacheHeaders = getCachingHeaders(pathname, request.method);
	if (cacheHeaders) {
		console.info(`Applying cache headers for ${pathname}`);
		const response = NextResponse.next();
		cacheHeaders.forEach((value, key) => {
			response.headers.set(key, value);
			console.debug(`Set cache header: ${key}=${value}`);
		});
		return response;
	}
	
	console.info(`Middleware completed for ${pathname}`);
	return NextResponse.next();
}

async function getAuthenticatedUser(cookieStore: NextRequest['cookies']) {
	// Try access token first
	const sessionCookie = cookieStore.get(ACCESS_TOKEN_NAME);
	console.info(`Session cookie present: ${!!sessionCookie?.value}`);
	
	if (sessionCookie?.value) {
		try {
			console.info("Verifying access token...");
			const sessionData = await verifyToken(sessionCookie.value, AUTH_SECRET);
			if (sessionData?.expires && new Date(sessionData.expires) < new Date()) {
				console.warn("Access token expired");
			} else if (sessionData?.user) {
				console.info(`Access token valid for user ID: ${sessionData.user.id}`);
				return sessionData.user;
			}
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
		
		if (!refreshData?.user?.id || typeof refreshData.user.id !== "number") {
			console.warn("Invalid user data in refresh token");
			return null;
		}
		
		console.info(`Refresh token valid for user ID: ${refreshData.user.id}`);
		
		// Verify token exists in database
		const storedToken = await getRefreshToken(refreshCookie.value);
		if (!storedToken) {
			console.warn("Refresh token not found in database");
			return null;
		}
		
		console.info("Refresh token found in database");
		console.info(`User authenticated via refresh token: ${refreshData.user.id}`);
		return refreshData.user;
	} catch (error) {
		console.error("Error verifying refresh token:", error);
		return null;
	}
}

async function clearAuthTokens(cookieStore: NextRequest['cookies']) {
	const refreshCookie = cookieStore.get(REFRESH_TOKEN_NAME);
	if (refreshCookie?.value) {
		await deleteRefreshToken(refreshCookie.value);
	}
	
	cookieStore.delete(ACCESS_TOKEN_NAME);
	cookieStore.delete(REFRESH_TOKEN_NAME);
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
