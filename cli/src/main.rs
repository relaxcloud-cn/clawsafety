use std::path::PathBuf;
use std::process;

use clap::{Parser, ValueEnum};

use clawsafety::rules;
use clawsafety::scanner::Scanner;
use clawsafety::scoring::ScoreResult;
use clawsafety::reporter::{Reporter, TerminalReporter, JsonReporter};

#[derive(Parser)]
#[command(name = "clawsafety", version, about = "Security scanner for Agent Skills")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(clap::Subcommand)]
enum Commands {
    /// Scan a skill directory for security issues
    Scan {
        /// Path to the skill directory
        path: PathBuf,

        /// Output format
        #[arg(short, long, default_value = "terminal")]
        format: OutputFormat,

        /// Minimum severity to report
        #[arg(short = 's', long, default_value = "low")]
        min_severity: MinSeverity,

        /// Fail with exit code 1 if score is below this threshold
        #[arg(long)]
        fail_under: Option<i32>,
    },

    /// Scan all skills in a directory
    ScanAll {
        /// Path to the directory containing skills
        path: PathBuf,

        /// Output format
        #[arg(short, long, default_value = "terminal")]
        format: OutputFormat,
    },

    /// List available scan rules
    Rules,
}

#[derive(Clone, ValueEnum)]
enum OutputFormat {
    Terminal,
    Json,
}

#[derive(Clone, ValueEnum)]
enum MinSeverity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

impl MinSeverity {
    fn order(&self) -> u8 {
        match self {
            MinSeverity::Critical => 0,
            MinSeverity::High => 1,
            MinSeverity::Medium => 2,
            MinSeverity::Low => 3,
            MinSeverity::Info => 4,
        }
    }
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Scan { path, format, min_severity, fail_under } => {
            if !path.exists() {
                eprintln!("Error: path '{}' does not exist", path.display());
                process::exit(1);
            }

            let all_rules = rules::all_rules();
            let scanner = Scanner::new(all_rules);

            let mut findings = match scanner.scan(&path) {
                Ok(f) => f,
                Err(e) => {
                    eprintln!("Error scanning: {}", e);
                    process::exit(1);
                }
            };

            // Filter by min severity
            findings.retain(|f| f.severity.order() <= min_severity.order());

            let score = ScoreResult::from_findings(&findings);
            let path_str = path.to_string_lossy();

            let reporter: Box<dyn Reporter> = match format {
                OutputFormat::Terminal => Box::new(TerminalReporter),
                OutputFormat::Json => Box::new(JsonReporter),
            };
            reporter.report(&findings, &score, &path_str);

            if let Some(threshold) = fail_under {
                if score.score < threshold {
                    process::exit(1);
                }
            }
        }

        Commands::ScanAll { path, format } => {
            if !path.exists() {
                eprintln!("Error: path '{}' does not exist", path.display());
                process::exit(1);
            }

            let entries: Vec<_> = std::fs::read_dir(&path)
                .unwrap()
                .filter_map(|e| e.ok())
                .filter(|e| e.file_type().map(|t| t.is_dir()).unwrap_or(false))
                .filter(|e| e.path().join("SKILL.md").exists())
                .collect();

            if entries.is_empty() {
                eprintln!("No skills found in '{}'", path.display());
                process::exit(1);
            }

            println!("\n  Found {} skills to scan\n", entries.len());

            let all_rules = rules::all_rules();
            let scanner = Scanner::new(all_rules);
            let mut results: Vec<(String, i32, char, usize)> = Vec::new();

            for entry in &entries {
                let skill_path = entry.path();
                let name = entry.file_name().to_string_lossy().to_string();

                match scanner.scan(&skill_path) {
                    Ok(findings) => {
                        let score = ScoreResult::from_findings(&findings);

                        match format {
                            OutputFormat::Terminal => {
                                TerminalReporter.report(&findings, &score, &skill_path.to_string_lossy());
                            }
                            OutputFormat::Json => {
                                JsonReporter.report(&findings, &score, &skill_path.to_string_lossy());
                            }
                        }

                        results.push((name, score.score, score.grade, findings.len()));
                    }
                    Err(e) => {
                        eprintln!("  Error scanning {}: {}", name, e);
                    }
                }
            }

            // Summary table
            if matches!(format, OutputFormat::Terminal) {
                println!("\n  {}", "=".repeat(55));
                println!("  {:<30} {:>5} {:>5} {:>8}", "SKILL", "SCORE", "GRADE", "FINDINGS");
                println!("  {}", "-".repeat(55));
                for (name, score, grade, count) in &results {
                    println!("  {:<30} {:>5} {:>5} {:>8}", name, score, grade, count);
                }
                println!("  {}", "=".repeat(55));
            }
        }

        Commands::Rules => {
            let all_rules = rules::all_rules();
            println!("\n  ClawSafety Rules ({} total)\n", all_rules.len());
            println!("  {:<14} {:<10} {:<14} {}", "ID", "SEVERITY", "CATEGORY", "DESCRIPTION");
            println!("  {}", "-".repeat(70));
            for rule in &all_rules {
                println!(
                    "  {:<14} {:<10} {:<14} {}",
                    rule.id(),
                    rule.severity().label(),
                    rule.category(),
                    rule.description(),
                );
            }
            println!();
        }
    }
}
