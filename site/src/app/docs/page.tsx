import { CopyCommand } from "@/components/copy-command";
import { docsSections } from "@/lib/registry";

export default function DocsPage() {
  return (
    <section className="container docs-page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">文档</div>
          <h1>保存、分享、验证、安装——基于统一的注册表模型。</h1>
        </div>
        <p>
          文档参考了 SkillSafe 的信息架构，同时基于 ClawSafety 现有的扫描器和路线图。
        </p>
      </div>

      <div className="docs-layout">
        <aside className="panel docs-nav">
          <div className="eyebrow">目录</div>
          <ol>
            {docsSections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </aside>

        <div className="docs-content">
          {docsSections.map((section) => (
            <article key={section.id} id={section.id} className="docs-section panel">
              <div className="eyebrow">{section.title}</div>
              <h2>{section.title}</h2>
              <p>{section.body}</p>

              {"commands" in section && section.commands ? (
                <div className="command-block">
                  <div className="command-line">
                    <code>{section.commands.join("\n")}</code>
                    <CopyCommand command={section.commands.join("\n")} />
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
