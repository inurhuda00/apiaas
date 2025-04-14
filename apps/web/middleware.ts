import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
	ACCESS_TOKEN_EXPIRY,
	type SessionData,
	signAccessToken,
	verifyToken,
} from "@apiaas/auth";
import { env } from "./env";

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

	const { user: loggedInUser, response: authResponse } =
		await getAuthenticatedUser(request.cookies);
	const response = authResponse || NextResponse.next();

	// Redirect authenticated users away from sign-in page
	if (loggedInUser && signInRoutes.has(pathname)) {
		console.info(
			`Redirecting authenticated user from ${pathname} to /overview`,
		);
		const redirectResponse = NextResponse.redirect(
			new URL("/overview", request.url),
		);

		// Copy cookies from auth response if present
		if (authResponse) {
			for (const cookie of authResponse.cookies.getAll()) {
				redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
			}
		}
		return redirectResponse;
	}

	// Protect routes that require authentication
	if (protectedRoutes.has(pathname)) {
		console.info(`Checking access to protected route: ${pathname}`);
		if (!loggedInUser) {
			console.warn(`Access denied to ${pathname}, redirecting to sign-in`);
			const redirectResponse = NextResponse.redirect(
				new URL("/sign-in", request.url),
			);
			clearAuthTokens(redirectResponse.cookies);
			return redirectResponse;
		}
		console.info(`Access granted to ${pathname}`);
	}

	console.info(`Middleware completed for ${pathname}`);
	return response;
}

async function getAuthenticatedUser(
	cookieStore: NextRequest["cookies"],
): Promise<{
	user: SessionData["user"] | null;
	response: NextResponse | null;
}> {
	// Try to authenticate with access token first
	const sessionCookie = cookieStore.get(ACCESS_TOKEN_NAME);
	console.info(`Session cookie present: ${!!sessionCookie?.value}`);

	if (sessionCookie?.value) {
		try {
			console.info("Verifying access token...");
			const sessionData = await verifyToken(sessionCookie.value, AUTH_SECRET);

			if (!sessionData) {
				console.warn("Invalid access token");
				return { user: null, response: null };
			}

			if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
				console.warn("Access token expired");
				return { user: null, response: null };
			}

			if (!sessionData.user) {
				console.warn("Invalid user data in access token");
				return { user: null, response: null };
			}

			console.info(`Access token valid for user ID: ${sessionData.user.id}`);
			return { user: sessionData.user, response: null };
		} catch (error) {
			console.error("Error verifying access token:", error);
		}
	}

	// Fall back to refresh token if access token is invalid or missing
	console.info("No valid session, checking refresh token...");
	const refreshCookie = cookieStore.get(REFRESH_TOKEN_NAME);
	if (!refreshCookie?.value) {
		console.info("No refresh token present");
		return { user: null, response: null };
	}

	try {
		console.info("Verifying refresh token...");
		const refreshData = await verifyToken(refreshCookie.value, AUTH_SECRET);

		if (!refreshData) {
			console.warn("Invalid refresh token");
			return { user: null, response: null };
		}

		if (refreshData.expires && new Date(refreshData.expires) < new Date()) {
			console.warn("Refresh token expired");
			return { user: null, response: null };
		}

		if (!refreshData.user) {
			console.warn("Invalid user data in refresh token");
			return { user: null, response: null };
		}

		console.info(`Refresh token valid for user ID: ${refreshData.user.id}`);

		// Create new access token
		const session: SessionData = {
			user: {
				id: refreshData.user.id,
				role: refreshData.user.role,
			},
		};

		const accessToken = await signAccessToken(session, AUTH_SECRET);
		const response = NextResponse.next();

		response.cookies.set(ACCESS_TOKEN_NAME, accessToken, {
			expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRY),
			httpOnly: true,
			secure: true,
			sameSite: "lax",
		});

		return { user: refreshData.user, response };
	} catch (error) {
		console.error("Error verifying refresh token:", error);
		return { user: null, response: null };
	}
}

function clearAuthTokens(
	cookieStore: NextRequest["cookies"] | NextResponse["cookies"],
) {
	cookieStore.delete(ACCESS_TOKEN_NAME);
	cookieStore.delete(REFRESH_TOKEN_NAME);
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
