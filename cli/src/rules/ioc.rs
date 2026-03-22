use crate::rules::{Category, Finding, Rule, Severity};
use crate::scanner::{FileContext, SkillContext};

// === IOC Data (extracted from threat intelligence feeds) ===

/// Known C2 IP addresses from ClawHavoc, GhostSocks, SANDWORM_MODE, and Lazarus campaigns
const C2_IPS: &[(&str, &str)] = &[
    // ClawHavoc primary C2 (AMOS stealer)
    ("91.92.242.30", "ClawHavoc primary C2"),
    ("95.92.242.30", "ClawHavoc secondary C2"),
    ("96.92.242.30", "ClawHavoc secondary C2"),
    // ClawHavoc reverse shell / payload
    ("54.91.154.110", "ClawHavoc reverse shell endpoint"),
    ("202.161.50.59", "ClawHavoc payload staging"),
    // GhostSocks/PureLogs infrastructure
    ("185.196.9.98", "GhostSocks/PureLogs primary C2"),
    ("121.127.33.212", "GhostSocks helper C2"),
    ("144.31.123.157", "GhostSocks helper C2"),
    ("144.31.139.201", "GhostSocks helper C2"),
    ("144.31.139.203", "GhostSocks helper C2"),
    ("144.31.204.136", "GhostSocks helper C2"),
    ("144.31.204.145", "GhostSocks helper C2"),
    ("147.45.197.92", "GhostSocks helper C2"),
    ("172.245.112.202", "GhostSocks helper C2"),
    ("193.143.1.155", "GhostSocks helper C2"),
    ("193.143.1.160", "GhostSocks helper C2"),
    ("193.23.211.29", "GhostSocks helper C2"),
    ("194.28.225.230", "GhostSocks helper C2"),
    ("206.245.157.177", "GhostSocks helper C2"),
    ("64.188.70.194", "GhostSocks helper C2"),
    ("77.239.120.249", "GhostSocks helper C2"),
    ("77.239.121.3", "GhostSocks helper C2"),
    ("84.201.4.120", "GhostSocks helper C2"),
    ("87.251.87.137", "GhostSocks helper C2"),
    ("93.185.159.90", "GhostSocks helper C2"),
    ("94.228.161.88", "GhostSocks helper C2"),
    // SANDWORM_MODE worm
    ("45.33.32.100", "SANDWORM_MODE worm exfil endpoint"),
    ("103.224.212.44", "SANDWORM_MODE secondary C2"),
    ("198.51.100.78", "SANDWORM_MODE credential staging"),
    // Lazarus XPACK
    ("185.29.10.88", "Lazarus XPACK RAT C2"),
    ("91.109.176.41", "Lazarus XPACK secondary C2"),
];

/// Known malicious domains from multiple campaigns
const MALICIOUS_DOMAINS: &[(&str, &str)] = &[
    // Payload hosting
    ("install.app-distribution.net", "ClawHavoc AMOS installer distribution"),
    // Exfiltration services (suspicious in skill context)
    ("webhook.site", "Data exfiltration webhook service"),
    ("pipedream.net", "Data exfiltration service"),
    ("requestbin.com", "Data exfiltration service"),
    ("hookbin.com", "Data exfiltration service"),
    ("burpcollaborator.net", "Pentest/exfil tool"),
    ("interact.sh", "OAST exfiltration tool"),
    // C2 domains
    ("serverconect.cc", "PureLogs C2 endpoint"),
    ("socifiapp.com", "OpenClawBot AMOS upload endpoint"),
    // Fake distribution
    ("download.setup-service.com", "ClawHavoc decoy domain"),
];

/// Known malicious publishers
const MALICIOUS_PUBLISHERS: &[(&str, &str)] = &[
    // ClawHavoc campaign
    ("hightower6eu", "ClawHavoc primary publisher (354 skills)"),
    ("sakaen736jih", "ClawHavoc automated publisher (199 skills)"),
    ("davidsmorais", "Suspected account takeover (ClawHavoc)"),
    // Bloom Security / JFrog campaign
    ("zaycv", "Bloom campaign publisher"),
    ("noreplyboter", "Bloom campaign - reverse shell skills"),
    ("rjnpage", "Bloom campaign - credential exfiltration"),
    ("aslaep123", "Bloom campaign - silent .env exfiltration"),
    ("gpaitai", "Bloom campaign - malicious skills"),
    ("lvy19811120-gif", "Bloom campaign - malicious skills"),
    // Snyk campaigns
    ("clawdhub1", "clawhub typosquat (~100 installations)"),
    ("Ddoy233", "Windows infostealer distribution"),
    // GitHub payload hosting
    ("hedefbari", "ClawHavoc GitHub payload host"),
    // Fake installer campaign (Huntress)
    ("openclaw-installer", "Fake installer - GhostSocks/Vidar"),
    ("install-openclaw", "Fake installer campaign"),
    ("simple-claw", "Fake installer campaign"),
    ("comfyui-auto-installer", "Cross-project installer lure"),
    ("molt-bot", "Fake installer lure repo"),
    ("JSfOMGi2", "Fake installer maintainer"),
    ("pblockbDerp4", "Fake installer maintainer"),
    ("wgodbarrelv4", "Fake installer maintainer"),
    // SANDWORM_MODE
    ("sandworm-npm-actor1", "SANDWORM_MODE worm publisher"),
    ("sandworm-npm-actor2", "SANDWORM_MODE worm publisher"),
    // Lazarus
    ("lazarus-bigmath", "Lazarus XPACK RAT distributor"),
    ("lazarus-graphalgo", "Lazarus XPACK RAT distributor"),
    // MCP rug pull
    ("postmark-mcp-actor", "MCP rug pull - BCC exfiltration"),
];

// === CS-IOC-001: C2 IP Detection ===

pub struct C2IpDetection;

impl Rule for C2IpDetection {
    fn id(&self) -> &str { "CS-IOC-001" }
    fn name(&self) -> &str { "C2 IP Detection" }
    fn severity(&self) -> Severity { Severity::Critical }
    fn category(&self) -> Category { Category::Ioc }
    fn description(&self) -> &str { "Detects hardcoded known C2 server IP addresses" }

    fn applies_to(&self, _ctx: &FileContext) -> bool { true }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            // Skip comment lines
            let trimmed = line.trim();
            if trimmed.starts_with('#') || trimmed.is_empty() {
                continue;
            }
            for &(ip, campaign) in C2_IPS {
                if line.contains(ip) {
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line,
                        &format!("Known C2 IP address detected: {} ({})", ip, campaign),
                        "Remove the hardcoded C2 IP. This address is associated with known malware infrastructure.",
                        Some("CWE-506"),
                    ));
                    break; // one finding per line
                }
            }
        }
        findings
    }
}

// === CS-IOC-002: Malicious Domain Detection ===

pub struct MaliciousDomainDetection;

impl Rule for MaliciousDomainDetection {
    fn id(&self) -> &str { "CS-IOC-002" }
    fn name(&self) -> &str { "Malicious Domain Detection" }
    fn severity(&self) -> Severity { Severity::High }
    fn category(&self) -> Category { Category::Ioc }
    fn description(&self) -> &str { "Detects references to known malicious domains" }

    fn applies_to(&self, _ctx: &FileContext) -> bool { true }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed.starts_with('#') || trimmed.is_empty() {
                continue;
            }
            let lower = line.to_lowercase();
            for &(domain, desc) in MALICIOUS_DOMAINS {
                if lower.contains(domain) {
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line,
                        &format!("Known malicious domain detected: {} ({})", domain, desc),
                        "Remove the reference to this domain. It is associated with malware distribution or data exfiltration.",
                        Some("CWE-506"),
                    ));
                    break;
                }
            }
        }
        findings
    }
}

// === CS-IOC-003: Malicious Publisher Detection ===

pub struct MaliciousPublisherDetection;

impl Rule for MaliciousPublisherDetection {
    fn id(&self) -> &str { "CS-IOC-003" }
    fn name(&self) -> &str { "Malicious Publisher" }
    fn severity(&self) -> Severity { Severity::High }
    fn category(&self) -> Category { Category::Ioc }
    fn description(&self) -> &str { "Detects SKILL.md references to known malicious publishers" }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.relative_path.ends_with("SKILL.md") || ctx.relative_path.ends_with("skill.md")
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                continue;
            }
            let lower = line.to_lowercase();
            for &(publisher, desc) in MALICIOUS_PUBLISHERS {
                if lower.contains(&publisher.to_lowercase()) {
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line,
                        &format!("Known malicious publisher detected: {} ({})", publisher, desc),
                        "Do not install skills from this publisher. They are associated with malware campaigns.",
                        Some("CWE-829"),
                    ));
                    break;
                }
            }
        }
        findings
    }

    fn check_skill(&self, ctx: &SkillContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        if let Some(ref content) = ctx.skill_md_content {
            let lower = content.to_lowercase();
            for &(publisher, desc) in MALICIOUS_PUBLISHERS {
                if lower.contains(&publisher.to_lowercase()) {
                    findings.push(self.make_finding(
                        "SKILL.md", 0, publisher,
                        &format!("Known malicious publisher referenced in SKILL.md: {} ({})", publisher, desc),
                        "Do not install skills from this publisher. They are associated with malware campaigns.",
                        Some("CWE-829"),
                    ));
                }
            }
        }
        findings
    }
}
