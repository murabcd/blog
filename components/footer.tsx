import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { CurrentYear } from "@/components/current-year";

function ArrowIcon() {
	return (
		<svg
			width="10"
			height="10"
			viewBox="0 0 12 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M2.07 11.35.96 10.24 9.2 1.99H2.84L2.85.45h8.99v9.01h-1.55l.02-6.36-8.24 8.25Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export default function Footer() {
	return (
		<footer className="mb-6 mt-16">
			<ul className="font-sm mt-8 flex flex-row space-x-4 space-y-0 text-foreground">
				<li>
					<Link
						className="flex items-center transition-colors hover:text-primary"
						aria-label="RSS feed"
						href="/api/rss"
					>
						<ArrowIcon />
						<p className="ml-2 h-7">rss</p>
					</Link>
				</li>
				<li>
					<a
						className="flex items-center transition-colors hover:text-primary"
						aria-label="X (Twitter)"
						rel="noopener noreferrer"
						target="_blank"
						href="https://x.com/murabcd"
					>
						<ArrowIcon />
						<p className="ml-2 h-7">x</p>
					</a>
				</li>
				<li>
					<a
						className="flex items-center transition-colors hover:text-primary"
						aria-label="LinkedIn"
						rel="noopener noreferrer"
						target="_blank"
						href="https://www.linkedin.com/in/murabcd/"
					>
						<ArrowIcon />
						<p className="ml-2 h-7">li</p>
					</a>
				</li>
				<li>
					<a
						className="flex items-center transition-colors hover:text-primary"
						aria-label="GitHub"
						rel="noopener noreferrer"
						target="_blank"
						href="https://github.com/murabcd"
					>
						<ArrowIcon />
						<p className="ml-2 h-7">git</p>
					</a>
				</li>
			</ul>
			<div className="flex items-end justify-between text-xs text-muted-foreground">
				<p>
					© <CurrentYear /> Murad&apos;s blog. All rights reserved.
				</p>
				<ThemeSwitcher />
			</div>
		</footer>
	);
}
