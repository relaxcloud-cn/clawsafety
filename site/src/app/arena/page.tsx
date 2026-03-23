import { arenaCards } from "@/lib/registry";

export default function ArenaPage() {
  return (
    <section className="container list-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">对比</div>
          <h1>对比已验证分发与非受控安装路径的差异。</h1>
        </div>
        <p>
          评分标准刻意保持简单：信任不仅取决于扫描质量，
          还取决于安装载荷是否仍然是审核通过的那个版本。
        </p>
      </div>

      <div className="arena-grid">
        {arenaCards.map((card) => (
          <article key={card.name} className="article-card">
            <div className="eyebrow">{card.score}</div>
            <h3>{card.name}</h3>
            <p>{card.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
