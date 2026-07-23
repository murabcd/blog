import type { Metadata } from "next";
import { baseUrl } from "@/lib/site";
import { CustomMDX } from "@/components/mdx";
import { getStaticPage } from "@/lib/public-content-cache";

const ogImage = new URL("/opengraph-image", baseUrl).toString();

export const metadata: Metadata = {
	title: "Chat",
	description:
		"Get in touch with me. I help startups with product advising and enjoy collaborating on interesting technical challenges.",
	alternates: {
		canonical: `${baseUrl}/chat`,
	},
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
		creator: "@murabcd",
	},
};

export default async function Page() {
	const page = await getStaticPage("chat");

	if (!page) {
		return (
			<section>
				<h1 className="title mb-8 text-2xl font-semibold tracking-tighter">
					Chat
				</h1>
			</section>
		);
	}

	return (
		<section>
			<h1 className="title mb-8 text-2xl font-semibold tracking-tighter">
				{page.title}
			</h1>
			<article className="prose">
				<CustomMDX source={page.content} />
			</article>
		</section>
	);
}
