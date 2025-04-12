import { defineConfig } from "drizzle-kit";

if (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "../../packages/db",
	out: "./drizzle",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
