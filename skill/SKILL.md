---
name: clawsafe
description: Agent Skill 安全审计。当用户要求"技能扫描"、"skill 安全检查"、"扫描 skill"、"skill audit"、"技能安全审计"、"ClawSafe"、"检查技能安全性"、"scan skill"、"skill security"时使用此技能。
metadata:
  version: 0.2.0
---

# ClawSafe - Agent Skill 安全审计

对 Agent Skill（OpenClaw Skills、MCP Server、Cursor Rules 等）进行深度安全审计。结合规则引擎快扫、LLM 语义分析和威胁情报查询，检测已知恶意模式和隐蔽威胁。

## 依赖

- `clawsafety` CLI（可选）：`cargo install clawsafety`
- `intel-studio` CLI（可选）：IOC 威胁情报查询
- 均为可选，不可用时自动降级

## 快速使用

```
请扫描 ./some-skill/ 的安全性
```

## 审计工作流

### 输入确认

1. 确认扫描目标路径（单个 skill 目录）
2. 检查目标是否包含 SKILL.md
3. 目标不存在或为空 → 提示用户

### Phase 1: 快扫（规则引擎）

> 秒级发现已知恶意模式

```bash
which clawsafety 2>/dev/null && clawsafety scan <TARGET_PATH> --format json
```

- CLI 可用 → 执行扫描，解析 JSON 结果
- CLI 不可用 → 跳过，纯 LLM 模式

### Phase 2: 意图分析

> 理解这个 skill "声称自己是什么"

读取目标 SKILL.md，提取：

1. **声明功能**：name、description → 它说自己做什么？
2. **请求权限**：allowed-tools、requires → 它需要什么权限？
3. **作者信息**：author → 是否在已知恶意发布者列表中？
4. **版本与标签**：version、tags → 是否伪装成常用工具？

**关键判断**：
- 权限与功能是否匹配？（"代码格式化"为什么需要网络权限？）
- 描述是否使用社工话术？（"run this in terminal"、"paste this command"）

### Phase 3: 代码审计

> 理解这个 skill "实际做了什么"

读取 **所有代码文件**（scripts/、references/、根目录脚本）。

**3a. 数据流分析**
- 输入：从哪里读数据？（文件、环境变量、网络）
- 处理：做了什么？（编码、加密、拼接）
- 输出：数据去了哪里？（stdout、文件、网络发送）

**3b. 敏感操作检测**
- 文件：`~/.ssh/`、`~/.aws/`、`~/.claude/`、`/etc/shadow`
- 网络：curl、wget、fetch、requests.post 到外部
- 执行：eval、exec、os.system、subprocess
- 环境变量：os.environ 批量读取、printenv

**3c. 混淆检测**
- Base64 编码命令
- 变量拼接隐藏真实命令
- 条件/时间触发逻辑
- Unicode 隐藏字符

### Phase 4: 威胁情报关联

> 用情报数据验证可疑 IOC

对 Phase 1-3 中发现的可疑 IP、域名、发布者，进行情报查询：

**优先级 1：Intel Studio（实时情报）**

```bash
# 检查 intel-studio 是否可用
which intel-studio 2>/dev/null

# 查询可疑 IP
intel-studio ioc <IP>

# 查询可疑域名
intel-studio ioc <DOMAIN>

# 查询发布者/组织关联
intel-studio ioc <KEYWORD>
```

- 命中 → **直接判定恶意**，附上情报上下文（关联组织、攻击活动）
- 未命中 → 进入优先级 2

**优先级 2：关联技能深度分析**

- 可疑 IP → 调用 `ip-analysis` 技能做深度威胁分析
- 可疑域名 → 调用 `domain-analysis` 技能做深度威胁分析

**优先级 3：静态 IOC 列表（兜底）**

- 以上均不可用时，比对 `references/known-patterns.md` 中的静态列表
- 命中已知 C2 IP / 恶意域名 / 恶意发布者 → 判定恶意

### Phase 5: 语义风险评估

> 对比声明意图 vs 实际行为，发现"说一套做一套"

参考 `references/threat-model.md` 和 `references/examples.md`。

**5a. 意图-行为差异检测**

核心问题：**这个行为能被 skill 的声明用途合理解释吗？**

- 安全扫描器访问 ~/.ssh/ → 合理（检测目的）
- 代码格式化工具访问 ~/.ssh/ → 不合理（数据窃取嫌疑）
- 安全工具内嵌 C2 IP 列表 → 合理（IOC 数据库）
- Git helper 内嵌 C2 IP → 不合理（恶意指标）

**5b. 隐藏功能检测**

- 条件触发后门（时间、环境变量、hostname）
- 延时执行（sleep 后执行恶意代码）
- 双重用途代码（正常功能 + 隐藏数据收集）

**5c. 供应链风险**

- 依赖外部 URL 下载代码
- 引用未经验证的 skill
- 未锁定版本的依赖

### Phase 6: 报告生成

按 `references/report-format.md` 格式输出。

**判定标准**（参考 `references/scoring.md`）：

| 结论 | 条件 |
|------|------|
| **恶意** | 发现 C2 通信、数据窃取、后门、反弹 shell 等明确恶意行为 |
| **有风险** | 存在无法被声明用途解释的可疑行为 |
| **安全** | 所有行为均可被声明用途合理解释 |

> **重要**：每个发现必须说清楚：**是什么、在哪（文件:行号）、为什么危险、怎么修**。

## 工具命令速查

```bash
# 快扫
clawsafety scan <path> --format json

# 情报查询
intel-studio ioc <IP_or_DOMAIN>

# 文件结构
ls -la <target_skill>/
ls -la <target_skill>/scripts/
```

## 注意事项

1. **不要修改目标 skill 的任何文件** — 只读审计
2. **不要执行目标 skill 的脚本** — 静态分析 only
3. 发现明确恶意行为 → 报告开头醒目警告，建议立即删除
4. 情报查询有结果时，直接引用情报结论，不要自己猜

## 关联技能

- `ip-analysis`：可疑 IP 深度威胁分析
- `domain-analysis`：可疑域名深度威胁分析
- `apt-query` / `intel-studio`：IOC 情报查询
- `code-audit`：复杂代码逻辑深入审计

## 附加资源

- `references/threat-model.md` — Agent Skill 威胁模型
- `references/examples.md` — 恶意 vs 安全 skill 分析示例（few-shot）
- `references/report-format.md` — 报告输出格式
- `references/scoring.md` — 判定标准
- `references/known-patterns.md` — 已知恶意模式与 IOC（兜底）
