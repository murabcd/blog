import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  postLikes: defineTable({
    postSlug: v.string(),
    visitorId: v.string(),
    likedAt: v.number(),
  })
    .index("by_post", ["postSlug"])
    .index("by_visitor_post", ["visitorId", "postSlug"]),
});