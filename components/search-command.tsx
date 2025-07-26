"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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

type Content = {
	metadata: {
		title: string;
		publishedAt: string;
		summary: string;
	};
	slug: string;
};

export function SearchCommand() {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [blogs, setBlog] = React.useState<Content[]>([]);
	const [talks, setTalks] = React.useState<Content[]>([]);

	React.useEffect(() => {
		const fetchContent = async () => {
			try {
				const [blogResponse, talksResponse] = await Promise.all([
					fetch("/api/blog"),
					fetch("/api/talk"),
				]);
				const [blogData, talksData] = await Promise.all([
					blogResponse.json(),
					talksResponse.json(),
				]);
				setBlog(blogData);
				setTalks(talksData);
			} catch (error) {
				console.error("Failed to fetch content:", error);
			}
		};
		fetchContent();
	}, []);

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
				className="inline-flex items-center gap-2 rounded-md border border-input bg-transparent px-1.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
			>
				<Search className="h-4 w-4" />
				<span className="hidden sm:inline-flex">Search content...</span>
				<kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:inline-flex">
					<span className="text-xs">⌘</span>K
				</kbd>
			</button>
			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				className="sm:max-w-[450px]"
			>
				<CommandInput placeholder="Search content..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="Posts">
						{blogs.map((Content) => (
							<CommandItem
								key={Content.slug}
								onSelect={() => {
									router.push(`/blog/${Content.slug}`);
									setOpen(false);
								}}
							>
								<NotebookText className="mr-2 h-4 w-4" />
								<span>{Content.metadata.title}</span>
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
								<span>{talk.metadata.title}</span>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}
