import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { readBlogPosts, readContentCatalog } from ".";

const temporaryDirectories: string[] = [];

afterEach(() => {
	for (const directory of temporaryDirectories.splice(0)) {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

function createCatalogRoot() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "content-catalog-"));
	temporaryDirectories.push(root);

	for (const directory of ["blog", "talk", "code"]) {
		fs.mkdirSync(path.join(root, "content", directory), { recursive: true });
	}

	fs.writeFileSync(
		path.join(root, "content", "blog", "hello.mdx"),
		`---
title: Hello
publishedAt: "2026-01-01"
summary: First post
---
Blog body
`,
	);
	fs.writeFileSync(
		path.join(root, "content", "talk", "launch.mdx"),
		`---
title: Launch
publishedAt: "2026-02-01"
summary: Product launch talk
---
Talk body
`,
	);
	fs.writeFileSync(
		path.join(root, "content", "code", "project.md"),
		`---
title: Project
href: https://example.com/project
date: "2026-03-01"
published: false
---
Project body
`,
	);
	fs.writeFileSync(
		path.join(root, "content", "chat.md"),
		`---
title: Chat
---
Chat body
`,
	);

	return root;
}

describe("content catalog readers", () => {
	test("returns the complete validated catalog", () => {
		const catalog = readContentCatalog(createCatalogRoot());

		expect(catalog).toEqual({
			blogPosts: [
				{
					slug: "hello",
					title: "Hello",
					publishedAt: "2026-01-01",
					summary: "First post",
					content: "Blog body",
					image: undefined,
				},
			],
			talkEvents: [
				{
					slug: "launch",
					title: "Launch",
					publishedAt: "2026-02-01",
					summary: "Product launch talk",
					content: "Talk body",
					image: undefined,
				},
			],
			codeProjects: [
				{
					slug: "project",
					title: "Project",
					href: "https://example.com/project",
					date: "2026-03-01",
					content: "Project body",
					published: false,
				},
			],
			staticPages: [
				{
					slug: "chat",
					title: "Chat",
					content: "Chat body",
					published: true,
				},
			],
		});
	});

	test("rejects a missing required field", () => {
		const root = createCatalogRoot();
		fs.writeFileSync(
			path.join(root, "content", "blog", "hello.mdx"),
			`---
title: Hello
publishedAt: "2026-01-01"
---
Blog body
`,
		);

		expect(() => readContentCatalog(root)).toThrow(
			'missing required frontmatter field "summary"',
		);
	});

	test("rejects duplicate slugs", () => {
		const root = createCatalogRoot();
		fs.writeFileSync(
			path.join(root, "content", "blog", "hello.md"),
			`---
title: Duplicate
publishedAt: "2026-01-02"
summary: Duplicate post
---
Duplicate body
`,
		);

		expect(() => readContentCatalog(root)).toThrow(
			'Content catalog contains duplicate slug "hello"',
		);
	});

	test("reads blog posts without validating unrelated collections", () => {
		const root = createCatalogRoot();
		fs.writeFileSync(
			path.join(root, "content", "talk", "launch.mdx"),
			"invalid talk frontmatter",
		);

		expect(readBlogPosts(root)).toEqual([
			{
				slug: "hello",
				title: "Hello",
				publishedAt: "2026-01-01",
				summary: "First post",
				content: "Blog body",
				image: undefined,
			},
		]);
	});
});
