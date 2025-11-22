import { getBlogPosts } from "@/lib/server-utils";

export async function GET(): Promise<Response> {
	const posts = getBlogPosts();
	return Response.json(posts);
}
