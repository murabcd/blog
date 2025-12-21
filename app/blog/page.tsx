import { BlogPosts } from "@/components/posts";
import { baseUrl } from "@/app/sitemap";
import { fetchQuery } from "convex/nextjs";
import { unstable_cache } from "next/cache";
import { api } from "@/convex/_generated/api";

const ogImage = new URL("/api/og", baseUrl).toString();

export const metadata = {
	title: "Blog",
	description:
		"Articles on AI, tech, product building, and leadership. Exploring practical insights from building products and leading teams.",
	openGraph: {
		title: "Blog | Murad Abdulkadyrov",
		description:
			"Articles on AI, tech, product building, and leadership. Exploring practical insights from building products and leading teams.",
		url: `${baseUrl}/blog`,
		siteName: "Murad Abdulkadyrov",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: ogImage,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Blog | Murad Abdulkadyrov",
		description:
			"Articles on AI, tech, product building, and leadership. Exploring practical insights from building products and leading teams.",
		images: [ogImage],
		creator: "@murabcd",
	},
};

const getAllBlogPostsCached = unstable_cache(
	async () => {
		return fetchQuery(api.blog.getAllPosts);
	},
	["convex", "blog", "getAllPosts"],
	{
		tags: ["blogPosts"],
		revalidate: 60,
	},
);

export default async function Page() {
	const posts = await getAllBlogPostsCached();

	return (
		<section>
			<h1 className="font-semibold text-2xl mb-8 tracking-tighter">Blog</h1>
			<BlogPosts posts={posts} />
		</section>
	);
}
