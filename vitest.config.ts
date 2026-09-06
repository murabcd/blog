import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		exclude: [...configDefaults.exclude, "tests/public-http.test.ts"],
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL(".", import.meta.url)),
		},
	},
});
