# ClawSafety Open-Core Migration Notes

本文件记录从私有 `clawsafe-platform` 向公开 `clawsafety` 仓库迁移能力时的边界。目标是开源可复用的扫描器、规则思想、公开样本和文档，同时避免把私有平台、部署资产、运营数据或 Git 历史带入公开仓。

## 已迁移

| 内容 | 公开仓落点 | 说明 |
|---|---|---|
| 扫描规则族 | `cli/src/rules/open_core.rs` | 以 Rust 规则重新实现公开检测语义，不复制私有 Astro 后台代码 |
| 多语言扫描入口 | `cli/src/scanner/context.rs`, `cli/src/scanner/file_walker.rs` | 增加 JS/TS/Ruby/PHP 文本文件扫描 |
| 二进制工件检测 | `CS-SC-002` | 在 skill 级别检查常见预编译二进制扩展名 |
| 集成测试 | `cli/tests/open_core_rules.rs` | 覆盖执行、外传、提权、持久化、混淆、二进制工件 |
| 开源许可证 | `LICENSE` | 根目录补齐 Apache-2.0 文本 |

## 不迁移

| 私有内容 | 原因 |
|---|---|
| `web/src/pages/admin/**` | 管理后台、认证、运营界面属于私有平台 |
| `deploy/**`, `docker-compose.yml`, worker 部署脚本 | 暴露部署形态、环境变量和运营方式 |
| `web/.env`, 真实环境配置 | 密钥和私有运行时配置风险 |
| `datasets/**`, `data/**`, `papers/**` | 数据来源、授权、合规和体积风险 |
| 私有仓 Git 历史 | 历史可能包含内部路径、误提交、返工记录或配置痕迹 |

## 新增规则族

| 规则 | 类别 | 检测重点 |
|---|---|---|
| `CS-EXE-001` | CodeExec | subprocess、child_process、shell_exec 等命令执行面 |
| `CS-EXE-002` | CodeExec | eval、Function、compile 等动态代码执行 |
| `CS-EXT-001` | Exfiltration | 外部 HTTP POST |
| `CS-EXT-002` | Exfiltration | DNS/OAST 外传模式 |
| `CS-CRT-001` | Credential | SSH、Keychain、Credential Store、云元数据访问 |
| `CS-FS-001` | Filesystem | 环境文件、shell history、浏览器凭证等敏感文件 |
| `CS-FS-002` | Filesystem | 危险删除和磁盘覆盖 |
| `CS-PRS-001` | Privilege | sudo、su、doas、setuid/setgid |
| `CS-PER-001` | Persistence | cron、systemd、LaunchAgent、shell 启动文件、agent 记忆文件 |
| `CS-OBF-001` | Obfuscation | Base64、字符码、十六进制混淆 |
| `CS-SC-001` | SupplyChain | 不安全 registry、curl-pipe、typosquat 包名 |
| `CS-SC-002` | SupplyChain | 捆绑预编译二进制 |
| `CS-CFG-005` | Config | 诱导 agent 预执行脚本的文案 |

## 发布前检查

```bash
cargo test
cargo run -q -p clawsafety -- rules
git diff --check
rg -n --hidden --glob '!.git/**' --glob '!target/**' --glob '!site/node_modules/**' --glob '!site/.next/**' --glob '!site/out/**' --glob '!samples/**/.git/**' "(sk-ant-[A-Za-z0-9_-]{20,}|sk-proj-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----)" .
git status --short
```

如果后续继续从 `clawsafe-platform` 迁移能力，优先走“白名单复制到临时目录 -> 人工重写到 Rust/公开文档 -> secret/provenance 审计 -> 测试”的流程，不做整目录覆盖。
