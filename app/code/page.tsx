import type { Metadata } from "next";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/lib/utils";
import { baseUrl } from "@/app/sitemap";

const ogImage = new URL("/api/og", baseUrl).toString();

export const metadata: Metadata = {
	title: "Code",
	description:
		"Open source projects and code I've written. Including AI agents, voice applications, and other tools.",
	openGraph: {
		title: "Code | Murad Abdulkadyrov",
		description:
			"Open source projects and code I've written. Including AI agents, voice applications, and other tools.",
		url: `${baseUrl}/code`,
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
		title: "Code | Murad Abdulkadyrov",
		description:
			"Open source projects and code I've written. Including AI agents, voice applications, and other tools.",
		images: [ogImage],
		creator: "@murabcd",
	},
};

export default async function Page() {
	const projects = await fetchQuery(api.code.getAllProjects);

	return (
		<section>
			<h1 className="font-semibold text-2xl mb-8 tracking-tighter">Code</h1>
			<div className="relative">
				<div className="space-y-4">
					{projects.map((project) => (
						<Link
							key={project.href}
							href={project.href}
							target="_blank"
							rel="noopener noreferrer"
							className="block group cursor-pointer"
						>
							<div className="flex flex-col md:flex-row gap-2">
								<p className="text-muted-foreground w-[110px] tabular-nums">
									{formatDate(project.date, false)}
								</p>
								<p className="text-foreground tracking-tight group-hover:underline">
									{project.title}
								</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
