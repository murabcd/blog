"use client";

import { useId, useSyncExternalStore } from "react";

import { Copy } from "lucide-react";

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
import { siteDomain } from "@/lib/site";

interface EmbedDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	postSlug: string;
	title: string;
	description?: string;
	author: string;
}

function subscribe() {
	return () => {};
}

function getOriginSnapshot() {
	return window.location.origin;
}

function getServerOriginSnapshot() {
	return "";
}

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

export function EmbedDialog({
	isOpen,
	onOpenChange,
	postSlug,
	title,
	description,
	author,
}: EmbedDialogProps) {
	const embedCodeId = useId();
	const origin = useSyncExternalStore(
		subscribe,
		getOriginSnapshot,
		getServerOriginSnapshot,
	);

	const fullUrl = origin ? `${origin}/blog/${postSlug}` : `/blog/${postSlug}`;
	const escapedUrl = escapeHtml(fullUrl);
	const escapedTitle = escapeHtml(title);
	const escapedAuthor = escapeHtml(author);
	const escapedDescription = description ? escapeHtml(description) : "";

	const embedCode = `<a href="${escapedUrl}" class="blog-post-embed" style="display: block; box-sizing: border-box; border: 1px solid #eaeaea; border-radius: 6px; padding: 16px; max-width: 500px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fafafa; color: #171717; text-decoration: none;" target="_blank" rel="noopener noreferrer">
  <p style="font-size: 12px; color: #666666; margin: 0 0 8px 0; line-height: 1.4;">${siteDomain} · ${escapedAuthor}</p>
  <h3 style="font-weight: 600; color: #171717; font-size: 16px; margin: 0 0 8px 0; line-height: 1.3;">${escapedTitle}</h3>
  ${escapedDescription ? `<p style="font-size: 14px; color: #4d4d4d; margin: 0 0 12px 0; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapedDescription}</p>` : ""}
  <span style="font-size: 14px; color: #171717; font-weight: 500;">Read full post →</span>
</a>`;

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
					<div className="space-y-2">
						<p className="text-sm font-medium">Preview</p>
						<a
							href={fullUrl}
							className="group block max-w-md rounded-md border border-border bg-muted/20 p-4 no-underline outline-none transition-[background-color,border-color,box-shadow] hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							target="_blank"
							rel="noopener noreferrer"
						>
							<div className="min-w-0 space-y-2">
								<p className="text-xs leading-none text-muted-foreground">
									{siteDomain} · {author}
								</p>
								<h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
									{title}
								</h3>
								{description && (
									<p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
										{description}
									</p>
								)}
								<span className="inline-flex text-sm font-medium text-foreground transition-all group-hover:text-primary">
									Read full post →
								</span>
							</div>
						</a>
					</div>

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
