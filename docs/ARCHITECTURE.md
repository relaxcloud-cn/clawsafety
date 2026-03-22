# ClawSafety - Technical Architecture

## 系统架构

```
+------------------------------------------------------------------+
|                        ClawSafety SaaS                           |
|                                                                  |
|  +------------+    +-------------+    +----------------------+   |
|  | Web UI     |    | GitHub App  |    | API Server           |   |
|  | (Next.js)  |--->| (Webhook)   |--->| (Axum)               |   |
|  +------------+    +-------------+    +----------+-----------+   |
|                                                  |               |
|                                       +----------v-----------+   |
|                                       | Scan Orchestrator    |   |
|                                       +----------+-----------+   |
|                                                  |               |
|                                       +----------v-----------+   |
|                                       | Scan Engine (Rust)   |   |
|                                       | +------------------+ |   |
|                                       | | Rule Engine      | |   |
|                                       | | Pattern Matcher  | |   |
|                                       | | Dep Analyzer     | |   |
|                                       | | Score Calculator | |   |
|                                       | +------------------+ |   |
|                                       +----------+-----------+   |
|                                                  |               |
|                                       +----------v-----------+   |
|                                       | Report Generator     |   |
|                                       | (Terminal/JSON/SARIF) |   |
|                                       +----------------------+   |
|                                                                  |
|  +------------+    +-------------+                               |
|  | PostgreSQL |    | Redis       |                               |
|  | (扫描记录)  |    | (任务队列)   |                               |
|  +------------+    +-------------+                               |
+------------------------------------------------------------------+
```

---

## 1. 核心组件

### 1.1 Scan Engine (MVP 核心)

扫描引擎是 ClawSafety 的核心，Rust 实现，同时作为 CLI 工具和 SaaS 后端的扫描模块。

```
clawsafety/
├── src/
│   ├── main.rs              # CLI 入口
│   ├── lib.rs               # 库入口（SaaS 复用）
│   ├── scanner/
│   │   ├── mod.rs            # Scanner trait + orchestrator
│   │   ├── skill_parser.rs   # 解析 SKILL.md 结构
│   │   ├── file_walker.rs    # 遍历 skill 目录
│   │   └── context.rs        # 扫描上下文（文件类型、语言检测）
│   ├── rules/
│   │   ├── mod.rs            # Rule trait + registry
│   │   ├── injection.rs      # CS-INJ-* 规则
│   │   ├── secrets.rs        # CS-SEC-* 规则
│   │   ├── dependencies.rs   # CS-DEP-* 规则
│   │   ├── permissions.rs    # CS-PRM-* 规则
│   │   └── config.rs         # CS-CFG-* 规则
│   ├── reporter/
│   │   ├── mod.rs            # Reporter trait
│   │   ├── terminal.rs       # 彩色终端输出
│   │   ├── json.rs           # JSON 报告
│   │   └── sarif.rs          # SARIF 格式（GitHub Code Scanning 兼容）
│   └── scoring/
│       └── mod.rs            # 评分计算
├── rules/                    # 外部规则定义 (YAML)
│   ├── injection.yaml
│   ├── secrets.yaml
│   ├── dependencies.yaml
│   ├── permissions.yaml
│   └── config.yaml
├── tests/
│   ├── fixtures/             # 测试用 skill 样本
│   │   ├── clean_skill/      # 无问题的 skill
│   │   ├── vulnerable_skill/ # 有各类问题的 skill
│   │   └── malicious_skill/  # 恶意 skill
│   └── integration/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── SCAN_RULES.md
│   └── ROADMAP.md
└── Cargo.toml
```

### 1.2 Rule Engine 设计

```rust
/// 扫描规则 trait
pub trait Rule: Send + Sync {
    fn id(&self) -> &str;
    fn name(&self) -> &str;
    fn severity(&self) -> Severity;
    fn category(&self) -> Category;

    /// 对单个文件执行检查
    fn check_file(&self, ctx: &FileContext) -> Vec<Finding>;

    /// 对整个 skill 目录执行检查（用于跨文件分析）
    fn check_skill(&self, ctx: &SkillContext) -> Vec<Finding> {
        vec![] // 默认不做 skill 级检查
    }
}

/// 扫描发现
pub struct Finding {
    pub rule_id: String,
    pub severity: Severity,
    pub message: String,
    pub file: PathBuf,
    pub line: usize,
    pub column: usize,
    pub snippet: String,         // 问题代码片段
    pub fix_suggestion: String,  // 修复建议
    pub cwe: Option<String>,     // CWE 编号
}

/// 严重性等级
pub enum Severity {
    Critical,
    High,
    Medium,
    Low,
    Info,
}

/// 规则类别
pub enum Category {
    Injection,
    Secrets,
    Dependencies,
    Permissions,
    Config,
}
```

### 1.3 Pattern Matcher

基于正则的快速匹配器，支持多语言感知：

```rust
pub struct PatternRule {
    pub id: String,
    pub severity: Severity,
    pub patterns: Vec<Pattern>,
}

pub struct Pattern {
    pub regex: Regex,
    pub language: Option<Language>,  // bash, python, yaml, markdown
    pub description: String,
    pub fix_suggestion: String,
}
```

MVP 阶段以正则匹配为主，后续版本引入 tree-sitter AST 分析提高准确率。

---

## 2. CLI 接口设计

### 2.1 基本用法

```bash
# 扫描当前目录
clawsafety scan .

# 扫描指定 skill
clawsafety scan /path/to/my-skill/

# 指定输出格式
clawsafety scan . --format json
clawsafety scan . --format sarif

# 仅检查特定类别
clawsafety scan . --category injection,secrets

# 设置最低严重性
clawsafety scan . --min-severity high

# 输出到文件
clawsafety scan . --output report.json --format json

# 批量扫描（扫描目录下所有 skill）
clawsafety scan-all /path/to/skills/

# 查看规则列表
clawsafety rules list

# 查看规则详情
clawsafety rules show CS-INJ-001
```

### 2.2 终端输出示例

```
  ClawSafety v0.1.0 - Agent Skill Security Scanner

  Scanning: /path/to/url-analysis/
  Files scanned: 12
  Rules applied: 20

  CRITICAL  CS-SEC-002  Hardcoded API Key detected
            scripts/url_analyze.py:45
            > api_key = "sk-proj-abc123..."
            Fix: Use environment variable instead

  HIGH      CS-INJ-001  Shell command injection
            scripts/check_redirect.sh:23
            > curl -L "$URL" | grep $PATTERN
            Fix: Quote variables and use -- to end options

  MEDIUM    CS-DEP-002  Unpinned dependency version
            skill.yaml:8
            > requests>=2.0
            Fix: Pin to exact version (requests==2.31.0)

  ─────────────────────────────────────
  Score: 52/100 (D)
  Critical: 1 | High: 1 | Medium: 1 | Low: 0
  ─────────────────────────────────────
```

---

## 3. 技术选型

| 组件 | 选型 | 理由 |
|------|------|------|
| **扫描引擎** | Rust | 性能、安全、CLI 分发便捷 |
| **正则引擎** | `regex` crate | Rust 生态最成熟 |
| **CLI 框架** | `clap` | Rust CLI 标准 |
| **终端输出** | `colored` + `indicatif` | 彩色 + 进度条 |
| **YAML 解析** | `serde_yaml` | 规则定义解析 |
| **SARIF 输出** | 自定义 serde 序列化 | GitHub Code Scanning 兼容 |
| **Web 前端** | Next.js 15 | 与 yisec-website 同技术栈 |
| **API 服务** | Axum | Rust 异步 Web 框架 |
| **数据库** | PostgreSQL | SaaS 标配 |
| **任务队列** | Redis + Tokio | 异步扫描任务 |
| **部署** | Cloudflare Pages + Workers | 与现有基础设施一致 |

---

## 4. GitHub 集成方案

### 4.1 GitHub App

```
用户安装 ClawSafety GitHub App
        ↓
App 获取仓库访问权限
        ↓
配置 Webhook (push, pull_request)
        ↓
每次 push/PR → Webhook 触发
        ↓
API Server 接收 → 克隆仓库 → 执行扫描
        ↓
结果写入：
  - PR Comment（扫描摘要）
  - Check Run（SARIF 格式，集成 GitHub Code Scanning）
  - Dashboard（历史记录）
```

### 4.2 PR Comment 格式

```markdown
## ClawSafety Scan Report

**Score: B (78/100)**

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 1 |
| Medium   | 2 |
| Low      | 1 |

### Findings

| Rule | Severity | File | Line | Description |
|------|----------|------|------|-------------|
| CS-INJ-001 | High | scripts/scan.sh | 23 | Shell command injection |
| CS-DEP-002 | Medium | skill.yaml | 8 | Unpinned dependency |
| CS-DEP-002 | Medium | skill.yaml | 12 | Unpinned dependency |
| CS-CFG-002 | Low | SKILL.md | - | Missing version |

[View full report](https://clawsafety.dev/reports/xxx)
```

---

## 5. 数据模型

### 5.1 核心表

```sql
-- 用户
CREATE TABLE users (
    id          UUID PRIMARY KEY,
    github_id   BIGINT UNIQUE NOT NULL,
    username    VARCHAR(255) NOT NULL,
    email       VARCHAR(255),
    plan        VARCHAR(20) DEFAULT 'free',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 仓库
CREATE TABLE repositories (
    id          UUID PRIMARY KEY,
    user_id     UUID REFERENCES users(id),
    github_repo VARCHAR(255) NOT NULL,  -- "owner/repo"
    default_branch VARCHAR(100) DEFAULT 'main',
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 扫描记录
CREATE TABLE scans (
    id          UUID PRIMARY KEY,
    repo_id     UUID REFERENCES repositories(id),
    commit_sha  VARCHAR(40),
    branch      VARCHAR(255),
    trigger     VARCHAR(20),  -- 'push', 'pr', 'manual', 'cli'
    score       INT,
    grade       CHAR(1),
    status      VARCHAR(20),  -- 'pending', 'running', 'completed', 'failed'
    started_at  TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 扫描发现
CREATE TABLE findings (
    id          UUID PRIMARY KEY,
    scan_id     UUID REFERENCES scans(id),
    rule_id     VARCHAR(20) NOT NULL,
    severity    VARCHAR(10) NOT NULL,
    message     TEXT NOT NULL,
    file_path   VARCHAR(500),
    line_number INT,
    snippet     TEXT,
    fix_suggestion TEXT,
    cwe         VARCHAR(20),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. MVP 开发阶段

### Phase 1: CLI 扫描器 (v0.1) — 2 周

**Week 1:**
- 项目骨架（Cargo workspace、CLI 参数解析）
- Rule trait + PatternRule 实现
- 实现 INJ 类规则（4 条）
- 实现 SEC 类规则（4 条）
- Terminal reporter

**Week 2:**
- 实现 DEP 类规则（4 条）
- 实现 PRM 类规则（4 条）
- 实现 CFG 类规则（4 条）
- 评分计算
- JSON/SARIF reporter
- 测试 + 文档 + 发布

### Phase 2: GitHub 集成 (v0.2) — 3 周

- GitHub App 注册和 OAuth
- Webhook 处理（push, pull_request）
- 异步扫描任务队列
- PR Comment 报告
- Web Dashboard（扫描历史、评分趋势）
- Badge 生成

### Phase 3: 自动修复 (v0.3) — 2 周

- 修复代码生成（LLM 辅助）
- 自动创建修复 PR
- URL 即时扫描（无需登录）
- ClawHub 全量扫描

---

## 7. 分发方式

| 渠道 | 方式 | 用户 |
|------|------|------|
| **cargo install** | `cargo install clawsafety` | Rust 开发者 |
| **Homebrew** | `brew install clawsafety` | macOS 用户 |
| **GitHub Release** | 预编译二进制 (Linux/macOS/Windows) | 所有用户 |
| **Docker** | `docker run clawsafety scan .` | CI/CD |
| **GitHub Action** | `uses: clawsafety/scan-action@v1` | GitHub 用户 |
| **SaaS** | clawsafety.dev | Web 用户 |
