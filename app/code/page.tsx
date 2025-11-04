import Link from "next/link";

export const metadata = {
	title: "Code",
	description: "Check out some of the code I've written.",
};

export default function Page() {
	return (
		<section>
			<h1 className="font-semibold text-2xl mb-8 tracking-tighter">Code</h1>
			<ul className="space-y-4">
				<li>
					<Link
						href="https://github.com/murabcd/openchat"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline"
					>
						AI Chatbot
					</Link>
				</li>
				<li>
					<Link
						href="https://github.com/murabcd/voice-agent"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline"
					>
						Realtime AI Voice Agent
					</Link>
				</li>
				<li>
					<Link
						href="https://github.com/murabcd/vibestack"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:underline"
					>
						VibeStack
					</Link>
				</li>
			</ul>
		</section>
	);
}
