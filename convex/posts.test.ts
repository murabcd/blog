// @vitest-environment edge-runtime

import aggregateTest from "@convex-dev/aggregate/test";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import { env } from "./_generated/server";
import { postLikesAggregate } from "./lib/postLikes";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.ts", "!./**/*.test.ts"]);
const SYNC_SECRET = "test-content-sync-secret";

Object.defineProperty(env, "CONTENT_SYNC_SECRET", {
	configurable: true,
	enumerable: true,
	value: SYNC_SECRET,
	writable: true,
});

function setupTest() {
	const t = convexTest(schema, modules);
	aggregateTest.register(t, "postLikes");
	return t;
}

async function seedPost(
	t: ReturnType<typeof setupTest>,
	slug: string,
	title = "Test post",
) {
	await t.run(async (ctx) => {
		const lastSyncedAt = Date.now();
		await ctx.db.insert("blogPosts", {
			slug,
			title,
			summary: "Test summary",
			publishedAt: "2026-01-01",
			lastSyncedAt,
		});
		await ctx.db.insert("blogPostContents", {
			slug,
			content: "Test content",
			lastSyncedAt,
		});
	});
}

describe("post likes", () => {
	test("rejects likes for missing posts", async () => {
		const t = setupTest();

		await expect(
			t.mutation(api.posts.toggleLike, {
				postSlug: "missing-post",
				visitorId: "visitor-1",
			}),
		).rejects.toBeInstanceOf(ConvexError);
	});

	test("keeps the source table and aggregate in sync when toggled", async () => {
		const t = setupTest();
		const postSlug = "test-post";
		const visitorId = "visitor-1";
		await seedPost(t, postSlug);

		await expect(
			t.mutation(api.posts.toggleLike, { postSlug, visitorId }),
		).resolves.toBe(true);
		await expect(t.query(api.posts.getLikeCount, { postSlug })).resolves.toBe(
			1,
		);
		await expect(
			t.query(api.posts.getIsLiked, { postSlug, visitorId }),
		).resolves.toBe(true);
		await expect(
			t.run((ctx) => postLikesAggregate.count(ctx, { namespace: postSlug })),
		).resolves.toBe(1);

		await expect(
			t.mutation(api.posts.toggleLike, { postSlug, visitorId }),
		).resolves.toBe(false);
		await expect(t.query(api.posts.getLikeCount, { postSlug })).resolves.toBe(
			0,
		);
		await expect(
			t.query(api.posts.getIsLiked, { postSlug, visitorId }),
		).resolves.toBe(false);
		await expect(
			t.run((ctx) => postLikesAggregate.count(ctx, { namespace: postSlug })),
		).resolves.toBe(0);
	});

	test("deleting a post also deletes its likes from both stores", async () => {
		const t = setupTest();
		const deletedSlug = "deleted-post";
		const remainingSlug = "remaining-post";
		await seedPost(t, deletedSlug, "Deleted post");
		await seedPost(t, remainingSlug, "Remaining post");
		await t.mutation(api.posts.toggleLike, {
			postSlug: deletedSlug,
			visitorId: "visitor-1",
		});
		await t.mutation(api.posts.toggleLike, {
			postSlug: remainingSlug,
			visitorId: "visitor-2",
		});

		await t.mutation(api.blog.syncPostsPublic, {
			syncSecret: SYNC_SECRET,
			slugs: [remainingSlug],
			posts: [
				{
					slug: remainingSlug,
					title: "Remaining post",
					summary: "Test summary",
					content: "Test content",
					publishedAt: "2026-01-01",
				},
			],
		});

		await expect(
			t.query(api.posts.getLikeCount, { postSlug: deletedSlug }),
		).resolves.toBe(0);
		await expect(
			t.run((ctx) => postLikesAggregate.count(ctx, { namespace: deletedSlug })),
		).resolves.toBe(0);
		await expect(
			t.query(api.posts.getLikeCount, { postSlug: remainingSlug }),
		).resolves.toBe(1);
		await expect(
			t.query(api.posts.getIsLiked, {
				postSlug: remainingSlug,
				visitorId: "visitor-2",
			}),
		).resolves.toBe(true);
		await expect(
			t.run((ctx) =>
				ctx.db
					.query("postLikes")
					.withIndex("by_postSlug", (query) =>
						query.eq("postSlug", deletedSlug),
					)
					.unique(),
			),
		).resolves.toBeNull();
	});
});
