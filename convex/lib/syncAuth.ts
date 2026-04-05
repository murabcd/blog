declare const process: {
	env: Record<string, string | undefined>;
};

function getExpectedSyncSecret() {
	return process.env.CONTENT_SYNC_SECRET ?? process.env.REVALIDATE_SECRET;
}

export function assertValidSyncSecret(syncSecret: string) {
	const expectedSyncSecret = getExpectedSyncSecret();

	if (!expectedSyncSecret) {
		throw new Error("Content sync secret is not configured");
	}

	if (syncSecret !== expectedSyncSecret) {
		throw new Error("Unauthorized");
	}
}
