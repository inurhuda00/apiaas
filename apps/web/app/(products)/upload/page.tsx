"use client";

import { useState } from "react";
import { FileUploader } from "@/components/upload/file-uploader";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { mockFileUpload } from "@/lib/utils/mock-upload";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { MaxWidthWrapper } from "@/components/max-width-wrapper";

export default function UploadPage() {
	const [progresses, setProgresses] = useState<Record<string, number>>({});
	const [files, setFiles] = useState<Array<File>>([]);

	const handleProcess = async () => {
		setProgresses(Object.fromEntries(files.map((file) => [file.name, 0])));

		await Promise.all(
			files.map(async (file) => {
				try {
					const result = await mockFileUpload(
						file,
						{ minDuration: 2000, failureRate: 0.1 },
						(progress) => {
							setProgresses((prev) => ({
								...prev,
								[file.name]: progress,
							}));
						},
					);
					return { file, success: true, result };
				} catch (error) {
					console.error(`Upload failed for ${file.name}:`, error);
					return { file, success: false, error };
				}
			}),
		);
	};

	return (
		<MaxWidthWrapper>
			<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
				<div>
					<h1 className="text-3xl font-bold">File Upload</h1>
				</div>
				<Link href="/files" className={buttonVariants()}>
					My Assets
				</Link>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Upload Files</CardTitle>
					<CardDescription>
						Upload your files using the uploader below. Supported file types are
						images.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FileUploader
						value={files}
						onValueChange={setFiles}
						accept={{ "image/*": [] }}
						maxSize={1024 * 1024 * 5} // 5MB
						maxFiles={5}
						multiple={true}
						progresses={progresses}
					/>
				</CardContent>
				<CardFooter>
					<Button onClick={handleProcess} disabled={!files.length}>
						Process
					</Button>
				</CardFooter>
			</Card>
		</MaxWidthWrapper>
	);
}
