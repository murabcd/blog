"use client";

import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center px-4 py-10">
			<Empty>
				<EmptyHeader>
					<EmptyTitle>404 - Not Found</EmptyTitle>
					<EmptyDescription>
						The page you&apos;re looking for doesn&apos;t exist. Use the
						navigation or search.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button onClick={() => redirect("/")} size="sm">
						Go back
					</Button>
				</EmptyContent>
			</Empty>
		</div>
	);
}
