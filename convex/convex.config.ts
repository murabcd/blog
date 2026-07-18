import aggregate from "@convex-dev/aggregate/convex.config.js";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
	env: {
		CONTENT_SYNC_SECRET: v.string(),
	},
});

app.use(aggregate, { name: "postLikes" });

export default app;
