"use client";

import { useState } from "react";
import Link from "next/link";

interface Finding {
  rule_id: string;
  severity: string;
  message: string;
  file: string;
  line: number;
  fix_suggestion: string;
}

interface ScanResult {
  score: number;
  grade: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total_findings: number;
  findings: Finding[];
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-400 bg-red-400/10",
  HIGH: "text-orange-400 bg-orange-400/10",
  MEDIUM: "text-yellow-400 bg-yellow-400/10",
  LOW: "text-gray-400 bg-gray-400/10",
};

const GRADE_COLORS: Record<string, string> = {
  A: "from-green-400 to-green-600",
  B: "from-cyan-400 to-cyan-600",
  C: "from-yellow-400 to-yellow-600",
  D: "from-orange-400 to-orange-600",
  F: "from-red-400 to-red-600",
};

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  const handleScan = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const resp = await fetch(`${apiUrl}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: url.trim() }),
      });

      if (!resp.ok) {
        throw new Error(`Server error: ${resp.status}`);
      }

      const data: ScanResult = await resp.json();
      if (data.score === -1) {
        setError("Failed to clone repository. Please check the URL and try again.");
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-gray-300 transition">
            ClawSafety
          </Link>
          <a
            href="https://github.com/relaxcloud-cn/clawsafety"
            target="_blank"
            className="text-sm text-gray-400 hover:text-white transition"
          >
            GitHub
          </a>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Scan a Skill</h1>
        <p className="text-gray-400 text-center mb-10">
          Paste a GitHub repository URL to scan for security issues
        </p>

        {/* Input */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            placeholder="https://github.com/owner/skill-repo"
            className="flex-1 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 font-mono text-sm"
          />
          <button
            onClick={handleScan}
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Scanning..." : "Scan"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Cloning and scanning repository...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="p-8 rounded-xl border border-white/10 bg-white/[0.02] text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${GRADE_COLORS[result.grade] || GRADE_COLORS.F} text-white text-5xl font-bold mb-4`}>
                {result.grade}
              </div>
              <div className="text-2xl font-bold mb-2">{result.score}/100</div>
              <div className="flex justify-center gap-6 text-sm">
                <span className="text-red-400">Critical: {result.critical}</span>
                <span className="text-orange-400">High: {result.high}</span>
                <span className="text-yellow-400">Medium: {result.medium}</span>
                <span className="text-gray-400">Low: {result.low}</span>
              </div>
            </div>

            {/* Findings */}
            {result.findings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  Findings ({result.total_findings})
                </h2>
                <div className="space-y-3">
                  {result.findings.map((f, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-white/10 bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${SEVERITY_COLORS[f.severity] || ""}`}>
                          {f.severity}
                        </span>
                        <span className="font-mono text-sm text-gray-400">{f.rule_id}</span>
                      </div>
                      <p className="text-sm mb-1">{f.message}</p>
                      {f.file && (
                        <p className="text-xs text-gray-500 font-mono">
                          {f.file}{f.line > 0 ? `:${f.line}` : ""}
                        </p>
                      )}
                      <p className="text-xs text-cyan-400/70 mt-2">
                        Fix: {f.fix_suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.findings.length === 0 && (
              <div className="p-8 rounded-xl border border-green-500/20 bg-green-500/5 text-center">
                <div className="text-4xl mb-3">&#10003;</div>
                <p className="text-green-400 font-semibold">No security issues found!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
