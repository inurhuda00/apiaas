"use client";

import {
	useState,
	useCallback,
	use,
	useRef,
	useActionState,
	startTransition,
} from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { env } from "@/env";
import { useSession } from "@/components/providers/session";
import type { ActionState } from "@/actions/middleware";
import { updateProduct } from "@/actions/products";
import { DynamicFileUploader } from "@/components/lazy-components";

const API_BASE_URL = env.NEXT_PUBLIC_BACKEND_URL;

interface ProductData {
	id: string;
	name: string;
	description?: string;
	price: string;
	category: string;
	userId: number;
	createdAt: string;
}

interface MediaItem {
	url: string;
	filename: string;
	size: number;
	type: string;
	isPrimary: boolean;
}

interface FileItem {
	filename: string;
	originalName: string;
	size: number;
	type: string;
}

interface FileUploadState {
	mediaFiles: File[];
	files: File[];
	progresses: Record<string, number>;
	uploadedMediaItems: MediaItem[];
	uploadedFileItems: FileItem[];
	pendingUploads: Set<string>;
}

async function uploadWithProgress<T>(
	url: string,
	formData: FormData,
	onProgress: (progress: number) => void,
	token?: string | null,
): Promise<T> {
	try {
		const response = await axios.post<{
			data: T;
		}>(`${API_BASE_URL}${url}`, formData, {
			withCredentials: true,
			headers: {
				"Content-Type": "multipart/form-data",
				Authorization: `Bearer ${token}`,
			},
			onUploadProgress: (progressEvent) => {
				const total = progressEvent.total || 0;
				if (total <= 0) return;

				const percentCompleted = Math.round(
					(progressEvent.loaded * 100) / total,
				);
				onProgress(percentCompleted);
			},
		});
		return response.data.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			const apiError =
				error.response.data?.error ||
				`Request failed with status ${error.response.status}`;
			throw new Error(apiError);
		}

		throw new Error(
			error instanceof Error
				? error.message
				: "An unknown error occurred during upload",
		);
	}
}

const productService = {
	async createProduct(
		data: { name: string },
		token?: string | null,
	): Promise<ProductData> {
		try {
			const response = await axios.post<{
				data: ProductData;
			}>(`${API_BASE_URL}/v1/product/create`, data, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				withCredentials: true,
			});

			return response.data.data;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response) {
				const apiError =
					error.response.data?.error ||
					`Request failed with status ${error.response.status}`;
				throw new Error(apiError);
			}
			throw new Error(
				error instanceof Error ? error.message : "An unknown error occurred",
			);
		}
	},

	async uploadMedia(
		productId: string,
		file: File,
		onProgress: (progress: number) => void,
		isPrimary = false,
		token?: string | null,
	): Promise<MediaItem> {
		const formData = new FormData();
		formData.append("productId", productId);
		formData.append("file", file);
		formData.append("isPrimary", isPrimary.toString());

		return uploadWithProgress<MediaItem>(
			"/v1/product/media",
			formData,
			onProgress,
			token,
		);
	},

	async uploadFile(
		productId: string,
		file: File,
		onProgress: (progress: number) => void,
		token?: string | null,
	): Promise<FileItem> {
		const formData = new FormData();
		formData.append("productId", productId);
		formData.append("file", file);

		return uploadWithProgress<FileItem>(
			"/v1/product/files",
			formData,
			onProgress,
			token,
		);
	},
};

export function UploadImageForm() {
	const { sessionPromise } = useSession();
	const sessionToken = use(sessionPromise);

	const uploadStateRef = useRef<FileUploadState>({
		mediaFiles: [],
		files: [],
		progresses: {},
		uploadedMediaItems: [],
		uploadedFileItems: [],
		pendingUploads: new Set(),
	});

	const productIdRef = useRef<string>("");

	const [state, formAction, pending] = useActionState<ActionState, FormData>(
		updateProduct,
		{},
	);

	const [progresses, setProgresses] = useState<Record<string, number>>({});

	const isMediaFileAlreadyUploaded = useCallback((file: File): boolean => {
		return uploadStateRef.current.uploadedMediaItems.some((item) => {
			const nameMatch = item.filename === file.name;
			const sizeTypeMatch = item.size === file.size && item.type === file.type;
			return nameMatch || sizeTypeMatch;
		});
	}, []);

	const isFileAlreadyUploaded = useCallback((file: File): boolean => {
		return uploadStateRef.current.uploadedFileItems.some((item) => {
			const nameMatch = item.originalName === file.name;
			const sizeTypeMatch = item.size === file.size && item.type === file.type;
			return (nameMatch && item.size === file.size) || sizeTypeMatch;
		});
	}, []);

	const identifyNewFiles = useCallback(
		(newFiles: File[], currentFiles: File[]): File[] => {
			return newFiles.filter(
				(newFile) =>
					!currentFiles.some(
						(currentFile) =>
							currentFile.name === newFile.name &&
							currentFile.size === newFile.size &&
							currentFile.type === newFile.type &&
							currentFile.lastModified === newFile.lastModified,
					),
			);
		},
		[],
	);

	const updateProgress = useCallback((fileName: string, progress: number) => {
		uploadStateRef.current.progresses[fileName] = progress;
		setProgresses((prev) => ({
			...prev,
			[fileName]: progress,
		}));
	}, []);

	const createTemporaryProduct = async (): Promise<string> => {
		if (productIdRef.current) {
			return productIdRef.current;
		}

		try {
			const tempProduct = await productService.createProduct(
				{ name: "Temporary Product" },
				sessionToken,
			);

			productIdRef.current = tempProduct.id;

			return tempProduct.id;
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to create temporary product for uploads",
				variant: "destructive",
			});
			throw error;
		}
	};

	async function handleImageUpload(file: File): Promise<void> {
		if (uploadStateRef.current.pendingUploads.has(file.name)) {
			return;
		}

		if (isMediaFileAlreadyUploaded(file)) {
			return;
		}

		try {
			uploadStateRef.current.pendingUploads.add(file.name);

			const productId = await createTemporaryProduct();

			uploadStateRef.current.progresses[file.name] = 0;

			const isPrimary = uploadStateRef.current.uploadedMediaItems.length === 0;

			const mediaItem = await productService.uploadMedia(
				productId,
				file,
				(progress) => updateProgress(file.name, progress),
				isPrimary,
				sessionToken,
			);

			uploadStateRef.current.uploadedMediaItems.push(mediaItem);

			uploadStateRef.current.pendingUploads.delete(file.name);
		} catch (error) {
			uploadStateRef.current.pendingUploads.delete(file.name);

			toast({
				title: "Upload Error",
				description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
				variant: "destructive",
			});
		}
	}

	async function handleFileUpload(file: File): Promise<void> {
		if (uploadStateRef.current.pendingUploads.has(file.name)) {
			return;
		}

		if (isFileAlreadyUploaded(file)) {
			return;
		}

		try {
			uploadStateRef.current.pendingUploads.add(file.name);
			const productId = await createTemporaryProduct();

			uploadStateRef.current.progresses[file.name] = 0;

			const fileItem = await productService.uploadFile(
				productId,
				file,
				(progress) => updateProgress(file.name, progress),
				sessionToken,
			);

			uploadStateRef.current.uploadedFileItems.push(fileItem);

			uploadStateRef.current.pendingUploads.delete(file.name);
		} catch (error) {
			uploadStateRef.current.pendingUploads.delete(file.name);
			toast({
				title: "Upload Error",
				description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`,
				variant: "destructive",
			});
		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		formData.append("productId", productIdRef.current);

		startTransition(() => {
			formAction(formData);
		});
	}

	return (
		<form onSubmit={handleSubmit}>
			<Accordion
				type="single"
				collapsible
				defaultValue="general"
				className="mb-6"
			>
				<AccordionItem value="general" className="border bg-card rounded-md">
					<AccordionTrigger className="px-4 py-3">
						<span className="text-base font-medium">General</span>
					</AccordionTrigger>
					<AccordionContent className="px-4 pb-4">
						<div className="space-y-4">
							<div>
								<Label htmlFor="name" className="font-medium">
									Product name <span className="text-red-500">*</span>
								</Label>
								<Input
									id="name"
									name="name"
									type="text"
									autoComplete="name"
									defaultValue={state.name}
									placeholder="Product name"
									className="mt-1"
								/>
								<p className="text-sm text-muted-foreground mt-1">
									Give your product a short and clear name
								</p>
							</div>

							<div>
								<Label htmlFor="description" className="font-medium">
									Product description
								</Label>
								<Textarea
									id="description"
									name="description"
									defaultValue={state.description}
									className="mt-1"
									placeholder="Describe your product"
								/>
								<p className="text-sm text-muted-foreground mt-1">
									Give your product a short and clear description
								</p>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Accordion
				type="single"
				collapsible
				defaultValue="media"
				className="mb-6"
			>
				<AccordionItem value="media" className="border bg-card rounded-md">
					<AccordionTrigger className="px-4 py-3">
						<span className="text-base font-medium">Media</span>
					</AccordionTrigger>
					<AccordionContent className="px-4 pb-4">
						<DynamicFileUploader
							accept={{ "image/*": [] }}
							maxSize={10 * 1024 * 1024}
							maxFiles={5}
							multiple={true}
							value={uploadStateRef.current.mediaFiles}
							progresses={progresses}
							onValueChange={(newFiles) => {
								const files = newFiles as File[];

								const addedFiles = identifyNewFiles(
									files,
									uploadStateRef.current.mediaFiles,
								);

								uploadStateRef.current.mediaFiles = files;

								const filesToUpload = addedFiles.filter(
									(file) =>
										!isMediaFileAlreadyUploaded(file) &&
										!uploadStateRef.current.pendingUploads.has(file.name),
								);

								if (filesToUpload.length > 0) {
									for (const file of filesToUpload) {
										handleImageUpload(file);
									}
								}
							}}
						/>
						<p className="text-sm text-muted-foreground mt-4">
							Add up to 10 images to your product. Used to represent your
							product during checkout, in email, social sharing and more.
						</p>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Accordion
				type="single"
				collapsible
				defaultValue="pricing"
				className="mb-6"
			>
				<AccordionItem value="pricing" className="border bg-card rounded-md">
					<AccordionTrigger className="px-4 py-3">
						<span className="text-base font-medium">Pricing</span>
					</AccordionTrigger>
					<AccordionContent className="px-4 pb-4">
						<div className="space-y-4">
							<div>
								<Label htmlFor="price" className="font-medium">
									Price <span className="text-red-500">*</span>
								</Label>
								<div className="relative mt-1">
									<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
										<span className="text-gray-500">$</span>
									</div>
									<Input
										id="price"
										name="price"
										type="text"
										inputMode="numeric"
										pattern="[0-9]*"
										min="0"
										step="0.01"
										onKeyDown={(e) => {
											if (
												!/^[0-9]$/.test(e.key) &&
												![
													"Backspace",
													"Delete",
													"ArrowLeft",
													"ArrowRight",
													"Tab",
												].includes(e.key) &&
												!e.ctrlKey
											) {
												e.preventDefault();
											}
										}}
										className="pl-8"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="category" className="font-medium">
									Category <span className="text-red-500">*</span>
								</Label>
								<Select defaultValue={state.category}>
									<SelectTrigger className="mt-1">
										<SelectValue placeholder="Select a category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="digital-goods">
											Digital goods or services (excluding ebooks)
										</SelectItem>
										<SelectItem value="physical-goods">
											Physical goods
										</SelectItem>
										<SelectItem value="services">Services</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<Accordion
				type="single"
				collapsible
				defaultValue="files"
				className="mb-6"
			>
				<AccordionItem value="files" className="border bg-card rounded-md">
					<AccordionTrigger className="px-4 py-3">
						<span className="text-base font-medium">Files</span>
					</AccordionTrigger>
					<AccordionContent className="px-4 pb-4">
						<DynamicFileUploader
							maxSize={5 * 1024 * 1024 * 1024}
							maxFiles={5}
							multiple={true}
							value={uploadStateRef.current.files}
							progresses={progresses}
							onValueChange={(newFiles) => {
								const files = newFiles as File[];

								const addedFiles = identifyNewFiles(
									files,
									uploadStateRef.current.files,
								);

								uploadStateRef.current.files = files;

								const filesToUpload = addedFiles.filter(
									(file) =>
										!isFileAlreadyUploaded(file) &&
										!uploadStateRef.current.pendingUploads.has(file.name),
								);

								if (filesToUpload.length > 0) {
									for (const file of filesToUpload) {
										handleFileUpload(file);
									}
								}
							}}
							scrollableArea={true}
						/>
						<p className="text-sm text-muted-foreground mt-4">
							Upload an unlimited number of files to your product. Your
							customers will be given access to them after purchase. Unlimited
							files, 5GB total limit.
						</p>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			<div className="flex justify-end">
				<SubmitButton pending={pending}>Create Product</SubmitButton>
			</div>

			<div className="mt-4">
				{state.error && (
					<div className="text-red-500 text-sm">{state.error}</div>
				)}

				{state.success && (
					<div className="text-green-500 text-sm">{state.success}</div>
				)}
			</div>
		</form>
	);
}
