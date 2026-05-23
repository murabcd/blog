import { ConvexError } from "convex/values";

export function assertCompleteSync(
	expectedSlugs: string[],
	items: { slug: string }[],
) {
	if (items.length === 0) {
		throw new ConvexError("Sync payload is empty");
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
