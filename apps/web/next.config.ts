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
};

export default nextConfig;
