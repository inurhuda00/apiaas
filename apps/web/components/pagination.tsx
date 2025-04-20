import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Button } from "./ui/button";
import { Icons } from "./ui/icons";

interface PaginationProps {
	pageCount: number;
	currentPage: number;
	baseUrl: string;
	searchParams?: Record<string, string | string[] | undefined>;
}

export function Pagination({ pageCount, currentPage, baseUrl, searchParams = {} }: PaginationProps) {
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
			<Button
				variant="outline"
				size="icon"
				className={cn(currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "")}
				asChild={currentPage > 1}
			>
				{currentPage > 1 ? (
					<Link href={createPageUrl(currentPage - 1)} aria-label="Previous page">
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
							<Icons.MoreHorizontal className="h-4 w-4" />
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
						{page !== currentPage ? <Link href={createPageUrl(page)}>{page}</Link> : <span>{page}</span>}
					</Button>
				);
			})}

			{/* Next button */}
			<Button
				variant="outline"
				size="icon"
				className={cn(currentPage >= pageCount ? "opacity-50 cursor-not-allowed" : "")}
				asChild={currentPage < pageCount}
			>
				{currentPage < pageCount ? (
					<Link href={createPageUrl(currentPage + 1)} aria-label="Next page">
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
