use axum::http::{HeaderMap, StatusCode};
use axum::body::Bytes;
use hmac::{Hmac, Mac};
use sha2::Sha256;
use serde::Deserialize;

use super::comment;

type HmacSha256 = Hmac<Sha256>;

#[derive(Deserialize)]
struct PullRequestEvent {
    action: String,
    number: u64,
    pull_request: PullRequest,
    repository: Repository,
}

#[derive(Deserialize)]
struct PushEvent {
    #[serde(rename = "ref")]
    git_ref: String,
    repository: Repository,
    after: String,
}

#[derive(Deserialize)]
struct PullRequest {
    head: Head,
}

#[derive(Deserialize)]
struct Head {
    #[serde(rename = "ref")]
    git_ref: String,
    sha: String,
}

#[derive(Deserialize)]
struct Repository {
    full_name: String,
    clone_url: String,
}

pub async fn handle_webhook(headers: HeaderMap, body: Bytes) -> StatusCode {
    // Verify signature
    let secret = std::env::var("GITHUB_WEBHOOK_SECRET").unwrap_or_default();
    if !secret.is_empty() {
        let sig = headers
            .get("x-hub-signature-256")
            .and_then(|v| v.to_str().ok())
            .unwrap_or("");

        if !verify_signature(&secret, &body, sig) {
            tracing::warn!("Invalid webhook signature");
            return StatusCode::UNAUTHORIZED;
        }
    }

    let event_type = headers
        .get("x-github-event")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    match event_type {
        "pull_request" => handle_pr_event(&body).await,
        "push" => handle_push_event(&body).await,
        "ping" => {
            tracing::info!("Received ping event");
            StatusCode::OK
        }
        _ => {
            tracing::debug!("Ignoring event: {}", event_type);
            StatusCode::OK
        }
    }
}

async fn handle_pr_event(body: &[u8]) -> StatusCode {
    let event: PullRequestEvent = match serde_json::from_slice(body) {
        Ok(e) => e,
        Err(e) => {
            tracing::error!("Failed to parse PR event: {}", e);
            return StatusCode::BAD_REQUEST;
        }
    };

    if event.action != "opened" && event.action != "synchronize" {
        return StatusCode::OK;
    }

    tracing::info!(
        "PR #{} {} on {} (sha: {})",
        event.number,
        event.action,
        event.repository.full_name,
        event.pull_request.head.sha
    );

    // Spawn scan task
    let repo_url = event.repository.clone_url;
    let repo_name = event.repository.full_name;
    let pr_number = event.number;
    let sha = event.pull_request.head.sha;
    let branch = event.pull_request.head.git_ref;

    tokio::spawn(async move {
        match scan_and_comment(&repo_url, &repo_name, pr_number, &sha, &branch).await {
            Ok(_) => tracing::info!("Scan complete for PR #{}", pr_number),
            Err(e) => tracing::error!("Scan failed for PR #{}: {}", pr_number, e),
        }
    });

    StatusCode::OK
}

async fn handle_push_event(body: &[u8]) -> StatusCode {
    let event: PushEvent = match serde_json::from_slice(body) {
        Ok(e) => e,
        Err(e) => {
            tracing::error!("Failed to parse push event: {}", e);
            return StatusCode::BAD_REQUEST;
        }
    };

    tracing::info!(
        "Push to {} ref={} sha={}",
        event.repository.full_name,
        event.git_ref,
        event.after
    );

    // TODO: store scan result for badge/dashboard
    StatusCode::OK
}

async fn scan_and_comment(
    repo_url: &str,
    repo_name: &str,
    pr_number: u64,
    sha: &str,
    branch: &str,
) -> anyhow::Result<()> {
    let temp_dir = tempfile::tempdir()?;

    // Clone specific branch
    let output = std::process::Command::new("git")
        .args([
            "clone", "--depth", "1",
            "--branch", branch,
            repo_url,
            temp_dir.path().to_str().unwrap(),
        ])
        .output()?;

    if !output.status.success() {
        anyhow::bail!("git clone failed: {}", String::from_utf8_lossy(&output.stderr));
    }

    // Scan
    let all_rules = clawsafety::rules::all_rules();
    let scanner = clawsafety::scanner::Scanner::new(all_rules);
    let findings = scanner.scan(temp_dir.path())?;
    let score = clawsafety::scoring::ScoreResult::from_findings(&findings);

    // Post comment
    let markdown = comment::format_pr_comment(&findings, &score, sha);
    comment::post_pr_comment(repo_name, pr_number, &markdown).await?;

    Ok(())
}

fn verify_signature(secret: &str, payload: &[u8], signature: &str) -> bool {
    let sig_hex = signature.strip_prefix("sha256=").unwrap_or("");
    let Ok(sig_bytes) = hex::decode(sig_hex) else {
        return false;
    };

    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
    mac.update(payload);
    mac.verify_slice(&sig_bytes).is_ok()
}
