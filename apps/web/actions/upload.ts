"use server";

import { redirect } from "next/navigation";
import { validatedActionWithUser } from "./middleware";
import { UploadImageSchema } from "./upload.validation";
import { getCookieValue } from "@/lib/auth/session";

export type UploadImageActionState = {
	error?: string;
	success?: string;
};

export const uploadImage = validatedActionWithUser(
	UploadImageSchema,
	async (data, _, user): Promise<UploadImageActionState> => {
		const { file } = data;
		const token = await getCookieValue();

		if (!token) redirect("/sign-in");

		const formData = new FormData();
		formData.append("file", file);

		const res = await fetch("https://api.mondive.xyz/v1/image/upload", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		const result = await res.json();

		if (!result.success) {
			return {
				error: `Upload failed: ${res.status} - ${result.error}`,
			};
		}

		return {
			success: "success",
		};
	},
);
