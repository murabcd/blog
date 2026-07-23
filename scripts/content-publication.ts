import type { ContentCatalog } from "../lib/content-catalog";
import {
	publicContentCacheTags,
	type PublicContentCacheTag,
} from "../lib/public-content-cache-policy";

export type PublicationCounts = {
	created: number;
	deleted: number;
	updated: number;
};

export type PublicationBatch = {
	[Kind in keyof ContentCatalog]: {
		kind: Kind;
		items: ContentCatalog[Kind];
	};
}[keyof ContentCatalog];

export type ContentPublicationAdapters = {
	invalidate: (tag: PublicContentCacheTag) => Promise<void>;
	publish: (batch: PublicationBatch) => Promise<PublicationCounts>;
};

export type PublicationResult = PublicationCounts & {
	kind: PublicationBatch["kind"];
	label: string;
};

const labels = {
	blogPosts: "Blog posts",
	codeProjects: "Code projects",
	staticPages: "Static pages",
	talkEvents: "Talk events",
} satisfies Record<PublicationBatch["kind"], string>;

function createBatches(catalog: ContentCatalog): PublicationBatch[] {
	return [
		{ kind: "blogPosts", items: catalog.blogPosts },
		{ kind: "talkEvents", items: catalog.talkEvents },
		{ kind: "codeProjects", items: catalog.codeProjects },
		{ kind: "staticPages", items: catalog.staticPages },
	];
}

async function publishBatch(
	batch: PublicationBatch,
	adapters: ContentPublicationAdapters,
): Promise<PublicationResult> {
	const label = labels[batch.kind];
	let counts: PublicationCounts;
	try {
		counts = await adapters.publish(batch);
	} catch (cause) {
		throw new Error(`Failed to publish ${label}`, { cause });
	}

	try {
		await adapters.invalidate(publicContentCacheTags[batch.kind]);
	} catch (cause) {
		throw new Error(`Published ${label}, but cache invalidation failed`, {
			cause,
		});
	}

	return { kind: batch.kind, label, ...counts };
}

export async function publishContent(
	catalog: ContentCatalog,
	adapters: ContentPublicationAdapters,
) {
	const outcomes = await Promise.allSettled(
		createBatches(catalog).map((batch) => publishBatch(batch, adapters)),
	);
	const errors: Error[] = [];
	const results: PublicationResult[] = [];
	for (const outcome of outcomes) {
		if (outcome.status === "fulfilled") {
			results.push(outcome.value);
		} else {
			errors.push(
				outcome.reason instanceof Error
					? outcome.reason
					: new Error(String(outcome.reason)),
			);
		}
	}

	if (errors.length > 0) {
		throw new AggregateError(
			errors,
			errors.map((error) => error.message).join("; "),
		);
	}

	return results;
}
