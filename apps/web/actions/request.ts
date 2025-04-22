"use server";

import { validatedAction } from "./middleware";
import { requestSchema } from "./request.validation";

export const submitAssetRequest = validatedAction(requestSchema, async (data, formData) => {
	try {
		return { success: "Your request has been submitted successfully!" };
	} catch (error) {
		return { error: "Failed to submit your request. Please try again later." };
	}
});
