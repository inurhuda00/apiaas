export function DataControlsSkeleton() {
	return (
		<div className="space-y-4 animate-pulse">
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				{/* Search Input Skeleton */}
				<div className="relative w-full md:max-w-xs h-10 bg-muted rounded-md" />

				<div className="flex flex-wrap gap-2">
					{/* Filter Buttons Skeleton */}
					<div className="flex flex-wrap gap-2">
						{[...Array(3)].map((_, index) => (
							<div key={`filter-${index}`} className="h-8 w-20 bg-muted rounded-md" />
						))}
					</div>

					{/* Sort Dropdown Skeleton */}
					<div className="h-8 w-24 bg-muted rounded-md" />
				</div>
			</div>

			{/* Active Filters Skeleton */}
			<div className="flex flex-wrap items-center gap-2">
				{[...Array(2)].map((_, index) => (
					<div key={`active-filter-${index}`} className="h-6 w-24 bg-muted rounded-md" />
				))}
			</div>
		</div>
	);
}

export function PaginateSkeleton() {
	return (
		<div className="flex items-center justify-center space-x-2 mt-8">
			{[...Array(5)].map((_, index) => (
				<div key={`pagination-${index}`} className="h-9 w-9 bg-muted rounded-md" />
			))}
		</div>
	);
}
