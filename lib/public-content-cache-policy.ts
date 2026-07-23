export const publicContentCacheTags = {
	blogPosts: "blogPosts",
	codeProjects: "codeProjects",
	staticPages: "staticPages",
	talkEvents: "talkEvents",
} as const;

export type PublicContentCacheTag =
	(typeof publicContentCacheTags)[keyof typeof publicContentCacheTags];

const acceptedTags = new Set<string>(Object.values(publicContentCacheTags));

export function isPublicContentCacheTag(
	value: string,
): value is PublicContentCacheTag {
	return acceptedTags.has(value);
}
