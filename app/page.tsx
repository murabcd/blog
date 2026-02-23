import type { Metadata } from "next";
import { BlogPosts } from "@/components/posts";
import { baseUrl } from "./sitemap";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/convex/_generated/api";

const ogImage = new URL("/opengraph-image", baseUrl).toString();

export const metadata: Metadata = {
	title: "Home",
	description:
		"Chief Product Officer at Flomni. Exploring AI, tech, and product building. Sharing real experiences, ideas, and lessons from building products and leading teams.",
	alternates: {
		canonical: baseUrl,
	},
	openGraph: {
		title: "Murad Abdulkadyrov",
		description:
			"Chief Product Officer at Flomni. Exploring AI, tech, and product building. Sharing real experiences, ideas, and lessons from building products and leading teams.",
		url: baseUrl,
		type: "website",
		siteName: "Murad Abdulkadyrov",
		locale: "en_US",
		images: [
			{
				url: ogImage,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Murad Abdulkadyrov",
		description:
			"Chief Product Officer at Flomni. Exploring AI, tech, and product building. Sharing real experiences, ideas, and lessons from building products and leading teams.",
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
			<h1 className="title mb-8 text-2xl font-semibold tracking-tighter">
				Murad Abdulkadyrov
			</h1>
			<p className="mb-4">
				{`I'm a Chief Product Officer at `}
				<a
					href="https://flomni.com/en"
					target="_blank"
					rel="noopener noreferrer"
					className="no-underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
				>
					Flomni
				</a>
				{`, where I lead the Product and Engineering teams. My job is to help build useful tools that make life easier for our customers, mostly in B2B SaaS companies.`}
			</p>
			<p className="mb-4">
				{`I like figuring out how things work and finding better ways to build them. Sometimes I write code, sometimes I sketch out ideas, and most of the time I'm connecting the dots between people, problems, and solutions.`}
			</p>
			<p className="mb-4">
				{`This blog is where I share what I'm learning from working with AI and tech, to building products and leading teams. Nothing fancy - just real experiences, ideas, and lessons worth sharing.`}
			</p>
			<div className="my-8">
				<BlogPosts posts={posts} limit={5} />
			</div>
		</section>
	);
}
