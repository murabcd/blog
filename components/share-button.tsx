"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { EmbedDialog } from "@/components/embed-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

	const handleCopyLink = async () => {
		try {
			const fullUrl =
				typeof window !== "undefined"
					? `${window.location.origin}/blog/${postSlug}`
					: `/blog/${postSlug}`;
			await navigator.clipboard.writeText(fullUrl);
			toast.success("Copied to clipboard");
		} catch (error) {
			console.error("Failed to copy link:", error);
			toast.error("Failed to copy link");
		}
	};

	const handleEmbed = () => {
		setIsEmbedDialogOpen(true);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="cursor-pointer">
						<Share2 className="w-4 h-4 mr-1 text-muted-foreground" />
						<span className="text-xs">Share</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-40">
					<DropdownMenuItem onClick={handleCopyLink}>
						Copy link
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleEmbed}>Embed</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

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
