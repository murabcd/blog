import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { baseUrl } from "@/app/sitemap";
import { CustomMDX } from "@/components/mdx";

export const metadata: Metadata = {
	title: "Chat",
	description:
		"Get in touch with me. I help startups with product advising and enjoy collaborating on interesting technical challenges.",
	openGraph: {
		title: "Chat | Murad Abdulkadyrov",
		description:
			"Get in touch with me. I help startups with product advising and enjoy collaborating on interesting technical challenges.",
		url: `${baseUrl}/chat`,
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Chat | Murad Abdulkadyrov",
		description:
			"Get in touch with me. I help startups with product advising and enjoy collaborating on interesting technical challenges.",
		creator: "@murabcd",
	},
};

export default async function Page() {
	const page = await fetchQuery(api.pages.getPageBySlug, { slug: "chat" });

	if (!page) {
		return (
			<section>
				<h1 className="mb-8 text-2xl font-semibold tracking-tighter">Chat</h1>
				<p>Page content not found.</p>
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
