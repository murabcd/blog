import { BlogPosts } from "@/components/posts";

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">Murad Abdulkadyrov</h1>
      <p className="mb-4">
        {`I’m the Chief Product Officer at Flomni, where I lead the product and engineering teams. My job is to help build useful tools that make life easier for our clients—mostly non-technical teams in B2B companies.`}
      </p>
      <p className="mb-4">
        {`I like figuring out how things work and finding better ways to build them. Sometimes I write code, sometimes I sketch out ideas, and most of the time I’m connecting the dots between people, problems, and solutions.`}
      </p>
      <p className="mb-4">
        {`This blog is where I share what I’m learning—from working with AI and tech, to building products and leading teams. Nothing fancy—just real experiences, ideas, and lessons worth sharing.`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  );
}
