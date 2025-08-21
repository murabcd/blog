import { BlogPosts } from "@/components/posts";

export default function Page() {
	return (
		<section>
			<h1 className="mb-8 text-2xl font-semibold tracking-tighter">
				Murad Abdulkadyrov
			</h1>
			<p className="mb-4">
				{`I'm a Chief Product Officer at `}
				<a
					href="https://flomni.com/en"
					target="_blank"
					rel="noopener noreferrer"
					className="underline hover:text-primary"
				>
					Flomni
				</a>
				{`, where I lead the Product and Engineering teams. My job is to help build useful tools that make life easier for our customers, mostly in B2B SaaS companies.`}
			</p>
			<p className="mb-4">
				{`I like figuring out how things work and finding better ways to build them. Sometimes I write code, sometimes I sketch out ideas, and most of the time I'm connecting the dots between people, problems, and solutions.`}
			</p>
			<p className="mb-4">
				{`This blog is where I share what I'm learning from working with AI and tech, to building products and leading teams. Nothing fancy - just real experiences, ideas, and lessons worth sharing.`}
			</p>
			<div className="my-8">
				<BlogPosts limit={5} />
			</div>
		</section>
	);
}
