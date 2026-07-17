"use client";

import type * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function CommandDialog({
	title = "Search",
	description = "Search posts and talks",
	children,
	className,
	...props
}: React.ComponentProps<typeof Dialog> & {
	title?: string;
	description?: string;
	className?: string;
}) {
	return (
		<Dialog {...props}>
			<DialogContent className={cn("overflow-hidden p-0", className)}>
				<DialogHeader className="sr-only">
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<CommandPrimitive className="bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md">
					{children}
				</CommandPrimitive>
			</DialogContent>
		</Dialog>
	);
}

function CommandInput({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
	return (
		<div className="flex h-12 items-center gap-2 border-b px-3">
			<SearchIcon className="size-4 shrink-0 opacity-50" />
			<CommandPrimitive.Input
				className={cn(
					"placeholder:text-muted-foreground h-12 w-full bg-transparent text-sm outline-hidden",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function CommandList({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			className={cn(
				"max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto",
				className,
			)}
			{...props}
		/>
	);
}

function CommandEmpty({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
	return (
		<CommandPrimitive.Empty
			className={cn("py-6 text-center text-sm", className)}
			{...props}
		/>
	);
}

function CommandGroup({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
	return (
		<CommandPrimitive.Group
			className={cn(
				"text-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

function CommandItem({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
	return (
		<CommandPrimitive.Item
			className={cn(
				"data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
				className,
			)}
			{...props}
		/>
	);
}

export {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
};
