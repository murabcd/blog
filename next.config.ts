import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	headers() {
		return [
			{
				source: "/",
				headers: [
					{
						key: "Vary",
						value:
							"Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Accept-Encoding",
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
