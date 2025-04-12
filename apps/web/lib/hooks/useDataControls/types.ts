import type {
	ExtendedColumnSort,
	ExtendedColumnFilter,
} from "@/lib/utils/parsers";
import type { LucideProps } from "lucide-react";
import type { RefAttributes, ForwardRefExoticComponent } from "react";
import type { IconType } from "react-icons/lib";

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
	label: string;
	count?: number;
};

export type SortOption = {
	key: string;
	column: string;
	desc: boolean;
	label: string;
	group?: string;
	icon?:
		| ForwardRefExoticComponent<
				Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
		  >
		| IconType;
};

export type FilterBadge = {
	id: string;
	type: string;
	label: string;
	clearHref: string;
};
