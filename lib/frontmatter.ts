export type FrontmatterValue = string | boolean | undefined;
export type Frontmatter = Record<string, FrontmatterValue>;

export function toFrontmatter(data: Record<string, unknown>): Frontmatter {
	const frontmatter: Frontmatter = {};

	for (const [key, value] of Object.entries(data)) {
		if (
			typeof value === "string" ||
			typeof value === "boolean" ||
			value === undefined
		) {
			frontmatter[key] = value;
		}
	}

	return frontmatter;
}

export function getRequiredString(
	frontmatter: Frontmatter,
	field: string,
): string | null {
	const value = frontmatter[field];
	return typeof value === "string" && value.length > 0 ? value : null;
}

export function getOptionalString(
	frontmatter: Frontmatter,
	field: string,
): string | undefined {
	const value = frontmatter[field];
	return typeof value === "string" ? value : undefined;
}

export function getOptionalBoolean(
	frontmatter: Frontmatter,
	field: string,
): boolean | undefined {
	const value = frontmatter[field];
	return typeof value === "boolean" ? value : undefined;
}
