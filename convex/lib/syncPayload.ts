import { ConvexError } from "convex/values";

export function assertCompleteSync(
	expectedSlugs: string[],
	items: { slug: string }[],
	maxItems: number,
) {
	if (items.length === 0) {
		throw new ConvexError("Sync payload is empty");
	}
	if (items.length > maxItems || expectedSlugs.length > maxItems) {
		throw new ConvexError(`Sync payload exceeds the ${maxItems} item limit`);
	}

	const expected = new Set(expectedSlugs);
	const actual = new Set(items.map((item) => item.slug));

	if (expected.size !== expectedSlugs.length || actual.size !== items.length) {
		throw new ConvexError("Sync payload contains duplicate slugs");
	}

	if (expected.size !== actual.size) {
		throw new ConvexError("Sync payload does not match expected slugs");
	}

	for (const slug of expected) {
		if (!actual.has(slug)) {
			throw new ConvexError("Sync payload does not match expected slugs");
		}
	}
}

export function assertStoredSyncLimit(itemCount: number, maxItems: number) {
	if (itemCount > maxItems) {
		throw new ConvexError(`Stored content exceeds the ${maxItems} item limit`);
	}
}
