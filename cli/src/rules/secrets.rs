use regex::Regex;
use std::sync::LazyLock;

use crate::rules::{Category, Finding, Rule, Severity};
use crate::scanner::{FileContext, Language};

static EXCLUDE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)(changeme|xxx|TODO|FIXME|placeholder|example|your[_-]?(password|key)|<password>|\{\{|\$\{|os\.environ|getenv|process\.env)"#).unwrap()
});

// === CS-SEC-001: Hardcoded Password ===

static PASSWORD_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)(password|passwd|pwd)\s*=\s*["'][^"']{4,}["']"#).unwrap()
});

pub struct HardcodedPassword;

impl Rule for HardcodedPassword {
    fn id(&self) -> &str { "CS-SEC-001" }
    fn name(&self) -> &str { "Hardcoded Password" }
    fn severity(&self) -> Severity { Severity::Critical }
    fn category(&self) -> Category { Category::Secrets }
    fn description(&self) -> &str { "Hardcoded passwords in source code" }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.is_script() || ctx.language == Language::Yaml || ctx.language == Language::Toml
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_lines(self, ctx, &[(PASSWORD_RE.clone(), "Hardcoded password detected")])
    }
}

// === CS-SEC-002: Hardcoded API Key ===

static API_KEY_PATTERNS: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"sk-[A-Za-z0-9]{20,}"#).unwrap(), "OpenAI API Key"),
        (Regex::new(r#"ghp_[A-Za-z0-9]{36}"#).unwrap(), "GitHub PAT"),
        (Regex::new(r#"gho_[A-Za-z0-9]{36}"#).unwrap(), "GitHub OAuth Token"),
        (Regex::new(r#"github_pat_[A-Za-z0-9_]{22,}"#).unwrap(), "GitHub Fine-grained PAT"),
        (Regex::new(r#"AKIA[0-9A-Z]{16}"#).unwrap(), "AWS Access Key ID"),
        (Regex::new(r#"AIza[0-9A-Za-z_\-]{35}"#).unwrap(), "Google API Key"),
        (Regex::new(r#"xox[baprs]-[0-9a-zA-Z-]{10,}"#).unwrap(), "Slack Token"),
        (Regex::new(r#"(?i)(api_key|apikey|api_secret|api_token)\s*=\s*["'][A-Za-z0-9_\-]{16,}["']"#).unwrap(), "Generic API Key"),
        (Regex::new(r#"(?i)(secret_key|secret_token|auth_token|access_token)\s*=\s*["'][A-Za-z0-9_\-]{16,}["']"#).unwrap(), "Generic Secret/Token"),
    ]
});

pub struct HardcodedApiKey;

impl Rule for HardcodedApiKey {
    fn id(&self) -> &str { "CS-SEC-002" }
    fn name(&self) -> &str { "Hardcoded API Key / Token" }
    fn severity(&self) -> Severity { Severity::Critical }
    fn category(&self) -> Category { Category::Secrets }
    fn description(&self) -> &str { "API keys and tokens in source code" }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.language != Language::Json // skip data files
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_lines(self, ctx, &API_KEY_PATTERNS)
    }
}

// === CS-SEC-003: Private Key ===

static PRIVATE_KEY_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"-----BEGIN\s+(RSA\s+|EC\s+|OPENSSH\s+|DSA\s+)?PRIVATE KEY-----"#).unwrap()
});

pub struct PrivateKey;

impl Rule for PrivateKey {
    fn id(&self) -> &str { "CS-SEC-003" }
    fn name(&self) -> &str { "Private Key in Repository" }
    fn severity(&self) -> Severity { Severity::Critical }
    fn category(&self) -> Category { Category::Secrets }
    fn description(&self) -> &str { "Private keys committed to source code" }

    fn applies_to(&self, _ctx: &FileContext) -> bool { true }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            if PRIVATE_KEY_RE.is_match(line) {
                findings.push(self.make_finding(
                    &ctx.relative_path, i + 1, line,
                    "Private key found in repository",
                    "Remove the key, rotate it, add *.pem *.key to .gitignore.",
                    Some("CWE-321"),
                ));
            }
        }
        findings
    }
}

// === CS-SEC-004: Credentials in URL ===

static URL_CRED: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"https?://[^:@\s]+:[^:@\s]+@[^\s]+"#).unwrap(), "user:pass embedded in URL"),
        (Regex::new(r#"[?&](key|token|api_key|apikey|secret)=[A-Za-z0-9_\-]{16,}"#).unwrap(), "Secret in URL query parameter"),
    ]
});

pub struct UrlCredentials;

impl Rule for UrlCredentials {
    fn id(&self) -> &str { "CS-SEC-004" }
    fn name(&self) -> &str { "Credentials in URL" }
    fn severity(&self) -> Severity { Severity::High }
    fn category(&self) -> Category { Category::Secrets }
    fn description(&self) -> &str { "Credentials embedded in URLs" }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.language != Language::Json
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_lines(self, ctx, &URL_CRED)
    }
}

// === Helper ===

fn scan_lines(rule: &dyn Rule, ctx: &FileContext, patterns: &[(Regex, &str)]) -> Vec<Finding> {
    let mut findings = Vec::new();
    for (i, line) in ctx.lines.iter().enumerate() {
        let trimmed = line.trim();
        if trimmed.starts_with('#') || trimmed.is_empty() {
            continue;
        }
        if EXCLUDE.is_match(line) {
            continue;
        }
        for (regex, desc) in patterns {
            if regex.is_match(line) {
                findings.push(rule.make_finding(
                    &ctx.relative_path, i + 1, line, desc,
                    "Use environment variables or a secret manager.",
                    Some("CWE-798"),
                ));
                break;
            }
        }
    }
    findings
}
