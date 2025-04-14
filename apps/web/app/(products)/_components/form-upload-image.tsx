"use client";

import { useState, useCallback, use, useRef } from "react";
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
import { FileUploader } from "@/components/upload/file-uploader";
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
		data: {
			name: string;
			description?: string;
			price: string;
			category: string;
		},
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
	const isTemporaryProductRef = useRef<boolean>(false);

	const [formState, setFormState] = useState({
		name: "Default",
		description: "",
		price: "",
		category: "",
		error: "",
		success: "",
		pending: false,
	});

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
				{
					name: "Temporary Product",
					description: "This is a temporary product created for file uploads",
					price: "0",
					category: "digital-goods",
				},
				sessionToken,
			);

			productIdRef.current = tempProduct.id;
			isTemporaryProductRef.current = true;

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

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		setFormState((prev) => ({
			...prev,
			pending: true,
			error: "",
			success: "",
		}));

		try {
			if (!formState.name) {
				throw new Error("Product name is required");
			}
			if (!formState.price) {
				throw new Error("Price is required");
			}
			if (!formState.category) {
				throw new Error("Category is required");
			}

			let productId = productIdRef.current;

			if (isTemporaryProductRef.current) {
				toast({
					title: "Updating product",
					description: "Finalizing product details...",
				});

				isTemporaryProductRef.current = false;

				setFormState((prev) => ({
					...prev,
					success: "Product updated successfully!",
				}));
			} else {
				const productData = await productService.createProduct(
					{
						name: formState.name,
						description: formState.description,
						price: formState.price,
						category: formState.category,
					},
					sessionToken,
				);

				productId = productData.id;
				productIdRef.current = productId;

				setFormState((prev) => ({
					...prev,
					success: "Product created successfully!",
				}));

				toast({
					title: "Product created",
					description: "Product created successfully!",
				});
			}

			setFormState((prev) => ({
				...prev,
				pending: false,
				success: "Product and all files uploaded successfully!",
			}));

			toast({
				title: "Success!",
				description: "Product and all files uploaded successfully!",
				variant: "success",
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to upload product";

			setFormState((prev) => ({
				...prev,
				pending: false,
				error: errorMessage,
			}));

			toast({
				title: "Error",
				description: errorMessage,
				variant: "destructive",
			});
		}
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
								<div className="flex justify-between mb-1">
									<Label htmlFor="name" className="font-medium">
										Product name <span className="text-red-500">*</span>
									</Label>
									<span className="text-sm text-muted-foreground">
										{formState.name.length}
									</span>
								</div>
								<Input
									id="name"
									name="name"
									value={formState.name}
									onChange={(e) =>
										setFormState({ ...formState, name: e.target.value })
									}
									className="mt-1"
									placeholder="Default"
								/>
								<p className="text-sm text-muted-foreground mt-1">
									Give your product a short and clear name
								</p>
							</div>

							<div>
								<div className="flex justify-between mb-1">
									<Label htmlFor="description" className="font-medium">
										Product description
									</Label>
									<span className="text-sm text-muted-foreground">
										{formState.description.length}
									</span>
								</div>
								<Textarea
									id="description"
									name="description"
									value={formState.description}
									onChange={(e) =>
										setFormState({ ...formState, description: e.target.value })
									}
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
						<FileUploader
							accept={{ "image/*": [] }}
							maxSize={10 * 1024 * 1024}
							maxFiles={10}
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
										value={formState.price}
										onChange={(e) =>
											setFormState({ ...formState, price: e.target.value })
										}
										className="pl-8"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="category" className="font-medium">
									Category <span className="text-red-500">*</span>
								</Label>
								<Select
									onValueChange={(value) =>
										setFormState({ ...formState, category: value })
									}
									defaultValue={formState.category}
								>
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
						<FileUploader
							maxSize={5 * 1024 * 1024 * 1024}
							maxFiles={100}
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
				<SubmitButton pending={formState.pending}>
					{formState.pending
						? "Creating Product..."
						: isTemporaryProductRef.current
							? "Update Product"
							: "Create Product"}
				</SubmitButton>
			</div>

			<div className="mt-4">
				{formState.error && (
					<div className="text-red-500 text-sm">{formState.error}</div>
				)}

				{formState.success && (
					<div className="text-green-500 text-sm">{formState.success}</div>
				)}
			</div>
		</form>
	);
}
