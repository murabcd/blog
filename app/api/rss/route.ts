import { baseUrl } from "@/lib/site";
import { readBlogPosts } from "@/lib/content-catalog";

export async function GET(): Promise<Response> {
	const blogPosts = readBlogPosts(process.cwd());

	const itemsXml = blogPosts
		.sort((a, b) => {
			if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
				return -1;
			}
			return 1;
		})
		.map(
			(post) =>
				`<item>
          <title>${post.title}</title>
          <link>${baseUrl}/blog/${post.slug}</link>
          <description>${post.summary}</description>
          <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
        </item>`,
		)
		.join("\n");

	const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>Murad Abdulkadyrov</title>
        <link>${baseUrl}</link>
        <description>Articles on AI, tech, product building, and leadership. Exploring practical insights from building products and leading teams.</description>
        <language>en-US</language>
        ${itemsXml}
    </channel>
  </rss>`;

	return new Response(rssFeed, {
		headers: {
			"Content-Type": "text/xml",
		},
	});
}
