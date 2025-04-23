import type { z } from "zod";
import type { User } from "@apiaas/db/schema";
import { getAuthenticatedUser } from "@/lib/auth/session";

export type ActionState = {
	error?: string;
	success?: string;
	// biome-ignore lint/suspicious/noExplicitAny: Used for flexible action state
	[key: string]: any;
};

// biome-ignore lint/suspicious/noExplicitAny: Required for zod schema type
type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (data: z.infer<S>, formData: FormData) => Promise<T>;

// biome-ignore lint/suspicious/noExplicitAny: Required for zod schema type
export function validatedAction<S extends z.ZodType<any, any>, T>(schema: S, action: ValidatedActionFunction<S, T>) {
	return async (_prevState: ActionState, formData: FormData): Promise<T> => {
		// biome-ignore lint/suspicious/noExplicitAny: Needed for dynamic form data
		const formDataObj: Record<string, any> = {};

		formData.forEach((value, key) => {
			if (key.endsWith("[]")) {
				const arrayKey = key.slice(0, -2);
				// biome-ignore lint/suspicious/noExplicitAny: Required for array type casting
				formDataObj[arrayKey] = formDataObj[arrayKey] ? [...(formDataObj[arrayKey] as any[]), value] : [value];
			} else {
				formDataObj[key] = key in formDataObj ? [formDataObj[key], value].flat() : value;
			}
		});

		const result = schema.safeParse(formDataObj);
		if (!result.success) {
			return { error: result.error.errors[0].message } as T;
		}

		return action(result.data, formData);
	};
}

// biome-ignore lint/suspicious/noExplicitAny: Required for zod schema type
type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
	data: z.infer<S>,
	formData: FormData,
	user: Pick<User, "id" | "name" | "email" | "role">,
) => Promise<T>;

// biome-ignore lint/suspicious/noExplicitAny: Required for zod schema type
export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
	schema: S,
	action: ValidatedActionWithUserFunction<S, T>,
) {
	return async (_prevState: ActionState, formData: FormData): Promise<T> => {
		const user = await getAuthenticatedUser();
		if (!user) {
			throw new Error("User is not authenticated");
		}

		// biome-ignore lint/suspicious/noExplicitAny: Needed for dynamic form data
		const formDataObj: Record<string, any> = {};

		formData.forEach((value, key) => {
			if (key.endsWith("[]")) {
				const arrayKey = key.slice(0, -2);
				// biome-ignore lint/suspicious/noExplicitAny: Required for array type casting
				formDataObj[arrayKey] = formDataObj[arrayKey] ? [...(formDataObj[arrayKey] as any[]), value] : [value];
			} else {
				formDataObj[key] = key in formDataObj ? [formDataObj[key], value].flat() : value;
			}
		});

		const result = schema.safeParse(formDataObj);
		if (!result.success) return { error: result.error.errors[0].message } as T;

		return action(result.data, formData, user);
	};
}
