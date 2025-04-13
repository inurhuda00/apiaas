"use client";

import { useActionState, useState } from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { uploadImage, type UploadImageActionState } from "@/actions/upload";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";

export function UploadImageForm() {
	const [state, formAction, pending] = useActionState<
		UploadImageActionState,
		FormData
	>(uploadImage, {
		error: "",
		success: "",
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upload Files</CardTitle>
				<CardDescription>
					Upload your files using the uploader below. Supported file types are
					images.
				</CardDescription>
			</CardHeader>
			<form action={formAction}>
				<CardContent>
					<div className="mb-2">
						<Input
							id="file"
							name="file"
							type="file"
							autoComplete="file"
							className="mt-1"
						/>
					</div>
					<div>
						{state.error && (
							<div className="text-red-500 text-sm">{state.error}</div>
						)}

						{state.success && (
							<div className="text-green-500 text-sm">{state.success}</div>
						)}
					</div>
				</CardContent>
				<CardFooter className="">
					<SubmitButton pending={pending}>Upload</SubmitButton>
				</CardFooter>
			</form>
		</Card>
	);
}
