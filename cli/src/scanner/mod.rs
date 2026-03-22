mod context;
mod file_walker;

pub use context::{FileContext, Language, SkillContext};
pub use file_walker::walk_skill;

use crate::rules::{Finding, Rule};

pub struct Scanner {
    rules: Vec<Box<dyn Rule>>,
}

impl Scanner {
    pub fn new(rules: Vec<Box<dyn Rule>>) -> Self {
        Self { rules }
    }

    pub fn scan(&self, path: &std::path::Path) -> anyhow::Result<Vec<Finding>> {
        let skill_ctx = SkillContext::from_path(path)?;
        let files = walk_skill(path)?;
        let mut findings = Vec::new();

        // Skill-level checks
        for rule in &self.rules {
            findings.extend(rule.check_skill(&skill_ctx));
        }

        // File-level checks
        for file_ctx in &files {
            for rule in &self.rules {
                if rule.applies_to(file_ctx) {
                    findings.extend(rule.check_file(file_ctx));
                }
            }
        }

        // Sort by severity (critical first)
        findings.sort_by_key(|f| f.severity.order());

        Ok(findings)
    }
}
