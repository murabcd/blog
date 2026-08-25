import { readBlogPosts } from "@/lib/content-catalog";
import { createApiErrorResponse } from "@/lib/api-error";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
	const { slug } = await params;
	const post = readBlogPosts(process.cwd()).find(
		(candidate) => candidate.slug === slug,
	);

	if (!post) {
		return createApiErrorResponse({
			code: "post_not_found",
			message: "The requested article does not exist.",
			resolution: "Use /llms.txt to discover published article slugs.",
			status: 404,
		});
	}

	const frontmatterLines = [
		"---",
		`title: ${JSON.stringify(post.title)}`,
		`publishedAt: ${JSON.stringify(post.publishedAt)}`,
		`summary: ${JSON.stringify(post.summary)}`,
		post.image ? `image: ${JSON.stringify(post.image)}` : null,
		"---",
	].filter(Boolean);

	const body = `${frontmatterLines.join("\n")}\n\n${post.content}\n`;

	return new Response(body, {
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
			"Content-Disposition": `inline; filename="${slug}.md"`,
		},
	});
}
