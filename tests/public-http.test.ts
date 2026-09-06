import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { readContentCatalog } from "../lib/content-catalog";

let server: ChildProcess;
let origin: string;

beforeAll(async () => {
	server = spawn(
		process.execPath,
		[
			"node_modules/next/dist/bin/next",
			"start",
			"--hostname",
			"127.0.0.1",
			"--port",
			"0",
		],
		{ stdio: ["ignore", "pipe", "pipe"] },
	);
	await new Promise<void>((resolve, reject) => {
		let output = "";
		const readOutput = (chunk: Buffer) => {
			output += chunk.toString();
			const url = output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
			if (url && output.includes("Ready in")) {
				origin = url;
				resolve();
			}
		};
		server.stdout?.on("data", readOutput);
		server.stderr?.on("data", readOutput);
		server.once("error", reject);
		server.once("exit", (code) =>
			reject(new Error(`Next.js exited (${code}): ${output}`)),
		);
	});
});

afterAll(async () => {
	if (server.exitCode !== null || server.signalCode !== null) return;
	const exited = once(server, "exit");
	server.kill();
	await exited;
});

function visibleHtml(html: string) {
	return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

describe("production HTTP contracts", () => {
	test("exposes the homepage owner and site identity in raw JSON-LD", async () => {
		const response = await fetch(origin, { headers: { Accept: "text/html" } });
		const html = await response.text();
		const scripts = [
			...html.matchAll(
				/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
			),
		];
		expect(scripts).toHaveLength(1);
		const data = JSON.parse(scripts[0][1]);
		const url = "https://murabcd.vercel.app";
		const profiles = [
			"https://x.com/murabcd",
			"https://www.linkedin.com/in/murabcd/",
			"https://github.com/murabcd",
		];
		expect(data["@context"]).toBe("https://schema.org");
		expect(data["@graph"]).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					"@type": "Person",
					"@id": `${url}/#person`,
					name: "Murad Abdulkadyrov",
					description: expect.stringContaining(
						"Chief Product Officer at Flomni",
					),
					url,
					jobTitle: "Chief Product Officer",
					worksFor: {
						"@type": "Organization",
						name: "Flomni",
						url: "https://flomni.com/en",
					},
					sameAs: profiles,
				}),
				expect.objectContaining({
					"@type": "WebSite",
					"@id": `${url}/#website`,
					name: "Murad Abdulkadyrov",
					url,
					publisher: { "@id": `${url}/#person` },
				}),
			]),
		);
		for (const profile of profiles)
			expect(visibleHtml(html)).toContain(`href="${profile}"`);
	});

	test("leads homepage search metadata with the owner name and canonical URL", async () => {
		const response = await fetch(origin, { headers: { Accept: "text/html" } });
		const html = await response.text();
		expect(html).toContain(
			"<title>Murad Abdulkadyrov — AI and Product Building</title>",
		);
		expect(html).toMatch(
			/<meta name="description" content="Murad Abdulkadyrov, Chief Product Officer at Flomni\./,
		);
		expect(html).toContain('rel="canonical" href="https://murabcd.vercel.app"');
		expect(html).toContain(
			'property="og:site_name" content="Murad Abdulkadyrov"',
		);
		expect(html).toContain('name="author" content="Murad Abdulkadyrov"');
		expect(html).toContain('rel="author" href="https://murabcd.vercel.app"');
		expect(html).toContain('name="robots" content="index, follow"');
		expect(response.headers.get("x-robots-tag")).toBeNull();
	});

	test.each([
		{
			accept: "text/html",
			status: 200,
			type: "text/html",
			body: "Murad Abdulkadyrov",
		},
		{
			accept: "text/markdown",
			status: 200,
			type: "text/markdown",
			body: "# Murad Abdulkadyrov",
		},
		{
			accept: "application/pdf",
			status: 406,
			type: "text/plain",
			body: "Not Acceptable",
		},
	])("varies the homepage on Accept: $accept", async ({
		accept,
		status,
		type,
		body,
	}) => {
		const response = await fetch(origin, { headers: { Accept: accept } });
		const vary = response.headers.get("vary")?.toLowerCase().split(/,\s*/);
		expect(vary).toContain("accept");
		expect(response.status).toBe(status);
		expect(response.headers.get("content-type")).toContain(type);
		const text = await response.text();
		expect(text).toContain(body);
		expect(text).not.toContain("Latest writing");
	});

	test("preserves Next.js cache variation and server-rendered homepage content", async () => {
		const response = await fetch(origin, { headers: { Accept: "text/html" } });
		const vary = response.headers.get("vary")?.toLowerCase().split(/,\s*/);
		expect(vary).toEqual(
			expect.arrayContaining([
				"accept",
				"rsc",
				"next-router-state-tree",
				"next-router-prefetch",
				"next-router-segment-prefetch",
			]),
		);
		expect(vary?.length).toBe(new Set(vary).size);
		const html = visibleHtml(await response.text());
		expect(html).toMatch(/<h1[^>]*>Murad Abdulkadyrov<\/h1>/);
		expect(html.match(/<h2\b/g)).toHaveLength(5);
		expect(html).not.toContain("<h3");
		const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
		expect(main.replace(/<[^>]+>/g, "").length).toBeGreaterThanOrEqual(500);
	});

	test.each([
		"/404",
		"/not-a-real-page-http-test",
		"/blog/not-a-real-article-http-test",
		"/talk/not-a-real-talk-http-test",
	])("renders a recoverable HTML 404 without JavaScript: %s", async (path) => {
		const response = await fetch(`${origin}${path}`, {
			headers: { Accept: "text/html" },
		});
		expect(response.status).toBe(404);
		expect(response.headers.get("content-type")).toContain("text/html");
		expect(response.headers.get("vary")?.toLowerCase().split(/,\s*/)).toContain(
			"accept",
		);
		const html = visibleHtml(await response.text());
		expect(html).toContain("404 - Not Found");
		expect(html).toContain('href="/llms.txt"');
		expect(html).toContain('href="/sitemap.xml"');
		expect(html).toContain('content="noindex"');
	});

	test.each([
		"/404",
		"/blog/not-a-real-article-http-test",
		"/talk/not-a-real-talk-http-test",
	])("returns a recoverable Markdown 404: %s", async (path) => {
		const response = await fetch(`${origin}${path}`, {
			headers: { Accept: "text/markdown" },
		});
		expect(response.status).toBe(404);
		expect(response.headers.get("content-type")).toContain("text/markdown");
		expect(response.headers.get("vary")?.toLowerCase().split(/,\s*/)).toContain(
			"accept",
		);
		expect(await response.text()).toContain("/llms.txt");
	});

	const { blogPosts, talkEvents } = readContentCatalog(process.cwd());
	test.each([
		`/blog/${blogPosts[0].slug}`,
		`/talk/${talkEvents[0].slug}`,
	])("keeps published content reachable: %s", async (path) => {
		const response = await fetch(`${origin}${path}`, {
			headers: { Accept: "text/html" },
		});
		expect(response.status).toBe(200);
		const html = visibleHtml(await response.text());
		expect(html).toContain("<h1");
		expect(html).toContain(
			`rel="canonical" href="https://murabcd.vercel.app${path}"`,
		);
	});

	test.each([
		"/blog/twitter-image",
		"/talk/twitter-image",
	])("preserves metadata routes: %s", async (path) => {
		const response = await fetch(`${origin}${path}`);
		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("image/png");
		await response.arrayBuffer();
	});
});
