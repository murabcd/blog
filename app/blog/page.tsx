import { BlogPosts } from "@/components/posts";
import { baseUrl } from "@/app/sitemap";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/convex/_generated/api";

const ogImage = new URL("/opengraph-image", baseUrl).toString();

export const metadata = {
	title: "Blog",
	description:
		"Articles on AI, tech, product building, and leadership. Exploring practical insights from building products and leading teams.",
	alternates: {
		canonical: `${baseUrl}/blog`,
	},
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
		creator: "@murabcd",
	},
};

async function getAllBlogPostsCached() {
	"use cache";
	cacheLife({ revalidate: 60 });
	cacheTag("blogPosts");
	return fetchQuery(api.blog.getAllPosts);
}

export default async function Page() {
	const posts = await getAllBlogPostsCached();

	return (
		<section>
			<h1 className="title font-semibold text-2xl mb-8 tracking-tighter">
				Blog
			</h1>
			<BlogPosts posts={posts} />
		</section>
	);
}
