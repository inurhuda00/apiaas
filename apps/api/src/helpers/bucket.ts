import type { Context } from "hono";

export const getBucketObject = async (
	c: Context,
	productId: string,
	path: string,
	filename: string,
) => {
	const key = `products/${productId}/${path}/${filename}`;
	return await c.env.BUCKET.get(key);
};

const generateUniqueFilename = (originalName: string) => {
	const timestamp = Date.now();
	const randomString = Math.random().toString(36).substring(2, 10);
	const ext = originalName.split(".").pop();
	return `${timestamp}-${randomString}.${ext}`;
};

export const uploadToBucket = async (
	c: Context,
	file: File,
	productId: number | string,
	path: string,
	metadata: Record<string, string>,
) => {
	const uniqueFilename = generateUniqueFilename(file.name);

	await c.env.BUCKET.put(
		`products/${productId}/${path}/${uniqueFilename}`,
		file,
		{
			httpMetadata: {
				contentType: file.type,
			},
			customMetadata: {
				...metadata,
				originalName: file.name,
				uploadedAt: new Date().toISOString(),
			},
		},
	);

	return uniqueFilename;
};

export const listBucketObjects = async (
	c: Context,
	productId: string,
	path: string,
) => {
	if (!productId) {
		return c.json(
			{
				success: false,
				error: "Product ID is required",
			},
			400,
		);
	}

	const prefix = `products/${productId}/${path}/`;
	return await c.env.BUCKET.list({ prefix });
};

export const deleteBucketObject = async (
	c: Context,
	productId: string,
	path: string,
	filename: string,
) => {
	if (!productId || !filename) {
		return c.json(
			{
				success: false,
				error: "Product ID and filename are required",
			},
			400,
		);
	}

	const key = `products/${productId}/${path}/${filename}`;
	await c.env.BUCKET.delete(key);

	return c.json({
		success: true,
		message: `${path === "media" ? "Media" : "File"} deleted successfully`,
	});
};
