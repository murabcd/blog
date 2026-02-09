import type { Metadata } from "next";
import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/convex/_generated/api";

const ogImage = new URL("/api/og", baseUrl).toString();

export const metadata: Metadata = {
	title: "Chat",
	description:
		"Get in touch with me. I help startups with product advising and enjoy collaborating on interesting technical challenges.",
	openGraph: {
		title: "Chat | Murad Abdulkadyrov",
		description:
			"Get in touch with me. I help startups with product advising and enjoy collaborating on interesting technical challenges.",
		url: `${baseUrl}/chat`,
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
		title: "Chat | Murad Abdulkadyrov",
		description:
			"Get in touch with me. I help startups with product advising and enjoy collaborating on interesting technical challenges.",
		images: [ogImage],
		creator: "@murabcd",
	},
};

async function getChatPageCached() {
	"use cache";
	cacheLife({ revalidate: 300 });
	cacheTag("pages", "pages:chat");
	return fetchQuery(api.pages.getPageBySlug, { slug: "chat" });
}

export default async function Page() {
	const page = await getChatPageCached();

	if (!page) {
		return (
			<section>
				<h1 className="mb-8 text-2xl font-semibold tracking-tighter">Chat</h1>
			</section>
		);
	}

	return (
		<section>
			<h1 className="mb-8 text-2xl font-semibold tracking-tighter">
				{page.title}
			</h1>
			<article className="prose">
				<CustomMDX source={page.content} />
			</article>
		</section>
	);
}
