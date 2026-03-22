use clawsafety::rules::Finding;
use clawsafety::scoring::ScoreResult;

/// Format scan results as a GitHub PR comment in Markdown
pub fn format_pr_comment(findings: &[Finding], score: &ScoreResult, sha: &str) -> String {
    let grade_emoji = match score.grade {
        'A' => "🟢",
        'B' => "🔵",
        'C' => "🟡",
        'D' => "🟠",
        _ => "🔴",
    };

    let mut md = format!(
        "## {} ClawSafety Scan Report\n\n\
         **Score: {}/100 ({})** | Commit: `{}`\n\n\
         | Severity | Count |\n\
         |----------|-------|\n\
         | Critical | {} |\n\
         | High | {} |\n\
         | Medium | {} |\n\
         | Low | {} |\n\n",
        grade_emoji,
        score.score,
        score.grade,
        &sha[..7],
        score.critical,
        score.high,
        score.medium,
        score.low,
    );

    if findings.is_empty() {
        md.push_str("**No security issues found!** ✅\n");
    } else {
        md.push_str("### Findings\n\n");
        md.push_str("| Rule | Severity | File | Line | Description |\n");
        md.push_str("|------|----------|------|------|-------------|\n");

        for f in findings.iter().take(20) {
            md.push_str(&format!(
                "| {} | {} | `{}` | {} | {} |\n",
                f.rule_id,
                f.severity.label(),
                f.file,
                if f.line > 0 { f.line.to_string() } else { "-".to_string() },
                truncate(&f.message, 60),
            ));
        }

        if findings.len() > 20 {
            md.push_str(&format!(
                "\n*...and {} more findings. [View full report](https://clawsafety.dev)*\n",
                findings.len() - 20
            ));
        }
    }

    md.push_str("\n---\n*Powered by [ClawSafety](https://github.com/relaxcloud-cn/clawsafety) - Agent Skill Security Scanner*\n");

    md
}

/// Post a comment to a GitHub PR
pub async fn post_pr_comment(repo: &str, pr_number: u64, body: &str) -> anyhow::Result<()> {
    let token = std::env::var("GITHUB_TOKEN")
        .map_err(|_| anyhow::anyhow!("GITHUB_TOKEN not set"))?;

    let client = reqwest::Client::new();
    let url = format!(
        "https://api.github.com/repos/{}/issues/{}/comments",
        repo, pr_number
    );

    let resp = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", token))
        .header("Accept", "application/vnd.github+json")
        .header("User-Agent", "ClawSafety")
        .json(&serde_json::json!({ "body": body }))
        .send()
        .await?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        anyhow::bail!("GitHub API error {}: {}", status, text);
    }

    tracing::info!("Posted comment to {}#{}", repo, pr_number);
    Ok(())
}

fn truncate(s: &str, max: usize) -> String {
    if s.len() <= max {
        s.to_string()
    } else {
        format!("{}...", &s[..max - 3])
    }
}
