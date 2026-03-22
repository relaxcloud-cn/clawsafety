use regex::Regex;
use std::sync::LazyLock;

use crate::rules::{Category, Finding, Rule, Severity};
use crate::scanner::{FileContext, SkillContext};

// === CS-PRM-001: Excessive Permissions ===

static DANGEROUS_TOOLS: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"(?i)allowed[_-]?tools:.*\*"#).unwrap(), "Wildcard tool permission (allows everything)"),
        (Regex::new(r#"(?i)allowed[_-]?tools:.*Bash"#).unwrap(), "Bash tool access (can execute arbitrary commands)"),
        (Regex::new(r#"(?i)allowed[_-]?tools:.*Write"#).unwrap(), "Write tool access (can modify any file)"),
    ]
});

pub struct ExcessivePermissions;

impl Rule for ExcessivePermissions {
    fn id(&self) -> &str { "CS-PRM-001" }
    fn name(&self) -> &str { "Excessive Permission Request" }
    fn severity(&self) -> Severity { Severity::Medium }
    fn category(&self) -> Category { Category::Permissions }
    fn description(&self) -> &str { "Skill requests overly broad permissions" }

    fn applies_to(&self, _ctx: &FileContext) -> bool { false }
    fn check_file(&self, _ctx: &FileContext) -> Vec<Finding> { vec![] }

    fn check_skill(&self, ctx: &SkillContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        if let Some(content) = &ctx.skill_md_content {
            for (i, line) in content.lines().enumerate() {
                for (regex, desc) in DANGEROUS_TOOLS.iter() {
                    if regex.is_match(line) {
                        findings.push(self.make_finding(
                            "SKILL.md", i + 1, line,
                            &format!("Excessive permission: {}", desc),
                            "Request only the specific tools needed. Avoid wildcard permissions.",
                            Some("CWE-250"),
                        ));
                        break;
                    }
                }
            }
        }
        findings
    }
}

// === CS-PRM-002: Sensitive Paths ===

static SENSITIVE_PATHS: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"/etc/shadow"#).unwrap(), "/etc/shadow (password hashes)"),
        (Regex::new(r#"~/\.ssh/"#).unwrap(), "~/.ssh/ (SSH keys)"),
        (Regex::new(r#"~/\.aws/credentials"#).unwrap(), "~/.aws/credentials"),
        (Regex::new(r#"~/\.claude/"#).unwrap(), "~/.claude/ (Claude config)"),
        (Regex::new(r#"~/\.config/gcloud"#).unwrap(), "~/.config/gcloud (GCP creds)"),
        (Regex::new(r#"~/\.kube/config"#).unwrap(), "~/.kube/config (Kubernetes)"),
        (Regex::new(r#"~/\.docker/config\.json"#).unwrap(), "~/.docker/config.json"),
        (Regex::new(r#"/proc/\d+/"#).unwrap(), "/proc/ (process info)"),
    ]
});

pub struct SensitivePaths;

impl Rule for SensitivePaths {
    fn id(&self) -> &str { "CS-PRM-002" }
    fn name(&self) -> &str { "Access to Sensitive System Paths" }
    fn severity(&self) -> Severity { Severity::High }
    fn category(&self) -> Category { Category::Permissions }
    fn description(&self) -> &str { "Reading or writing sensitive system paths" }

    fn applies_to(&self, ctx: &FileContext) -> bool { ctx.is_script() }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed.starts_with('#') || trimmed.is_empty() { continue; }
            for (regex, desc) in SENSITIVE_PATHS.iter() {
                if regex.is_match(line) {
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line,
                        &format!("Access to sensitive path: {}", desc),
                        "Use minimal required paths. Document why access is needed.",
                        Some("CWE-552"),
                    ));
                    break;
                }
            }
        }
        findings
    }
}

// === CS-PRM-003: Environment Variable Abuse ===

static ENV_ABUSE: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"os\.environ\s*\["#).unwrap(), "Direct os.environ[] access (prefer os.environ.get())"),
        (Regex::new(r#"for\s+\w+\s+in\s+os\.environ"#).unwrap(), "Iterating all environment variables"),
        (Regex::new(r#"dict\(os\.environ\)"#).unwrap(), "Copying all environment variables"),
        (Regex::new(r#"printenv\b"#).unwrap(), "Dumping environment with printenv"),
    ]
});

pub struct EnvAbuse;

impl Rule for EnvAbuse {
    fn id(&self) -> &str { "CS-PRM-003" }
    fn name(&self) -> &str { "Environment Variable Abuse" }
    fn severity(&self) -> Severity { Severity::Medium }
    fn category(&self) -> Category { Category::Permissions }
    fn description(&self) -> &str { "Reading excessive environment variables" }

    fn applies_to(&self, ctx: &FileContext) -> bool { ctx.is_script() }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed.starts_with('#') || trimmed.is_empty() { continue; }
            for (regex, desc) in ENV_ABUSE.iter() {
                if regex.is_match(line) {
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line,
                        &format!("Env abuse: {}", desc),
                        "Use os.environ.get('SPECIFIC_VAR') to read only needed variables.",
                        Some("CWE-526"),
                    ));
                    break;
                }
            }
        }
        findings
    }
}

// === CS-PRM-004: Insecure File Permissions ===

static INSECURE_PERMS: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"chmod\s+777"#).unwrap(), "chmod 777 (world-writable)"),
        (Regex::new(r#"chmod\s+a\+rwx"#).unwrap(), "chmod a+rwx (world-writable)"),
        (Regex::new(r#"chmod\s+666"#).unwrap(), "chmod 666 (world-readable/writable)"),
        (Regex::new(r#"os\.chmod\([^)]*0o?777"#).unwrap(), "os.chmod 777"),
    ]
});

pub struct InsecurePermissions;

impl Rule for InsecurePermissions {
    fn id(&self) -> &str { "CS-PRM-004" }
    fn name(&self) -> &str { "Insecure File Permissions" }
    fn severity(&self) -> Severity { Severity::Low }
    fn category(&self) -> Category { Category::Permissions }
    fn description(&self) -> &str { "Overly permissive file permissions" }

    fn applies_to(&self, ctx: &FileContext) -> bool { ctx.is_script() }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed.starts_with('#') || trimmed.is_empty() { continue; }
            for (regex, desc) in INSECURE_PERMS.iter() {
                if regex.is_match(line) {
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line,
                        &format!("Insecure permissions: {}", desc),
                        "Use minimal permissions (e.g., 0o755 or 0o600).",
                        Some("CWE-732"),
                    ));
                    break;
                }
            }
        }
        findings
    }
}
