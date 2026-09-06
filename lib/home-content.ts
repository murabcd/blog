export const homeContent = {
	name: "Murad Abdulkadyrov",
	description:
		"Murad Abdulkadyrov, Chief Product Officer at Flomni. Writing about AI, product building, and engineering leadership.",
	intro: {
		beforeOrganization: "I'm a Chief Product Officer at ",
		organization: "Flomni",
		organizationUrl: "https://flomni.com/en",
		afterOrganization:
			", where I lead the Product and Engineering teams. My job is to help build useful tools that make life easier for our customers, mostly in B2B SaaS companies.",
	},
	paragraphs: [
		"I like figuring out how things work and finding better ways to build them. Sometimes I write code, sometimes I sketch out ideas, and most of the time I'm connecting the dots between people, problems, and solutions.",
		"This blog is where I share what I'm learning from working with AI and tech, to building products and leading teams. Nothing fancy - just real experiences, ideas, and lessons worth sharing.",
	],
} as const;

export function createHomeMarkdown(siteUrl: string) {
	const url = (pathname: string) => new URL(pathname, siteUrl).toString();
	const { intro } = homeContent;

	return [
		`# ${homeContent.name}`,
		"",
		`${intro.beforeOrganization}[${intro.organization}](${intro.organizationUrl})${intro.afterOrganization}`,
		"",
		...homeContent.paragraphs.flatMap((paragraph) => [paragraph, ""]),
		"The blog covers practical work with AI, product building, engineering leadership, and the decisions behind shipping software in real teams.",
		"",
		`- [Read all articles](${url("/blog")})`,
		`- [Browse talks and event notes](${url("/talk")})`,
		`- [Browse open-source projects](${url("/code")})`,
		`- [Machine-readable site index](${url("/llms.txt")})`,
		"",
	]
		.join("\n")
		.concat("\n");
}
