import type { z } from "zod";
import type { User } from "@apiaas/db/schema";
import { getUser } from "@/lib/db/queries/user";

export type ActionState = {
	error?: string;
	success?: string;
	[key: string]: any;
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
	data: z.infer<S>,
	formData: FormData,
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
	schema: S,
	action: ValidatedActionFunction<S, T>,
) {
	return async (_prevState: ActionState, formData: FormData): Promise<T> => {
		const result = schema.safeParse(Object.fromEntries(formData));
		if (!result.success) {
			return { error: result.error.errors[0].message } as T;
		}

		return action(result.data, formData);
	};
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
	data: z.infer<S>,
	formData: FormData,
	user: Pick<User, "id" | "name" | "email" | "role">,
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
	schema: S,
	action: ValidatedActionWithUserFunction<S, T>,
) {
	return async (_prevState: ActionState, formData: FormData): Promise<T> => {
		const user = await getUser();
		if (!user) {
			throw new Error("User is not authenticated");
		}

		const formDataObj: Record<string, unknown> = {};

		formData.forEach((value, key) => {
			if (key.endsWith("[]")) {
				const arrayKey = key.slice(0, -2);
				formDataObj[arrayKey] = formDataObj[arrayKey]
					? [...(formDataObj[arrayKey] as unknown[]), value]
					: [value];
			} else {
				formDataObj[key] =
					key in formDataObj ? [formDataObj[key], value].flat() : value;
			}
		});

		const result = schema.safeParse(formDataObj);
		if (!result.success) return { error: result.error.errors[0].message } as T;

		return action(result.data, formData, user);
	};
}
