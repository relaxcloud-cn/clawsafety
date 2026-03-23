import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container list-page">
      <div className="panel">
        <div className="section-heading">
          <div>
            <div className="eyebrow">404</div>
            <h1>该技能或页面不存在。</h1>
          </div>
          <p>注册表导出仅包含此原型中的演示页面和静态技能数据。</p>
        </div>
        <div className="skill-card-actions">
          <Link href="/" className="primary-button">
            返回首页
          </Link>
          <Link href="/skills" className="ghost-button">
            浏览技能库
          </Link>
        </div>
      </div>
    </section>
  );
}
