import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["tests/public-http.test.ts"],
		hookTimeout: 30_000,
	},
});
