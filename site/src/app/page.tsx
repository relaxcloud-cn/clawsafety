"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");

  return (
    <main className="min-h-screen" style={{ background: "#131320" }}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50" style={{ background: "rgba(19,19,32,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1300px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white" style={{ background: "#394EFF" }}>CS</div>
            <span className="font-semibold text-[15px] tracking-tight">ClawSafe</span>
          </Link>
          <div className="flex items-center gap-5 text-[13px]" style={{ color: "#8888a0" }}>
            <Link href="/scan" className="hover:text-white transition">Scan</Link>
            <Link href="/blog" className="hover:text-white transition">Research</Link>
            <Link href="/ioc" className="hover:text-white transition">IOC Feed</Link>
            <a href="https://github.com/relaxcloud-cn/clawsafety" target="_blank" className="hover:text-white transition">GitHub</a>
            <Link href="/en" className="hover:text-white transition">EN</Link>
          </div>
        </div>
      </nav>

      {/* Hero — VT style: centered, minimal */}
      <section className="pt-28 pb-8 px-6">
        <div className="max-w-[680px] mx-auto text-center">
          {/* Logo mark */}
          <div className="mb-8 flex justify-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ background: "linear-gradient(135deg, #394EFF 0%, #6366f1 100%)" }}>
              CS
            </div>
          </div>

          <h1 className="text-[28px] font-semibold tracking-tight mb-3" style={{ color: "#e0e0e8" }}>
            分析可疑的 Agent Skill
          </h1>
          <p className="text-[14px] mb-8" style={{ color: "#6b6b82" }}>
            扫描 OpenClaw Skill、MCP Server、Claude Code Skill 中的安全漏洞和恶意行为
          </p>

          {/* Search Box — the core */}
          <div className="relative mb-4">
            <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "#1e1e32", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="pl-4 pr-3 flex items-center" style={{ color: "#6b6b82" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入 GitHub 仓库 URL 或 ClawHub Skill 地址"
                className="flex-1 py-3.5 bg-transparent text-[14px] outline-none placeholder:text-[#4a4a60]"
                style={{ color: "#e0e0e8" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && url.trim()) {
                    window.location.href = `/scan?url=${encodeURIComponent(url.trim())}`;
                  }
                }}
              />
              <button
                onClick={() => {
                  if (url.trim()) window.location.href = `/scan?url=${encodeURIComponent(url.trim())}`;
                }}
                className="px-5 py-3.5 text-[13px] font-medium text-white transition-colors cursor-pointer"
                style={{ background: "#394EFF" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4d5fff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#394EFF")}
              >
                扫描
              </button>
            </div>
          </div>

          {/* Tabs under search */}
          <div className="flex justify-center gap-6 text-[12px] mb-12" style={{ color: "#5a5a72" }}>
            <span className="pb-1" style={{ borderBottom: "2px solid #394EFF", color: "#394EFF" }}>URL</span>
            <span className="pb-1 cursor-pointer hover:text-white transition">文件上传</span>
            <span className="pb-1 cursor-pointer hover:text-white transition">Skill 搜索</span>
          </div>
        </div>
      </section>

      {/* Alert Banner */}
      <section className="px-6 mb-12">
        <div className="max-w-[680px] mx-auto">
          <div className="rounded-lg px-4 py-3 flex items-center gap-3 text-[13px]" style={{ background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.15)" }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#f44336" }} />
            <span style={{ color: "#f4a0a0" }}>
              <strong style={{ color: "#f44336" }}>ClawHavoc</strong> — 1,184 个恶意 Skill 确认，C2: 91.92.242.30
              <Link href="/blog/clawhavoc-amos" className="ml-2 underline" style={{ color: "#8888a0" }}>详情</Link>
            </span>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="px-6 pb-16">
        <div className="max-w-[900px] mx-auto">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-px rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            {[
              { v: "23", l: "扫描规则" },
              { v: "6", l: "规则类别" },
              { v: "46", l: "已扫描 Skill" },
              { v: "8", l: "C2 IP" },
              { v: "9", l: "恶意域名" },
              { v: "4", l: "研究报告" },
            ].map((s) => (
              <div key={s.l} className="text-center py-5" style={{ background: "#1a1a2e" }}>
                <div className="text-[22px] font-semibold" style={{ color: "#e0e0e8" }}>{s.v}</div>
                <div className="text-[11px] mt-0.5" style={{ color: "#5a5a72" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compatible Tools */}
      <section className="px-6 pb-16">
        <div className="max-w-[900px] mx-auto">
          <div className="text-[12px] text-center mb-4" style={{ color: "#5a5a72" }}>兼容平台</div>
          <div className="flex flex-wrap justify-center gap-2">
            {["Claude Code", "OpenClaw", "Cursor", "Windsurf", "Codex", "Gemini", "Cline", "Roo", "Goose", "MCP Server"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-md text-[12px]" style={{ background: "#1a1a2e", color: "#7a7a92", border: "1px solid rgba(255,255,255,0.05)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — clean 3 col */}
      <section className="px-6 pb-16">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-[18px] font-semibold text-center mb-8" style={{ color: "#e0e0e8" }}>工作流程</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { n: "01", t: "提交", d: "粘贴 GitHub URL 或上传 Skill 目录" },
              { n: "02", t: "扫描", d: "23 条规则 + IOC 数据库深度检测" },
              { n: "03", t: "报告", d: "A-F 评分、逐条发现、修复建议" },
            ].map((s) => (
              <div key={s.n} className="rounded-xl p-5" style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="text-[11px] font-mono mb-3" style={{ color: "#394EFF" }}>{s.n}</div>
                <div className="text-[15px] font-semibold mb-1" style={{ color: "#e0e0e8" }}>{s.t}</div>
                <div className="text-[13px]" style={{ color: "#6b6b82" }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-6 pb-16">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-[18px] font-semibold text-center mb-8" style={{ color: "#e0e0e8" }}>对比</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <CompareCol
              title="无扫描"
              titleColor="#6b6b82"
              items={[
                { text: "无安全审查", type: "bad" },
                { text: "恶意 Skill 自由安装", type: "bad" },
                { text: "出事后才发现", type: "bad" },
              ]}
            />
            <CompareCol
              title="标签扫描"
              titleColor="#ff9800"
              items={[
                { text: "安装时扫描", type: "ok" },
                { text: "高危仅显示警告", type: "ok" },
                { text: "无 IOC 威胁情报", type: "bad" },
              ]}
            />
            <CompareCol
              title="ClawSafe"
              titleColor="#394EFF"
              highlight
              items={[
                { text: "23 条规则 + IOC 深度扫描", type: "good" },
                { text: "A-F 评分 + 修复建议", type: "good" },
                { text: "4 大攻击活动 IOC 实时更新", type: "good" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* CLI Preview */}
      <section className="px-6 pb-16">
        <div className="max-w-[680px] mx-auto">
          <h2 className="text-[18px] font-semibold text-center mb-8" style={{ color: "#e0e0e8" }}>命令行</h2>
          <div className="rounded-xl overflow-hidden" style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <pre className="p-5 text-[12px] font-mono leading-relaxed overflow-x-auto" style={{ color: "#8b949e" }}>
{`$ cargo install clawsafety
$ clawsafety scan ./my-skill/

  `}<span style={{ color: "#e0e0e8" }}>ClawSafe v0.1.0</span>{`
  Findings: 3

  `}<span style={{ color: "#f44336" }}>CRITICAL</span>{`  CS-IOC-001  已知 C2 IP: `}<span style={{ color: "#f44336" }}>91.92.242.30</span>{`
  `}<span style={{ color: "#ff9800" }}>HIGH</span>{`      CS-INJ-001  Shell 命令注入
  `}<span style={{ color: "#e5c07b" }}>MEDIUM</span>{`    CS-DEP-002  依赖版本未锁定

  Score: `}<span style={{ color: "#f44336" }}>22/100 (F)</span>
            </pre>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 pb-16">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-[18px] font-semibold text-center mb-8" style={{ color: "#e0e0e8" }}>能力</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { t: "注入检测", d: "Shell / SQL / RCE / 反弹 Shell" },
              { t: "密钥扫描", d: "API Key / 密码 / 私钥 / Token" },
              { t: "供应链审计", d: "依赖漏洞 / 版本锁定 / 不安全安装" },
              { t: "权限分析", d: "敏感路径 / 环境变量 / 文件权限" },
              { t: "IOC 匹配", d: "C2 IP / 恶意域名 / 恶意发布者" },
              { t: "Prompt 注入", d: "SKILL.md / MCP description 注入" },
            ].map((f) => (
              <div key={f.t} className="rounded-xl p-4" style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="text-[14px] font-medium mb-1" style={{ color: "#e0e0e8" }}>{f.t}</div>
                <div className="text-[12px]" style={{ color: "#5a5a72" }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research / Blog */}
      <section className="px-6 pb-16">
        <div className="max-w-[900px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-semibold" style={{ color: "#e0e0e8" }}>安全研究</h2>
            <Link href="/blog" className="text-[12px] hover:underline" style={{ color: "#394EFF" }}>查看全部</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { slug: "sandworm-mcp-worm", t: "SANDWORM_MODE：npm 仿冒包传播的 MCP 蠕虫", tag: "供应链", c: "#f44336" },
              { slug: "clawhavoc-amos", t: "677 个恶意 Skill：AMOS 窃密木马分发链", tag: "恶意软件", c: "#ff9800" },
              { slug: "mcp-tool-poisoning", t: "MCP Tool Poisoning：SSH Key 窃取实战", tag: "MCP", c: "#9c27b0" },
              { slug: "clawhavoc-bob-p2p", t: "假 Polymarket Skill 窃取 Solana 钱包", tag: "威胁", c: "#f44336" },
            ].map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group rounded-lg p-4 transition-colors" style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: `${p.c}18`, color: p.c }}>{p.tag}</span>
                </div>
                <div className="text-[13px] font-medium group-hover:underline" style={{ color: "#c0c0d0" }}>{p.t}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-[900px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-white" style={{ background: "#394EFF" }}>CS</div>
            <span className="text-[12px]" style={{ color: "#5a5a72" }}>&copy; 2026 YiSec</span>
          </div>
          <div className="flex gap-5 text-[12px]" style={{ color: "#5a5a72" }}>
            <Link href="/blog" className="hover:text-white transition">Research</Link>
            <Link href="/ioc" className="hover:text-white transition">IOC</Link>
            <a href="https://github.com/relaxcloud-cn/clawsafety" target="_blank" className="hover:text-white transition">GitHub</a>
            <a href="https://yisec.ai" target="_blank" className="hover:text-white transition">YiSec</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CompareCol({ title, titleColor, items, highlight }: {
  title: string;
  titleColor: string;
  items: { text: string; type: "good" | "ok" | "bad" }[];
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: highlight ? "rgba(57,78,255,0.06)" : "#1a1a2e",
        border: highlight ? "1px solid rgba(57,78,255,0.2)" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="text-[14px] font-semibold mb-4" style={{ color: titleColor }}>{title}</div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 text-[12px]">
            <span style={{ color: item.type === "good" ? "#4caf50" : item.type === "ok" ? "#ff9800" : "#f44336" }}>
              {item.type === "good" ? "✓" : item.type === "ok" ? "~" : "✗"}
            </span>
            <span style={{ color: "#9a9ab0" }}>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
