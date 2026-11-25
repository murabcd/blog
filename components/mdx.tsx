import { MDXRemote, type MDXRemoteProps } from "next-mdx-remote/rsc";
import { cacheLife } from "next/cache";
import {
	Blockquote,
	Code,
	CustomLink,
	Pre,
	RoundedImage,
	Table,
} from "@/components/mdx-components";
import { createHeading } from "@/lib/mdx-heading";

const components = {
	h1: createHeading(1),
	h2: createHeading(2),
	h3: createHeading(3),
	h4: createHeading(4),
	h5: createHeading(5),
	h6: createHeading(6),
	Image: RoundedImage,
	a: CustomLink,
	pre: Pre,
	code: Code,
	Table,
	blockquote: Blockquote,
};

export async function CustomMDX(props: MDXRemoteProps) {
	"use cache";
	// The source is part of the cache key, so edited content gets a new render.
	cacheLife("max");

	return (
		<MDXRemote
			{...props}
			components={{ ...components, ...(props.components || {}) }}
		/>
	);
}
