import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	shared: {},
	server: {
		APP_URL: z.string(),
		DATABASE_URL: z.string(),
		POLAR_ACCESS_TOKEN: z.string(),
		POLAR_WEBHOOK_SECRET: z.string(),
		POLAR_WORKSPACE_ID: z.string(),
		PRODUCT_ID: z.string(),
		AUTH_SECRET: z.string(),
		BACKEND_URL: z.string(),
		SESSION_DOMAIN: z.string(),
	},
	client: {
		NEXT_PUBLIC_BACKEND_URL: z.string(),
		NEXT_PUBLIC_ASSETS_URL: z.string(),
	},
	runtimeEnv: {
		APP_URL: process.env.APP_URL,
		NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
		NEXT_PUBLIC_ASSETS_URL: process.env.NEXT_PUBLIC_ASSETS_URL,
		DATABASE_URL: process.env.DATABASE_URL,
		POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
		POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
		POLAR_WORKSPACE_ID: process.env.POLAR_WORKSPACE_ID,
		PRODUCT_ID: process.env.PRODUCT_ID,
		AUTH_SECRET: process.env.AUTH_SECRET,
		BACKEND_URL: process.env.BACKEND_URL,
		SESSION_DOMAIN: process.env.SESSION_DOMAIN,
	},
	skipValidation: !!process.env.CI || !!process.env.SKIP_ENV_VALIDATION,
});
