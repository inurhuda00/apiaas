"use server";

import { mockFileUpload } from "@/lib/utils/mock-upload";
import { validatedActionWithUser } from "./middleware";
import { UploadAssetsSchema } from "./products.validation";

export const uploadAssets = validatedActionWithUser(
	UploadAssetsSchema,
	async (data, _, user) => {
		const progresses: Record<string, number> = {};

		return data.images.map(async (file) => {
			try {
				await mockFileUpload(
					file,
					{ minDuration: 2000, failureRate: 0.1 },
					(progress) => {
						progresses[file.name] = progress;
					},
				);

				return { progresses, error: "", success: "" };
			} catch (error) {
				return { error };
			}
		});
	},
);
