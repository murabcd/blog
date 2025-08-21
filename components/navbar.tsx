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
};

export function Navbar() {
	const navId = useId();

	return (
		<aside className="sticky top-0 z-50 bg-background mb-16 tracking-tight">
			<div className="lg:sticky lg:top-20">
				<nav
					className="flex flex-row items-center justify-between relative px-2 md:px-0 pb-4 fade md:overflow-auto scroll-pr-6 md:relative mt-6"
					id={navId}
				>
					<div className="flex flex-row items-center space-x-4">
						{Object.entries(navItems).map(([path, { name }]) => {
							return (
								<Link
									key={path}
									href={path}
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
		</aside>
	);
}
