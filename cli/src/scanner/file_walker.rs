use std::path::Path;
use walkdir::WalkDir;

use super::context::FileContext;

const SKIP_DIRS: &[&str] = &[".git", "node_modules", "__pycache__", ".venv", "target"];
const SCAN_EXTENSIONS: &[&str] = &["sh", "bash", "py", "yaml", "yml", "toml", "md", "txt", "cfg", "ini", "json"];

pub fn walk_skill(path: &Path) -> anyhow::Result<Vec<FileContext>> {
    let mut files = Vec::new();

    for entry in WalkDir::new(path)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !SKIP_DIRS.iter().any(|d| name == *d)
        })
    {
        let entry = entry?;
        if !entry.file_type().is_file() {
            continue;
        }

        let ext = entry
            .path()
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");

        if !SCAN_EXTENSIONS.contains(&ext) {
            continue;
        }

        // Skip large files (> 1MB)
        if entry.metadata()?.len() > 1_048_576 {
            continue;
        }

        match FileContext::from_file(path, entry.path()) {
            Ok(ctx) => files.push(ctx),
            Err(_) => continue, // skip binary/unreadable files
        }
    }

    Ok(files)
}
