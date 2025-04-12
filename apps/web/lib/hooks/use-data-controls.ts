import type {
	ExtendedColumnSort,
	ExtendedColumnFilter,
} from "@/lib/utils/parsers";
import { createUrl, type SortItem } from "@/lib/utils/url";

export type SearchStateResult<T> = {
	readonly name: string;
	readonly page: number;
	readonly perPage: number;
	readonly sort: ExtendedColumnSort<T>[];
	readonly filters: ExtendedColumnFilter<T>[];
};

export type FilterOption = {
	key: string;
	field: string;
	operator: string;
	value: string;
};

export type SortOption = {
	key: string;
	column: string;
	desc: boolean;
	label: string;
	group?: string;
	icon?: React.ComponentType;
};

export function useDataControls<T>(
	search: SearchStateResult<T>,
	baseRoute: string,
	filterOptions: FilterOption[] = [],
	sortOptions: SortOption[] = [],
) {
	// Filter State Management
	const isFilterActive = (field: string, operator: string, value: string) =>
		search.filters.some(
			(f) =>
				f.field === field &&
				f.operator === operator &&
				String(f.value) === value,
		);

	const createFilterStates = () => {
		const states: Record<string, boolean> = {};

		for (const option of filterOptions) {
			states[option.key] = isFilterActive(
				option.field,
				option.operator,
				option.value,
			);
		}

		return states;
	};

	// Sort State Management
	const isSortActive = (column: string, desc: boolean) =>
		search.sort.some((s) => String(s.column) === column && s.desc === desc);

	const createSortStates = () => {
		const states: Record<string, boolean> = {};

		for (const option of sortOptions) {
			states[option.key] = isSortActive(option.column, option.desc);
		}

		return states;
	};

	// URL Building
	const getFilterUrl = (
		field: string,
		operator: string,
		value: string,
		keepExisting = false,
	) => {
		const filters = keepExisting
			? [
					...search.filters.filter((f) => f.field !== field),
					{ field, operator, value, variant: "select" },
				]
			: [{ field, operator, value, variant: "select" }];

		return createUrl({
			baseUrl: baseRoute,
			name: search.name || undefined,
			filters,
			page: 1,
		});
	};

	const getSortUrl = (column: keyof T, desc: boolean, page?: number) => {
		const sort = [{ column, desc }] as unknown as SortItem[];

		return createUrl({
			name: search.name || undefined,
			baseUrl: baseRoute,
			sort,
			page: page || undefined,
			filters: search.filters,
		});
	};

	const getClearUrl = () => createUrl({ baseUrl: baseRoute });

	return {
		// Filter states
		filterStates: createFilterStates(),
		isFilterActive,
		hasActiveFilters: Boolean(search.name) || search.filters.length > 0,

		// Sort states
		sortStates: createSortStates(),
		isSortActive,
		hasActiveSort: search.sort.length > 0,

		// URL helpers
		getFilterUrl,
		getSortUrl,
		getClearUrl,

		// Current state
		currentSearch: search,
	};
}
