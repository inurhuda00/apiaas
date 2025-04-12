import type { ExtendedColumnSort } from "./parsers";

export type SortItem = ExtendedColumnSort;

/**
 * Creates a URL with the given query parameters
 */
export function createUrl({
	baseUrl = "",
	sort,
	page,
	perPage,
	filters = [],
	name,
}: {
	baseUrl?: string;
	sort?: SortItem[];
	page?: number;
	perPage?: number;
	filters?: Array<{
		field: string;
		operator: string;
		value: string | string[];
		variant?: string;
	}>;
	name?: string;
} = {}) {
	const searchParams = new URLSearchParams();

	// Add sorting
	if (sort && sort.length > 0) {
		searchParams.set("sort", JSON.stringify(sort));
	}

	// Add pagination
	if (page && page > 1) {
		searchParams.set("page", String(page));
	}

	if (perPage) {
		searchParams.set("perPage", String(perPage));
	}

	// Add filters
	if (filters && filters.length > 0) {
		searchParams.set("filters", JSON.stringify(filters));
	}

	if (name) {
		searchParams.set("name", name);
	}

	const queryString = searchParams.toString();
	return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
}
