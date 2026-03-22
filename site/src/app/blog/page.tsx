import Link from "next/link";

const posts = [
  {
    slug: "sandworm-mcp-worm",
    title: "SANDWORM_MODE：通过 npm 仿冒包传播的 MCP 蠕虫",
    date: "2026-03-23",
    description: "19 个仿冒 npm 包瞄准 Claude Code、Cursor 和 Windsurf 用户，注入恶意 MCP 配置，窃取凭证，并通过 Git 仓库自我传播。",
    tag: "供应链攻击",
    tagColor: "text-red-400 bg-red-400/10",
  },
  {
    slug: "clawhavoc-bob-p2p",
    title: "一个假 Polymarket Skill 如何偷走你的 Solana 钱包",
    date: "2026-03-22",
    description: "ClawHub 上伪装成去中心化 API 市场的 Skill，诱导 AI Agent 以明文存储私钥并购买空气币。",
    tag: "威胁分析",
    tagColor: "text-red-400 bg-red-400/10",
  },
  {
    slug: "clawhavoc-amos",
    title: "一人之力，677 个恶意 Skill：AMOS 窃密木马的 ClawHub 分发链",
    date: "2026-03-22",
    description: "单一攻击者如何在 3 天内通过 ClawHub 向 7,000+ 受害者分发 Atomic macOS Stealer。",
    tag: "恶意软件分析",
    tagColor: "text-orange-400 bg-orange-400/10",
  },
  {
    slug: "mcp-tool-poisoning",
    title: "你的 MCP Server 正在读取你的 SSH Key：Tool Poisoning 实战",
    date: "2026-03-22",
    description: "复现 Invariant Labs 的 PoC：恶意 MCP 工具如何通过 description 注入，从 Claude Desktop 和 Cursor 中窃取凭证。",
    tag: "MCP 安全",
    tagColor: "text-purple-400 bg-purple-400/10",
  },
];

export default function BlogIndex() {
  return (
    <main className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-gray-300 transition">ClawSafety</Link>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/scan" className="hover:text-white transition">扫描</Link>
            <Link href="/blog" className="text-white">博客</Link>
            <Link href="/en/blog" className="hover:text-white transition">EN</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">安全研究</h1>
        <p className="text-gray-400 mb-12">深入分析真实 Agent Skill 攻击事件与防御方案。</p>

        <div className="space-y-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${post.tagColor}`}>{post.tag}</span>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>
                <h2 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition">{post.title}</h2>
                <p className="text-sm text-gray-400">{post.description}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
