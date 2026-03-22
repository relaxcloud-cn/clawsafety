import Link from "next/link";
import iocData from "../../../public/ioc-feed.json";

export default function IOCFeed() {
  return (
    <main className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-gray-300 transition">ClawSafety</Link>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <Link href="/blog" className="hover:text-white transition">Blog</Link>
            <Link href="/scan" className="hover:text-white transition">Scan</Link>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">IOC Feed</h1>
          <a
            href="/ioc-feed.json"
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-mono hover:bg-white/10 transition"
          >
            JSON Feed
          </a>
        </div>
        <p className="text-gray-400 mb-2">
          Indicators of Compromise from Agent Skill supply chain attacks. Updated: {iocData.updated}
        </p>
        <p className="text-xs text-gray-500 mb-12">License: CC BY 4.0 &mdash; free to use with attribution.</p>

        {/* Campaigns */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Active Campaigns</h2>
          <div className="space-y-4">
            {iocData.campaigns.map((c) => (
              <div key={c.name} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${c.status === "active" ? "text-red-400 bg-red-400/10" : "text-yellow-400 bg-yellow-400/10"}`}>
                    {c.status}
                  </span>
                  <span className="font-bold">{c.name}</span>
                  <span className="text-xs text-gray-500">First seen: {c.first_seen}</span>
                </div>
                <p className="text-sm text-gray-400">{c.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* C2 IPs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">C2 IP Addresses ({iocData.c2_ips.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10">
                <th className="text-left py-2 text-gray-400">IP</th>
                <th className="text-left py-2 text-gray-400">Campaign</th>
                <th className="text-left py-2 text-gray-400">First Seen</th>
                <th className="text-left py-2 text-gray-400">Description</th>
              </tr></thead>
              <tbody className="font-mono text-xs">
                {iocData.c2_ips.map((ioc) => (
                  <tr key={ioc.ip} className="border-b border-white/10">
                    <td className="py-2 text-red-400">{ioc.ip}</td>
                    <td className="py-2">{ioc.campaign}</td>
                    <td className="py-2 text-gray-500">{ioc.first_seen}</td>
                    <td className="py-2 text-gray-400">{ioc.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Malicious Domains */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Malicious Domains ({iocData.malicious_domains.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10">
                <th className="text-left py-2 text-gray-400">Domain</th>
                <th className="text-left py-2 text-gray-400">Context</th>
              </tr></thead>
              <tbody className="font-mono text-xs">
                {iocData.malicious_domains.map((d) => (
                  <tr key={d.domain} className="border-b border-white/10">
                    <td className="py-2 text-yellow-400">{d.domain}</td>
                    <td className="py-2 text-gray-400">{d.context}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* File Hashes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">File Hashes ({iocData.file_hashes.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10">
                <th className="text-left py-2 text-gray-400">SHA-256</th>
                <th className="text-left py-2 text-gray-400">File</th>
                <th className="text-left py-2 text-gray-400">Campaign</th>
              </tr></thead>
              <tbody className="font-mono text-xs">
                {iocData.file_hashes.map((f) => (
                  <tr key={f.sha256} className="border-b border-white/10">
                    <td className="py-2 text-cyan-400 break-all max-w-xs">{f.sha256.substring(0, 16)}...</td>
                    <td className="py-2">{f.filename}</td>
                    <td className="py-2 text-gray-400">{f.campaign}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Malicious Publishers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Malicious Publishers ({iocData.malicious_publishers.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10">
                <th className="text-left py-2 text-gray-400">Publisher</th>
                <th className="text-left py-2 text-gray-400">Campaign</th>
                <th className="text-left py-2 text-gray-400">Skills</th>
                <th className="text-left py-2 text-gray-400">Description</th>
              </tr></thead>
              <tbody className="font-mono text-xs">
                {iocData.malicious_publishers.map((p) => (
                  <tr key={p.id} className="border-b border-white/10">
                    <td className="py-2 text-orange-400">{p.id}</td>
                    <td className="py-2">{p.campaign}</td>
                    <td className="py-2">{p.skills ?? "-"}</td>
                    <td className="py-2 text-gray-400">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Malicious Packages */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Malicious Packages ({iocData.malicious_packages.length})</h2>
          <div className="flex flex-wrap gap-2">
            {iocData.malicious_packages.map((p) => (
              <span key={p.name} className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 font-mono text-xs">
                {p.name}
              </span>
            ))}
          </div>
        </section>

        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] text-center">
          <p className="font-semibold mb-2">Integrate IOC data into your pipeline</p>
          <p className="text-sm text-gray-400 mb-4">
            Machine-readable JSON feed available at <code className="text-cyan-400">/ioc-feed.json</code>
          </p>
          <code className="text-xs text-gray-500 font-mono">
            curl https://clawsafety.yisec.ai/ioc-feed.json
          </code>
        </div>
      </div>
    </main>
  );
}
