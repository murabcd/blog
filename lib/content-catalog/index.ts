import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
	getOptionalBoolean,
	getOptionalString,
	getRequiredString,
	toFrontmatter,
	type Frontmatter,
} from "../frontmatter";
import type {
	BlogPost,
	CodeProject,
	ContentCatalog,
	StaticPage,
	TalkEvent,
} from "./model";

export type {
	BlogPost,
	CodeProject,
	ContentCatalog,
	StaticPage,
	TalkEvent,
} from "./model";

type ParsedFile = {
	content: string;
	metadata: Frontmatter;
};

function requiredString(
	metadata: Frontmatter,
	field: string,
	filePath: string,
) {
	const value = getRequiredString(metadata, field);
	if (!value) {
		throw new Error(
			`${filePath}: missing required frontmatter field "${field}"`,
		);
	}
	return value;
}

function readFile(filePath: string): ParsedFile {
	const raw = fs.readFileSync(filePath, "utf-8");
	const { data, content } = matter(raw);
	return {
		content: content.trim(),
		metadata: toFrontmatter(data),
	};
}

function slugFromPath(filePath: string) {
	return path.basename(filePath, path.extname(filePath));
}

function readCollection<T>(directory: string, parse: (filePath: string) => T) {
	if (!fs.existsSync(directory)) {
		throw new Error(`Content directory does not exist: ${directory}`);
	}

	const filePaths = fs
		.readdirSync(directory)
		.filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
		.sort()
		.map((file) => path.join(directory, file));

	if (filePaths.length === 0) {
		throw new Error(`Content directory is empty: ${directory}`);
	}

	const slugs = new Set<string>();
	for (const filePath of filePaths) {
		const slug = slugFromPath(filePath);
		if (slugs.has(slug)) {
			throw new Error(`Content catalog contains duplicate slug "${slug}"`);
		}
		slugs.add(slug);
	}

	return filePaths.map(parse);
}

function readBlogPost(filePath: string): BlogPost {
	const { content, metadata } = readFile(filePath);
	return {
		slug: slugFromPath(filePath),
		title: requiredString(metadata, "title", filePath),
		summary: requiredString(metadata, "summary", filePath),
		content,
		publishedAt: requiredString(metadata, "publishedAt", filePath),
		image: getOptionalString(metadata, "image"),
	};
}

function readTalkEvent(filePath: string): TalkEvent {
	const { content, metadata } = readFile(filePath);
	return {
		slug: slugFromPath(filePath),
		title: requiredString(metadata, "title", filePath),
		summary: requiredString(metadata, "summary", filePath),
		content,
		publishedAt: requiredString(metadata, "publishedAt", filePath),
		image: getOptionalString(metadata, "image"),
	};
}

function readCodeProject(filePath: string): CodeProject {
	const { content, metadata } = readFile(filePath);
	return {
		slug: slugFromPath(filePath),
		title: requiredString(metadata, "title", filePath),
		href: requiredString(metadata, "href", filePath),
		date: requiredString(metadata, "date", filePath),
		content,
		published: getOptionalBoolean(metadata, "published") ?? true,
	};
}

function readStaticPage(filePath: string, slug: string): StaticPage {
	const { content, metadata } = readFile(filePath);
	return {
		slug,
		title: requiredString(metadata, "title", filePath),
		content,
		published: getOptionalBoolean(metadata, "published") ?? true,
	};
}

export function readBlogPosts(rootDirectory: string) {
	return readCollection(
		path.join(rootDirectory, "content", "blog"),
		readBlogPost,
	);
}

export function readTalkEvents(rootDirectory: string) {
	return readCollection(
		path.join(rootDirectory, "content", "talk"),
		readTalkEvent,
	);
}

export function readContentCatalog(rootDirectory: string): ContentCatalog {
	const contentDirectory = path.join(rootDirectory, "content");

	return {
		blogPosts: readBlogPosts(rootDirectory),
		talkEvents: readTalkEvents(rootDirectory),
		codeProjects: readCollection(
			path.join(contentDirectory, "code"),
			readCodeProject,
		),
		staticPages: [
			readStaticPage(path.join(contentDirectory, "chat.md"), "chat"),
		],
	};
}
