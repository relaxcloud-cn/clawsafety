import { resolveSkillFromQuery, type SkillRecord } from "@/lib/registry";

export type MockScanReport = {
  query: string;
  mode: "url" | "skill" | "search";
  score: number;
  grade: SkillRecord["grade"];
  verification: SkillRecord["verification"];
  statusLine: string;
  skill: SkillRecord;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
};

function countBySeverity(skill: SkillRecord) {
  return skill.findings.reduce(
    (acc, finding) => {
      acc[finding.severity] += 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  );
}

export function buildMockScanReport(
  query: string,
  mode: MockScanReport["mode"],
): MockScanReport {
  const skill = resolveSkillFromQuery(query);
  const summary = countBySeverity(skill);

  const statusLine =
    skill.verification === "verified"
      ? "Publisher and consumer tree hashes match. Safe to install under current policy."
      : skill.verification === "divergent"
        ? "Publisher scan passed, but at least one consumer replay drifted from the shared payload."
        : "Critical mismatch or malicious pattern detected. Installation must stay blocked.";

  return {
    query,
    mode,
    score: skill.score,
    grade: skill.grade,
    verification: skill.verification,
    statusLine,
    skill,
    summary,
  };
}
