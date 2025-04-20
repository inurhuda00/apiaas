import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { FilterOption, SortOption, DataControlsResult, FilterBadge } from "@/lib/hooks/useDataControls";

interface DataControlsProps<T> {
	controls: DataControlsResult<T>;
	filterOptions: FilterOption[];
	sortOptions: SortOption[];
	searchPlaceholder?: string;
}

interface PaginationProps {
	pageCount: number;
	currentPage: number;
	baseUrl: string;
	searchParams?: Record<string, string | string[] | undefined>;
}

export function DataControls<T>({
	controls,
	filterOptions,
	sortOptions,
	searchPlaceholder = "Search...",
}: DataControlsProps<T>) {
	const { filterStates, sortStates, getFilterUrl, getSortUrl, getClearUrl, activeFilters } = controls;

	// Group sort options
	const groupedSortOptions = sortOptions.reduce(
		(acc, option) => {
			const group = option.group || "default";
			if (!acc[group]) acc[group] = [];
			acc[group].push(option);
			return acc;
		},
		{} as Record<string, SortOption[]>,
	);

	return (
		<div className="space-y-4">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div className="flex flex-wrap gap-2">
					{/* Filter Buttons */}
					<div className="flex flex-wrap gap-2">
						{filterOptions.map((option) => (
							<Button key={option.key} asChild variant={filterStates[option.key] ? "default" : "outline"} size="sm">
								<Link href={getFilterUrl(option.field, option.operator, option.value)} scroll={false} prefetch={true}>
									{option.label} {option.count ? `(${option.count})` : ""}
								</Link>
							</Button>
						))}
					</div>

					{/* Sort Dropdown */}
					<div className="relative group">
						<Button variant="outline" size="sm" className="gap-1">
							Sort <Icons.ChevronDown className="h-4 w-4" />
						</Button>
						<div className="absolute right-0 z-10 w-56 origin-top-right">
							<div className="py-2 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block mt-2">
								{Object.entries(groupedSortOptions).map(([group, options]) => (
									<div key={group}>
										<div className="px-3 py-2 text-xs font-semibold text-gray-500">
											{group.charAt(0).toUpperCase() + group.slice(1)}
										</div>
										{options.map((option) => {
											const Icon = option.icon;
											return (
												<Link
													key={option.key}
													href={getSortUrl(option.column as keyof T, option.desc)}
													className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 w-full text-left ${sortStates[option.key] ? "bg-gray-100 font-medium" : ""}`}
													scroll={false}
													prefetch={true}
												>
													{Icon && <Icon className="h-3.5 w-3.5" />}
													<span>{option.label}</span>
												</Link>
											);
										})}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Active Filters */}
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-xs text-muted-foreground font-medium">filters:</span>

				{activeFilters.map((filter: FilterBadge) => (
					<Badge key={filter.id} variant="secondary" className="pl-2 pr-1 h-6 gap-1 font-normal">
						<span className="font-medium">
							{filter.type === "search" ? "Search:" : filter.type === "filter" ? "Filter:" : "Sort:"}
						</span>{" "}
						{filter.label}
						<Button asChild variant="ghost" size="icon" className="h-4 w-4 ml-1 hover:bg-secondary/80">
							<Link href={filter.clearHref} scroll={false} prefetch={true}>
								<Icons.X className="h-3 w-3" />
							</Link>
						</Button>
					</Badge>
				))}

				<Button asChild variant="link" size="sm" className="ml-auto h-6 p-0 text-xs text-primary">
					<Link href={getClearUrl()} scroll={false} prefetch={true}>
						Clear all
					</Link>
				</Button>
			</div>
		</div>
	);
}

export function Paginate({ pageCount, currentPage, baseUrl, searchParams = {} }: PaginationProps) {
	// Don't render pagination if there's only one page
	if (pageCount <= 1) return null;

	const createPageUrl = (page: number) => {
		const params = new URLSearchParams();

		// Add existing search params
		for (const [key, value] of Object.entries(searchParams)) {
			if (key !== "page" && value !== undefined) {
				if (Array.isArray(value)) {
					for (const v of value) {
						params.append(key, v);
					}
				} else {
					params.append(key, value);
				}
			}
		}

		// Add the page parameter
		params.set("page", String(page));

		return `${baseUrl}?${String(params)}`;
	};

	// Generate array of page numbers to show
	const getPageNumbers = () => {
		const pages: (number | null)[] = [];

		// Always show first page
		pages.push(1);

		// Calculate range around current page
		const rangeStart = Math.max(2, currentPage - 1);
		const rangeEnd = Math.min(pageCount - 1, currentPage + 1);

		// Add ellipsis if there's a gap between 1 and rangeStart
		if (rangeStart > 2) {
			pages.push(null); // null represents ellipsis
		}

		// Add pages in the range
		for (let i = rangeStart; i <= rangeEnd; i++) {
			pages.push(i);
		}

		// Add ellipsis if there's a gap between rangeEnd and last page
		if (rangeEnd < pageCount - 1) {
			pages.push(null);
		}

		// Always show last page if more than 1 page exists
		if (pageCount > 1) {
			pages.push(pageCount);
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	// Create a unique ID for each ellipsis
	let ellipsisCounter = 0;

	return (
		<div className="flex items-center justify-center space-x-2 mt-8">
			{/* Previous button */}
			<Button variant="outline" size="icon" disabled={currentPage <= 1} asChild={currentPage > 1}>
				{currentPage > 1 ? (
					<Link href={createPageUrl(currentPage - 1)} aria-label="Previous page" prefetch={true}>
						<Icons.ChevronLeft className="h-4 w-4" />
					</Link>
				) : (
					<span>
						<Icons.ChevronLeft className="h-4 w-4" />
					</span>
				)}
			</Button>

			{/* Page numbers */}
			{pageNumbers.map((page) => {
				if (page === null) {
					ellipsisCounter++;
					return (
						<span key={`ellipsis-${ellipsisCounter}`} className="px-1">
							<Icons.MoreHoriz className="h-4 w-4" />
						</span>
					);
				}

				return (
					<Button
						key={`page-${page}`}
						variant={page === currentPage ? "default" : "outline"}
						size="icon"
						className="w-9 h-9"
						asChild={page !== currentPage}
					>
						{page !== currentPage ? (
							<Link href={createPageUrl(page)} prefetch={true}>
								{page}
							</Link>
						) : (
							<span>{page}</span>
						)}
					</Button>
				);
			})}

			{/* Next button */}
			<Button
				variant="outline"
				size="icon"
				className={cn(currentPage >= pageCount ? "opacity-50 cursor-not-allowed" : "")}
				disabled={currentPage >= pageCount}
				asChild={currentPage < pageCount}
			>
				{currentPage < pageCount ? (
					<Link href={createPageUrl(currentPage + 1)} aria-label="Next page" prefetch={true}>
						<Icons.ChevronRight className="h-4 w-4" />
					</Link>
				) : (
					<span>
						<Icons.ChevronRight className="h-4 w-4" />
					</span>
				)}
			</Button>
		</div>
	);
}
