import type { DurableObjectRateLimiter } from "@hono-rate-limiter/cloudflare";

export type Env = {
	DATABASE_URL: string;
	TURNSTILE_SITE_KEY: string;
	TURNSTILE_SECRET_KEY: string;
	RESEND_API_KEY: string;
	AUTH_SECRET: string;
	NODE_ENV?: "development" | "production";
	ASSET_DOMAIN?: string;
	SESSION_DOMAIN?: string;
	
	HYPERDRIVE: Hyperdrive;
	AI: Ai;
	EMAIL_LIMITER: {
		limit: (params: { key: string }) => Promise<{ success: boolean }>;
	};
	BUCKET: R2Bucket;
	RATE_LIMITER: DurableObjectNamespace<DurableObjectRateLimiter>;
};

export type Variables = {
	user: { id: number; role: string };
};
