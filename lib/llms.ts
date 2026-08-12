import type { BlogPost, CodeProject, TalkEvent } from "@/lib/content-catalog";

type LlmsContent = {
	blogPosts: readonly Pick<
		BlogPost,
		"publishedAt" | "slug" | "summary" | "title"
	>[];
	codeProjects: readonly Pick<CodeProject, "date" | "href" | "title">[];
	siteUrl: string;
	talkEvents: readonly Pick<
		TalkEvent,
		"publishedAt" | "slug" | "summary" | "title"
	>[];
};

function normalizeInlineText(value: string) {
	return value.replace(/\s+/g, " ").trim();
}

function escapeLinkLabel(value: string) {
	return normalizeInlineText(value)
		.replaceAll("\\", "\\\\")
		.replaceAll("[", "\\[")
		.replaceAll("]", "\\]");
}

function createLink({
	description,
	href,
	label,
}: {
	description: string;
	href: string;
	label: string;
}) {
	return `- [${escapeLinkLabel(label)}](${href}): ${normalizeInlineText(description)}`;
}

function createSection(title: string, links: string[]) {
	return links.length > 0 ? [`## ${title}`, "", ...links, ""] : [];
}

export function createLlmsText({
	blogPosts,
	codeProjects,
	siteUrl,
	talkEvents,
}: LlmsContent) {
	const url = (pathname: string) => new URL(pathname, siteUrl).toString();
	const articles = [...blogPosts]
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
		.map((post) =>
			createLink({
				description: `Published ${post.publishedAt}. ${post.summary}`,
				href: url(`/api/blog/${encodeURIComponent(post.slug)}/md`),
				label: post.title,
			}),
		);
	const talks = [...talkEvents]
		.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
		.map((event) =>
			createLink({
				description: `Published ${event.publishedAt}. ${event.summary}`,
				href: url(`/talk/${encodeURIComponent(event.slug)}`),
				label: event.title,
			}),
		);
	const projects = [...codeProjects]
		.sort((a, b) => b.date.localeCompare(a.date))
		.map((project) =>
			createLink({
				description: `Open-source project published ${project.date}.`,
				href: project.href,
				label: project.title,
			}),
		);

	return [
		"# Murad Abdulkadyrov",
		"",
		"> Personal site and blog of Murad Abdulkadyrov, Chief Product Officer at Flomni, covering AI, technology, product building, leadership, talks, and open-source projects.",
		"",
		"Use the Markdown article links below when full source content is needed.",
		"",
		...createSection("Main sections", [
			createLink({
				description: "Biography and latest writing.",
				href: url("/"),
				label: "Home",
			}),
			createLink({
				description: "All published articles.",
				href: url("/blog"),
				label: "Blog",
			}),
			createLink({
				description: "Presentations, podcasts, and event recaps.",
				href: url("/talk"),
				label: "Talks",
			}),
			createLink({
				description: "Open-source software projects.",
				href: url("/code"),
				label: "Code",
			}),
			createLink({
				description: "Background, advising, and contact information.",
				href: url("/chat"),
				label: "Chat",
			}),
		]),
		...createSection("Machine-readable resources", [
			createLink({
				description: "Canonical index of site pages, articles, and talks.",
				href: url("/sitemap.xml"),
				label: "Sitemap",
			}),
			createLink({
				description: "Published articles with summaries.",
				href: url("/api/rss"),
				label: "RSS feed",
			}),
		]),
		...createSection("Articles", articles),
		...createSection("Talks", talks),
		...createSection("Open-source projects", projects),
	]
		.join("\n")
		.trimEnd()
		.concat("\n");
}
