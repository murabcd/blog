import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { TalksEvents } from "@/components/events";
import { baseUrl } from "@/app/sitemap";

const ogImage = new URL("/api/og", baseUrl).toString();

export const metadata = {
	title: "Talk",
	description:
		"Talks, presentations, and events where I share insights on AI, product building, and technology.",
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
		images: [ogImage],
		creator: "@murabcd",
	},
};

export default async function Page() {
	const events = await fetchQuery(api.talk.getAllEvents);

	return (
		<section>
			<h1 className="font-semibold text-2xl mb-8 tracking-tighter">Talk</h1>
			<TalksEvents events={events} />
		</section>
	);
}
