"use client";

import { useState, useId } from "react";

import { Copy } from "lucide-react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmbedDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	postSlug: string;
	title: string;
	description?: string;
	publishedAt: string;
	author: string;
}

export function EmbedDialog({
	isOpen,
	onOpenChange,
	postSlug,
	title,
	description,
	publishedAt,
	author,
}: EmbedDialogProps) {
	const embedCodeId = useId();
	const likeCount = useQuery(api.posts.getLikeCount, { postSlug });

	const fullUrl =
		typeof window !== "undefined"
			? `${window.location.origin}/blog/${postSlug}`
			: `/blog/${postSlug}`;

	const embedCode = `<div class="blog-post-embed" style="border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 16px; max-width: 500px; font-family: system-ui, -apple-system, sans-serif; background: hsl(var(--background));">
  <div style="flex: 1; min-width: 0;">
    <h3 style="font-weight: 600; color: hsl(var(--foreground)); font-size: 14px; margin: 0 0 4px 0; line-height: 1.3;">${title}</h3>
    <p style="font-size: 14px; color: hsl(var(--muted-foreground)); margin: 0 0 4px 0;">From ${author}</p>
    ${description ? `<p style="font-size: 14px; color: hsl(var(--muted-foreground)); margin: 0 0 8px 0; line-height: 1.4;">${description}</p>` : ""}
    <a href="${fullUrl}" style="font-size: 14px; color: hsl(var(--primary)); text-decoration: none; font-weight: 500;" target="_blank" rel="noopener noreferrer">Read full post</a>
  </div>
</div>`;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(embedCode);
			toast.success("Embed code copied to clipboard");
		} catch (error) {
			console.error("Failed to copy embed code:", error);
			toast.error("Failed to copy embed code");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<DialogTitle>Embed post</DialogTitle>
					<DialogDescription>
						Embed this post on your website or blog.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					{/* Preview */}
					<div className="space-y-2">
						<Label htmlFor="embed-code" className="text-sm font-medium">
							Preview
						</Label>
						<div className="border rounded-lg p-4 bg-muted/40 shadow-sm max-w-md">
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
									{title}
								</h3>
								<p className="text-sm text-muted-foreground mb-1">{author}</p>
								{description && (
									<p className="text-sm text-muted-foreground mb-2 line-clamp-2">
										{description}
									</p>
								)}

								<a
									href={fullUrl}
									className="text-sm text-primary hover:text-primary/80 font-medium no-underline"
									target="_blank"
									rel="noopener noreferrer"
								>
									Read full post
								</a>
							</div>
						</div>
					</div>

					{/* Embed Code */}
					<div className="space-y-2">
						<Label htmlFor={embedCodeId} className="text-sm font-medium">
							Code
						</Label>
						<div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
							<Input
								id={embedCodeId}
								value={embedCode}
								readOnly
								className="text-xs cursor-not-allowed flex-1"
							/>
							<Button
								onClick={handleCopy}
								size="sm"
								className="w-full sm:w-auto"
								aria-label="Copy embed code"
							>
								<Copy className="w-4 h-4 sm:block hidden" />
								<span className="sm:hidden">Copy</span>
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
