export const homeContent = {
	name: "Murad Abdulkadyrov",
	description:
		"Murad Abdulkadyrov, Chief Product Officer at Flomni. Writing about AI, product building, and engineering leadership.",
	intro: {
		beforeOrganization: "I'm the Chief Product Officer at ",
		organization: "Flomni",
		organizationUrl: "https://flomni.com/en",
		afterOrganization: ", where I lead Product and Engineering.",
	},
	paragraphs: [
		"I like figuring out how things work and finding better ways to build them. Sometimes that means writing code, sometimes sketching an idea, and sometimes questioning a process everyone has gotten used to.",
		"Here I write about AI, products, leadership, and whatever else gets me thinking. Some posts come from things I've tried. Others start with a question I haven't figured out yet.",
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
