use regex::Regex;
use std::sync::LazyLock;
use walkdir::WalkDir;

use crate::rules::{Category, Finding, Rule, Severity};
use crate::scanner::{FileContext, Language, SkillContext};

type Pattern = (Regex, &'static str, Option<&'static str>);

// === CS-EXE-001: Command Execution Surface ===

static COMMAND_EXECUTION: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"\bsubprocess\.(call|run|Popen|check_output)\b"#).unwrap(),
            "Python subprocess execution",
            Some("CWE-78"),
        ),
        (
            Regex::new(r#"\bos\.(system|popen|exec[lv]?p?)\b"#).unwrap(),
            "Python OS command execution",
            Some("CWE-78"),
        ),
        (
            Regex::new(r#"\bchild_process\.(exec|spawn|execFile|fork)\b"#).unwrap(),
            "Node.js child_process execution",
            Some("CWE-78"),
        ),
        (
            Regex::new(r#"\b(exec|execSync|spawnSync)\s*\("#).unwrap(),
            "Direct process execution call",
            Some("CWE-78"),
        ),
        (
            Regex::new(r#"\bshell_exec\s*\("#).unwrap(),
            "PHP shell_exec call",
            Some("CWE-78"),
        ),
    ]
});

pub struct CommandExecutionSurface;

impl Rule for CommandExecutionSurface {
    fn id(&self) -> &str {
        "CS-EXE-001"
    }
    fn name(&self) -> &str {
        "Command Execution Surface"
    }
    fn severity(&self) -> Severity {
        Severity::High
    }
    fn category(&self) -> Category {
        Category::CodeExecution
    }
    fn description(&self) -> &str {
        "Direct shell or process execution in skill code"
    }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.is_script()
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &COMMAND_EXECUTION,
            "Avoid shell/process execution. Prefer safe library APIs or sandboxed execution.",
        )
    }
}

// === CS-EXE-002: Dynamic Code Evaluation ===

static DYNAMIC_EVAL: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"\beval\s*\("#).unwrap(),
            "eval() dynamic code execution",
            Some("CWE-95"),
        ),
        (
            Regex::new(r#"\bFunction\s*\("#).unwrap(),
            "JavaScript Function constructor",
            Some("CWE-95"),
        ),
        (
            Regex::new(r#"\bcompile\s*\("#).unwrap(),
            "compile() dynamic code compilation",
            Some("CWE-95"),
        ),
        (
            Regex::new(r#"new\s+Function\s*\("#).unwrap(),
            "new Function() dynamic code execution",
            Some("CWE-95"),
        ),
    ]
});

pub struct DynamicCodeEvaluation;

impl Rule for DynamicCodeEvaluation {
    fn id(&self) -> &str {
        "CS-EXE-002"
    }
    fn name(&self) -> &str {
        "Dynamic Code Evaluation"
    }
    fn severity(&self) -> Severity {
        Severity::High
    }
    fn category(&self) -> Category {
        Category::CodeExecution
    }
    fn description(&self) -> &str {
        "eval/Function/compile style dynamic code execution"
    }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.is_script()
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &DYNAMIC_EVAL,
            "Parse data with safe parsers instead of evaluating code strings.",
        )
    }
}

// === CS-EXT-001: Outbound Data POST ===

static OUTBOUND_POST: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"fetch\s*\(\s*['"`]https?://[^'"`]+['"`]\s*,\s*\{[^}]*method\s*:\s*['"`]POST['"`]"#).unwrap(),
            "fetch() HTTP POST to external endpoint",
            Some("CWE-201"),
        ),
        (
            Regex::new(r#"requests\.post\s*\("#).unwrap(),
            "Python requests.post() call",
            Some("CWE-201"),
        ),
        (
            Regex::new(r#"axios\.post\s*\("#).unwrap(),
            "axios.post() call",
            Some("CWE-201"),
        ),
        (
            Regex::new(r#"\bcurl\s+.*-X\s*POST\b"#).unwrap(),
            "curl HTTP POST",
            Some("CWE-201"),
        ),
        (
            Regex::new(r#"\bwget\s+--post"#).unwrap(),
            "wget HTTP POST",
            Some("CWE-201"),
        ),
    ]
});

pub struct OutboundDataPost;

impl Rule for OutboundDataPost {
    fn id(&self) -> &str {
        "CS-EXT-001"
    }
    fn name(&self) -> &str {
        "Outbound Data POST"
    }
    fn severity(&self) -> Severity {
        Severity::High
    }
    fn category(&self) -> Category {
        Category::DataExfiltration
    }
    fn description(&self) -> &str {
        "Outbound POST requests that can exfiltrate skill data"
    }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.is_script()
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &OUTBOUND_POST,
            "Document the destination and data contract, or keep analysis data local.",
        )
    }
}

// === CS-EXT-002: DNS Exfiltration Pattern ===

static DNS_EXFIL: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"\b(nslookup|dig)\b.*\$\("#).unwrap(),
            "Shell substitution inside DNS lookup",
            Some("CWE-201"),
        ),
        (
            Regex::new(r#"\.(burpcollaborator\.net|oastify\.com|interact\.sh)\b"#).unwrap(),
            "Known OAST/DNS exfiltration domain",
            Some("CWE-201"),
        ),
    ]
});

pub struct DnsExfiltration;

impl Rule for DnsExfiltration {
    fn id(&self) -> &str {
        "CS-EXT-002"
    }
    fn name(&self) -> &str {
        "DNS Exfiltration Pattern"
    }
    fn severity(&self) -> Severity {
        Severity::High
    }
    fn category(&self) -> Category {
        Category::DataExfiltration
    }
    fn description(&self) -> &str {
        "DNS-based exfiltration or OAST endpoint usage"
    }

    fn applies_to(&self, _ctx: &FileContext) -> bool {
        true
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &DNS_EXFIL,
            "Remove DNS exfiltration patterns and external interaction endpoints.",
        )
    }
}

// === CS-CRT-001: Credential Store Access ===

static CREDENTIAL_ACCESS: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"~/\.ssh/(id_rsa|id_ed25519|id_ecdsa|authorized_keys|known_hosts)"#)
                .unwrap(),
            "SSH key or trust-store access",
            Some("CWE-522"),
        ),
        (
            Regex::new(r#"\.ssh[/\\](id_rsa|id_ed25519|config|authorized_keys)"#).unwrap(),
            "SSH credential path access",
            Some("CWE-522"),
        ),
        (
            Regex::new(r#"\bsecurity\s+find-(generic|internet)-password\b"#).unwrap(),
            "macOS Keychain password extraction",
            Some("CWE-522"),
        ),
        (
            Regex::new(r#"\b(keychain|credential[_-]?store|login\.keychain)\b"#).unwrap(),
            "Credential store reference",
            Some("CWE-522"),
        ),
        (
            Regex::new(r#"\b(169\.254\.169\.254|metadata\.google\.internal|100\.100\.100\.200)\b"#)
                .unwrap(),
            "Cloud instance metadata endpoint access",
            Some("CWE-200"),
        ),
    ]
});

pub struct CredentialStoreAccess;

impl Rule for CredentialStoreAccess {
    fn id(&self) -> &str {
        "CS-CRT-001"
    }
    fn name(&self) -> &str {
        "Credential Store Access"
    }
    fn severity(&self) -> Severity {
        Severity::Critical
    }
    fn category(&self) -> Category {
        Category::CredentialTheft
    }
    fn description(&self) -> &str {
        "Attempts to access credential stores, SSH keys, or cloud metadata"
    }

    fn applies_to(&self, _ctx: &FileContext) -> bool {
        true
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &CREDENTIAL_ACCESS,
            "Skills should not read credential stores or cloud metadata endpoints.",
        )
    }
}

// === CS-FS-001: Sensitive File Access ===

static SENSITIVE_FILES: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"/etc/(passwd|shadow|sudoers)"#).unwrap(),
            "Sensitive system file access",
            Some("CWE-552"),
        ),
        (
            Regex::new(r#"~/\.(bash_history|zsh_history|bash_profile|bashrc|zshrc|gitconfig)"#)
                .unwrap(),
            "Shell history or user configuration access",
            Some("CWE-552"),
        ),
        (
            Regex::new(r#"\.(env|env\.local|env\.production)\b"#).unwrap(),
            "Environment file access",
            Some("CWE-552"),
        ),
        (
            Regex::new(r#"\b(Login Data|Cookies\.sqlite|profiles\.ini)\b"#).unwrap(),
            "Browser credential or profile file access",
            Some("CWE-522"),
        ),
        (
            Regex::new(r#"\bwp-config\.php\b"#).unwrap(),
            "Application secret-bearing config access",
            Some("CWE-552"),
        ),
    ]
});

pub struct SensitiveFileAccess;

impl Rule for SensitiveFileAccess {
    fn id(&self) -> &str {
        "CS-FS-001"
    }
    fn name(&self) -> &str {
        "Sensitive File Access"
    }
    fn severity(&self) -> Severity {
        Severity::High
    }
    fn category(&self) -> Category {
        Category::Filesystem
    }
    fn description(&self) -> &str {
        "Reads or references sensitive system, browser, or env files"
    }

    fn applies_to(&self, _ctx: &FileContext) -> bool {
        true
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &SENSITIVE_FILES,
            "Read only declared inputs and avoid secrets, shell history, and browser data.",
        )
    }
}

// === CS-FS-002: Destructive File Operation ===

static DESTRUCTIVE_FILE_OPS: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"\brm\s+(?:-[rRfv]+\s+)*(?:/|~/|~\s|\$HOME)"#).unwrap(),
            "Dangerous recursive deletion",
            Some("CWE-732"),
        ),
        (
            Regex::new(r#"\bdd\s+.*\bof=/dev/(sd[a-z]|hd[a-z]|nvme\d)"#).unwrap(),
            "Raw disk overwrite",
            Some("CWE-732"),
        ),
        (
            Regex::new(r#"\bshred\s+.*(?:/|~/|\$HOME)"#).unwrap(),
            "Destructive shred operation",
            Some("CWE-732"),
        ),
    ]
});

pub struct DestructiveFileOperation;

impl Rule for DestructiveFileOperation {
    fn id(&self) -> &str {
        "CS-FS-002"
    }
    fn name(&self) -> &str {
        "Destructive File Operation"
    }
    fn severity(&self) -> Severity {
        Severity::Critical
    }
    fn category(&self) -> Category {
        Category::Filesystem
    }
    fn description(&self) -> &str {
        "Dangerous deletion or disk overwrite operations"
    }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.is_script()
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &DESTRUCTIVE_FILE_OPS,
            "Remove destructive filesystem operations from skills.",
        )
    }
}

// === CS-PRS-001: Privilege Escalation ===

static PRIVILEGE_ESCALATION: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"\b(sudo|doas)\s+"#).unwrap(),
            "Elevated command execution",
            Some("CWE-250"),
        ),
        (
            Regex::new(r#"\bsu\s+(-\s*)?root\b|\bsu\s+-\s"#).unwrap(),
            "Root shell escalation",
            Some("CWE-250"),
        ),
        (
            Regex::new(r#"\bchmod\s+([ug]\+s|4[0-7]{3})\b"#).unwrap(),
            "setuid/setgid permission change",
            Some("CWE-732"),
        ),
        (
            Regex::new(r#"\b(setuid|setgid)\b"#).unwrap(),
            "setuid/setgid API usage",
            Some("CWE-250"),
        ),
    ]
});

pub struct PrivilegeEscalation;

impl Rule for PrivilegeEscalation {
    fn id(&self) -> &str {
        "CS-PRS-001"
    }
    fn name(&self) -> &str {
        "Privilege Escalation"
    }
    fn severity(&self) -> Severity {
        Severity::Critical
    }
    fn category(&self) -> Category {
        Category::PrivilegeEscalation
    }
    fn description(&self) -> &str {
        "sudo/su/doas/setuid privilege escalation patterns"
    }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.is_script()
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &PRIVILEGE_ESCALATION,
            "Skills should run with least privilege and never require root escalation.",
        )
    }
}

// === CS-PER-001: Persistence Mechanism ===

static PERSISTENCE: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"\bcrontab\b|/etc/cron\.(d|daily|hourly|weekly)"#).unwrap(),
            "Cron persistence",
            Some("CWE-912"),
        ),
        (
            Regex::new(r#"/Library/Launch(Agents|Daemons)/"#).unwrap(),
            "macOS LaunchAgent/LaunchDaemon persistence",
            Some("CWE-912"),
        ),
        (
            Regex::new(r#"\bsystemctl\s+(enable|start)\b"#).unwrap(),
            "systemd service persistence",
            Some("CWE-912"),
        ),
        (
            Regex::new(r#">>\s*~/\.(bashrc|zshrc|profile|bash_profile)"#).unwrap(),
            "Shell startup file modification",
            Some("CWE-912"),
        ),
        (
            Regex::new(r#">>?\s*(MEMORY\.md|CLAUDE\.md|\.cursorrules|\.windsurfrules)"#).unwrap(),
            "Agent instruction or memory file modification",
            Some("CWE-912"),
        ),
    ]
});

pub struct PersistenceMechanism;

impl Rule for PersistenceMechanism {
    fn id(&self) -> &str {
        "CS-PER-001"
    }
    fn name(&self) -> &str {
        "Persistence Mechanism"
    }
    fn severity(&self) -> Severity {
        Severity::High
    }
    fn category(&self) -> Category {
        Category::Persistence
    }
    fn description(&self) -> &str {
        "Cron, startup, service, or agent-memory persistence"
    }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        ctx.is_script()
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &PERSISTENCE,
            "Remove persistence behavior; skills should not survive beyond the task.",
        )
    }
}

// === CS-OBF-001: Obfuscated Payload ===

static OBFUSCATED_PAYLOAD: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"\batob\s*\(\s*['"`][A-Za-z0-9+/=]{20,}['"`]\s*\)"#).unwrap(),
            "JavaScript Base64 decode",
            Some("CWE-506"),
        ),
        (
            Regex::new(r#"base64\s*(-d|--decode|\.b64decode)\b"#).unwrap(),
            "Base64 decode before execution",
            Some("CWE-506"),
        ),
        (
            Regex::new(
                r#"Buffer\.from\s*\(\s*['"`][A-Za-z0-9+/=]{20,}['"`]\s*,\s*['"`]base64['"`]\s*\)"#,
            )
            .unwrap(),
            "Node.js Base64 decode",
            Some("CWE-506"),
        ),
        (
            Regex::new(r#"echo\s+[A-Za-z0-9+/=]{30,}\s*\|\s*base64\s+-d"#).unwrap(),
            "Encoded shell payload",
            Some("CWE-506"),
        ),
        (
            Regex::new(r#"String\.fromCharCode\s*\(\s*\d+(\s*,\s*\d+){5,}"#).unwrap(),
            "Character-code string obfuscation",
            Some("CWE-506"),
        ),
        (
            Regex::new(r#"\\x[0-9a-fA-F]{2}(\\x[0-9a-fA-F]{2}){5,}"#).unwrap(),
            "Hex-escaped payload",
            Some("CWE-506"),
        ),
    ]
});

pub struct ObfuscatedPayload;

impl Rule for ObfuscatedPayload {
    fn id(&self) -> &str {
        "CS-OBF-001"
    }
    fn name(&self) -> &str {
        "Obfuscated Payload"
    }
    fn severity(&self) -> Severity {
        Severity::Medium
    }
    fn category(&self) -> Category {
        Category::Obfuscation
    }
    fn description(&self) -> &str {
        "Base64, character-code, or hex escaped payloads"
    }

    fn applies_to(&self, _ctx: &FileContext) -> bool {
        true
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &OBFUSCATED_PAYLOAD,
            "Keep skill logic readable. Avoid encoded executable content.",
        )
    }
}

// === CS-SC-001: Suspicious Package Install ===

static SUSPICIOUS_PACKAGE_INSTALL: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"pip\s+install\s+--index-url\s+http://"#).unwrap(),
            "pip install from insecure custom index",
            Some("CWE-829"),
        ),
        (
            Regex::new(r#"pip\s+install\s+--extra-index-url"#).unwrap(),
            "pip install with extra package index",
            Some("CWE-829"),
        ),
        (
            Regex::new(r#"npm\s+install\s+--registry\s+http://"#).unwrap(),
            "npm install from insecure registry",
            Some("CWE-829"),
        ),
        (
            Regex::new(r#"(curl|wget)\s+.*\|\s*(bash|sh|python)"#).unwrap(),
            "Remote script piped into interpreter",
            Some("CWE-494"),
        ),
        (
            Regex::new(r#"\b(import|require\s*\(\s*['"`])(requets|reqeusts|requsts|loddash|axois|expres)\b"#).unwrap(),
            "Common typosquatting package name",
            Some("CWE-829"),
        ),
    ]
});

pub struct SuspiciousPackageInstall;

impl Rule for SuspiciousPackageInstall {
    fn id(&self) -> &str {
        "CS-SC-001"
    }
    fn name(&self) -> &str {
        "Suspicious Package Install"
    }
    fn severity(&self) -> Severity {
        Severity::High
    }
    fn category(&self) -> Category {
        Category::SupplyChain
    }
    fn description(&self) -> &str {
        "Insecure registries, curl-pipe execution, or typo package names"
    }

    fn applies_to(&self, _ctx: &FileContext) -> bool {
        true
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &SUSPICIOUS_PACKAGE_INSTALL,
            "Use trusted registries, pin dependencies, and verify downloaded scripts.",
        )
    }
}

// === CS-SC-002: Bundled Binary ===

const BINARY_EXTENSIONS: &[&str] = &[
    "exe", "dll", "so", "dylib", "bin", "elf", "o", "a", "ko", "sys", "drv", "deb", "rpm", "msi",
    "pkg", "pyc", "pyo", "pyd",
];

pub struct BundledBinary;

impl Rule for BundledBinary {
    fn id(&self) -> &str {
        "CS-SC-002"
    }
    fn name(&self) -> &str {
        "Bundled Binary Artifact"
    }
    fn severity(&self) -> Severity {
        Severity::High
    }
    fn category(&self) -> Category {
        Category::SupplyChain
    }
    fn description(&self) -> &str {
        "Precompiled binary artifacts bundled in a skill"
    }

    fn applies_to(&self, _ctx: &FileContext) -> bool {
        false
    }
    fn check_file(&self, _ctx: &FileContext) -> Vec<Finding> {
        vec![]
    }

    fn check_skill(&self, ctx: &SkillContext) -> Vec<Finding> {
        let mut findings = Vec::new();
        for entry in WalkDir::new(&ctx.root)
            .into_iter()
            .filter_entry(|e| {
                let name = e.file_name().to_string_lossy();
                name != ".git" && name != "node_modules" && name != "target"
            })
            .filter_map(Result::ok)
        {
            if !entry.file_type().is_file() {
                continue;
            }
            let Some(ext) = entry.path().extension().and_then(|e| e.to_str()) else {
                continue;
            };
            if !BINARY_EXTENSIONS.contains(&ext.to_ascii_lowercase().as_str()) {
                continue;
            }
            let relative = entry
                .path()
                .strip_prefix(&ctx.root)
                .unwrap_or(entry.path())
                .to_string_lossy()
                .to_string();
            findings.push(self.make_finding(
                &relative,
                0,
                "",
                "Skill bundles a precompiled binary artifact",
                "Publish source, document provenance, or verify binary signatures and hashes.",
                Some("CWE-494"),
            ));
        }
        findings
    }
}

// === CS-CFG-005: Inducement Language ===

static INDUCEMENT: LazyLock<Vec<Pattern>> = LazyLock::new(|| {
    vec![
        (
            Regex::new(r#"(?i)before\s+(using|running|proceeding)[,\s]+(run|execute|source)\b"#).unwrap(),
            "Instruction to run code before using the skill",
            Some("CWE-74"),
        ),
        (
            Regex::new(r#"(?i)for\s+(the\s+)?(tool|this\s+skill|it)\s+to\s+(work|function|operate)\b"#).unwrap(),
            "Frames execution as required for the skill to work",
            Some("CWE-74"),
        ),
        (
            Regex::new(r#"(?i)(setup|initialization|configuration|install(?:ation)?)\s+step\s+is\s+(required|necessary|mandatory)\b"#).unwrap(),
            "Required setup step framing",
            Some("CWE-74"),
        ),
        (
            Regex::new(r#"(?i)run\s+the\s+(included|bundled|provided|attached)\s+(script|setup|installer|helper)\b"#).unwrap(),
            "Explicit instruction to run a bundled script",
            Some("CWE-74"),
        ),
        (
            Regex::new(r#"(?i)must\s+(be\s+)?(run|executed?|sourced?)\s+(before|first|prior)\b"#).unwrap(),
            "Mandatory pre-execution instruction",
            Some("CWE-74"),
        ),
    ]
});

pub struct InducementLanguage;

impl Rule for InducementLanguage {
    fn id(&self) -> &str {
        "CS-CFG-005"
    }
    fn name(&self) -> &str {
        "Inducement Language"
    }
    fn severity(&self) -> Severity {
        Severity::Medium
    }
    fn category(&self) -> Category {
        Category::Config
    }
    fn description(&self) -> &str {
        "Prompt text that pressures the agent into running bundled code"
    }

    fn applies_to(&self, ctx: &FileContext) -> bool {
        matches!(
            ctx.language,
            Language::Markdown | Language::Yaml | Language::Json
        )
    }

    fn check_file(&self, ctx: &FileContext) -> Vec<Finding> {
        scan_line_patterns(
            self,
            ctx,
            &INDUCEMENT,
            "Rewrite instructions so setup is explicit, optional, and permission-scoped.",
        )
    }
}

fn scan_line_patterns(
    rule: &dyn Rule,
    ctx: &FileContext,
    patterns: &[Pattern],
    fix: &str,
) -> Vec<Finding> {
    let mut findings = Vec::new();
    for (i, line) in ctx.lines.iter().enumerate() {
        let trimmed = line.trim();
        if is_ignorable_line(trimmed) {
            continue;
        }
        for (regex, desc, cwe) in patterns {
            if regex.is_match(line) {
                findings.push(rule.make_finding(&ctx.relative_path, i + 1, line, desc, fix, *cwe));
                break;
            }
        }
    }
    findings
}

fn is_ignorable_line(trimmed: &str) -> bool {
    trimmed.is_empty() || trimmed.starts_with('#') || trimmed.starts_with("//")
}
