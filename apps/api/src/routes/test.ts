import { Hono } from "hono";
import type { Env, Variables } from "@/types";
import { handleError } from "../helpers/error";
import { createWatermarkedSvg } from "../helpers/watermark";

const testRoute = new Hono<{ Bindings: Env; Variables: Variables }>();

/**
 * Test endpoint for image watermarking
 * Returns a watermarked SVG image
 */
testRoute.post("/watermark", async (c) => {
	try {
		// Get the uploaded file from the form data
		const formData = await c.req.formData();
		const file = formData.get("image") as File;

		if (!file) {
			return c.json({ success: false, error: "No image file provided" }, 400);
		}

		// Get image dimensions if possible
		let width = 1200;
		let height = 630;

		// Apply watermark using Satori
		console.log("Creating watermark...");
		const originalBuffer = await file.arrayBuffer();
		const watermarkedSvg = await createWatermarkedSvg(originalBuffer, width, height);

		if (!watermarkedSvg) {
			return c.json(
				{
					success: false,
					error: "Failed to generate watermark",
				},
				500,
			);
		}

		// Return the SVG directly
		const headers = new Headers();
		headers.set("Content-Type", "image/svg+xml");
		headers.set("Content-Disposition", `inline; filename="watermarked-${file.name}.svg"`);
		headers.set("Cache-Control", "no-cache");

		return new Response(watermarkedSvg, { headers });
	} catch (error) {
		return handleError(c, error, "Failed to create watermarked image");
	}
});

export default testRoute;
