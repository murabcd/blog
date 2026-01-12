"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Search, NotebookText, Presentation } from "lucide-react";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";

export function SearchCommand() {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const blogs = useQuery(api.blog.getAllPosts) ?? [];
	const talks = useQuery(api.talk.getAllEvents) ?? [];

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				aria-label="Search content"
				className="inline-flex items-center gap-2 rounded-md border border-input bg-transparent px-1.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
			>
				<Search className="h-4 w-4" />
				<span className="hidden sm:inline-flex">Search content…</span>
				<Kbd className="hidden sm:inline-flex">⌘ K</Kbd>
			</button>
			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				className="sm:max-w-[450px]"
			>
				<CommandInput placeholder="Search content…" />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Posts">
						{blogs.map((post) => (
							<CommandItem
								key={post.slug}
								onSelect={() => {
									router.push(`/blog/${post.slug}`);
									setOpen(false);
								}}
							>
								<NotebookText className="mr-2 h-4 w-4" />
								<span>{post.title}</span>
							</CommandItem>
						))}
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Talks">
						{talks.map((talk) => (
							<CommandItem
								key={talk.slug}
								onSelect={() => {
									router.push(`/talk/${talk.slug}`);
									setOpen(false);
								}}
							>
								<Presentation className="mr-2 h-4 w-4" />
								<span>{talk.title}</span>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}
