import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	partialPrefetching: true,
	headers() {
		return [
			{
				// Proxy negotiates both homepage and unknown-path responses.
				source: "/:path*",
				headers: [
					{
						key: "Vary",
						value: "Accept",
					},
				],
			},
		];
	},
	experimental: {
		instantInsights: {
			validationLevel: "warning",
		},
	},
};

export default nextConfig;
