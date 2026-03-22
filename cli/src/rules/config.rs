use regex::Regex;
use std::sync::LazyLock;

use crate::rules::{Category, Finding, Rule, Severity};
use crate::scanner::{FileContext, Language, SkillContext};

// === CS-CFG-001: Missing SKILL.md ===

pub struct MissingSkillMd;

impl Rule for MissingSkillMd {
    fn id(&self) -> &str { "CS-CFG-001" }
    fn name(&self) -> &str { "Missing SKILL.md" }
    fn severity(&self) -> Severity { Severity::High }
    fn category(&self) -> Category { Category::Config }
    fn description(&self) -> &str { "Skill directory has no SKILL.md" }

    fn applies_to(&self, _ctx: &FileContext) -> bool { false }
    fn check_file(&self, _ctx: &FileContext) -> Vec<Finding> { vec![] }

    fn check_skill(&self, ctx: &SkillContext) -> Vec<Finding> {
        if !ctx.has_skill_md {
            vec![self.make_finding(
                ".", 0, "",
                "Missing SKILL.md - skill has no metadata or documentation",
                "Create a SKILL.md with skill name, description, version, and permissions.",
                None,
            )]
        } else {
            vec![]
        }
    }
}

// === CS-CFG-002: Missing Version ===

static VERSION_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)(version|v\d+\.\d+)"#).unwrap()
});

pub struct MissingVersion;

impl Rule for MissingVersion {
    fn id(&self) -> &str { "CS-CFG-002" }
    fn name(&self) -> &str { "Missing Version Declaration" }
    fn severity(&self) -> Severity { Severity::Low }
    fn category(&self) -> Category { Category::Config }
    fn description(&self) -> &str { "SKILL.md has no version number" }

    fn applies_to(&self, _ctx: &FileContext) -> bool { false }
    fn check_file(&self, _ctx: &FileContext) -> Vec<Finding> { vec![] }

    fn check_skill(&self, ctx: &SkillContext) -> Vec<Finding> {
        if let Some(content) = &ctx.skill_md_content {
            if !VERSION_RE.is_match(content) {
                return vec![self.make_finding(
                    "SKILL.md", 0, "",
                    "No version declaration found in SKILL.md",
                    "Add a version number (e.g., Version: 1.0.0) to SKILL.md.",
                    None,
                )];
            }
        }
        vec![]
    }
}

// === CS-CFG-003: Missing Permission Declaration ===

static PERMISSION_KEYWORDS: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)(allowed[_-]?tools|permissions?|require[sd]?[_-]?tools|access)"#).unwrap()
});

pub struct MissingPermissions;

impl Rule for MissingPermissions {
    fn id(&self) -> &str { "CS-CFG-003" }
    fn name(&self) -> &str { "Missing Permission Declaration" }
    fn severity(&self) -> Severity { Severity::Medium }
    fn category(&self) -> Category { Category::Config }
    fn description(&self) -> &str { "SKILL.md does not declare required permissions" }

    fn applies_to(&self, _ctx: &FileContext) -> bool { false }
    fn check_file(&self, _ctx: &FileContext) -> Vec<Finding> { vec![] }

    fn check_skill(&self, ctx: &SkillContext) -> Vec<Finding> {
        // Only flag if skill has scripts (meaning it executes things) but no permission declaration
        if ctx.has_scripts_dir {
            if let Some(content) = &ctx.skill_md_content {
                if !PERMISSION_KEYWORDS.is_match(content) {
                    return vec![self.make_finding(
                        "SKILL.md", 0, "",
                        "Skill has scripts but no permission/tool declarations in SKILL.md",
                        "Declare which tools and permissions the skill requires.",
                        None,
                    )];
                }
            }
        }
        vec![]
    }
}

// === CS-CFG-004: Prompt Injection Risk ===

static PROMPT_INJ: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"(?i)ignore\s+(all\s+)?previous\s+instructions"#).unwrap(), "Prompt injection: ignore previous instructions"),
        (Regex::new(r#"(?i)you\s+are\s+now\s+(a|an)\s+"#).unwrap(), "Prompt injection: role override"),
        (Regex::new(r#"(?i)disregard\s+(all\s+)?prior"#).unwrap(), "Prompt injection: disregard prior"),
        (Regex::new(r#"(?i)<\s*system\s*>"#).unwrap(), "Prompt injection: fake system tag"),
        (Regex::new(r#"(?i)do\s+not\s+follow\s+(the\s+)?(above|previous)"#).unwrap(), "Prompt injection: do not follow above"),
        (Regex::new(r#"(?i)forget\s+(everything|all|your)\s+(above|previous|prior)"#).unwrap(), "Prompt injection: forget previous"),
    ]
});

pub struct PromptInjectionRisk;

impl Rule for PromptInjectionRisk {
    fn id(&self) -> &str { "CS-CFG-004" }
    fn name(&self) -> &str { "Prompt Injection Risk" }
    fn severity(&self) -> Severity { Severity::Medium }
    fn category(&self) -> Category { Category::Config }
    fn description(&self) -> &str { "Possible prompt injection payloads in skill content" }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.language == Language::Markdown || ctx.language == Language::Yaml
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            for (regex, desc) in PROMPT_INJ.iter() {
                if regex.is_match(line) {
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line,
                        desc,
                        "Remove or rewrite suspicious instructions that could hijack LLM behavior.",
                        Some("CWE-74"),
                    ));
                    break;
                }
            }
        }
        findings
    }
}
