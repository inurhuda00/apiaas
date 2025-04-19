import { env } from "./env";

interface ImageLoaderParams {
	src: string;
	width: number;
	quality?: number;
}

export default function imageLoader({ src, width, quality = 80 }: ImageLoaderParams): string {
	// Use environment variable for the assets URL
	const baseUrl = env.NEXT_PUBLIC_ASSETS_URL || '';
	return `${baseUrl}/cdn-cgi/image/width=${width},quality=${quality}/${src}`;
}
