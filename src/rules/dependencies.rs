use regex::Regex;
use std::sync::LazyLock;

use crate::rules::{Category, Finding, Rule, Severity};
use crate::scanner::{FileContext, Language};

// === CS-DEP-001: Unsafe Install ===

static UNSAFE_INSTALL_RE: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"curl\s+[^|]*\|\s*(ba)?sh"#).unwrap(), "curl piped to shell"),
        (Regex::new(r#"wget\s+.*-O\s*-\s*\|\s*(ba)?sh"#).unwrap(), "wget piped to shell"),
        (Regex::new(r#"pip\s+install\s+--break-system-packages"#).unwrap(), "pip --break-system-packages"),
        (Regex::new(r#"pip\s+install\s+--trusted-host"#).unwrap(), "pip --trusted-host bypasses TLS"),
    ]
});

pub struct UnsafeInstall;

impl Rule for UnsafeInstall {
    fn id(&self) -> &str { "CS-DEP-001" }
    fn name(&self) -> &str { "Unsafe Dependency Installation" }
    fn severity(&self) -> Severity { Severity::High }
    fn category(&self) -> Category { Category::Dependencies }
    fn description(&self) -> &str { "Unsafe package installation methods" }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.is_script() || ctx.language == Language::Yaml
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed.starts_with('#') || trimmed.is_empty() { continue; }
            for (regex, desc) in UNSAFE_INSTALL_RE.iter() {
                if regex.is_match(line) {
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line,
                        &format!("Unsafe installation: {}", desc),
                        "Verify downloads with checksums. Use locked dependency files.",
                        Some("CWE-829"),
                    ));
                    break;
                }
            }
        }
        findings
    }
}

// === CS-DEP-002: Unpinned Dependency ===

static UNPINNED_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"^\s*-?\s*([a-zA-Z0-9_-]+)\s*(>=|>|~=|!=)\s*[\d.]+"#).unwrap()
});

static NO_VERSION_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"^\s*-\s+([a-zA-Z][a-zA-Z0-9_-]+)\s*$"#).unwrap()
});

pub struct UnpinnedDependency;

impl Rule for UnpinnedDependency {
    fn id(&self) -> &str { "CS-DEP-002" }
    fn name(&self) -> &str { "Unpinned Dependency Version" }
    fn severity(&self) -> Severity { Severity::Medium }
    fn category(&self) -> Category { Category::Dependencies }
    fn description(&self) -> &str { "Dependencies without pinned versions" }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.language == Language::Yaml || ctx.relative_path.ends_with("requirements.txt")
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        let mut in_pip = false;

        for (i, line) in ctx.lines.iter().enumerate() {
            let trimmed = line.trim();
            if ctx.language == Language::Yaml {
                if trimmed == "pip:" || trimmed.starts_with("pip:") {
                    in_pip = true;
                    continue;
                }
                if in_pip && !trimmed.is_empty() && !trimmed.starts_with('-') && !trimmed.starts_with('#') {
                    in_pip = false;
                }
                if !in_pip { continue; }
            }

            if UNPINNED_RE.is_match(trimmed) {
                findings.push(self.make_finding(
                    &ctx.relative_path, i + 1, line,
                    "Unpinned dependency (range specifier)",
                    "Pin to exact version: package==1.2.3",
                    None,
                ));
            } else if NO_VERSION_RE.is_match(trimmed) {
                findings.push(self.make_finding(
                    &ctx.relative_path, i + 1, line,
                    "Dependency without version constraint",
                    "Add version: package==1.2.3",
                    None,
                ));
            }
        }
        findings
    }
}

// === CS-DEP-003: Known Vulnerable Dependencies ===

/// Hardcoded list of known-vulnerable package patterns.
/// MVP: simple regex match. Future: query OSV/NVD API.
static KNOWN_VULN: LazyLock<Vec<(Regex, &str, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"(?i)pyyaml\s*(==|<=)\s*[0-5]\."#).unwrap(), "PyYAML < 6.0 has arbitrary code execution (CVE-2020-14343)", "CVE-2020-14343"),
        (Regex::new(r#"(?i)requests\s*(==|<=)\s*2\.(0|1[0-9]|2[0-4])\."#).unwrap(), "requests < 2.25.0 has CRLF injection (CVE-2023-32681)", "CVE-2023-32681"),
        (Regex::new(r#"(?i)urllib3\s*(==|<=)\s*1\."#).unwrap(), "urllib3 1.x is EOL, upgrade to 2.x", ""),
        (Regex::new(r#"(?i)pillow\s*(==|<=)\s*([0-8]|9\.[0-4])\."#).unwrap(), "Pillow < 9.5 has multiple CVEs", ""),
        (Regex::new(r#"(?i)jinja2\s*(==|<=)\s*[0-2]\."#).unwrap(), "Jinja2 < 3.0 has sandbox escape (CVE-2024-22195)", "CVE-2024-22195"),
        (Regex::new(r#"(?i)cryptography\s*(==|<=)\s*(3[0-9]|4[01])\."#).unwrap(), "cryptography < 42.0 has multiple CVEs", ""),
    ]
});

pub struct KnownVulnerableDep;

impl Rule for KnownVulnerableDep {
    fn id(&self) -> &str { "CS-DEP-003" }
    fn name(&self) -> &str { "Known Vulnerable Dependency" }
    fn severity(&self) -> Severity { Severity::High }
    fn category(&self) -> Category { Category::Dependencies }
    fn description(&self) -> &str { "Dependency with known security vulnerabilities" }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.language == Language::Yaml || ctx.relative_path.ends_with("requirements.txt")
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed.starts_with('#') || trimmed.is_empty() { continue; }
            for (regex, desc, cve) in KNOWN_VULN.iter() {
                if regex.is_match(trimmed) {
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line,
                        desc,
                        "Upgrade to a patched version.",
                        if cve.is_empty() { None } else { Some(cve) },
                    ));
                    break;
                }
            }
        }
        findings
    }
}

// === CS-DEP-004: Untrusted Download ===

static UNTRUSTED_DL_RE: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"(?i)url:\s*https?://raw\.githubusercontent\.com/"#).unwrap(), "Raw GitHub download without integrity check"),
        (Regex::new(r#"(?i)url:\s*https?://.*\.(tar\.gz|zip|tgz)"#).unwrap(), "Archive download without checksum"),
        (Regex::new(r#"curl\s+.*-[oO]\s+\S+\s+https?://"#).unwrap(), "curl download without verification"),
        (Regex::new(r#"wget\s+.*https?://.*\.(tar\.gz|zip|sh|py)"#).unwrap(), "wget download of executable content"),
    ]
});

pub struct UntrustedDownload;

impl Rule for UntrustedDownload {
    fn id(&self) -> &str { "CS-DEP-004" }
    fn name(&self) -> &str { "Download from Untrusted Source" }
    fn severity(&self) -> Severity { Severity::Medium }
    fn category(&self) -> Category { Category::Dependencies }
    fn description(&self) -> &str { "Downloads without integrity verification" }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.is_script() || ctx.language == Language::Yaml
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed.starts_with('#') || trimmed.is_empty() { continue; }
            for (regex, desc) in UNTRUSTED_DL_RE.iter() {
                if regex.is_match(line) {
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line,
                        &format!("Untrusted download: {}", desc),
                        "Add SHA256 checksum verification.",
                        Some("CWE-494"),
                    ));
                    break;
                }
            }
        }
        findings
    }
}
