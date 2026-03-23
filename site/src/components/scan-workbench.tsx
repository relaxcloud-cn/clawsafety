"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { buildMockScanReport, type MockScanReport } from "@/lib/mock-scan";

const MODES = [
  { id: "url", label: "URL" },
  { id: "skill", label: "Skill" },
  { id: "search", label: "注册表搜索" },
] as const;

function toneForVerification(state: MockScanReport["verification"]) {
  if (state === "verified") {
    return "safe";
  }
  if (state === "divergent") {
    return "warn";
  }
  return "danger";
}

export function ScanWorkbench() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const initialMode =
    (searchParams.get("mode") as MockScanReport["mode"] | null) ?? "url";

  return (
    <ScanWorkbenchInner
      key={`${initialMode}:${initialQuery}`}
      initialMode={initialMode}
      initialQuery={initialQuery}
    />
  );
}

function ScanWorkbenchInner({
  initialQuery,
  initialMode,
}: {
  initialQuery: string;
  initialMode: MockScanReport["mode"];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<MockScanReport["mode"]>(initialMode);
  const [isScanning, setIsScanning] = useState(Boolean(initialQuery));
  const [stepIndex, setStepIndex] = useState(0);
  const [report] = useState<MockScanReport | null>(
    initialQuery ? buildMockScanReport(initialQuery, initialMode) : null,
  );

  useEffect(() => {
    let cancelled = false;

    if (!report) {
      return () => {
        cancelled = true;
      };
    }

    const execute = async () => {
      for (let index = 0; index < report.skill.scanSteps.length; index += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 260));

        if (cancelled) {
          return;
        }

        setStepIndex(index + 1);
      }

      if (!cancelled) {
        setIsScanning(false);
      }
    };

    void execute();

    return () => {
      cancelled = true;
    };
  }, [report]);

  const activeSteps = report?.skill.scanSteps.slice(0, stepIndex) ?? [];

  return (
    <section className="scan-shell container">
      <div className="section-heading">
        <div>
          <div className="eyebrow">扫描工作台</div>
          <h1>一个搜索框，完成技能安全分诊。</h1>
        </div>
        <p>
          粘贴 GitHub 仓库地址、已保存的技能句柄或关键词。报告包含扫描结果、tree hash 验证和安装建议。
        </p>
      </div>

      <div className="hero-tabs">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={mode === item.id ? "hero-tab active" : "hero-tab"}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="scan-input-card">
        <label className="scan-input">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="https://github.com/org/repo 或 @发布者/技能名"
            onKeyDown={(event) => {
              if (event.key === "Enter" && query.trim()) {
                router.replace(`/scan?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
              }
            }}
          />
        </label>
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            if (!query.trim()) {
              return;
            }

            router.replace(`/scan?q=${encodeURIComponent(query.trim())}&mode=${mode}`);
          }}
        >
          {isScanning ? "扫描中..." : "搜索"}
        </button>
      </div>

      {report ? (
        <div className="scan-grid">
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="eyebrow">判定</div>
                <h2>{report.skill.name}</h2>
              </div>
              <span className={`mini-pill ${toneForVerification(report.verification)}`}>
                {report.verification}
              </span>
            </div>

            <div className="scan-score">
              <div className="scan-grade">{report.grade}</div>
              <div>
                <strong>{report.score}/100</strong>
                <p>{report.statusLine}</p>
              </div>
            </div>

            <div className="summary-grid">
              <div className="summary-tile">
                <span>严重</span>
                <strong>{report.summary.critical}</strong>
              </div>
              <div className="summary-tile">
                <span>高危</span>
                <strong>{report.summary.high}</strong>
              </div>
              <div className="summary-tile">
                <span>中危</span>
                <strong>{report.summary.medium}</strong>
              </div>
              <div className="summary-tile">
                <span>低危</span>
                <strong>{report.summary.low}</strong>
              </div>
            </div>

            <div className="timeline-list">
              {activeSteps.map((step) => (
                <div key={`${step.timestamp}-${step.title}`} className="timeline-row">
                  <span className={`timeline-dot ${step.state}`} />
                  <div>
                    <div className="timeline-meta">
                      <strong>{step.title}</strong>
                      <span>{step.timestamp}</span>
                    </div>
                    <p>{step.detail}</p>
                  </div>
                </div>
              ))}
              {isScanning ? (
                <div className="timeline-row">
                  <span className="timeline-dot scanning" />
                  <div>
                    <div className="timeline-meta">
                      <strong>扫描中</strong>
                      <span>进行中</span>
                    </div>
                    <p>正在执行高权重检查和安装验证。</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="eyebrow">发现</div>
                <h2>需要关注的问题</h2>
              </div>
            </div>

            <div className="finding-table">
              {report.skill.findings.map((finding) => (
                <article key={finding.id} className="finding-row">
                  <div className="finding-topline">
                    <span className={`mini-pill ${finding.severity === "critical" ? "danger" : finding.severity === "high" ? "warn" : "neutral"}`}>
                      {finding.severity}
                    </span>
                    <strong>{finding.id}</strong>
                  </div>
                  <h3>{finding.title}</h3>
                  <p>{finding.detail}</p>
                  <div className="finding-fix">修复: {finding.fix}</div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="panel empty-panel">
          <div className="scan-score">
            <div className="scan-grade">?</div>
            <div>
              <strong>粘贴 URL、技能句柄或搜索关键词。</strong>
              <p>
                报告将模拟发布端扫描、tree hash 存储和消费端复检流程。
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
