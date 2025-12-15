import { getBlogPosts } from "@/lib/server-utils";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
	const { slug } = await params;
	const post = getBlogPosts().find((p) => p.slug === slug);

	if (!post) {
		return new Response("Not found", { status: 404 });
	}

	const frontmatterLines = [
		"---",
		`title: ${JSON.stringify(post.metadata.title)}`,
		`publishedAt: ${JSON.stringify(post.metadata.publishedAt)}`,
		`summary: ${JSON.stringify(post.metadata.summary)}`,
		post.metadata.image
			? `image: ${JSON.stringify(post.metadata.image)}`
			: null,
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
