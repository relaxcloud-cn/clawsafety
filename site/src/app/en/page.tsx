import Link from "next/link";

const RULES = [
  { id: "INJ", name: "Injection", count: 4, desc: "Shell injection, SQL injection, dangerous functions, reverse shells", color: "text-red-400" },
  { id: "SEC", name: "Secrets", count: 4, desc: "Hardcoded passwords, API keys, private keys, URL credentials", color: "text-orange-400" },
  { id: "DEP", name: "Dependencies", count: 4, desc: "Unsafe installs, unpinned versions, known CVEs, untrusted downloads", color: "text-yellow-400" },
  { id: "PRM", name: "Permissions", count: 4, desc: "Excessive permissions, sensitive paths, env abuse, insecure chmod", color: "text-blue-400" },
  { id: "CFG", name: "Config", count: 4, desc: "Missing SKILL.md, no version, no permissions, prompt injection", color: "text-purple-400" },
];

const GRADES = [
  { grade: "A", range: "90-100", color: "bg-green-500", meaning: "Excellent" },
  { grade: "B", range: "75-89", color: "bg-cyan-500", meaning: "Good" },
  { grade: "C", range: "60-74", color: "bg-yellow-500", meaning: "Fair" },
  { grade: "D", range: "40-59", color: "bg-orange-500", meaning: "Poor" },
  { grade: "F", range: "0-39", color: "bg-red-500", meaning: "Dangerous" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">ClawSafety</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#rules" className="hover:text-white transition">Rules</a>
            <Link href="/en/blog" className="hover:text-white transition">Blog</Link>
            <Link href="/en/ioc" className="hover:text-white transition">IOC Feed</Link>
            <Link href="/" className="hover:text-white transition">中文</Link>
            <Link href="/en/scan" className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition">
              Scan Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium">
            ClawHavoc: 341 malicious skills compromised 9,000+ installations
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Security Scanner for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Agent Skills
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Scan OpenClaw Skills for vulnerabilities, hardcoded secrets, supply chain risks, and more.
            20 rules. A-F grading. One command.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/en/scan"
              className="px-8 py-3 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-200 transition"
            >
              Scan a Skill
            </Link>
            <a
              href="https://github.com/relaxcloud-cn/clawsafety"
              target="_blank"
              className="px-8 py-3 border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/5 transition"
            >
              GitHub
            </a>
          </div>

          {/* CLI preview */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-[#1a1a2e] rounded-xl border border-white/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-sm text-gray-500 font-mono">terminal</span>
              </div>
              <pre className="p-6 text-sm font-mono text-left overflow-x-auto">
                <code>
{`$ clawsafety scan ./my-skill/

  ClawSafety v0.1.0

  Scanning: ./my-skill/
  Findings: 3

  `}<span className="text-red-400">CRITICAL</span>{`  CS-SEC-002  Hardcoded API Key detected
            scripts/config.py:12
            > api_key = "sk-proj-abc123..."

  `}<span className="text-yellow-400">HIGH</span>{`      CS-INJ-001  Shell command injection
            scripts/run.sh:45
            > eval $USER_INPUT

  `}<span className="text-yellow-300">MEDIUM</span>{`    CS-DEP-002  Unpinned dependency
            skill.yaml:8
            > requests>=2.0

  Score: `}<span className="text-orange-400">52/100 (D)</span>{`
  Critical: 1 | High: 1 | Medium: 1`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              step="1"
              title="Paste a URL"
              desc="Enter any GitHub skill repository URL. No login required."
            />
            <FeatureCard
              step="2"
              title="Automatic scan"
              desc="20 rules check for injection, secrets, dependencies, permissions, and config issues."
            />
            <FeatureCard
              step="3"
              title="Get your grade"
              desc="A-F security score with detailed findings and fix suggestions."
            />
          </div>
        </div>
      </section>

      {/* Rules */}
      <section id="rules" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">20 Security Rules</h2>
          <p className="text-center text-gray-400 mb-12">5 categories covering the full Agent Skill attack surface</p>
          <div className="space-y-4">
            {RULES.map((r) => (
              <div key={r.id} className="p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold ${r.color}`}>{r.id}</span>
                    <span className="font-semibold">{r.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{r.count} rules</span>
                </div>
                <p className="text-sm text-gray-400">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grading */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Security Grading</h2>
          <div className="flex justify-center gap-4">
            {GRADES.map((g) => (
              <div key={g.grade} className="text-center">
                <div className={`w-14 h-14 ${g.color} rounded-xl flex items-center justify-center text-2xl font-bold text-white mb-2`}>
                  {g.grade}
                </div>
                <div className="text-xs text-gray-400">{g.range}</div>
                <div className="text-xs text-gray-500">{g.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Secure your skills today</h2>
          <p className="text-gray-400 mb-8">Free for public repositories. No login required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/en/scan"
              className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Scan Now
            </Link>
            <div className="px-6 py-3 rounded-lg border border-white/10 font-mono text-sm bg-white/5">
              cargo install clawsafety
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-sm text-gray-500">
        <p>
          Built by{" "}
          <a href="https://yisec.ai" className="text-gray-400 hover:text-white transition" target="_blank">
            YiSec
          </a>{" "}
          &mdash; AI-native security, Agent-Native architecture.
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg mb-4">
        {step}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}
