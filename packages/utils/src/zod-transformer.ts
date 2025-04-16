import type { ZodError } from "zod";

export function transformZodError(error: ZodError) {
	const errors: Record<string, string[]> = {};

	for (const err of error.errors) {
		const path = err.path.join(".");
		if (!errors[path]) {
			errors[path] = [];
		}
		errors[path].push(err.message);
	}

	return {
		message: Object.values(errors)[0][0],
		errors,
	};
}
