use crate::rules::{Finding, Severity};

#[derive(Debug)]
pub struct ScoreResult {
    pub score: i32,
    pub grade: char,
    pub critical: usize,
    pub high: usize,
    pub medium: usize,
    pub low: usize,
    pub info: usize,
}

impl ScoreResult {
    pub fn from_findings(findings: &[Finding]) -> Self {
        let mut score = 100i32;
        let mut critical = 0;
        let mut high = 0;
        let mut medium = 0;
        let mut low = 0;
        let mut info = 0;

        for f in findings {
            score -= f.severity.score_penalty();
            match f.severity {
                Severity::Critical => critical += 1,
                Severity::High => high += 1,
                Severity::Medium => medium += 1,
                Severity::Low => low += 1,
                Severity::Info => info += 1,
            }
        }

        let score = score.max(0);
        let grade = match score {
            90..=100 => 'A',
            75..=89 => 'B',
            60..=74 => 'C',
            40..=59 => 'D',
            _ => 'F',
        };

        Self { score, grade, critical, high, medium, low, info }
    }
}
