"use client";

import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useState, useRef } from "react";
import Dropzone, { type DropzoneOptions as DropzoneProps, type FileRejection } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/cn";
import { useControllableState } from "@/lib/utils/use-controllable-state";
import { toast, useToast } from "../ui/use-toast";
import formatBytes from "@/lib/utils/format-bytes";
import { Icons } from "../ui/icons";

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * Value of the uploader.
	 * @type File[]
	 * @default undefined
	 * @example value={files}
	 */
	value?: File[];

	/**
	 * Function to be called when the value changes.
	 * @type React.Dispatch<React.SetStateAction<File[]>>
	 * @default undefined
	 * @example onValueChange={(files) => setFiles(files)}
	 */
	onValueChange?: React.Dispatch<React.SetStateAction<File[]>>;

	/**
	 * Function to be called when files are uploaded.
	 * @type (files: File[]) => Promise<void>
	 * @default undefined
	 * @example onUpload={(files) => uploadFiles(files)}
	 */
	onUpload?: (files: File[]) => Promise<void>;

	/**
	 * Progress of the uploaded files.
	 * @type Record<string, number> | undefined
	 * @default undefined
	 * @example progresses={{ "file1.png": 50 }}
	 */
	progresses?: Record<string, number>;

	/**
	 * Accepted file types for the uploader.
	 * @type { [key: string]: string[]}
	 * @default
	 * ```ts
	 * { "image/*": [] }
	 * ```
	 * @example accept={["image/png", "image/jpeg"]}
	 */
	accept?: DropzoneProps["accept"];

	/**
	 * Maximum file size for the uploader.
	 * @type number | undefined
	 * @default 1024 * 1024 * 2 // 2MB
	 * @example maxSize={1024 * 1024 * 2} // 2MB
	 */
	maxSize?: DropzoneProps["maxSize"];

	/**
	 * Maximum number of files for the uploader.
	 * @type number | undefined
	 * @default 1
	 * @example maxFiles={5}
	 */
	maxFiles?: DropzoneProps["maxFiles"];

	/**
	 * Whether the uploader should accept multiple files.
	 * @type boolean
	 * @default false
	 * @example multiple
	 */
	multiple?: boolean;

	/**
	 * Whether the uploader is disabled.
	 * @type boolean
	 * @default false
	 * @example disabled
	 */
	disabled?: boolean;

	/**
	 * Whether the uploader is disabled.
	 * @type boolean
	 * @default false
	 * @example disabled
	 */
	scrollableArea?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
	const {
		value: valueProp,
		onValueChange,
		onUpload,
		progresses,
		accept = { "image/*": [] },
		maxSize = 1024 * 1024 * 2,
		maxFiles = 1,
		multiple = false,
		disabled = false,
		scrollableArea = false,
		className,
		...dropzoneProps
	} = props;

	const [files, setFiles] = useControllableState({
		prop: valueProp,
		onChange: onValueChange,
	});

	// Ref to keep track of files that have been sent for upload
	const pendingUploadRef = useRef<Set<string>>(new Set());

	const onDrop = useCallback(
		(acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
			if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
				toast({ title: "Cannot upload more than 1 file at a time" });
				return;
			}

			if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
				toast({ title: `Cannot upload more than ${maxFiles} files` });
				return;
			}

			const newFiles = acceptedFiles.map((file) =>
				Object.assign(file, {
					preview: URL.createObjectURL(file),
				}),
			);

			const updatedFiles = files ? [...files, ...newFiles] : newFiles;

			// Update files state immediately so they appear in the UI
			setFiles(updatedFiles);

			if (rejectedFiles.length > 0) {
				for (const rejected of rejectedFiles) {
					toast({
						title: `File ${rejected.file.name} was rejected`,
						variant: "error",
						duration: 3000,
					});
				}
			}

			// IMPORTANT: Filter out files that have already been sent for upload
			// This is the key to preventing duplicate uploads
			const filesToUpload = newFiles.filter((file) => !pendingUploadRef.current.has(file.name));

			if (filesToUpload.length === 0) {
				// All files already sent for upload, nothing to do
				return;
			}
		},
		[files, maxFiles, multiple, setFiles],
	);

	function onRemove(index: number) {
		if (!files) return;

		const removedFile = files[index];

		const newFiles = files.filter((_, i) => i !== index);

		setFiles(newFiles);
		onValueChange?.(newFiles);

		if (removedFile && isFileWithPreview(removedFile)) {
			URL.revokeObjectURL(removedFile.preview);

			// Remove from pending uploads if it was previously sent for upload
			pendingUploadRef.current.delete(removedFile.name);
		}
	}

	const isDisabled = disabled || (files?.length ?? 0) >= maxFiles;

	return (
		<div className="relative flex flex-col gap-6 overflow-hidden">
			<Dropzone
				onDrop={onDrop}
				accept={accept}
				maxSize={maxSize}
				maxFiles={maxFiles}
				multiple={maxFiles > 1 || multiple}
				disabled={isDisabled}
			>
				{({
					getRootProps,
					getInputProps,
					isDragActive,
				}: {
					getRootProps: () => Record<string, unknown>;
					getInputProps: () => Record<string, unknown>;
					isDragActive: boolean;
				}) => (
					<div
						{...getRootProps()}
						className={cn(
							"group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
							"ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							isDragActive && "border-muted-foreground/50",
							isDisabled && "pointer-events-none opacity-60",
							className,
						)}
						{...dropzoneProps}
					>
						<input name="images" {...getInputProps()} />
						{isDragActive ? (
							<div className="flex flex-col items-center justify-center gap-4 sm:px-5">
								<div className="rounded-full border border-dashed p-3">
									<Icons.FileUpload className="size-7 text-muted-foreground" aria-hidden="true" />
								</div>
								<p className="font-medium text-muted-foreground">Drop the files here</p>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center gap-4 sm:px-5">
								<div className="rounded-full border border-dashed p-3">
									<Icons.FileUpload className="size-7 text-muted-foreground" aria-hidden="true" />
								</div>
								<div className="space-y-px">
									<p className="font-medium text-muted-foreground">
										Drag {`'n'`} drop files here, or click to select files
									</p>
									<p className="text-sm text-muted-foreground/70">
										You can upload
										{maxFiles > 1
											? ` ${maxFiles === Number.POSITIVE_INFINITY ? "multiple" : maxFiles}
                      files (up to ${formatBytes(maxSize)} each)`
											: ` a file with ${formatBytes(maxSize)}`}
									</p>
								</div>
							</div>
						)}
					</div>
				)}
			</Dropzone>
			{files?.length && scrollableArea ? (
				<ScrollArea className="h-fit w-full px-3">
					<div className="max-h-48 space-y-4">
						{files?.map((file: File, index: number) => (
							<FileCard
								key={`${file.name}-${index}`}
								file={file}
								onRemove={() => onRemove(index)}
								progress={progresses?.[file.name]}
							/>
						))}
					</div>
				</ScrollArea>
			) : (
				<div className="space-y-4">
					{files?.map((file: File, index: number) => (
						<FileCard
							key={`${file.name}-${index}`}
							file={file}
							onRemove={() => onRemove(index)}
							progress={progresses?.[file.name]}
						/>
					))}
				</div>
			)}
		</div>
	);
}

interface FileCardProps {
	file: File;
	onRemove: () => void;
	progress?: number;
}

function FileCard({ file, progress, onRemove }: FileCardProps) {
	return (
		<div className="relative flex items-center space-x-4">
			<div className="flex flex-1 space-x-4">
				{isFileWithPreview(file) ? (
					<Image
						src={file.preview}
						alt={file.name}
						width={48}
						height={48}
						loading="lazy"
						className="aspect-square shrink-0  object-cover"
					/>
				) : null}
				<div className="flex w-full flex-col gap-2">
					<div className="space-y-px">
						<p className="line-clamp-1 text-sm font-medium text-foreground/80">{file.name}</p>
						<p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
					</div>
					{progress ? <Progress value={progress} className="h-2" /> : null}
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Button type="button" variant="outline" size="icon" className="size-7" onClick={onRemove}>
					<Icons.Close className="size-4 " aria-hidden="true" />
					<span className="sr-only">Remove file</span>
				</Button>
			</div>
		</div>
	);
}

function isFileWithPreview(file: File): file is File & { preview: string } {
	return "preview" in file && typeof file.preview === "string";
}
