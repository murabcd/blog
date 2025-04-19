import { BlogPosts } from "@/components/posts";

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">Murad Abdulkadyrov</h1>
      <p className="mb-4">
        {`I'm a product manager, developer and optimist. 
        I work at Flomni, where I lead the product and engineering teams.
        I'm also love to write about my experiences and thoughts on AI, technology and startups.`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  );
}
