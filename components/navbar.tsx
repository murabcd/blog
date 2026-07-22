import Link from "next/link";
import { SearchCommand } from "@/components/search-command";
import { getSearchContent } from "@/lib/search-content";

const navItems = {
	"/": {
		name: "home",
	},
	"/blog": {
		name: "blog",
	},
	"/talk": {
		name: "talk",
	},
	"/code": {
		name: "code",
	},
	"/chat": {
		name: "chat",
	},
};

export async function Navbar() {
	const searchContent = await getSearchContent();

	return (
		<aside
			data-site-navbar
			className="sticky top-0 z-50 relative bg-background mb-16 tracking-tight"
		>
			<div className="lg:sticky lg:top-20">
				<nav
					className="flex flex-row items-center relative px-0 pb-0 md:pb-4 fade md:overflow-auto scroll-pr-6 md:relative mt-6"
					aria-label="Primary navigation"
				>
					<div className="flex flex-row items-center space-x-4">
						{Object.entries(navItems).map(([path, { name }]) => {
							return (
								<Link
									key={path}
									href={path}
									prefetch
									className="transition-colors hover:text-primary"
								>
									{name}
								</Link>
							);
						})}
					</div>
					<SearchCommand {...searchContent} />
				</nav>
			</div>
			<div
				data-mobile-toc-slot
				className="lg:hidden absolute top-full left-1/2 z-40 w-screen -translate-x-1/2"
			/>
		</aside>
	);
}
