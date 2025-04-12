import { createParser, parseAsString } from "nuqs/server";
import { z } from "zod";

import { createSearchParamsCache, parseAsInteger } from "nuqs/server";

export function searchParamsCache<T extends Record<string, unknown>>(
	defaultSort?: {
		column: keyof T;
		desc: boolean;
	},
	defaultPerPage = 12,
) {
	return createSearchParamsCache({
		name: parseAsString.withDefault(""),
		page: parseAsInteger.withDefault(1),
		perPage: parseAsInteger.withDefault(defaultPerPage),
		sort: getSortingStateParser<T>().withDefault(
			defaultSort ? [defaultSort] : [],
		),
		filters: getFiltersStateParser().withDefault([]),
	});
}

const sortingItemSchema = z.object({
	column: z.string(),
	desc: z.boolean(),
});

export type ExtendedColumnSort<TData = unknown> = {
	column: keyof TData;
	desc: boolean;
};

export const getSortingStateParser = <TData>(
	columnIds?: string[] | Set<string>,
) => {
	const validKeys = columnIds
		? columnIds instanceof Set
			? columnIds
			: new Set(columnIds)
		: null;

	return createParser({
		parse: (value) => {
			try {
				const parsed = JSON.parse(value);
				const result = z.array(sortingItemSchema).safeParse(parsed);

				if (!result.success) return null;

				if (
					validKeys &&
					result.data.some((item) => !validKeys.has(item.column))
				) {
					return null;
				}

				return result.data as ExtendedColumnSort<TData>[];
			} catch {
				return null;
			}
		},
		serialize: (value) => JSON.stringify(value),
		eq: (a, b) =>
			a.length === b.length &&
			a.every(
				(item, index) =>
					item.column === b[index]?.column && item.desc === b[index]?.desc,
			),
	});
};

const filterItemSchema = z.object({
	field: z.string(),
	value: z.union([z.string(), z.array(z.string())]),
	operator: z.enum(["equals", "contains", "in"]),
	variant: z.enum(["text", "select", "date"]).optional(),
});

export type ExtendedColumnFilter<TData = unknown> = z.infer<
	typeof filterItemSchema
>;

export const getFiltersStateParser = <TData>(
	columnIds?: string[] | Set<string>,
) => {
	const validKeys = columnIds
		? columnIds instanceof Set
			? columnIds
			: new Set(columnIds)
		: null;

	return createParser({
		parse: (value) => {
			try {
				const parsed = JSON.parse(value);
				const result = z.array(filterItemSchema).safeParse(parsed);

				if (!result.success) return null;

				if (
					validKeys &&
					result.data.some((item) => !validKeys.has(item.field))
				) {
					return null;
				}

				return result.data as ExtendedColumnFilter<TData>[];
			} catch {
				return null;
			}
		},
		serialize: (value) => JSON.stringify(value),
		eq: (a, b) =>
			a.length === b.length &&
			a.every(
				(filter, index) =>
					filter.field === b[index]?.field &&
					filter.value === b[index]?.value &&
					filter.operator === b[index]?.operator &&
					filter.variant === b[index]?.variant,
			),
	});
};
