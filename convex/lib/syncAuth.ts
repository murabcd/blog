import { ConvexError } from "convex/values";

declare const process: {
	env: Record<string, string | undefined>;
};

function getExpectedSyncSecret() {
	return process.env.CONTENT_SYNC_SECRET;
}

export function assertValidSyncSecret(syncSecret: string) {
	const expectedSyncSecret = getExpectedSyncSecret();

	if (!expectedSyncSecret) {
		throw new ConvexError("CONTENT_SYNC_SECRET is not configured");
	}

	if (syncSecret !== expectedSyncSecret) {
		throw new ConvexError("Unauthorized");
	}
}
