import { describe, expect, test } from "vitest";
import { createOpenApiDocument } from "./openapi";

describe("createOpenApiDocument", () => {
	test("publishes a self-describing read-only API contract", () => {
		const document = createOpenApiDocument("https://example.com");
		const operations = Object.values(document.paths).flatMap((path) =>
			Object.values(path),
		);

		expect(document.openapi).toBe("3.1.0");
		expect(document.security).toEqual([]);
		expect(document.servers).toEqual([{ url: "https://example.com" }]);
		expect(document.paths).toHaveProperty("/api/blog/{slug}/md");
		expect(document.paths).toHaveProperty("/api/rss");
		expect(document.paths).toHaveProperty("/llms.txt");
		expect(
			operations.every((operation) => operation.description.length > 0),
		).toBe(true);
		expect(
			new Set(operations.map((operation) => operation.operationId)).size,
		).toBe(operations.length);

		const articleOperation = document.paths["/api/blog/{slug}/md"].get;
		expect(articleOperation.parameters).toEqual([
			expect.objectContaining({
				in: "path",
				name: "slug",
				required: true,
			}),
		]);
		expect(articleOperation.responses["200"].content).toHaveProperty(
			"text/markdown",
		);
		expect(articleOperation.responses["404"].content).toHaveProperty(
			"application/json",
		);
	});
});
