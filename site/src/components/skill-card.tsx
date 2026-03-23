import Link from "next/link";

import { skillHref, type SkillRecord } from "@/lib/registry";

function toneForVerification(state: SkillRecord["verification"]) {
  if (state === "verified") {
    return "safe";
  }
  if (state === "divergent") {
    return "warn";
  }
  return "danger";
}

export function SkillCard({ skill, compact = false }: { skill: SkillRecord; compact?: boolean }) {
  return (
    <article className={compact ? "skill-card compact" : "skill-card"}>
      <div className="skill-card-head">
        <div>
          <div className="skill-card-publisher">{skill.publisherLabel}</div>
          <h3>{skill.name}</h3>
        </div>
        <span className={`mini-pill ${toneForVerification(skill.verification)}`}>
          {skill.verification}
        </span>
      </div>

      <p className="skill-card-summary">{skill.summary}</p>

      <div className="skill-card-stats">
        <span>{skill.grade} / {skill.score}</span>
        <span>{skill.installs.toLocaleString()} 次安装</span>
        <span>{skill.updatedAt}</span>
      </div>

      <div className="skill-card-tags">
        <span className="mini-pill neutral">{skill.category}</span>
        <span className="mini-pill neutral">{skill.type}</span>
        {skill.support.slice(0, compact ? 2 : 3).map((tool) => (
          <span key={tool} className="mini-pill neutral">
            {tool}
          </span>
        ))}
      </div>

      <div className="skill-card-actions">
        <Link href={skillHref(skill)} className="ghost-button compact-button">
          详情
        </Link>
        <Link href={`/scan?q=${encodeURIComponent(skill.repoUrl)}&mode=url`} className="primary-button compact-button">
          扫描
        </Link>
      </div>
    </article>
  );
}
