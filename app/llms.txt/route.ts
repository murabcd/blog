import { createLlmsText } from "@/lib/llms";
import { readContentCatalog } from "@/lib/content-catalog";
import { baseUrl } from "@/lib/site";

export function GET(): Response {
	const { blogPosts, codeProjects, talkEvents } = readContentCatalog(
		process.cwd(),
	);
	const manifest = createLlmsText({
		blogPosts,
		codeProjects: codeProjects.filter((project) => project.published),
		siteUrl: baseUrl,
		talkEvents,
	});

	return new Response(manifest, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
}
