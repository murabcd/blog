import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
	deletePostLike,
	insertPostLike,
	postLikesAggregate,
} from "./lib/postLikes";

const MAX_POST_SLUG_LENGTH = 200;
const MAX_VISITOR_ID_LENGTH = 128;
const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertValidPostSlug(postSlug: string) {
	if (
		postSlug.length === 0 ||
		postSlug.length > MAX_POST_SLUG_LENGTH ||
		!POST_SLUG_PATTERN.test(postSlug)
	) {
		throw new ConvexError("Invalid post slug");
	}
}

function assertValidVisitorId(visitorId: string) {
	if (visitorId.length === 0 || visitorId.length > MAX_VISITOR_ID_LENGTH) {
		throw new ConvexError("Invalid visitor ID");
	}
}

export const getLikeCount = query({
	args: { postSlug: v.string() },
	returns: v.number(),
	handler: async (ctx, args) => {
		assertValidPostSlug(args.postSlug);
		return await postLikesAggregate.count(ctx, {
			namespace: args.postSlug,
		});
	},
});

export const getIsLiked = query({
	args: { postSlug: v.string(), visitorId: v.string() },
	returns: v.boolean(),
	handler: async (ctx, args) => {
		assertValidPostSlug(args.postSlug);
		assertValidVisitorId(args.visitorId);
		const like = await ctx.db
			.query("postLikes")
			.withIndex("by_visitorId_and_postSlug", (q) =>
				q.eq("visitorId", args.visitorId).eq("postSlug", args.postSlug),
			)
			.unique();

		return !!like;
	},
});

export const toggleLike = mutation({
	args: { postSlug: v.string(), visitorId: v.string() },
	returns: v.boolean(),
	handler: async (ctx, args) => {
		assertValidPostSlug(args.postSlug);
		assertValidVisitorId(args.visitorId);

		const post = await ctx.db
			.query("blogPosts")
			.withIndex("by_slug", (q) => q.eq("slug", args.postSlug))
			.unique();

		if (!post) {
			throw new ConvexError("Blog post not found");
		}

		const existingLike = await ctx.db
			.query("postLikes")
			.withIndex("by_visitorId_and_postSlug", (q) =>
				q.eq("visitorId", args.visitorId).eq("postSlug", args.postSlug),
			)
			.unique();

		if (existingLike) {
			await deletePostLike(ctx, existingLike);
			return false;
		}

		await insertPostLike(ctx, {
			postSlug: args.postSlug,
			visitorId: args.visitorId,
			likedAt: Date.now(),
		});
		return true;
	},
});
