"use client";

import { useState } from "react";
import { Code2, Link2, Linkedin, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";

import { EmbedDialog } from "@/components/embed-dialog";
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

interface ShareButtonProps {
	postSlug: string;
	title?: string;
	description?: string;
	publishedAt?: string;
	author?: string;
}

export function ShareButton({
	postSlug,
	title = "Untitled Post",
	description,
	publishedAt = "Recently",
	author = "Murad Abdulkadyrov",
}: ShareButtonProps) {
	const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const origin = typeof window !== "undefined" ? window.location.origin : "";
	const postUrl = origin ? `${origin}/blog/${postSlug}` : `/blog/${postSlug}`;
	const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
		postUrl,
	)}&text=${encodeURIComponent(title)}`;
	const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
		postUrl,
	)}`;
	const canNativeShare =
		typeof navigator !== "undefined" && typeof navigator.share === "function";

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(postUrl);
			toast.success("Copied to clipboard");
		} catch (error) {
			console.error("Failed to copy link:", error);
			toast.error("Failed to copy link");
		}
	};

	const handleNativeShare = async () => {
		if (!canNativeShare) return;
		try {
			const fullUrl = `${window.location.origin}/blog/${postSlug}`;
			await navigator.share({
				title,
				text: description,
				url: fullUrl,
			});
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			console.error("Failed to share:", error);
			toast.error("Failed to share");
		}
	};

	const handleEmbed = () => {
		setIsEmbedDialogOpen(true);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild className="hidden sm:inline-flex">
					<Button
						variant="ghost"
						size="sm"
						className="cursor-pointer h-8 shadow-none md:h-7 md:text-[0.8rem]"
					>
						<Share2 className="w-4 h-4 mr-1 text-muted-foreground" />
						<span className="text-xs">Share</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-52">
					{canNativeShare ? (
						<DropdownMenuItem onClick={handleNativeShare}>
							<Share2 />
							Share…
						</DropdownMenuItem>
					) : null}
					<DropdownMenuItem onClick={handleCopyLink}>
						<Link2 />
						Copy link
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
							<Twitter />
							Share to X
						</a>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<a
							href={linkedInShareUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Linkedin />
							Share to LinkedIn
						</a>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleEmbed}>
						<Code2 />
						Embed
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Popover open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
				<PopoverTrigger asChild className="sm:hidden">
					<Button
						variant="ghost"
						size="sm"
						className="cursor-pointer h-8 shadow-none md:h-7 md:text-[0.8rem]"
					>
						<Share2 className="w-4 h-4 mr-1 text-muted-foreground" />
						<span className="text-xs">Share</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="bg-background/70 dark:bg-background/60 w-56 rounded-lg p-1 shadow-sm backdrop-blur-sm"
					align="start"
				>
					{canNativeShare ? (
						<Button
							variant="ghost"
							size="lg"
							className="*:[svg]:text-muted-foreground w-full justify-start text-base font-normal"
							onClick={async () => {
								await handleNativeShare();
								setIsMobileMenuOpen(false);
							}}
						>
							<Share2 />
							Share…
						</Button>
					) : null}
					<Button
						variant="ghost"
						size="lg"
						className="*:[svg]:text-muted-foreground w-full justify-start text-base font-normal"
						onClick={async () => {
							await handleCopyLink();
							setIsMobileMenuOpen(false);
						}}
					>
						<Link2 />
						Copy link
					</Button>
					<Button
						variant="ghost"
						size="lg"
						asChild
						className="*:[svg]:text-muted-foreground w-full justify-start text-base font-normal"
						onClick={() => setIsMobileMenuOpen(false)}
					>
						<a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
							<Twitter />
							Share to X
						</a>
					</Button>
					<Button
						variant="ghost"
						size="lg"
						asChild
						className="*:[svg]:text-muted-foreground w-full justify-start text-base font-normal"
						onClick={() => setIsMobileMenuOpen(false)}
					>
						<a
							href={linkedInShareUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Linkedin />
							Share to LinkedIn
						</a>
					</Button>
					<Button
						variant="ghost"
						size="lg"
						className="*:[svg]:text-muted-foreground w-full justify-start text-base font-normal"
						onClick={() => {
							handleEmbed();
							setIsMobileMenuOpen(false);
						}}
					>
						<Code2 />
						Embed
					</Button>
				</PopoverContent>
			</Popover>

			<EmbedDialog
				isOpen={isEmbedDialogOpen}
				onOpenChange={setIsEmbedDialogOpen}
				postSlug={postSlug}
				title={title}
				description={description}
				publishedAt={publishedAt}
				author={author}
			/>
		</>
	);
}
