import { getSession } from "@/lib/auth/session";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { NextRequest } from "next/server";

/**
 * Generates a random string of specified length
 * @param length Length of the random string
 * @returns Random string
 */
function generateRandomCode(length = 5): string {
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}

export async function POST(request: NextRequest) {
	// Authenticate user
	const session = await getSession();

	if (!session) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Parse request data
	const formData = await request.formData();
	const file = formData.get("file") as File;
	const name = formData.get("name") as string;
	const description = formData.get("description") as string | null;

	if (!file || !name) {
		return Response.json({ error: "Missing required fields" }, { status: 400 });
	}

	// Validate file size (max 10MB)
	const buffer = Buffer.from(await file.arrayBuffer());
	if (buffer.length > 10 * 1024 * 1024) {
		return Response.json(
			{ error: "File too large (max 10MB)" },
			{ status: 400 },
		);
	}

	// Check if R2 environment variables are set
	if (
		!process.env.R2_ENDPOINT ||
		!process.env.R2_ACCESS_ID ||
		!process.env.R2_SECRET_KEY ||
		!process.env.R2_BUCKET_NAME
	) {
		return Response.json(
			{
				error: "Server configuration error: Storage credentials not configured",
			},
			{ status: 500 },
		);
	}

	try {
		// Get the user ID from the session
		const userId = session.user.id;

		// Generate a unique filename with random code
		const fileExtension = file.name.split(".").pop();
		const randomCode = generateRandomCode(5);
		const uniqueFilename = `files/${userId}/${Date.now()}_${randomCode}.${fileExtension}`;

		// Initialize S3 client
		const s3 = new S3Client({
			region: "auto",
			endpoint: process.env.R2_ENDPOINT,
			credentials: {
				accessKeyId: process.env.R2_ACCESS_ID,
				secretAccessKey: process.env.R2_SECRET_KEY,
			},
		});

		// Upload file to R2
		await s3.send(
			new PutObjectCommand({
				Bucket: process.env.R2_BUCKET_NAME,
				Key: uniqueFilename,
				Body: buffer,
				ContentType: file.type,
			}),
		);

		// Generate public URL for the asset
		const url = `${process.env.R2_PUBLIC_URL}/${uniqueFilename}`;
	} catch (error) {
		console.error("Error uploading asset:", error);
		return Response.json(
			{
				error: "Failed to upload asset",
			},
			{ status: 500 },
		);
	}
}
