import type { Metadata } from "next";
import { baseUrl } from "@/app/sitemap";

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

export default function Page() {
	return (
		<section>
			<h1 className="mb-8 text-2xl font-semibold tracking-tighter">Chat</h1>
			<p className="mb-4">
				My current focus is on AI tools in production at{" "}
				<a
					href="https://flomni.com/en"
					target="_blank"
					rel="noopener noreferrer"
					className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
				>
					Flomni
				</a>
				. Previously, I worked on AI at{" "}
				<a
					href="https://juro.com"
					target="_blank"
					rel="noopener noreferrer"
					className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
				>
					Juro
				</a>
				, and ML at{" "}
				<a
					href="https://inten.to"
					target="_blank"
					rel="noopener noreferrer"
					className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
				>
					Intento
				</a>
				.
			</p>
			<p className="mb-4">
				I also help startups with product advising. Helping startups taught me
				that being a founder is incredibly hard, so I try to support founders in
				any way I can.
			</p>
			<p className="mb-4">
				I graduated from{" "}
				<a
					href="https://sfedu.ru/index_eng.php"
					target="_blank"
					rel="noopener noreferrer"
					className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
				>
					Southern Federal University
				</a>
				, where I stidied Computer Science. I'm active on{" "}
				<a
					href="https://github.com/murabcd"
					target="_blank"
					rel="noopener noreferrer"
					className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
				>
					GitHub
				</a>{" "}
				and love seeing what others are building.
			</p>
			<p className="mb-4">
				I frequently speak at events. Some recent talks include discussions on
				AI chatbots and voice applications in HR and CS.
			</p>
			<p className="mb-4">
				I enjoy learning about interesting technical challenges and
				collaborating with great teams.{" "}
				<a
					href="mailto:murad.pmanager@gmail.com"
					className="underline text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
				>
					Reach out
				</a>{" "}
				if you want to find a way to work together!
			</p>
		</section>
	);
}
