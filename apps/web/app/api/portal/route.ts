import { env } from "@/env";
import { getSession } from "@/lib/auth/session";
import { getCustomerId } from "@/lib/db/queries/user";
import { CustomerPortal } from "@polar-sh/nextjs";
import type { NextRequest } from "next/server";

export const GET = CustomerPortal({
	accessToken: env.POLAR_ACCESS_TOKEN,
	getCustomerId: async (req: NextRequest) => {
		const session = await getSession();

		if (!session) return "";

		const customerId = await getCustomerId(session?.user.id);

		return customerId ? customerId : "";
	},
	server: "sandbox",
});
