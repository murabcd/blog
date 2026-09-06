import type { Metadata } from "next";
import { BlogPosts } from "@/components/posts";
import { baseUrl, socialProfiles } from "@/lib/site";
import { inlineContentLinkClassName } from "@/lib/link-styles";
import { getBlogPosts } from "@/lib/public-content-cache";
import { homeContent } from "@/lib/home-content";
import { serializeJsonLd } from "@/lib/jsonld";

const ogImage = new URL("/opengraph-image", baseUrl).toString();

export const metadata: Metadata = {
	title: { absolute: `${homeContent.name} — AI and Product Building` },
	description: homeContent.description,
	authors: [{ name: homeContent.name, url: baseUrl }],
	alternates: {
		canonical: baseUrl,
	},
	openGraph: {
		title: homeContent.name,
		description: homeContent.description,
		url: baseUrl,
		type: "website",
		siteName: homeContent.name,
		locale: "en_US",
		images: [
			{
				url: ogImage,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: homeContent.name,
		description: homeContent.description,
		creator: "@murabcd",
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "Person",
			"@id": `${baseUrl}/#person`,
			name: homeContent.name,
			description: homeContent.description,
			url: baseUrl,
			jobTitle: "Chief Product Officer",
			worksFor: {
				"@type": "Organization",
				name: homeContent.intro.organization,
				url: homeContent.intro.organizationUrl,
			},
			sameAs: Object.values(socialProfiles),
		},
		{
			"@type": "WebSite",
			"@id": `${baseUrl}/#website`,
			name: homeContent.name,
			description: homeContent.description,
			url: baseUrl,
			publisher: { "@id": `${baseUrl}/#person` },
		},
	],
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
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: serializeJsonLd escapes HTML delimiters in this structured data.
				dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
			/>
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
				<BlogPosts posts={posts} limit={5} titleElement="h2" />
			</div>
		</section>
	);
}

export default async function Page() {
	const posts = await getBlogPosts();

	return <HomePage posts={posts} />;
}
