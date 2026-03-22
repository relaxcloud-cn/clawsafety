use colored::Colorize;

use crate::rules::{Finding, Severity};
use crate::scoring::ScoreResult;
use super::Reporter;

pub struct TerminalReporter;

impl Reporter for TerminalReporter {
    fn report(&self, findings: &[Finding], score: &ScoreResult, path: &str) {
        println!();
        println!("  {} v{}", "ClawSafety".bold().cyan(), env!("CARGO_PKG_VERSION"));
        println!();
        println!("  Scanning: {}", path.bold());
        println!("  Findings: {}", findings.len());
        println!();

        if findings.is_empty() {
            println!("  {} No security issues found!", "OK".bold().green());
        } else {
            for f in findings {
                let severity_str = format!("{:<10}", f.severity.label());
                let colored_sev = match f.severity {
                    Severity::Critical => severity_str.bold().red(),
                    Severity::High => severity_str.bold().yellow(),
                    Severity::Medium => severity_str.yellow(),
                    Severity::Low => severity_str.normal(),
                    Severity::Info => severity_str.dimmed(),
                };

                println!("  {}  {}  {}", colored_sev, f.rule_id.dimmed(), f.message);

                if f.line > 0 {
                    println!("            {}:{}", f.file.dimmed(), f.line.to_string().dimmed());
                } else if !f.file.is_empty() {
                    println!("            {}", f.file.dimmed());
                }

                if !f.snippet.is_empty() {
                    let truncated = if f.snippet.len() > 100 {
                        format!("{}...", &f.snippet[..97])
                    } else {
                        f.snippet.clone()
                    };
                    println!("            > {}", truncated.dimmed());
                }

                println!("            {}: {}", "Fix".bold(), f.fix_suggestion);
                println!();
            }
        }

        // Score
        println!("  {}", "─".repeat(45));
        let grade_colored = match score.grade {
            'A' => format!("{}", score.grade).bold().green(),
            'B' => format!("{}", score.grade).bold().cyan(),
            'C' => format!("{}", score.grade).bold().yellow(),
            'D' => format!("{}", score.grade).bold().red(),
            _ => format!("{}", score.grade).bold().red(),
        };
        println!(
            "  Score: {}/100 ({})",
            score.score.to_string().bold(),
            grade_colored
        );
        println!(
            "  Critical: {} | High: {} | Medium: {} | Low: {}",
            colorize_count(score.critical, Severity::Critical),
            colorize_count(score.high, Severity::High),
            colorize_count(score.medium, Severity::Medium),
            colorize_count(score.low, Severity::Low),
        );
        println!("  {}", "─".repeat(45));
        println!();
    }
}

fn colorize_count(count: usize, severity: Severity) -> colored::ColoredString {
    let s = count.to_string();
    if count == 0 {
        return s.normal();
    }
    match severity {
        Severity::Critical => s.bold().red(),
        Severity::High => s.bold().yellow(),
        Severity::Medium => s.yellow(),
        Severity::Low => s.normal(),
        Severity::Info => s.dimmed(),
    }
}
