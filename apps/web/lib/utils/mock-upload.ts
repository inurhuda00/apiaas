/**
 * Mock file upload with progress simulation
 *
 * @param file - The file to upload
 * @param options - Configuration options for the mock upload
 * @param onProgress - Callback function for progress updates
 * @returns Promise that resolves when the upload is complete
 */
export async function mockFileUpload(
	file: File,
	options: {
		minDuration?: number;
		maxDurationPerMB?: number;
		failureRate?: number;
		progressSteps?: number;
	} = {},
	onProgress: (progress: number) => void,
): Promise<{ url: string; fileId: string }> {
	// Default options
	const {
		minDuration = 2000,
		maxDurationPerMB = 3000,
		failureRate = 0.05,
		progressSteps = 20,
	} = options;

	// Calculate upload duration based on file size
	const fileSizeInMB = file.size / (1024 * 1024);
	const durationPerMB = Math.random() * maxDurationPerMB;
	const uploadDuration = Math.max(
		minDuration,
		minDuration + fileSizeInMB * durationPerMB,
	);

	// Interval between progress updates
	const intervalTime = uploadDuration / progressSteps;

	return new Promise((resolve, reject) => {
		let currentStep = 0;

		// Generate mock file ID and URL
		const fileId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
		const mockUrl = `https://example.com/uploads/${fileId}/${encodeURIComponent(file.name)}`;

		const interval = setInterval(() => {
			currentStep++;

			// Calculate progress percentage (0-100)
			const progressPercent = Math.min(
				100,
				Math.round((currentStep / progressSteps) * 100),
			);

			// Report progress
			onProgress(progressPercent);

			// Complete the upload when all steps are done
			if (currentStep >= progressSteps) {
				clearInterval(interval);

				// Simulate response delay
				setTimeout(() => {
					resolve({
						url: mockUrl,
						fileId: fileId,
					});
				}, 300);
			}
		}, intervalTime);

		// Simulate failure based on failure rate
		if (Math.random() < failureRate) {
			const failureTime = Math.random() * uploadDuration * 0.8;

			setTimeout(() => {
				clearInterval(interval);
				onProgress(0); // Reset progress

				// Generate realistic error
				const errors = [
					"Network error: Connection reset",
					"Server error: 503 Service Unavailable",
					"Error: Maximum upload size exceeded",
					"Timeout error: Request took too long to complete",
				];

				reject(new Error(errors[Math.floor(Math.random() * errors.length)]));
			}, failureTime);
		}
	});
}
