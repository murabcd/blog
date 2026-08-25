import type { Metadata } from "next";
import { BlogPosts } from "@/components/posts";
import { baseUrl } from "@/lib/site";
import { inlineContentLinkClassName } from "@/lib/link-styles";
import { getBlogPosts } from "@/lib/public-content-cache";
import { homeContent } from "@/lib/home-content";

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

type HomePageProps = {
	posts: Array<{
		publishedAt: string;
		slug: string;
		title: string;
	}>;
};

export function HomePage({ posts }: HomePageProps) {
	return (
		<section>
			<h1 className="title mb-8 text-2xl font-semibold tracking-tighter">
				{homeContent.name}
			</h1>
			<p className="mb-4">
				{homeContent.intro.beforeOrganization}
				<a
					href={homeContent.intro.organizationUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={inlineContentLinkClassName}
				>
					{homeContent.intro.organization}
				</a>
				{homeContent.intro.afterOrganization}
			</p>
			{homeContent.paragraphs.map((paragraph) => (
				<p className="mb-4" key={paragraph}>
					{paragraph}
				</p>
			))}
			<div className="my-8">
				<h2 className="sr-only">{homeContent.latestWritingHeading}</h2>
				<BlogPosts posts={posts} limit={5} />
			</div>
		</section>
	);
}

export default async function Page() {
	const posts = await getBlogPosts();

	return <HomePage posts={posts} />;
}
