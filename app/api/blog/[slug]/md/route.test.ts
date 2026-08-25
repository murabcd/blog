import { describe, expect, test } from "vitest";
import { GET } from "./route";

describe("GET /api/blog/[slug]/md", () => {
	test("returns a structured JSON error for an unknown article", async () => {
		const response = await GET(new Request("https://example.com"), {
			params: Promise.resolve({ slug: "not-a-real-post" }),
		});

		expect(response.status).toBe(404);
		expect(response.headers.get("content-type")).toContain("application/json");
		await expect(response.json()).resolves.toEqual({
			error: {
				code: "post_not_found",
				message: "The requested article does not exist.",
				resolution: "Use /llms.txt to discover published article slugs.",
			},
		});
	});
});
