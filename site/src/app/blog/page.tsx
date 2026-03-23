import { blogPosts } from "@/lib/registry";

export default function BlogPage() {
  return (
    <section className="container list-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Research</div>
          <h1>Notes on skill trust, distribution, and registry ergonomics.</h1>
        </div>
        <p>
          The existing repo already leans heavily into research and incident
          reporting. This page turns that into a SkillSafe-like publishing surface.
        </p>
      </div>

      <div className="blog-list">
        {blogPosts.map((post) => (
          <article key={post.slug} className="article-card">
            <time>{post.date}</time>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
