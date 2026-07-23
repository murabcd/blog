import { readBlogPosts } from "@/lib/content-catalog";

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
	const { slug } = await params;
	const post = readBlogPosts(process.cwd()).find(
		(candidate) => candidate.slug === slug,
	);

	if (!post) {
		return new Response("Not found", { status: 404 });
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
