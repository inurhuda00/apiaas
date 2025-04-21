import { Hono } from "hono";
import { logger } from "hono/logger";
import { timing } from "hono/timing";
import { cors } from "hono/cors";
import { DurableObjectRateLimiter, DurableObjectStore } from "@hono-rate-limiter/cloudflare";
import type { Env } from "../types";
import waitlistRoute from "./routes/waitlist";
import imageRoute from "./routes/image";
import authRoute from "./routes/auth";
import productRoute from "./routes/product";
import { searchRoute } from "./routes/search";
import { rateLimiter } from "hono-rate-limiter";

const app = new Hono<{ Bindings: Env }>();

// Add all middleware and routes
app.use("*", timing());
app.use("*", logger());
app.use(
	"*",
	cors({
		origin: [
			"http://localhost:8787",
			"http://localhost:3000",
			"https://mondive.xyz",
			"https://www.mondive.xyz",
			"https://api.mondive.xyz",
		],
		allowHeaders: ["content-type", "authorization", "x-requested-with", "x-forwarded-for"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		credentials: true,
		exposeHeaders: ["content-length", "content-type"],
	}),
);

// // Add rate limiting middleware
// app.use("/v1/*", (c, next) => {
// 	return rateLimiter({
// 		windowMs: 60000, // 1 minute
// 		limit: 60, // 60 requests per minute
// 		keyGenerator: (c) => c.req.header("x-forwarded-for") || "",
// 		store: new DurableObjectStore({ namespace: c.env.RATE_LIMITER }),
// 		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
// 	})(c as any, next);
// });

app.route("waitlist", waitlistRoute);
app.route("v1/image", imageRoute);
app.route("v1/auth", authRoute);
app.route("v1/product", productRoute);
app.route("v1/search", searchRoute);

app.get("/up", (c) => {
	return c.json({ status: "ok" });
});

app.onError((err, c) => {
	console.error(err);
	return c.json({ error: "Internal server error" }, 500);
});

export default {
	fetch: app.fetch,
};
export { DurableObjectRateLimiter };

export type AppType = typeof app;
