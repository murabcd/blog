import { NextRequest } from "next/server";
import { describe, expect, test } from "vitest";
import { proxy } from "./proxy";

describe("proxy", () => {
	test("serves the homepage as Markdown when requested", async () => {
		const response = proxy(
			new NextRequest("https://example.com/", {
				headers: { Accept: "text/markdown" },
			}),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe(
			"text/markdown; charset=utf-8",
		);
		expect(response.headers.get("vary")).toBe("Accept, Accept-Encoding");
		expect(await response.text()).toContain("# Murad Abdulkadyrov");
	});

	test("keeps ordinary homepage requests on the HTML route", () => {
		const response = proxy(
			new NextRequest("https://example.com/", {
				headers: { Accept: "text/html" },
			}),
		);

		expect(response.headers.get("x-middleware-next")).toBe("1");
	});

	test("does not negotiate a media type with zero quality", () => {
		const response = proxy(
			new NextRequest("https://example.com/", {
				headers: { Accept: "text/markdown; q=0, text/html" },
			}),
		);

		expect(response.headers.get("x-middleware-next")).toBe("1");
	});

	test("honors client quality preferences", () => {
		const response = proxy(
			new NextRequest("https://example.com/", {
				headers: { Accept: "text/html, text/markdown; q=0.5" },
			}),
		);

		expect(response.headers.get("x-middleware-next")).toBe("1");
	});

	test("returns 406 when no available representation is acceptable", async () => {
		const response = proxy(
			new NextRequest("https://example.com/", {
				headers: { Accept: "application/pdf" },
			}),
		);

		expect(response.status).toBe(406);
		expect(response.headers.get("vary")).toBe("Accept, Accept-Encoding");
		expect(await response.text()).toContain(
			"Available: text/html, text/markdown",
		);
	});

	test("returns a recoverable Markdown 404 for an unknown path", async () => {
		const response = proxy(
			new NextRequest("https://example.com/does-not-exist", {
				headers: { Accept: "text/markdown" },
			}),
		);

		expect(response.status).toBe(404);
		expect(response.headers.get("content-type")).toBe(
			"text/markdown; charset=utf-8",
		);
		expect(await response.text()).toContain(
			"[Machine-readable site index](https://example.com/llms.txt)",
		);
	});

	test("leaves known non-home resources to their canonical handlers", () => {
		const response = proxy(
			new NextRequest("https://example.com/api/rss", {
				headers: { Accept: "text/markdown" },
			}),
		);

		expect(response.headers.get("x-middleware-next")).toBe("1");
	});

	test("returns structured JSON for an unknown API route", async () => {
		const response = proxy(
			new NextRequest("https://example.com/api/does-not-exist"),
		);

		expect(response.status).toBe(404);
		expect(response.headers.get("content-type")).toContain("application/json");
		await expect(response.json()).resolves.toEqual({
			error: {
				code: "api_route_not_found",
				message: "The requested API endpoint does not exist.",
				resolution: "Use /openapi.json to discover supported API endpoints.",
			},
		});
	});
});
