import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { BlogPosts } from "@/components/posts";
import { baseUrl } from "./sitemap";

export const metadata: Metadata = {
	title: "Home",
	description:
		"Chief Product Officer at Flomni. Exploring AI, tech, and product building. Sharing real experiences, ideas, and lessons from building products and leading teams.",
	openGraph: {
		title: "Murad Abdulkadyrov",
		description:
			"Chief Product Officer at Flomni. Exploring AI, tech, and product building. Sharing real experiences, ideas, and lessons from building products and leading teams.",
		url: baseUrl,
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Murad Abdulkadyrov",
		description:
			"Chief Product Officer at Flomni. Exploring AI, tech, and product building. Sharing real experiences, ideas, and lessons from building products and leading teams.",
		creator: "@murabcd",
	},
};

export default async function Page() {
	const posts = await fetchQuery(api.blog.getAllPosts);

	return (
		<section>
			<h1 className="mb-8 text-2xl font-semibold tracking-tighter">
				Murad Abdulkadyrov
			</h1>
			<p className="mb-4">
				{`I'm a Chief Product Officer at `}
				<a
					href="https://flomni.com/en"
					target="_blank"
					rel="noopener noreferrer"
					className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
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
