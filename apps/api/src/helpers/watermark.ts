import satori from "satori";

/**
 * Creates a watermarked SVG image using Satori
 *
 * @param imageBuffer The original image as an ArrayBuffer
 * @param width Image width
 * @param height Image height
 * @returns Promise with the watermarked SVG as a string
 */
export async function createWatermarkedSvg(
	imageBuffer: ArrayBuffer,
	width = 1200,
	height = 630,
): Promise<string | null> {
	try {
		return await generateWatermarkSvg(imageBuffer, { width, height });
	} catch (error) {
		console.error("Watermarking failed:", error);
		return null;
	}
}

async function generateWatermarkSvg(
	imageBuffer: ArrayBuffer,
	{ width, height }: { width: number; height: number },
): Promise<string | null> {
	try {
		const element = {
			type: "div",
			props: {
				style: {
					width: "100%",
					height: "100%",
					position: "relative",
					display: "flex",
				},
				children: [
					// Base image
					{
						type: "img",
						props: {
							src: `data:image/jpeg;base64,${arrayBufferToBase64(imageBuffer)}`,
							style: {
								width: "100%",
								height: "100%",
								objectFit: "cover",
							},
						},
					},
					// Watermark overlay
					{
						type: "svg",
						props: {
							viewBox: `0 0 ${width} ${height}`,
							width: "100%",
							height: "100%",
							style: {
								position: "absolute",
								top: 0,
								left: 0,
								zIndex: 10,
								opacity: 0.7,
							},
							children: createPatternElements(width, height),
						},
					},
				],
			},
		} as any;

		return await satori(element, { width, height, fonts: [] });
	} catch (error) {
		console.error("SVG generation failed:", error);
		return null;
	}
}

function createPatternElements(width: number, height: number) {
	const pattern = [];
	const rows = 25;
	const cols = 25;
	const spacing = Math.max(width, height) / 5;
	const dashPattern = "8";

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const x = col * spacing;
			const y = row * spacing;

			pattern.push({
				type: "g",
				props: {
					key: `g-${row}-${col}`,
					children: [
						createLine(x - spacing, y, x, y - spacing, dashPattern),
						createLine(x, y - spacing, x + spacing, y, dashPattern),
						createLine(x + spacing, y, x, y + spacing, dashPattern),
						createLine(x, y + spacing, x - spacing, y, dashPattern),
						{
							type: "circle",
							props: {
								cx: x,
								cy: y,
								r: 4,
								fill: "#fff1f1",
							},
						},
					],
				},
			});
		}
	}

	return pattern;
}

function createLine(x1: number, y1: number, x2: number, y2: number, dashPattern: string) {
	return {
		type: "line",
		props: {
			x1,
			y1,
			x2,
			y2,
			stroke: "#fff1f1",
			strokeWidth: 2,
			strokeDasharray: dashPattern,
		},
	};
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	if (!buffer) return "";

	const bytes = new Uint8Array(buffer);
	let binary = "";

	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}

	return btoa(binary);
}
