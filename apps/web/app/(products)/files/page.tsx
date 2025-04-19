import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { files, type File } from "@apiaas/db/schema";
import { desc, eq, and, sql, type SQL } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { Pagination } from "@/components/pagination";
import { searchParamsCache } from "@/lib/utils/parsers";
import { unstable_cache as cache } from "next/cache";
import { generateSearchCacheKey } from "@/lib/utils/generate-cache-key";
import type { SearchParams } from "next/dist/server/request/search-params";

export const metadata = {
	title: "My Files",
	description: "Manage your uploaded files",
};

interface PageProps {
	searchParams: SearchParams;
}

const ITEMS_PER_PAGE = 12;

export default async function FilesPage({ searchParams }: PageProps) {
	const user = await getAuthenticatedUser();

	if (!user) {
		redirect("/sign-in");
	}

	const search = searchParamsCache(
		{
			column: "createdAt" as keyof File,
			desc: true,
		},
		ITEMS_PER_PAGE
	).parse(searchParams);

	const { page, perPage, name } = search;
	const offset = (page - 1) * perPage;

	// Build conditions for file search
	const conditions: SQL<unknown>[] = [eq(files.productId, user.id)];
	
	// Add name filter if provided
	if (name) {
		conditions.push(sql`${files.name} ILIKE ${`%${name}%`}`);
	}

	// Use cache for better performance
	const filesCacheFunction = cache(
		async () => {
			// Get total count of user files with filters applied
			const totalCountResult = await db
				.select({ count: sql<number>`count(*)` })
				.from(files)
				.where(and(...conditions))
				.then((rows: { count: number }[]) => rows[0]?.count ?? 0);

			// Get paginated files
			const userFiles = await db.query.files.findMany({
				where: and(...conditions),
				orderBy: desc(files.createdAt),
				limit: perPage,
				offset,
			});

			return {
				files: userFiles,
				pagination: {
					total: Number(totalCountResult),
					perPage,
					page,
				}
			};
		},
		["user-files", user.id, generateSearchCacheKey(search)]
	);

	const { files: userFiles, pagination } = await filesCacheFunction();
	const totalPages = Math.ceil(pagination.total / perPage);

	const isImage = (fileType: string) => fileType.startsWith("image/");

	return (
		<main>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold">My Files</h1>
					<p className="text-muted-foreground mt-1">Manage your uploaded files</p>
				</div>
				<Link href="/upload" className={buttonVariants()}>
					<Icons.FileUpload className="h-4 w-4 mr-2" />
					Upload New File
				</Link>
			</div>

			{/* Search input */}
			<div className="mb-6">
				<form className="relative max-w-sm">
					<Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<input
						type="search"
						name="name"
						defaultValue={name ?? ""}
						placeholder="Search files..."
						className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
					/>
				</form>
			</div>

			{userFiles.length === 0 ? (
				<Card>
					<CardHeader>
						<CardTitle>No files found</CardTitle>
						<CardDescription>You haven't uploaded any files yet</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-center py-8 text-muted-foreground">Get started by uploading your first file</p>
					</CardContent>
				</Card>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{userFiles.map((file: File) => (
							<Card key={file.id} className="overflow-hidden flex flex-col">
								<div className="aspect-video bg-muted relative">
									{isImage(file.mimeType) ? (
										<img src={file.url} alt={file.name} className="w-full h-full object-cover" />
									) : (
										<div className="flex items-center justify-center h-full">
											<Icons.Description className="h-16 w-16 text-muted-foreground opacity-30" />
										</div>
									)}
								</div>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg truncate" title={file.name}>
										{file.name}
									</CardTitle>
									<CardDescription>
										{formatDistanceToNow(new Date(file.createdAt), {
											addSuffix: true,
										})}
									</CardDescription>
								</CardHeader>
								<CardContent className="pb-4 pt-0 flex-grow">
									<div className="text-xs text-muted-foreground mt-auto">
										<p className="flex items-center gap-1">
											<Icons.Image className="h-3 w-3" />
											<span>
												{file.fileName} ({(file.fileSize / 1024).toFixed(0)} KB)
											</span>
										</p>
										{file.width && file.height && (
											<p className="mt-1">
												{file.width} x {file.height}px
											</p>
										)}
									</div>
								</CardContent>
								<div className="px-6 pb-4 pt-0">
									<div className="flex space-x-2">
										<Button asChild variant="outline" size="sm" className="flex-1">
											<a
												href={file.url}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center justify-center"
											>
												<Icons.FileDownload className="h-4 w-4 mr-2" />
												Download
											</a>
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>

					{/* Pagination */}
					{totalPages > 1 && (
						<Pagination
							pageCount={totalPages}
							currentPage={page}
							baseUrl="/files"
							searchParams={searchParams}
						/>
					)}
				</>
			)}
		</main>
	);
}
