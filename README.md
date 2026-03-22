# ClawSafety

**Security scanner for Agent Skills. Protect the Agent-Native ecosystem.**

ClawSafety scans OpenClaw Skills (and other Agent Skill formats) for security vulnerabilities, hardcoded secrets, command injection, supply chain risks, and more.

## Why ClawSafety?

The [ClawHavoc incident](https://www.digitalapplied.com/blog/ai-agent-plugin-security-lessons-clawhavoc-2026) (Jan 2026) proved that Agent Skills are the new attack surface. 341 malicious skills compromised 9,000+ installations. A Snyk audit found 47% of ClawHub skills had at least one security issue.

**ClawSafety is the `npm audit` for Agent Skills.**

## Quick Start

```bash
# Install
cargo install clawsafety

# Scan a skill
clawsafety scan ./my-skill/

# Scan all skills in a directory
clawsafety scan-all ./skills/

# Output as JSON
clawsafety scan ./my-skill/ --format json
```

## What It Scans

| Category | Rules | Examples |
|----------|-------|---------|
| **Injection** (INJ) | 4 | Shell injection, SQL injection, reverse shells |
| **Secrets** (SEC) | 4 | Hardcoded passwords, API keys, private keys |
| **Dependencies** (DEP) | 4 | Unpinned versions, known CVEs, curl-pipe-bash |
| **Permissions** (PRM) | 4 | Excessive access, sensitive paths, env abuse |
| **Config** (CFG) | 4 | Missing SKILL.md, prompt injection risks |

## Security Score

Each skill gets a score from 0-100 and a grade:

| Grade | Score | Meaning |
|-------|-------|---------|
| **A** | 90-100 | Excellent - no high-risk issues |
| **B** | 75-89 | Good - minor issues |
| **C** | 60-74 | Fair - needs attention |
| **D** | 40-59 | Poor - high-risk issues found |
| **F** | 0-39 | Dangerous - critical security risks |

## GitHub Integration

Connect your repository for automated scanning on every push and PR.

1. Install the [ClawSafety GitHub App](https://github.com/apps/clawsafety)
2. Select your skill repositories
3. Get scan results as PR comments and GitHub Check Runs

## Roadmap

- [x] v0.1 - CLI scanner with 20 rules
- [ ] v0.2 - GitHub App integration + Web Dashboard
- [ ] v0.3 - Auto-fix PRs + Public URL scanning
- [ ] v1.0 - Enterprise: team management, runtime monitoring, SBOM

## Built by

[YiSec](https://yisec.ai) - AI-native security company, pioneering Agent-Native Architecture.

## License

Apache-2.0
