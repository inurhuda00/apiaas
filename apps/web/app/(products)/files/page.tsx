import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { files } from "@apiaas/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatDistanceToNow } from "date-fns";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import Link from "next/link";
import { getAuthenticatedUser } from "@/lib/auth/session";

export const metadata = {
	title: "My Files",
	description: "Manage your uploaded files",
};

export default async function FilesPage() {
	const user = await getAuthenticatedUser();

	if (!user) {
		redirect("/sign-in");
	}

	const userFiles = await db.query.files.findMany({
		where: eq(files.productId, user.id),
		orderBy: desc(files.createdAt),
	});

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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{userFiles.map((file) => (
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
			)}
		</main>
	);
}
