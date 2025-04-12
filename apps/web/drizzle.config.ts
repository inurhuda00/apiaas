import { type Config, defineConfig } from "drizzle-kit";
import { env } from "./env";

export default defineConfig({
	dialect: "postgresql",
	schema: "../../packages/db",
	out: "./drizzle",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
}) satisfies Config;
