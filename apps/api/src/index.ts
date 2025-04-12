import { Hono } from "hono";
import { logger } from "hono/logger";
import { timing } from "hono/timing";
import { cors } from "hono/cors";
import { rateLimiter } from "hono-rate-limiter";
import type { Env } from "../types";
import {
	DurableObjectRateLimiter,
	DurableObjectStore,
} from "@hono-rate-limiter/cloudflare";
import waitlistRoute from "./routes/waitlist";

const app = new Hono<{ Bindings: Env }>();

// Add all middleware and routes
app.use("*", timing());
app.use("*", logger());
app.use(
	"*",
	cors({
		origin: [
			"http://localhost:8787",
			"https://mondive.xyz",
			"https://*.mondive.xyz",
			"https://*.mondive.xyz",
		],
		allowHeaders: ["*"],
		allowMethods: ["*"],
		credentials: true,
		exposeHeaders: ["*"],
	}),
);

// Add rate limiting middleware
app.use("/v1/*", (c, next) => {
	return rateLimiter({
		windowMs: 60000, // 1 minute
		limit: 60, // 60 requests per minute
		keyGenerator: (c) => c.req.header("x-forwarded-for") || "",
		store: new DurableObjectStore({ namespace: c.env.RATE_LIMITER }),
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	})(c as any, next);
});

app.route("waitlist", waitlistRoute);

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
