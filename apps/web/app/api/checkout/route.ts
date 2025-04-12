import { env } from "@/env";
import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
	accessToken: env.POLAR_ACCESS_TOKEN,
	server: "sandbox",
	successUrl: `${env.APP_URL}/confirmation`,
});
