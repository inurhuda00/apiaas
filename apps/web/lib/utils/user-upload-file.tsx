import { useState } from "react";

interface UploadedFile {
	name: string;
	url: string;
	size: number;
	type: string;
	customId: string | null;
	key: string;
	serverData: unknown | null;
}

export function useUploadFile<T>(key: string, options?: T) {
	const [isUploading, setIsUploading] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

	const uploadFiles = async (image: File[]) => {
		setIsUploading(true);
		await Promise.all(
			image.map(async (file) => {
				const nameParts = file.name.split(".");
				const fileName = `${nameParts[0] ?? "file"}${Date.now()}.${nameParts[1] ?? "unknown"}`;

				const formData = new FormData();
				formData.append("data", file);

				const response = await fetch(`/api/upload_image?filename=${fileName}`, {
					method: "PUT",
					body: formData,
				});

				if (response.status !== 200) {
					throw new Error(response.statusText);
				}

				const resp = (await response.json()) as { url: string };
				const url = resp.url;

				const response2 = await fetch(url, {
					method: "PUT",
					body: file,
					headers: {
						"Content-Type": file.type,
					},
				});

				if (response2.status !== 200) {
					throw new Error(response2.statusText);
				}

				// For showing on the client
				const uri = URL.createObjectURL(file);

				setUploadedFiles((prev) => [
					...prev,
					{
						name: fileName,
						url: uri,
						size: file.size,
						type: file.type,
						customId: null,
						key: fileName,
						serverData: null,
					},
				]);

				return {
					url,
					filename: fileName,
				};
			}),
		);

		setIsUploading(false);
	};

	return {
		uploadFiles,
		uploadedFiles,
		isUploading,
	};
}
