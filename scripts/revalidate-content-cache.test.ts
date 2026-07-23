import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, test, vi } from "vitest";
import { publicContentCacheTags } from "../lib/public-content-cache-policy";
import { revalidateContentCache } from "./revalidate-content-cache";

const SECRET = "test-revalidation-secret";
const TAGS = [publicContentCacheTags.blogPosts] as const;

let server: Server | undefined;

afterEach(async () => {
	vi.restoreAllMocks();
	const activeServer = server;
	if (activeServer) {
		await new Promise<void>((resolve, reject) =>
			activeServer.close((error) => (error ? reject(error) : resolve())),
		);
		server = undefined;
	}
});

async function startServer(statuses: readonly [number, ...number[]]) {
	let requestCount = 0;
	const testServer = createServer((request, response) => {
		expect(request.headers["x-revalidate-secret"]).toBe(SECRET);
		requestCount += 1;
		response.statusCode = statuses[requestCount - 1] ?? statuses.at(-1);
		response.end(response.statusCode === 200 ? "ok" : "retry");
	});
	server = testServer;

	await new Promise<void>((resolve) =>
		testServer.listen(0, "127.0.0.1", resolve),
	);
	const address = testServer.address();
	if (!address || typeof address === "string") {
		throw new Error("Test server did not expose a TCP port");
	}

	return {
		getRequestCount: () => requestCount,
		siteUrl: `http://127.0.0.1:${address.port}`,
	};
}

async function getClosedPortUrl() {
	const testServer = createServer();
	await new Promise<void>((resolve) =>
		testServer.listen(0, "127.0.0.1", resolve),
	);
	const address = testServer.address();
	if (!address || typeof address === "string") {
		throw new Error("Test server did not expose a TCP port");
	}
	await new Promise<void>((resolve, reject) =>
		testServer.close((error) => (error ? reject(error) : resolve())),
	);
	return `http://127.0.0.1:${address.port}`;
}

describe("revalidateContentCache", () => {
	test("retries transient responses and succeeds", async () => {
		vi.spyOn(console, "warn").mockImplementation(() => undefined);
		const testServer = await startServer([503, 503, 200]);

		await expect(
			revalidateContentCache({
				secret: SECRET,
				siteUrl: testServer.siteUrl,
				tags: TAGS,
			}),
		).resolves.toBeUndefined();
		expect(testServer.getRequestCount()).toBe(3);
	});

	test("fails immediately for a permanent response", async () => {
		const testServer = await startServer([401]);

		await expect(
			revalidateContentCache({
				secret: SECRET,
				siteUrl: testServer.siteUrl,
				tags: TAGS,
			}),
		).rejects.toThrow("Cache revalidation failed (401): retry");
		expect(testServer.getRequestCount()).toBe(1);
	});

	test("fails after transient responses exhaust every attempt", async () => {
		vi.spyOn(console, "warn").mockImplementation(() => undefined);
		const testServer = await startServer([503]);

		await expect(
			revalidateContentCache({
				secret: SECRET,
				siteUrl: testServer.siteUrl,
				tags: TAGS,
			}),
		).rejects.toThrow("Cache revalidation failed (503): retry");
		expect(testServer.getRequestCount()).toBe(3);
	});

	test("retries network failures before aborting", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		const siteUrl = await getClosedPortUrl();

		await expect(
			revalidateContentCache({ secret: SECRET, siteUrl, tags: TAGS }),
		).rejects.toThrow("Cache revalidation request failed after 3 attempts");
		expect(warn).toHaveBeenCalledTimes(2);
	});
});
