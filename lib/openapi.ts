export function createOpenApiDocument(siteUrl: string) {
	const serverUrl = siteUrl.replace(/\/$/, "");

	return {
		openapi: "3.1.0",
		info: {
			title: "Murad Abdulkadyrov Public Content API",
			version: "1.0.0",
			description:
				"Read-only access to Murad Abdulkadyrov's published articles and machine-readable content indexes. No authentication is required.",
		},
		security: [],
		servers: [{ url: serverUrl }],
		tags: [
			{
				name: "Content",
				description: "Published blog content and discovery resources.",
			},
		],
		paths: {
			"/api/blog/{slug}/md": {
				get: {
					operationId: "getBlogArticleMarkdown",
					summary: "Get a published article as Markdown",
					description:
						"Returns one published blog article with YAML frontmatter and its complete Markdown body.",
					tags: ["Content"],
					parameters: [
						{
							name: "slug",
							in: "path",
							required: true,
							description:
								"The lowercase, hyphen-separated article slug listed in /llms.txt.",
							schema: {
								type: "string",
								maxLength: 200,
								pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$",
							},
						},
					],
					responses: {
						"200": {
							description: "The complete published article.",
							content: {
								"text/markdown": {
									schema: { type: "string" },
								},
							},
						},
						"404": {
							description: "No published article has the requested slug.",
							content: {
								"application/json": {
									schema: { $ref: "#/components/schemas/ApiError" },
								},
							},
						},
					},
				},
			},
			"/api/rss": {
				get: {
					operationId: "getBlogRssFeed",
					summary: "Get the blog RSS feed",
					description:
						"Returns the RSS 2.0 feed containing published article metadata and canonical links.",
					tags: ["Content"],
					responses: {
						"200": {
							description: "The current RSS feed.",
							content: {
								"text/xml": {
									schema: { type: "string" },
								},
							},
						},
					},
				},
			},
			"/llms.txt": {
				get: {
					operationId: "getAgentContentIndex",
					summary: "Get the machine-readable site index",
					description:
						"Returns the canonical llms.txt index of site sections, articles, talks, projects, and machine-readable resources.",
					tags: ["Content"],
					responses: {
						"200": {
							description: "The current llms.txt document.",
							content: {
								"text/plain": {
									schema: { type: "string" },
								},
							},
						},
					},
				},
			},
		},
		components: {
			schemas: {
				ApiError: {
					type: "object",
					additionalProperties: false,
					required: ["error"],
					properties: {
						error: {
							type: "object",
							additionalProperties: false,
							required: ["code", "message", "resolution"],
							properties: {
								code: { type: "string" },
								message: { type: "string" },
								resolution: { type: "string" },
							},
						},
					},
				},
			},
		},
	} as const;
}
