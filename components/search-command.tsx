"use client";

import { NotebookText, Presentation, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { SearchContent } from "@/lib/search-content";

export function SearchCommand({ posts, talks }: SearchContent) {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				setOpen((current) => !current);
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	function navigate(href: string) {
		router.push(href);
		setOpen(false);
	}

	return (
		<>
			<Button
				type="button"
				variant="outline"
				onClick={() => setOpen(true)}
				aria-label="Search"
				className="ml-auto size-[30px] border-input bg-transparent px-0 text-muted-foreground shadow-none transition-colors hover:bg-transparent hover:text-primary sm:w-auto sm:px-3 dark:border-input dark:bg-transparent dark:hover:bg-transparent"
			>
				<Search data-icon="inline-start" />
				<span className="hidden sm:inline-flex">Search…</span>
				<Kbd className="hidden sm:inline-flex">⌘ K</Kbd>
			</Button>
			<CommandDialog open={open} onOpenChange={setOpen} className="sm:max-w-md">
				<CommandInput placeholder="Search…" aria-label="Search" />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Posts">
						{posts.map((post) => (
							<CommandItem
								key={post.slug}
								value={post.title}
								onSelect={() => navigate(`/blog/${post.slug}`)}
							>
								<NotebookText />
								<span>{post.title}</span>
							</CommandItem>
						))}
					</CommandGroup>
					<CommandGroup heading="Talks">
						{talks.map((talk) => (
							<CommandItem
								key={talk.slug}
								value={talk.title}
								onSelect={() => navigate(`/talk/${talk.slug}`)}
							>
								<Presentation />
								<span>{talk.title}</span>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}
