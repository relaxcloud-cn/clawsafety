import { demos } from "@/lib/registry";

export default function DemosPage() {
  return (
    <section className="container list-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">演示</div>
          <h1>用短场景说明为什么需要重新验证。</h1>
        </div>
        <p>
          这些场景参考了 SkillSafe 的操作演示，但聚焦于
          ClawSafety 的扫描器和注册表行为。
        </p>
      </div>

      <div className="blog-list">
        {demos.map((demo) => (
          <article key={demo.title} className="article-card">
            <div className="timeline-meta">
              <h3>{demo.title}</h3>
              <span>{demo.result}</span>
            </div>
            <p>{demo.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
