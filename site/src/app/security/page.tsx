import { securityPrinciples } from "@/lib/registry";

export default function SecurityPage() {
  return (
    <section className="container security-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">安全模型</div>
          <h1>注册表完整性不能只靠一个扫描通过的标记。</h1>
        </div>
        <p>
          多数技能共享流程的主要缺陷在于：包在发布者扫描之后仍可能发生漂移。
          本页展示注册表如何应对这一问题。
        </p>
      </div>

      <div className="split-grid">
        {securityPrinciples.map((item) => (
          <article key={item.title} className="feature-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      <section className="stacked-section">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">威胁叙事</div>
              <h2>本框架旨在揭示的问题</h2>
            </div>
          </div>
          <div className="command-list">
            <div className="command-row">
              <strong>可变的 Git 引用</strong>
              <p>
                README 可以将用户指向一个分支，该分支在通过审核后被静默修改。
                版本化的 tree hash 可以防止静默漂移。
              </p>
            </div>
            <div className="command-row">
              <strong>恶意 SKILL.md 覆盖</strong>
              <p>
                Prompt 注入字符串可以隐藏在 markdown 代码块或示例片段中。
                发布者扫描会捕获它们，消费者安装时会重新运行最高优先级的规则。
              </p>
            </div>
            <div className="command-row">
              <strong>过宽的权限请求</strong>
              <p>
                注册表详情页在同一视图中展示请求的工具和安装命令，
                使安全审查始终基于实际载荷。
              </p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
