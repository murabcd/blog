import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const metadata = {
	title: "Code",
	description: "Check out some of the code I've written.",
};

const codeProjects = [
	{
		title: "VibeStack",
		href: "https://github.com/murabcd/vibestack",
		date: "2025-11-02",
	},
	{
		title: "Realtime AI Voice Agent",
		href: "https://github.com/murabcd/voice-agent",
		date: "2025-06-19",
	},
	{
		title: "AI Chatbot",
		href: "https://github.com/murabcd/openchat",
		date: "2025-05-21",
	},
];

export default function Page() {
	return (
		<section>
			<h1 className="font-semibold text-2xl mb-8 tracking-tighter">Code</h1>
			<div className="relative">
				<div className="space-y-4">
					{codeProjects.map((project) => (
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
