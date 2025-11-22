import { BlogPosts } from "@/components/posts";

export const metadata = {
	title: "Blog",
	description:
		"Articles on AI, tech, product building, and leadership. Exploring practical insights from building products and leading teams.",
	openGraph: {
		title: "Blog | Murad Abdulkadyrov",
		description:
			"Articles on AI, tech, product building, and leadership. Exploring practical insights from building products and leading teams.",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Blog | Murad Abdulkadyrov",
		description:
			"Articles on AI, tech, product building, and leadership. Exploring practical insights from building products and leading teams.",
		creator: "@murabcd",
	},
};

export default function Page() {
	return (
		<section>
			<h1 className="font-semibold text-2xl mb-8 tracking-tighter">Blog</h1>
			<BlogPosts />
		</section>
	);
}
