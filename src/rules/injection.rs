use regex::Regex;
use std::sync::LazyLock;

use crate::rules::{Category, Finding, Rule, Severity};
use crate::scanner::{FileContext, Language};

// === CS-INJ-001: Shell Command Injection ===

static SHELL_INJ_BASH: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"eval\s+\$"#).unwrap(), "eval with unquoted variable"),
        (Regex::new(r#"eval\s+"[^"]*\$\{?"#).unwrap(), "eval with variable interpolation"),
        (Regex::new(r#"bash\s+-c\s+"[^"]*\$"#).unwrap(), "bash -c with variable interpolation"),
        (Regex::new(r#"sh\s+-c\s+"[^"]*\$"#).unwrap(), "sh -c with variable interpolation"),
    ]
});

static SHELL_INJ_PYTHON: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"subprocess\.\w+\(f["\']"#).unwrap(), "subprocess with f-string"),
        (Regex::new(r#"os\.system\(f["\']"#).unwrap(), "os.system with f-string"),
        (Regex::new(r#"os\.system\([^)]*\+"#).unwrap(), "os.system with string concat"),
        (Regex::new(r#"os\.popen\(f["\']"#).unwrap(), "os.popen with f-string"),
    ]
});

pub struct ShellInjection;

impl Rule for ShellInjection {
    fn id(&self) -> &str { "CS-INJ-001" }
    fn name(&self) -> &str { "Shell Command Injection" }
    fn severity(&self) -> Severity { Severity::Critical }
    fn category(&self) -> Category { Category::Injection }
    fn description(&self) -> &str { "Unescaped variables in shell commands" }

    fn applies_to(&self, ctx: &FileContext) -> bool { ctx.is_script() }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let patterns: &[(Regex, &str)] = match ctx.language {
            Language::Bash => &SHELL_INJ_BASH,
            Language::Python => &SHELL_INJ_PYTHON,
            _ => return vec![],
        };
        check_patterns(self, ctx, patterns)
    }
}

// === CS-INJ-002: SQL Injection ===

static SQL_INJ_BASH: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"(?i)(duckdb|sqlite3?|mysql|psql)\s+.*["'].*\$\w+"#).unwrap(), "SQL with shell variable"),
        (Regex::new(r#"(?i)(INSERT|UPDATE|DELETE|SELECT)\s+.*'\$\w+"#).unwrap(), "SQL with unquoted variable"),
    ]
});

static SQL_INJ_PYTHON: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"\.execute\(f["\']"#).unwrap(), "execute() with f-string"),
        (Regex::new(r#"\.execute\([^)]*%\s*\("#).unwrap(), "execute() with % formatting"),
        (Regex::new(r#"\.execute\([^)]*\.format\("#).unwrap(), "execute() with .format()"),
    ]
});

pub struct SqlInjection;

impl Rule for SqlInjection {
    fn id(&self) -> &str { "CS-INJ-002" }
    fn name(&self) -> &str { "SQL Injection" }
    fn severity(&self) -> Severity { Severity::Critical }
    fn category(&self) -> Category { Category::Injection }
    fn description(&self) -> &str { "String interpolation in SQL queries" }

    fn applies_to(&self, ctx: &FileContext) -> bool { ctx.is_script() }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        match ctx.language {
            Language::Bash => check_sql_bash(self, ctx),
            Language::Python => check_patterns(self, ctx, &SQL_INJ_PYTHON),
            _ => vec![],
        }
    }
}

/// For bash SQL injection, skip heredocs with quoted delimiter (e.g., << 'SQL')
/// because variables are not expanded inside them.
fn check_sql_bash(rule: &dyn Rule, ctx: &FileContext) -> Vec<Finding> {
    let mut findings = Vec::new();
    let mut in_safe_heredoc = false;
    let safe_heredoc_re = LazyLock::force(&SAFE_HEREDOC);
    let heredoc_start_re = LazyLock::force(&HEREDOC_START);

    for (i, line) in ctx.lines.iter().enumerate() {
        let trimmed = line.trim();

        // Track heredoc state
        if trimmed == "SQL" || trimmed == "EOF" {
            in_safe_heredoc = false;
            continue;
        }
        if safe_heredoc_re.is_match(line) {
            in_safe_heredoc = true;
            continue;
        }
        if heredoc_start_re.is_match(line) {
            // Unquoted heredoc - variables expand, check the duckdb line itself
            in_safe_heredoc = false;
        }

        if in_safe_heredoc || trimmed.starts_with('#') || trimmed.is_empty() {
            continue;
        }

        for (regex, desc) in SQL_INJ_BASH.iter() {
            if regex.is_match(line) {
                findings.push(rule.make_finding(
                    &ctx.relative_path, i + 1, line, desc,
                    "Use parameterized queries.",
                    Some("CWE-89"),
                ));
                break;
            }
        }
    }
    findings
}

static SAFE_HEREDOC: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"<<\s*'(SQL|EOF)'"#).unwrap()
});

static HEREDOC_START: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"<<\s*(SQL|EOF)\b"#).unwrap()
});

// === CS-INJ-003: Dangerous Functions ===

static DANGEROUS_FUNCS: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        // Only match actual function calls at start of expression, not inside strings/dicts
        (Regex::new(r#"^\s*eval\s*\("#).unwrap(), "eval() can execute arbitrary code"),
        (Regex::new(r#"[=\s]eval\s*\("#).unwrap(), "eval() can execute arbitrary code"),
        (Regex::new(r#"^\s*exec\s*\("#).unwrap(), "exec() can execute arbitrary code"),
        (Regex::new(r#"[=\s]exec\s*\("#).unwrap(), "exec() can execute arbitrary code"),
        (Regex::new(r#"__import__\s*\("#).unwrap(), "__import__() dynamic import"),
        (Regex::new(r#"\bglobals\s*\(\s*\)\s*\["#).unwrap(), "globals() dynamic access"),
    ]
});

static DANGEROUS_EXCLUDE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)(["'].*eval.*["']|#.*eval|'[^']*eval[^']*':\s*['\"]|try:\s*$)"#).unwrap()
});

// __import__ used for dependency checking is safe
static IMPORT_CHECK_CONTEXT: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)(try|except|import.*check|dep.*check|verify|installed)"#).unwrap()
});

pub struct DangerousFunctions;

impl Rule for DangerousFunctions {
    fn id(&self) -> &str { "CS-INJ-003" }
    fn name(&self) -> &str { "Dangerous Function Calls" }
    fn severity(&self) -> Severity { Severity::High }
    fn category(&self) -> Category { Category::Injection }
    fn description(&self) -> &str { "Use of eval, exec, and other dangerous functions" }

    fn applies_to(&self, ctx: &FileContext) -> bool { ctx.language == Language::Python }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for (i, line) in ctx.lines.iter().enumerate() {
            let trimmed = line.trim();
            if trimmed.starts_with('#') || trimmed.is_empty() { continue; }
            // Skip lines where eval/exec appear inside strings or dict keys
            if DANGEROUS_EXCLUDE.is_match(line) { continue; }
            for (regex, desc) in DANGEROUS_FUNCS.iter() {
                if regex.is_match(line) {
                    // __import__ inside try/except for dep checking is safe
                    if line.contains("__import__") {
                        let context_start = i.saturating_sub(3);
                        let context = ctx.lines[context_start..=i].join("\n");
                        if IMPORT_CHECK_CONTEXT.is_match(&context) {
                            break;
                        }
                    }
                    findings.push(self.make_finding(
                        &ctx.relative_path, i + 1, line, desc,
                        "Avoid eval/exec with untrusted input.",
                        Some("CWE-95"),
                    ));
                    break;
                }
            }
        }
        findings
    }
}

// === CS-INJ-004: Reverse Shell / RCE ===

static REVERSE_SHELL: LazyLock<Vec<(Regex, &str)>> = LazyLock::new(|| {
    vec![
        (Regex::new(r#"bash\s+-i\s+>&\s*/dev/tcp/"#).unwrap(), "Bash reverse shell"),
        (Regex::new(r#"nc\s+.*-e\s+/bin/(sh|bash)"#).unwrap(), "Netcat reverse shell"),
        (Regex::new(r#"python[23]?\s+-c\s+['\"]import\s+socket"#).unwrap(), "Python reverse shell"),
        (Regex::new(r#"curl\s+[^|]*\|\s*(ba)?sh"#).unwrap(), "curl piped to shell"),
        (Regex::new(r#"wget\s+.*-O\s*-\s*\|\s*(ba)?sh"#).unwrap(), "wget piped to shell"),
        (Regex::new(r#"mkfifo\s+/tmp/.*\|\s*/bin/(sh|bash)"#).unwrap(), "Named pipe reverse shell"),
        (Regex::new(r#"perl\s+-e\s+.*socket"#).unwrap(), "Perl reverse shell"),
        (Regex::new(r#"ruby\s+-rsocket"#).unwrap(), "Ruby reverse shell"),
    ]
});

pub struct ReverseShell;

impl Rule for ReverseShell {
    fn id(&self) -> &str { "CS-INJ-004" }
    fn name(&self) -> &str { "Reverse Shell / Remote Code Execution" }
    fn severity(&self) -> Severity { Severity::Critical }
    fn category(&self) -> Category { Category::Injection }
    fn description(&self) -> &str { "Reverse shell patterns and remote code execution" }

    fn applies_to(&self, _ctx: &FileContext) -> bool { true }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        check_patterns(self, ctx, &REVERSE_SHELL)
    }
}

// === Helper ===

fn check_patterns(rule: &dyn Rule, ctx: &FileContext, patterns: &[(Regex, &str)]) -> Vec<Finding> {
    let mut findings = Vec::new();
    for (i, line) in ctx.lines.iter().enumerate() {
        let trimmed = line.trim();
        if trimmed.starts_with('#') || trimmed.is_empty() {
            continue;
        }
        for (regex, desc) in patterns {
            if regex.is_match(line) {
                findings.push(rule.make_finding(
                    &ctx.relative_path,
                    i + 1,
                    line,
                    desc,
                    rule.description(),
                    None,
                ));
                break;
            }
        }
    }
    findings
}
