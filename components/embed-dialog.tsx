"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
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
	const [copied, setCopied] = useState(false);

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
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <p style="font-size: 12px; color: hsl(var(--muted-foreground)); margin: 0;">${publishedAt}</p>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 12px; color: hsl(var(--muted-foreground));">${likeCount || 0} likes</span>
      </div>
    </div>
    <a href="${fullUrl}" style="font-size: 14px; color: hsl(var(--primary)); text-decoration: none; font-weight: 500;" target="_blank">Read full post</a>
  </div>
</div>`;

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(embedCode);
			setCopied(true);
			toast.success("Embed code copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy embed code:", error);
			toast.error("Failed to copy embed code");
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>Embed post</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Preview */}
					<div className="border rounded-lg p-4 bg-background max-w-md">
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
							<div className="flex items-center justify-between mb-2">
								<p className="text-xs text-muted-foreground">{publishedAt}</p>
								<div className="flex items-center gap-2">
									<span className="text-xs text-muted-foreground">
										{likeCount || 0} likes
									</span>
								</div>
							</div>
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

					{/* Embed Code */}
					<div className="space-y-2">
						<Label htmlFor="embed-code" className="text-sm font-medium">
							Embed code
						</Label>
						<div className="flex gap-2">
							<Input
								id="embed-code"
								value={embedCode}
								readOnly
								className="flex-1 text-xs font-mono"
							/>
							<Button
								onClick={handleCopy}
								size="icon"
								className="h-8 w-8 p-0"
								variant="secondary"
							>
								{copied ? (
									<Check className="w-3 h-3" />
								) : (
									<Copy className="w-3 h-3" />
								)}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
