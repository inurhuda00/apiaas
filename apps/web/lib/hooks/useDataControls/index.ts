import { createUrl, type SortItem } from "@/lib/utils/url";
import type {
	SearchStateResult,
	FilterOption,
	SortOption,
	FilterBadge,
} from "./types";

export type { SearchStateResult, FilterOption, SortOption, FilterBadge };

export type DataControlsResult<T> = {
	// Filter states
	filterStates: Record<string, boolean>;
	isFilterActive: (field: string, operator: string, value: string) => boolean;
	hasActiveFilters: boolean;

	// Sort states
	sortStates: Record<string, boolean>;
	isSortActive: (column: string, desc: boolean) => boolean;
	hasActiveSort: boolean;

	// URL helpers
	getFilterUrl: (
		field: string,
		operator: string,
		value: string,
		keepExisting?: boolean,
	) => string;
	getSortUrl: (column: keyof T, desc: boolean, page?: number) => string;
	getClearUrl: () => string;

	// Active filters
	activeFilters: FilterBadge[];

	// Current state
	currentSearch: SearchStateResult<T>;
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

	// Active Filters Management
	const getActiveFilters = (): FilterBadge[] => {
		const badges: FilterBadge[] = [];

		// Add search badge if exists
		if (search.name) {
			badges.push({
				id: "search",
				type: "search",
				label: search.name,
				clearHref: getClearUrl(),
			});
		}

		// Add filter badges
		for (const option of filterOptions) {
			if (isFilterActive(option.field, option.operator, option.value)) {
				badges.push({
					id: option.key,
					type: "filter",
					label: `${option.label}${option.count ? ` (${option.count})` : ""}`,
					clearHref: getClearUrl(),
				});
			}
		}

		// Add sort badge if exists
		if (search.sort.length > 0) {
			const activeSort = sortOptions.find((option) =>
				isSortActive(option.column, option.desc),
			);
			if (activeSort) {
				badges.push({
					id: "sort",
					type: "sort",
					label: activeSort.label,
					clearHref: getClearUrl(),
				});
			}
		}

		return badges;
	};

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

		// Active filters
		activeFilters: getActiveFilters(),

		// Current state
		currentSearch: search,
	};
}
