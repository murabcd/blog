import Link from "next/link";
import { useId } from "react";
import { SearchCommand } from "@/components/search-command";

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

export function Navbar() {
	const navId = useId();

	return (
		<aside
			data-site-navbar
			className="sticky top-0 z-50 relative bg-background mb-16 tracking-tight"
		>
			<div className="lg:sticky lg:top-20">
				<nav
					className="flex flex-row items-center justify-between relative px-0 pb-0 md:pb-4 fade md:overflow-auto scroll-pr-6 md:relative mt-6"
					id={navId}
					>
					<div className="flex flex-row items-center space-x-4">
						{Object.entries(navItems).map(([path, { name }]) => {
							return (
								<Link
									key={path}
									href={path}
									prefetch
									className="transition-all hover:text-primary"
								>
									{name}
								</Link>
							);
						})}
					</div>
					<SearchCommand />
					</nav>
				</div>
				<div
					data-mobile-toc-slot
					className="lg:hidden absolute top-full left-1/2 z-40 w-screen -translate-x-1/2"
				/>
			</aside>
	);
}
