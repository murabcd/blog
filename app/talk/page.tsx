import { TalksEvents } from "@/components/events";
import { baseUrl } from "@/lib/site";
import { getTalkEvents } from "@/lib/public-content-cache";

const ogImage = new URL("/opengraph-image", baseUrl).toString();

export const metadata = {
	title: "Talk",
	description:
		"Talks, presentations, and events where I share insights on AI, product building, and technology.",
	alternates: {
		canonical: `${baseUrl}/talk`,
	},
	openGraph: {
		title: "Talk | Murad Abdulkadyrov",
		description:
			"Talks, presentations, and events where I share insights on AI, product building, and technology.",
		url: `${baseUrl}/talk`,
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
		title: "Talk | Murad Abdulkadyrov",
		description:
			"Talks, presentations, and events where I share insights on AI, product building, and technology.",
		creator: "@murabcd",
	},
};

export default async function Page() {
	const events = await getTalkEvents();

	return (
		<section>
			<h1 className="title font-semibold text-2xl mb-8 tracking-tighter">
				Talk
			</h1>
			<TalksEvents events={events} />
		</section>
	);
}
