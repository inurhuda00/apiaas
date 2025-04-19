import { deleteSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const GET = async () => {
	await deleteSession();
	redirect("/");
};
