import Link from "next/link";

const posts = [
  {
    slug: "sandworm-mcp-worm",
    title: "SANDWORM_MODE: The MCP Worm That Spreads Through npm Typosquats",
    date: "2026-03-23",
    description: "19 typosquatted npm packages targeting Claude Code, Cursor, and Windsurf. Injects malicious MCP configs, steals credentials, and self-propagates through Git repos.",
    tag: "Supply Chain",
    tagColor: "text-red-400 bg-red-400/10",
  },
  {
    slug: "clawhavoc-bob-p2p",
    title: "A Fake Polymarket Skill Stole Solana Wallets: Inside the bob-p2p Attack",
    date: "2026-03-22",
    description: "How a ClawHub skill posing as a decentralized API marketplace tricked AI agents into storing private keys in plaintext and purchasing scam tokens.",
    tag: "Threat Analysis",
    tagColor: "text-red-400 bg-red-400/10",
  },
  {
    slug: "clawhavoc-amos",
    title: "One Actor, 677 Malicious Skills: The AMOS Stealer ClawHub Campaign",
    date: "2026-03-22",
    description: "Deep dive into how a single threat actor weaponized ClawHub to distribute Atomic macOS Stealer to 7,000+ victims in 3 days.",
    tag: "Malware Analysis",
    tagColor: "text-orange-400 bg-orange-400/10",
  },
  {
    slug: "mcp-tool-poisoning",
    title: "Your MCP Server Is Reading Your SSH Keys: Tool Poisoning in Practice",
    date: "2026-03-22",
    description: "Reproducing Invariant Labs' proof-of-concept: how a malicious MCP tool description silently exfiltrates credentials from Claude Desktop and Cursor.",
    tag: "MCP Security",
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
            <Link href="/scan" className="hover:text-white transition">Scan</Link>
            <Link href="/blog" className="text-white">Blog</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Security Research</h1>
        <p className="text-gray-400 mb-12">Deep dives into real-world Agent Skill attacks and defenses.</p>

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
