pub mod injection;
pub mod secrets;
pub mod dependencies;
pub mod permissions;
pub mod config;

use crate::scanner::{FileContext, SkillContext};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Severity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

impl Severity {
    pub fn order(&self) -> u8 {
        match self {
            Severity::Critical => 0,
            Severity::High => 1,
            Severity::Medium => 2,
            Severity::Low => 3,
            Severity::Info => 4,
        }
    }

    pub fn label(&self) -> &'static str {
        match self {
            Severity::Critical => "CRITICAL",
            Severity::High => "HIGH",
            Severity::Medium => "MEDIUM",
            Severity::Low => "LOW",
            Severity::Info => "INFO",
        }
    }

    pub fn score_penalty(&self) -> i32 {
        match self {
            Severity::Critical => 25,
            Severity::High => 15,
            Severity::Medium => 8,
            Severity::Low => 3,
            Severity::Info => 0,
        }
    }
}

impl std::fmt::Display for Severity {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.label())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Category {
    Injection,
    Secrets,
    Dependencies,
    Permissions,
    Config,
}

impl std::fmt::Display for Category {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Category::Injection => write!(f, "Injection"),
            Category::Secrets => write!(f, "Secrets"),
            Category::Dependencies => write!(f, "Dependencies"),
            Category::Permissions => write!(f, "Permissions"),
            Category::Config => write!(f, "Config"),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Finding {
    pub rule_id: String,
    pub rule_name: String,
    pub severity: Severity,
    pub category: Category,
    pub message: String,
    pub file: String,
    pub line: usize,
    pub snippet: String,
    pub fix_suggestion: String,
    pub cwe: Option<String>,
}

pub trait Rule: Send + Sync {
    fn id(&self) -> &str;
    fn name(&self) -> &str;
    fn severity(&self) -> Severity;
    fn category(&self) -> Category;
    fn description(&self) -> &str;

    fn applies_to(&self, ctx: &FileContext) -> bool;
    fn check_file(&self, ctx: &FileContext) -> Vec<Finding>;

    fn check_skill(&self, _ctx: &SkillContext) -> Vec<Finding> {
        vec![]
    }

    fn make_finding(&self, file: &str, line: usize, snippet: &str, message: &str, fix: &str, cwe: Option<&str>) -> Finding {
        Finding {
            rule_id: self.id().to_string(),
            rule_name: self.name().to_string(),
            severity: self.severity(),
            category: self.category(),
            message: message.to_string(),
            file: file.to_string(),
            line,
            snippet: snippet.trim().to_string(),
            fix_suggestion: fix.to_string(),
            cwe: cwe.map(|s| s.to_string()),
        }
    }
}

/// Build all rules for scanning
pub fn all_rules() -> Vec<Box<dyn Rule>> {
    let mut rules: Vec<Box<dyn Rule>> = Vec::new();

    // Injection
    rules.push(Box::new(injection::ShellInjection));
    rules.push(Box::new(injection::SqlInjection));
    rules.push(Box::new(injection::DangerousFunctions));
    rules.push(Box::new(injection::ReverseShell));

    // Secrets
    rules.push(Box::new(secrets::HardcodedPassword));
    rules.push(Box::new(secrets::HardcodedApiKey));
    rules.push(Box::new(secrets::PrivateKey));
    rules.push(Box::new(secrets::UrlCredentials));

    // Dependencies
    rules.push(Box::new(dependencies::UnsafeInstall));
    rules.push(Box::new(dependencies::UnpinnedDependency));
    rules.push(Box::new(dependencies::KnownVulnerableDep));
    rules.push(Box::new(dependencies::UntrustedDownload));

    // Permissions
    rules.push(Box::new(permissions::ExcessivePermissions));
    rules.push(Box::new(permissions::SensitivePaths));
    rules.push(Box::new(permissions::EnvAbuse));
    rules.push(Box::new(permissions::InsecurePermissions));

    // Config
    rules.push(Box::new(config::MissingSkillMd));
    rules.push(Box::new(config::MissingVersion));
    rules.push(Box::new(config::MissingPermissions));
    rules.push(Box::new(config::PromptInjectionRisk));

    rules
}
