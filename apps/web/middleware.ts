import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signToken, verifyToken } from "@/lib/auth/session";

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
	const sessionCookie = request.cookies.get("session");

	if (sessionCookie && signInRoutes.has(pathname)) {
		return NextResponse.redirect(new URL("/overview", request.url));
	}

	if (protectedRoutes.has(pathname)) {
		if (!sessionCookie) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}

		try {
			const parsed = await verifyToken(sessionCookie.value);
			const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

			const response = NextResponse.next();
			response.cookies.set({
				name: "session",
				value: await signToken({
					...parsed,
					expires: expiresInOneDay.toISOString(),
				}),
				httpOnly: true,
				secure: true,
				sameSite: "lax",
				expires: expiresInOneDay,
			});
			return response;
		} catch (error) {
			console.error("Error updating session:", error);
			const response = NextResponse.redirect(new URL("/sign-in", request.url));
			response.cookies.delete("session");
			return response;
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
