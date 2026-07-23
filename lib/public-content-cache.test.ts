import { beforeEach, describe, expect, test, vi } from "vitest";
import { publicContentCacheTags } from "./public-content-cache-policy";

const mocks = vi.hoisted(() => ({
	cacheLife: vi.fn(),
	cacheTag: vi.fn(),
	fetchQuery: vi.fn(),
}));

vi.mock("next/cache", () => ({
	cacheLife: mocks.cacheLife,
	cacheTag: mocks.cacheTag,
}));

vi.mock("convex/nextjs", () => ({
	fetchQuery: mocks.fetchQuery,
}));

import {
	getBlogPost,
	getBlogPosts,
	getCodeProjects,
	getSearchContent,
	getStaticPage,
	getTalkEvent,
	getTalkEvents,
} from "./public-content-cache";

beforeEach(() => {
	vi.clearAllMocks();
	mocks.fetchQuery.mockResolvedValue([]);
});

describe("public content cache", () => {
	test.each([
		["blog posts", () => getBlogPosts(), publicContentCacheTags.blogPosts],
		[
			"blog post",
			() => getBlogPost("example"),
			publicContentCacheTags.blogPosts,
		],
		["talk events", () => getTalkEvents(), publicContentCacheTags.talkEvents],
		[
			"talk event",
			() => getTalkEvent("example"),
			publicContentCacheTags.talkEvents,
		],
		[
			"code projects",
			() => getCodeProjects(),
			publicContentCacheTags.codeProjects,
		],
		[
			"static page",
			() => getStaticPage("chat"),
			publicContentCacheTags.staticPages,
		],
	])("applies the canonical freshness policy to %s", async (_, read, tag) => {
		await read();

		expect(mocks.cacheLife).toHaveBeenCalledExactlyOnceWith("hours");
		expect(mocks.cacheTag).toHaveBeenCalledExactlyOnceWith(tag);
		expect(mocks.fetchQuery).toHaveBeenCalledOnce();
	});

	test("builds search content through the cached collection reads", async () => {
		mocks.fetchQuery
			.mockResolvedValueOnce([{ slug: "post", title: "Post", summary: "" }])
			.mockResolvedValueOnce([{ slug: "talk", title: "Talk", summary: "" }]);

		await expect(getSearchContent()).resolves.toEqual({
			posts: [{ slug: "post", title: "Post" }],
			talks: [{ slug: "talk", title: "Talk" }],
		});
		expect(mocks.cacheTag).toHaveBeenCalledWith(
			publicContentCacheTags.blogPosts,
		);
		expect(mocks.cacheTag).toHaveBeenCalledWith(
			publicContentCacheTags.talkEvents,
		);
	});
});
