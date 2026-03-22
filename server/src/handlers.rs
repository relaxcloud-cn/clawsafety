use axum::Json;
use serde::{Deserialize, Serialize};

use clawsafety::rules;
use clawsafety::scanner::Scanner;
use clawsafety::scoring::ScoreResult;

pub async fn health() -> &'static str {
    "ok"
}

#[derive(Deserialize)]
pub struct ScanRequest {
    pub repo_url: String,
}

#[derive(Serialize)]
pub struct ScanResponse {
    pub score: i32,
    pub grade: char,
    pub critical: usize,
    pub high: usize,
    pub medium: usize,
    pub low: usize,
    pub total_findings: usize,
    pub findings: Vec<FindingResponse>,
}

#[derive(Serialize)]
pub struct FindingResponse {
    pub rule_id: String,
    pub severity: String,
    pub message: String,
    pub file: String,
    pub line: usize,
    pub fix_suggestion: String,
}

pub async fn scan_url(Json(req): Json<ScanRequest>) -> Json<ScanResponse> {
    // TODO: Clone repo from URL, scan, return results
    // For now, return a placeholder
    tracing::info!("Scan request for: {}", req.repo_url);

    // In production: git clone -> scan -> cleanup
    let temp_dir = tempfile::tempdir().unwrap();
    let clone_result = std::process::Command::new("git")
        .args(["clone", "--depth", "1", &req.repo_url, temp_dir.path().to_str().unwrap()])
        .output();

    match clone_result {
        Ok(output) if output.status.success() => {
            let all_rules = rules::all_rules();
            let scanner = Scanner::new(all_rules);

            match scanner.scan(temp_dir.path()) {
                Ok(findings) => {
                    let score = ScoreResult::from_findings(&findings);
                    let finding_responses: Vec<FindingResponse> = findings.iter().map(|f| {
                        FindingResponse {
                            rule_id: f.rule_id.clone(),
                            severity: f.severity.label().to_string(),
                            message: f.message.clone(),
                            file: f.file.clone(),
                            line: f.line,
                            fix_suggestion: f.fix_suggestion.clone(),
                        }
                    }).collect();

                    Json(ScanResponse {
                        score: score.score,
                        grade: score.grade,
                        critical: score.critical,
                        high: score.high,
                        medium: score.medium,
                        low: score.low,
                        total_findings: findings.len(),
                        findings: finding_responses,
                    })
                }
                Err(_) => Json(ScanResponse {
                    score: -1, grade: '?', critical: 0, high: 0,
                    medium: 0, low: 0, total_findings: 0, findings: vec![],
                }),
            }
        }
        _ => Json(ScanResponse {
            score: -1, grade: '?', critical: 0, high: 0,
            medium: 0, low: 0, total_findings: 0, findings: vec![],
        }),
    }
}
