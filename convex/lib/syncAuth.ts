import { ConvexError } from "convex/values";
import { env } from "../_generated/server";

export function assertValidSyncSecret(syncSecret: string) {
	if (syncSecret !== env.CONTENT_SYNC_SECRET) {
		throw new ConvexError("Unauthorized");
	}
}
