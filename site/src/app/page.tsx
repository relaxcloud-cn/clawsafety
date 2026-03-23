"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CopyCommand } from "@/components/copy-command";
import { SkillCard } from "@/components/skill-card";
import {
  compatibleTools,
  homeStats,
  registrySkills,
  trustPrograms,
  verificationModes,
} from "@/lib/registry";

const HERO_TABS = [
  { id: "url", label: "URL" },
  { id: "skill", label: "技能" },
  { id: "search", label: "搜索" },
] as const;

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<(typeof HERO_TABS)[number]["id"]>("search");
  const [query, setQuery] = useState("");

  const runSearch = () => {
    if (!query.trim()) {
      return;
    }

    router.push(`/scan?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
  };

  return (
    <div className="page-hero">
      <section className="container home-hero">
        <div className="hero-logo-stack">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <div className="hero-wordmark">CLAWSAFETY</div>
        </div>

        <p className="hero-lede">
          扫描可疑技能、GitHub 仓库和安装包，通过验证注册表安全分发。
        </p>

        <div className="hero-tabs">
          {HERO_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={mode === tab.id ? "hero-tab active" : "hero-tab"}
              onClick={() => setMode(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hero-search-stack">
          <div className="hero-search-card">
            <label className="scan-input">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="URL、GitHub 仓库、@发布者/技能名、文件哈希"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    runSearch();
                  }
                }}
              />
            </label>
            <button type="button" className="primary-button" onClick={runSearch}>
              搜索
            </button>
          </div>

          <div className="threat-banner">
            当消费端 tree hash 与发布端不一致时，ClawHavoc 类篡改会被自动拦截。
          </div>
        </div>

        <div className="tool-strip">
          {compatibleTools.map((tool) => (
            <span key={tool} className="tool-chip">
              {tool}
            </span>
          ))}
        </div>
      </section>

      <section className="container stacked-section">
        <div className="stats-grid">
          {homeStats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container stacked-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">注册表机制</div>
            <h2>先搜索，再信任，哈希一致才安装。</h2>
          </div>
          <p>
            交互面刻意做得简单：一个搜索框、一份报告、一条安装路径。背后注册表的保存、分享和验证状态始终可见。
          </p>
        </div>

        <div className="feature-grid">
          {trustPrograms.map((item) => (
            <article key={item.title} className="feature-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container stacked-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">验证流程</div>
            <h2>发布端扫描、消费端复检、显式交接。</h2>
          </div>
          <p>
            如果同一个技能要在团队和不同 AI 工具间流转，这是最低的安全门槛。
          </p>
        </div>

        <div className="split-grid">
          {verificationModes.map((item) => (
            <article key={item.title} className="panel">
              <div className="eyebrow">{item.title}</div>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container stacked-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">热门技能</div>
            <h2>不同信任状态的注册表条目。</h2>
          </div>
          <p>
            已验证、存在偏差、技能集——在同一界面展示，让运维人员一眼区分安全分发和待审队列。
          </p>
        </div>

        <div className="skills-grid">
          {registrySkills.slice(0, 3).map((skill) => (
            <SkillCard key={`${skill.publisher}-${skill.slug}`} skill={skill} />
          ))}
        </div>
      </section>

      <section className="container stacked-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">快速开始</div>
            <h2>安装、保存、分享、验证，一套命令搞定。</h2>
          </div>
          <p>
            当前为静态原型，但命令和页面结构已与后端 API 对齐。
          </p>
        </div>

        <div className="split-grid">
          <div className="command-block">
            <div className="command-line">
              <div>
                <div className="eyebrow">安装到 AI 工具</div>
                <code>Create clawsafety registry skill from https://clawsafe.dev/skill.md</code>
              </div>
              <CopyCommand
                command="Create clawsafety registry skill from https://clawsafe.dev/skill.md"
              />
            </div>
          </div>

          <div className="command-block">
            <div className="command-line">
              <div>
                <div className="eyebrow">CLI 命令</div>
                <code>{`clawsafety scan ./my-skill --format json
clawsafety registry save ./my-skill --version 1.0.0
clawsafety registry install @clawsafe/repo-audit@1.4.2`}</code>
              </div>
              <CopyCommand
                command={`clawsafety scan ./my-skill --format json
clawsafety registry save ./my-skill --version 1.0.0
clawsafety registry install @clawsafe/repo-audit@1.4.2`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container stacked-section">
        <div className="callout-card">
          <div className="section-heading">
            <div>
              <div className="eyebrow">下一步</div>
              <h2>从发现到治理，不用切换上下文。</h2>
            </div>
            <p>
              从首页搜索，浏览注册表，检查技能详情，再跳转到文档、定价或控制台——一条线走完。
            </p>
          </div>

          <div className="skill-card-actions">
            <Link href="/skills" className="primary-button">
              浏览技能库
            </Link>
            <Link href="/docs" className="ghost-button">
              查看文档
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
