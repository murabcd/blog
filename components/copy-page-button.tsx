"use client";

import { Check, ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import { useRef, useState } from "react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";

function getPromptUrl(baseURL: string, url: string) {
	return `${baseURL}?q=${encodeURIComponent(
		`I’m reading this blog article: ${url}
Please help me understand the content, answer questions about it, provide examples, or discuss the topics covered in this article.
  `,
	)}`;
}

const menuItems = {
	markdown: (url: string) => (
		<a
			href={`/api/blog/${new URL(url).pathname.split("/").filter(Boolean).at(-1)}/md`}
			target="_blank"
			rel="noopener noreferrer"
		>
			<Icons.markdown />
			View as Markdown
		</a>
	),
	chatgpt: (url: string) => (
		<a
			href={getPromptUrl("https://chatgpt.com", url)}
			target="_blank"
			rel="noopener noreferrer"
		>
			<Icons.chatgpt />
			Open in ChatGPT
		</a>
	),
	claude: (url: string) => (
		<a
			href={getPromptUrl("https://claude.ai/new", url)}
			target="_blank"
			rel="noopener noreferrer"
		>
			<Icons.claude />
			Open in Claude
		</a>
	),
};

export function CopyPageButton({ slug, url }: { slug: string; url: string }) {
	const { copyToClipboard, isCopied } = useCopyToClipboard({
		onCopy: () => {
			toast.success("Copied to clipboard");
		},
		onError: () => {
			toast.error("Failed to copy to clipboard");
		},
	});
	const [isCopying, setIsCopying] = useState(false);
	const cachedMarkdownRef = useRef<string | null>(null);

	const fetchMarkdown = async () => {
		if (cachedMarkdownRef.current) {
			return cachedMarkdownRef.current;
		}
		const response = await fetch(`/api/blog/${slug}/md`);
		if (!response.ok) {
			throw new Error("Failed to fetch markdown");
		}
		const markdown = await response.text();
		cachedMarkdownRef.current = markdown;
		return markdown;
	};

	const trigger = (
		<Button
			variant="ghost"
			size="sm"
			className="peer -ml-0.5 size-8 shadow-none md:size-7 md:text-[0.8rem]"
		>
			<ChevronDown className="rotate-180 sm:rotate-0" />
		</Button>
	);

	return (
		<Popover>
			<div className="group/buttons relative flex rounded-lg *:data-[slot=button]:focus-visible:relative *:data-[slot=button]:focus-visible:z-10">
				<Button
					variant="ghost"
					size="sm"
					className="cursor-pointer h-8 shadow-none md:h-7 md:text-[0.8rem]"
					disabled={isCopying}
					onMouseEnter={() => {
						void fetchMarkdown().catch(() => undefined);
					}}
					onFocus={() => {
						void fetchMarkdown().catch(() => undefined);
					}}
					onClick={async () => {
						if (isCopying) return;
						setIsCopying(true);
						try {
							const markdown = await fetchMarkdown();
							copyToClipboard(markdown);
						} catch (error) {
							console.error("Failed to copy markdown:", error);
							toast.error("Failed to copy markdown");
						} finally {
							setIsCopying(false);
						}
					}}
				>
					{isCopied ? (
						<Check className="w-4 h-4 mr-1 text-muted-foreground" />
					) : (
						<Copy className="w-4 h-4 mr-1 text-muted-foreground" />
					)}
					<span className="text-xs">Copy</span>
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild className="hidden sm:flex">
						{trigger}
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="shadow-none">
						{Object.entries(menuItems).map(([key, value]) => (
							<DropdownMenuItem key={key} asChild>
								{value(url)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
				<Separator
					orientation="vertical"
					className="bg-foreground/10! absolute top-0 right-8 z-0 h-8! peer-focus-visible:opacity-0 sm:right-7 sm:h-7!"
				/>
				<PopoverTrigger asChild className="flex sm:hidden">
					{trigger}
				</PopoverTrigger>
				<PopoverContent
					className="bg-background/70 dark:bg-background/60 w-52 origin-center! rounded-lg p-1 shadow-sm backdrop-blur-sm"
					align="start"
				>
					{Object.entries(menuItems).map(([key, value]) => (
						<Button
							variant="ghost"
							size="lg"
							asChild
							key={key}
							className="*:[svg]:text-muted-foreground w-full justify-start text-base font-normal"
						>
							{value(url)}
						</Button>
					))}
				</PopoverContent>
			</div>
		</Popover>
	);
}
