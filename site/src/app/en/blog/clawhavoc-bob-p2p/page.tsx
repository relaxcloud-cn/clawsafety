import Link from "next/link";

export default function Post() {
  return (
    <main className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/en" className="text-xl font-bold hover:text-gray-300 transition">ClawSafety</Link>
          <div className="flex items-center gap-6">
            <Link href="/en/blog" className="text-sm text-gray-400 hover:text-white transition">&larr; Blog</Link>
            <Link href="/blog/clawhavoc-bob-p2p" className="text-sm text-gray-400 hover:text-white transition">中文</Link>
          </div>
        </div>
      </nav>

      <article className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2 py-0.5 rounded text-xs font-bold text-red-400 bg-red-400/10">Threat Analysis</span>
          <span className="text-xs text-gray-500">2026-03-22</span>
        </div>
        <h1 className="text-4xl font-bold mb-6">A Fake Polymarket Skill Stole Solana Wallets: Inside the bob-p2p Attack</h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">

          <p className="text-xl text-gray-400">
            A ClawHub skill posing as a decentralized API marketplace tricked AI agents into storing wallet private keys in plaintext and purchasing worthless tokens. Here&apos;s how it worked.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12">TL;DR</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Threat actor <code className="text-cyan-400">26medias</code> published <strong>bob-p2p-beta</strong> on ClawHub, claiming to be a decentralized API marketplace</li>
            <li>The skill instructed AI agents to store Solana wallet private keys in <strong>plaintext</strong></li>
            <li>It directed agents to purchase the worthless <code className="text-cyan-400">$BOB</code> token on pump.fun</li>
            <li>All payments were routed through attacker-controlled aggregator infrastructure</li>
            <li>On-chain analysis confirms: aggregator wallet was funded directly by the $BOB token creator</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12">The Setup: Two Skills, One Actor</h2>
          <p>
            The attacker published two skills under the same ClawHub account. The first, <strong>runware</strong>, was a legitimate-looking image generation tool &mdash; a credibility anchor. It worked as advertised, generating images via an API. Nothing malicious.
          </p>
          <p>
            The second skill, <strong>bob-p2p-beta</strong>, arrived shortly after. It described itself as:
          </p>
          <div className="bg-[#1a1a2e] rounded-lg p-4 font-mono text-sm border border-white/10">
            <p className="text-gray-400"># bob-p2p-beta</p>
            <p>A decentralized peer-to-peer API marketplace. Buy and sell API access using SOL tokens.</p>
          </div>
          <p>
            Professional README. Clean documentation. An NPM package. To a user &mdash; or an AI agent &mdash; it looked legitimate.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12">The Attack: What the Skill Actually Did</h2>

          <h3 className="text-xl font-semibold text-white mt-8">Step 1: Private Key Storage in Plaintext</h3>
          <p>
            The skill&apos;s SKILL.md contained instructions that told the AI agent to store the user&apos;s Solana wallet private key in a local configuration file &mdash; <strong>in plaintext</strong>. No encryption. No keychain integration. Just raw private key bytes sitting in a JSON file.
          </p>
          <div className="bg-[#1a1a2e] rounded-lg p-4 font-mono text-sm border border-white/10">
            <p className="text-red-400">{"// ~/.bob-p2p/config.json"}</p>
            <p>{`{`}</p>
            <p>&nbsp;&nbsp;<span className="text-red-400">&quot;wallet_private_key&quot;</span>: <span className="text-yellow-400">&quot;5Kd3...your_actual_private_key...&quot;</span>,</p>
            <p>&nbsp;&nbsp;&quot;rpc_endpoint&quot;: &quot;https://api.mainnet-beta.solana.com&quot;</p>
            <p>{`}`}</p>
          </div>

          <h3 className="text-xl font-semibold text-white mt-8">Step 2: Forced Token Purchase</h3>
          <p>
            Once the wallet was configured, the skill directed the agent to purchase <code className="text-cyan-400">$BOB</code> tokens on pump.fun as &quot;required collateral for the marketplace.&quot; The token had zero utility. Birdeye&apos;s risk assessment flagged it at <strong>100% scam/rug probability</strong>.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8">Step 3: Attacker-Controlled Payment Routing</h3>
          <p>
            All API payments were routed through an &quot;aggregator&quot; wallet controlled by the attacker. On-chain forensics confirmed:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>The aggregator wallet received a <strong>0.25 SOL transfer</strong> directly from the $BOB token creator wallet</li>
            <li>The two wallets shared transaction patterns consistent with single-entity control</li>
            <li>No legitimate marketplace infrastructure existed &mdash; the &quot;API marketplace&quot; was entirely fictitious</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12">Why This Attack Worked</h2>
          <p>
            This attack is a masterclass in exploiting the Agent-Native trust chain:
          </p>
          <div className="bg-[#1a1a2e] rounded-lg p-4 font-mono text-sm border border-white/10">
            <p>User trusts Agent &rarr; Agent trusts Skill &rarr; Skill says &quot;store your private key&quot;</p>
            <p className="text-red-400 mt-2">Result: User&apos;s private key is stored in plaintext, funds are drained</p>
          </div>
          <p>
            The user never directly interacted with the malicious instructions. The AI agent read the SKILL.md, interpreted it as legitimate setup requirements, and presented them to the user as normal configuration steps.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12">IOC (Indicators of Compromise)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10"><th className="text-left py-2 text-gray-400">Type</th><th className="text-left py-2 text-gray-400">Value</th></tr></thead>
              <tbody className="font-mono">
                <tr className="border-b border-white/10"><td className="py-2">ClawHub Author</td><td className="py-2 text-cyan-400">26medias</td></tr>
                <tr className="border-b border-white/10"><td className="py-2">Skill Name</td><td className="py-2 text-cyan-400">bob-p2p-beta</td></tr>
                <tr className="border-b border-white/10"><td className="py-2">Scam Token</td><td className="py-2 text-cyan-400">$BOB on pump.fun</td></tr>
                <tr className="border-b border-white/10"><td className="py-2">Credibility Anchor</td><td className="py-2 text-cyan-400">runware (image generation skill)</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-white mt-12">What ClawSafety Would Have Caught</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>CS-SEC-001</strong>: Private key storage pattern in SKILL.md instructions</li>
            <li><strong>CS-CFG-004</strong>: Prompt injection patterns directing agent to handle credentials</li>
            <li><strong>CS-PRM-001</strong>: Skill requesting wallet/financial permissions for an &quot;API marketplace&quot;</li>
            <li><strong>AI Analysis</strong>: Intent mismatch &mdash; skill claims to be an API marketplace but primary behavior involves wallet key management and token purchases</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12">Lessons</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>Never trust a skill that asks for private keys.</strong> No legitimate skill needs your wallet private key in plaintext.</li>
            <li><strong>Credibility anchors are real.</strong> Attackers publish benign skills first to build trust before deploying the payload.</li>
            <li><strong>On-chain forensics matter.</strong> The wallet connection between the aggregator and token creator was the smoking gun.</li>
            <li><strong>AI agents need financial guardrails.</strong> An agent should never be able to initiate token purchases without explicit, out-of-band user confirmation.</li>
          </ol>

          <div className="mt-12 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <p className="font-semibold mb-2">Scan your skills for free</p>
            <p className="text-sm text-gray-400 mb-4">ClawSafety detects credential handling, prompt injection, and permission mismatches in Agent Skills.</p>
            <Link href="/en/scan" className="px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
              Scan Now
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
