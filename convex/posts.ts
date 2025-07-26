import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getLikeCount = query({
  args: { postSlug: v.string() },
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("postLikes")
      .withIndex("by_post", (q) => q.eq("postSlug", args.postSlug))
      .collect();
    
    return likes.length;
  },
});

export const getIsLiked = query({
  args: { postSlug: v.string(), visitorId: v.string() },
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("postLikes")
      .withIndex("by_visitor_post", (q) => 
        q.eq("visitorId", args.visitorId).eq("postSlug", args.postSlug)
      )
      .first();
    
    return !!like;
  },
});

export const toggleLike = mutation({
  args: { postSlug: v.string(), visitorId: v.string() },
  handler: async (ctx, args) => {
    const existingLike = await ctx.db
      .query("postLikes")
      .withIndex("by_visitor_post", (q) => 
        q.eq("visitorId", args.visitorId).eq("postSlug", args.postSlug)
      )
      .first();

    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      return false;
    } else {
      await ctx.db.insert("postLikes", {
        postSlug: args.postSlug,
        visitorId: args.visitorId,
        likedAt: Date.now(),
      });
      return true;
    }
  },
});