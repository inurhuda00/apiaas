/**
 * Upload file with fetch and progress tracking (compatible with handleProcess pattern)
 *
 * @param file - The file to upload
 * @param options - Optional simulation settings (not used in fetch version)
 * @param onProgress - Callback for upload progress
 * @returns Promise with uploaded file info
 */
export async function fileUpload(
	file: File,
	options: {
		minDuration?: number;
		maxDurationPerMB?: number;
		failureRate?: number;
		progressSteps?: number;
	} = {},
	onProgress: (progress: number) => void,
): Promise<{ url: string; fileId: string }> {
	const API_URL = "https://api.mondive.xyz/v1/image/upload";
	const token =
		"Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjp7ImlkIjoyLCJyb2xlIjoiYWRtaW4ifSwiZXhwaXJlcyI6IjIwMjUtMDQtMTNUMjM6MjU6MTAuMTQyWiIsImlhdCI6MTc0NDUwMDMxMCwiZXhwIjoxNzQ0NTg2NzEwfQ.LG9SCCftRiS2-ak9qTRyk27LB73VpmSRG4Mbrao1YY4"; // Ganti dengan dynamic token kalau perlu

	// biome-ignore lint/style/useTemplate: <explanation>
	const boundary = "----FormBoundary" + Math.random().toString(36).substring(2);
	const encoder = new TextEncoder();

	const prefix = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${file.name}"\r\nContent-Type: ${file.type}\r\n\r\n`;
	const suffix = `\r\n--${boundary}--\r\n`;

	const prefixBytes = encoder.encode(prefix);
	const suffixBytes = encoder.encode(suffix);
	const reader = file.stream().getReader();

	const totalSize = prefixBytes.length + file.size + suffixBytes.length;
	let uploaded = 0;

	const stream = new ReadableStream({
		async start(controller) {
			controller.enqueue(prefixBytes);
			uploaded += prefixBytes.length;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				controller.enqueue(value);
				uploaded += value.length;
				onProgress(Math.round((uploaded / totalSize) * 100));
			}

			controller.enqueue(suffixBytes);
			uploaded += suffixBytes.length;
			onProgress(100);
			controller.close();
		},
	});

	const response = await fetch(API_URL, {
		method: "POST",
		headers: {
			Authorization: token,
			"Content-Type": `multipart/form-data; boundary=${boundary}`,
		},
		body: stream,
	});

	// Clone the response before consuming it
	const responseClone = response.clone();

	if (!response.ok) {
		const errorText = await responseClone.text();
		throw new Error(`Upload failed: ${response.status} - ${errorText}`);
	}

	const json = await response.json();
	return {
		url: json.url,
		fileId: json.fileId,
	};
}
