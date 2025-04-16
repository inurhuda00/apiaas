import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		turbo: {
			resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".mdx"],
		},
		ppr: true,
		useCache: true,
		serverActions: {
			bodySizeLimit: "5mb",
		},
	},
	images: {
		loader: "custom",
		loaderFile: "./image-loader.ts",
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	// Configure caching for static assets
	headers: async () => {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/_next/static/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/_next/image/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
};

export default nextConfig;
