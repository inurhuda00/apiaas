import type { Context } from "hono";

export const handleError = (c: Context, error: unknown, defaultMessage: string) => {
	console.error(defaultMessage, error);
	return c.json(
		{
			success: false,
			error: error instanceof Error ? error.message : defaultMessage,
		},
		500,
	);
};
