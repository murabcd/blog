import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	experimental: {
		instantInsights: {
			validationLevel: "warning",
		},
	},
};

export default nextConfig;
