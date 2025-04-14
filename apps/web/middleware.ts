import { signAccessToken, verifyToken } from "@apiaas/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "./env";
import { getAccessToken, getUser } from "./lib/auth/session";

const protectedRoutes = new Set([
	"/overview",
	"/settings",
	"/settings/general",
	"/settings/security",
	"/upload",
]);

const signInRoutes = new Set(["/sign-in"]);

const STATIC_PATHS = [
	/^\/_next\/static\/.*/,
	/^\/_next\/image\/.*/,
	/^\/images\/.*/,
	/^\/assets\/.*/,
	/^\/api\/static\/.*/,
	/^\/favicon\.ico/,
	/^\/about$/,
	/^\/terms$/,
	/^\/privacy$/,
	/^\/license$/,
];

const CACHE_TIMES = {
	STATIC: 60 * 60 * 24 * 30,
	CONTENT: 60 * 60 * 24,
	DYNAMIC: 60 * 5,
};

function getCachingHeaders(
	pathname: string,
	method: string,
): Headers | undefined {
	if (method !== "GET") return undefined;

	const isStaticPath = STATIC_PATHS.some((pattern) =>
		pattern instanceof RegExp ? pattern.test(pathname) : pathname === pattern,
	);

	if (isStaticPath) {
		const headers = new Headers();
		headers.set(
			"Cache-Control",
			`public, max-age=${CACHE_TIMES.STATIC}, s-maxage=${CACHE_TIMES.STATIC}, stale-while-revalidate=60`,
		);
		return headers;
	}

	if (/^\/[a-zA-Z0-9-]+\/?$/.test(pathname) && !pathname.startsWith("/api/")) {
		const headers = new Headers();
		headers.set(
			"Cache-Control",
			`public, max-age=${CACHE_TIMES.CONTENT}, s-maxage=${CACHE_TIMES.CONTENT}, stale-while-revalidate=60`,
		);
		return headers;
	}

	if (/^\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/?$/.test(pathname)) {
		const headers = new Headers();
		headers.set(
			"Cache-Control",
			`public, max-age=${CACHE_TIMES.DYNAMIC}, s-maxage=${CACHE_TIMES.DYNAMIC}, stale-while-revalidate=60`,
		);
		return headers;
	}

	return undefined;
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const loggedInUser = await getUser();

	console.log(loggedInUser);

	if (loggedInUser && signInRoutes.has(pathname)) {
		return NextResponse.redirect(new URL("/overview", request.url));
	}

	if (protectedRoutes.has(pathname)) {
		if (!loggedInUser) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
	}

	const cacheHeaders = getCachingHeaders(pathname, request.method);
	if (cacheHeaders) {
		const response = NextResponse.next();
		cacheHeaders.forEach((value, key) => {
			response.headers.set(key, value);
		});
		return response;
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
