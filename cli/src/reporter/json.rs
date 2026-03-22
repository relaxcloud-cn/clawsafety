use serde::Serialize;

use crate::rules::Finding;
use crate::scoring::ScoreResult;
use super::Reporter;

#[derive(Serialize)]
struct JsonReport<'a> {
    version: &'static str,
    path: &'a str,
    score: i32,
    grade: char,
    summary: Summary,
    findings: Vec<JsonFinding<'a>>,
}

#[derive(Serialize)]
struct Summary {
    critical: usize,
    high: usize,
    medium: usize,
    low: usize,
    info: usize,
    total: usize,
}

#[derive(Serialize)]
struct JsonFinding<'a> {
    rule_id: &'a str,
    rule_name: &'a str,
    severity: &'a str,
    message: &'a str,
    file: &'a str,
    line: usize,
    snippet: &'a str,
    fix_suggestion: &'a str,
    cwe: Option<&'a str>,
}

pub struct JsonReporter;

impl Reporter for JsonReporter {
    fn report(&self, findings: &[Finding], score: &ScoreResult, path: &str) {
        let report = JsonReport {
            version: env!("CARGO_PKG_VERSION"),
            path,
            score: score.score,
            grade: score.grade,
            summary: Summary {
                critical: score.critical,
                high: score.high,
                medium: score.medium,
                low: score.low,
                info: score.info,
                total: findings.len(),
            },
            findings: findings.iter().map(|f| JsonFinding {
                rule_id: &f.rule_id,
                rule_name: &f.rule_name,
                severity: f.severity.label(),
                message: &f.message,
                file: &f.file,
                line: f.line,
                snippet: &f.snippet,
                fix_suggestion: &f.fix_suggestion,
                cwe: f.cwe.as_deref(),
            }).collect(),
        };

        println!("{}", serde_json::to_string_pretty(&report).unwrap());
    }
}
