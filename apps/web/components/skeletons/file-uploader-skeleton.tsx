import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/ui/icons";

export function FileUploaderSkeleton() {
	return (
		<div className="relative flex flex-col gap-6 overflow-hidden">
			<div className="group relative grid h-52 w-full place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center">
				<div className="flex flex-col items-center justify-center gap-4 sm:px-5">
					<div className="rounded-full border border-dashed p-3">
						<Icons.FileUpload
							className="size-7 text-muted-foreground/50"
							aria-hidden="true"
						/>
					</div>
					<div className="space-y-px">
						<Skeleton className="h-4 w-48" />
						<Skeleton className="h-3 w-40 mt-1" />
					</div>
				</div>
			</div>
			<div className="space-y-4">
				{Array.from({ length: 2 }).map((_, index) => (
					<div key={index} className="relative flex items-center space-x-4">
						<div className="flex flex-1 space-x-4">
							<Skeleton className="aspect-square h-12 w-12 shrink-0" />
							<div className="flex w-full flex-col gap-2">
								<div className="space-y-px">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-16 mt-1" />
								</div>
								<Skeleton className="h-2 w-full" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
