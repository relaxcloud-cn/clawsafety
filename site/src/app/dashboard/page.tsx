import { dashboardActivity, dashboardMetrics, registrySkills } from "@/lib/registry";

export default function DashboardPage() {
  return (
    <section className="container dashboard-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">控制台</div>
          <h1>已保存技能、安装历史和漂移事件的集中视图。</h1>
        </div>
        <p>
          这是一个静态演示控制台，但其数据结构与后端已有或计划跟踪的数据一致。
        </p>
      </div>

      <div className="stats-grid">
        {dashboardMetrics.map((metric) => (
          <div key={metric.label} className="stat-card">
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid stacked-section">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">操作记录</div>
              <h2>动态</h2>
            </div>
          </div>

          <div className="activity-list">
            {dashboardActivity.map((item) => (
              <article key={item.title} className="activity-row">
                <div className="timeline-meta">
                  <strong>{item.title}</strong>
                  <span>{item.time}</span>
                </div>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">已保存技能</div>
              <h2>清单</h2>
            </div>
          </div>

          <div className="activity-list">
            {registrySkills.map((skill) => (
              <article key={`${skill.publisher}-${skill.slug}`} className="activity-row">
                <div className="timeline-meta">
                  <strong>{skill.name}</strong>
                  <span>{skill.latestVersion}</span>
                </div>
                <p>
                  {skill.publisherLabel} · {skill.installs.toLocaleString()} 次安装 ·{" "}
                  {skill.verification}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
