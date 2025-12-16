import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

type Metadata = {
	title: string;
	publishedAt: string;
	summary: string;
	image?: string;
};

function parseMarkdown(fileContent: string) {
	const { data, content } = matter(fileContent);
	return { metadata: data as Metadata, content: content.trim() };
}

function getMarkdownFiles(dir: string) {
	if (!fs.existsSync(dir)) {
		return [];
	}
	return fs
		.readdirSync(dir)
		.filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
}

function readMarkdownFile(filePath: string) {
	const rawContent = fs.readFileSync(filePath, "utf-8");
	return parseMarkdown(rawContent);
}

function getMarkdownData(dir: string) {
	const files = getMarkdownFiles(dir).sort();
	return files.map((file) => {
		const { metadata, content } = readMarkdownFile(path.join(dir, file));
		const slug = path.basename(file, path.extname(file));

		return {
			metadata,
			slug,
			content,
		};
	});
}

export function getBlogPosts() {
	return getMarkdownData(path.join(process.cwd(), "content", "blog"));
}

export function getTalksEvents() {
	return getMarkdownData(path.join(process.cwd(), "content", "talk"));
}
