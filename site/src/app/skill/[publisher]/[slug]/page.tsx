import { notFound } from "next/navigation";

import { CopyCommand } from "@/components/copy-command";
import { findSkill, registrySkills } from "@/lib/registry";

type PageProps = {
  params: Promise<{
    publisher: string;
    slug: string;
  }>;
};

function toneForVerification(state: "verified" | "divergent" | "critical") {
  if (state === "verified") {
    return "safe";
  }
  if (state === "divergent") {
    return "warn";
  }
  return "danger";
}

export function generateStaticParams() {
  return registrySkills.map((skill) => ({
    publisher: skill.publisher,
    slug: skill.slug,
  }));
}

export default async function SkillDetailPage({ params }: PageProps) {
  const { publisher, slug } = await params;
  const skill = findSkill(publisher, slug);

  if (!skill) {
    notFound();
  }

  return (
    <section className="container details-page">
      <div className="details-hero">
        <div className="section-heading">
          <div>
            <div className="eyebrow">{skill.publisherLabel}</div>
            <h1>{skill.name}</h1>
          </div>
          <span className={`mini-pill ${toneForVerification(skill.verification)}`}>
            {skill.verification}
          </span>
        </div>
        <p className="hero-lede" style={{ margin: 0, textAlign: "left" }}>
          {skill.description}
        </p>
      </div>

      <div className="metric-strip">
        <div className="metric-card">
          <span>Grade</span>
          <strong>
            {skill.grade} / {skill.score}
          </strong>
        </div>
        <div className="metric-card">
          <span>Latest version</span>
          <strong>{skill.latestVersion}</strong>
        </div>
        <div className="metric-card">
          <span>Intent match</span>
          <strong>{skill.intentMatch}%</strong>
        </div>
        <div className="metric-card">
          <span>Installs</span>
          <strong>{skill.installs.toLocaleString()}</strong>
        </div>
      </div>

      <div className="details-grid stacked-section">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">Commands</div>
              <h2>Save, share, and install</h2>
            </div>
          </div>
          <div className="command-list">
            <div className="command-row">
              <div className="command-line">
                <div>
                  <strong>Install</strong>
                  <p>
                    Consumer-side verification runs again before install. This is
                    the main SkillSafe-style behavior implemented in the shell.
                  </p>
                  <code>{skill.installCommand}</code>
                </div>
                <CopyCommand command={skill.installCommand} />
              </div>
            </div>

            <div className="command-row">
              <div className="command-line">
                <div>
                  <strong>Save</strong>
                  <p>Publish a versioned tree hash into the registry.</p>
                  <code>{skill.saveCommand}</code>
                </div>
                <CopyCommand command={skill.saveCommand} />
              </div>
            </div>

            <div className="command-row">
              <div className="command-line">
                <div>
                  <strong>Share</strong>
                  <p>{skill.sharePolicy}</p>
                  <code>{skill.shareCommand}</code>
                </div>
                <CopyCommand command={skill.shareCommand} />
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">Package Trust</div>
              <h2>Verification context</h2>
            </div>
          </div>
          <div className="command-list">
            <div className="command-row">
              <strong>Tree hash</strong>
              <code>{skill.treeHash}</code>
            </div>
            <div className="command-row">
              <strong>Repository</strong>
              <code>{skill.repoUrl}</code>
            </div>
            <div className="command-row">
              <strong>Supported tools</strong>
              <div className="skill-card-tags">
                {skill.support.map((tool) => (
                  <span key={tool} className="mini-pill neutral">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="details-grid stacked-section">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">Scan Timeline</div>
              <h2>Publisher and consumer events</h2>
            </div>
          </div>
          <div className="timeline-list">
            {skill.scanSteps.map((step) => (
              <div key={`${step.timestamp}-${step.title}`} className="timeline-row">
                <span className={`timeline-dot ${step.state === "warning" ? "warning" : "pass"}`} />
                <div>
                  <div className="timeline-meta">
                    <strong>{step.title}</strong>
                    <span>{step.timestamp}</span>
                  </div>
                  <p>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">Findings</div>
              <h2>Current report</h2>
            </div>
          </div>
          <div className="finding-table">
            {skill.findings.map((finding) => (
              <article key={finding.id} className="finding-row">
                <div className="finding-topline">
                  <span
                    className={`mini-pill ${
                      finding.severity === "critical"
                        ? "danger"
                        : finding.severity === "high"
                          ? "warn"
                          : "neutral"
                    }`}
                  >
                    {finding.severity}
                  </span>
                  <strong>{finding.id}</strong>
                </div>
                <h3>{finding.title}</h3>
                <p>{finding.detail}</p>
                <div className="finding-fix">Fix: {finding.fix}</div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <section className="stacked-section">
        <div className="split-grid">
          <article className="callout-card">
            <div className="eyebrow">Highlights</div>
            {skill.highlights.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </article>
          <article className="callout-card">
            <div className="eyebrow">Use Cases</div>
            {skill.useCases.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </article>
        </div>
      </section>
    </section>
  );
}
