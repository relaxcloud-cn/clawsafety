# ClawSafe 竞品分析报告

**更新时间**: 2026-03-23

---

## 一、市场概况

AI Agent Skill 安全扫描是 2026 年新兴赛道。ClawHavoc 事件（2026.01，341 个恶意 Skill）引爆市场关注，多家安全厂商在 2-3 月集中入场。

**市场数据**：
- 全球四大平台 Skill 总量逼近 75 万，日增 2.1 万
- 学术研究：26.1% 的 Skill 含安全漏洞（14 种攻击模式）
- Snyk 研究：36% 的 Skill 存在安全缺陷
- 全球 20,471 个 OpenClaw 实例可能存在漏洞

---

## 二、核心竞品

### 1. 奇安信 SafeSkill

**官网**: safeskill.qianxin.com / safeskill.cn

**背景**: 2026.03.16 发布，随"龙虾安全伴侣"（政企版 OpenClaw 安全方案）一同推出。国内首个开放式 Skill 安全性鉴定平台。

**产品形态**:
- **SafeSkill 扫描平台** (safeskill.qianxin.com)：在线扫描，多源实时监测全球主流社区
- **SafeSkill Hub** (safeskill.cn)：经安全验证的 Skill 精选市场，一键安装到 Cursor/Claude/VS Code
- **龙虾安全伴侣**：企业级"端-网-云"三层联动防护

**技术架构（四层检测）**:
1. 输入层：文件上传（zip）、URL、名称搜索导入
2. 静态分析：Yara/YAML 规则、AST 解析、本地 SLM 意图检测
3. 深度分析：LLM 驱动（**GPT-5.2**）、威胁情报关联、沙箱执行
4. 综合判定：多维度加权评分 → 信任分（0-100）

**检测维度（实际扫描页面验证）**:
- **大模型意图分析**：用 GPT-5.2 对比"声明意图 vs 实际行为"，输出意图一致性百分比（阈值 80%）
- **异常检测**：代码混淆（Base64）、远程代码执行（curl|bash）、网络风险（裸 IP 访问）、供应链风险（密码保护 ZIP）
- **URL 检测**：提取外链并逐一分析威胁
- **子文件检测**：对 Skill 包内文件逐一扫描
- **综合判定**：多维度汇总 → 恶意/安全

**扫描时间线示例（实际截图）**:
```
21:29:14  输入 - Skill package received (zip, 2.0 KB)
21:29:15  校验 - Confirmed as Skill package (1 file)
21:30:34  意图识别 - 4 risk indicators found
09:36:15  URL 分析 - No threat found
21:29:19  子文件检测 - 1 threat found
21:30:35  综合判定 - malicious
```
扫描耗时约 82 秒，输出信任分 22/100。

**关键指标**:
- 50K+ 已扫描 Skill
- 2.3K 威胁已识别
- 10K+ Hub 中可用 Skill
- 99.7% 检测准确率
- 30 秒内出结果（官方宣称，实测 82 秒）

**定价**:
| 版本 | 价格 | 包含内容 |
|------|------|---------|
| 小微企业 | 17,800-25,800 元/年 | 50 Skill 实例 + 50 端点 + 5-15 集成账户 |
| 大型企业 | 26,800-35,800 元/年 | 100 Skill 实例 + 100 端点 + 10 集成账户 |

**API 接口（safeskill.cn/docs）**:
- `POST /api/v1/scan` — 提交 Skill（文件上传/URL/名称），返回 SHA256 用于跟踪
- `GET /v1/report` — 获取扫描报告（多维度威胁评估）
- `GET /v1/search` — 按名称/URL 查询已扫描 Skill
- 认证：API Key
- 限频：建议每 10 秒轮询，最长等待 5 分钟
- 判定分类：malicious / suspicious / unknown / clean
- 信任分：0-100（80-100 低风险，0-40 确认威胁）

**safeskill.cn（独立站，非 qianxin.com 子域）**:
- 定位："一站式 AI Agent 安全平台"
- Skill 检测 + Skill Hub 双功能
- 支持三种提交方式：文件上传、URL、名称搜索
- 免费使用，企业版定价"即将上线"
- 有 GitHub、Twitter、Discord 社区入口
- 导航：Skill 检测 / Skill Hub / API / AI Agent 支持 / 文档

**五维检测体系（API 文档确认）**:
1. LLM 语义分析
2. 静态代码分析
3. 动态沙箱测试
4. 子文件检查
5. 外链威胁情报

**风险指标类型**: 数据窃取、远程代码执行、Prompt 注入、Agent 劫持、供应链漏洞（高/中/低）

**优势**:
- 国内唯一有 Skill Hub（安全市场）的平台
- 背靠奇安信威胁情报能力（已发布 OpenClaw 威胁分析报告）
- 企业级方案完整（端-网-云联动）
- 有明确定价，商业化成熟
- 五维检测最全面（唯一有沙箱的）
- 有公开 RESTful API，可集成
- GPT-5.2 做意图分析，意图一致性量化评分（阈值 80%）

**劣势**:
- 闭源 SaaS，不适合开发者自建
- 定价较高（企业版），个人开发者需等免费版
- 扫描耗时 82 秒（官方宣称 30 秒）
- safeskill.cn 与 safeskill.qianxin.com 两个站点关系不清晰，品牌分散

---

### 2. Snyk Agent Scan

**官网**: github.com/snyk/agent-scan / labs.snyk.io/experiments/skill-scan

**背景**: Snyk（估值 ~$7B）的 AI 安全产品线延伸，集成进 Snyk Evo 平台。

**产品形态**:
- **CLI 工具**：`snyk-agent-scan`，扫描本地 Agent 环境
- **Web 工具**：Skill Inspector（labs.snyk.io），在线扫描
- **后台模式**：MDM/CrowdStrike 集成，企业全局监控
- **MCP Server**：作为 MCP 工具嵌入 Agent 内部

**技术架构**:
- 多层 LLM Judge + 确定性规则的混合引擎
- 自动发现本地 Agent 配置（Claude Code/Cursor/Gemini CLI/Windsurf）
- Toxic Flow 检测：分析看似无害的 prompt 如何触发恶意行为
- SAST + LLM 意图分析结合

**检测能力**:
- 15+ 检测规则
- Prompt Injection（base64/Unicode/多语言混淆、系统消息伪装）
- 恶意代码（凭证窃取、typosquatting、提权、恶意安装）
- 外部依赖（curl|bash、远程配置获取）
- 金融风险（直接访问交易平台、加密货币、银行账户）

**关键数据**: 扫描近 4,000 个 Skill，发现 36% 存在安全缺陷

**合作伙伴**: Vercel（skills.sh 集成）、Tessl Registry（安全评分展示）

**优势**:
- 品牌影响力大，SCA 领域龙头
- CLI + Web + 后台三种形态全覆盖
- LLM + 规则混合引擎，检测深度强
- 自动发现多平台 Agent 配置
- 开源 + 商业双轨

**劣势**:
- 核心引擎依赖 Snyk Evo 平台（商业绑定）
- 后台模式需要 Snyk 企业版
- 对中国市场/中文 Skill 适配不足

---

### 3. Cisco AI Defense Skill Scanner

**官网**: github.com/cisco-ai-defense/skill-scanner

**背景**: Cisco AI Defense 团队出品，开源，Apache 2.0。

**产品形态**:
- **CLI 工具**：`pip install cisco-ai-skill-scanner`
- **CI/CD 集成**：SARIF 输出 → GitHub Code Scanning
- **Pre-commit Hook**：提交前自动扫描

**技术架构**:
- 静态分析 + 字节码分析 + Pipeline 分析
- **BehavioralAnalyzer**：AST 解析 → CFG 控制流图 → 前向数据流分析（fixpoint 算法）
- 追踪从 source（凭证文件、环境变量）到 sink（网络、eval、文件操作）的数据流
- 插件架构，可扩展自定义分析器
- Meta-Analyzer 降低误报

**关键数据**: 1,481 Stars, 166 Forks

**优势**:
- 完全开源，技术透明
- CFG + 数据流分析是业界最强的静态分析能力
- CI/CD 友好（SARIF、GitHub Actions、pre-commit）
- 插件架构扩展性强

**劣势**:
- 仅支持 OpenAI Codex 和 Cursor Agent Skills 格式
- 无 Web 界面
- 社区驱动，无商业支持
- 仅 Python 脚本分析（AST），不覆盖 shell/JS

---

### 4. Socket

**官网**: socket.dev

**背景**: 供应链安全公司（$40M 融资），从 npm/PyPI 扩展到 AI Skill 生态。10,000+ 企业客户。

**产品形态**:
- **skills.sh 集成**：与 Vercel 合作，扫描 60,000+ Skill
- **跨生态扫描**：覆盖 Cursor、Claude Code、GitHub Copilot、Windsurf 等

**技术特点**:
- 静态分析 + AI 驱动检测
- 跨语言扫描：Python、JS、10+ 语言
- 94.5% 检测精度
- 聚焦供应链攻击：typosquatting、维护者劫持、多层依赖链

**优势**:
- 供应链安全领域经验深厚（npm/PyPI 已有成熟方案）
- 60K+ Skill 扫描规模最大
- 跨语言覆盖广

**劣势**:
- 非独立产品，依附 skills.sh 平台
- 无独立 CLI 工具面向终端用户
- 侧重供应链，语义分析较弱

---

### 5. SkillSafe

**官网**: skillsafe.ai

**背景**: 独立创业产品，定位"AI 编码工具的安全技能注册中心"（Verified Registry）。

**产品形态**:
- **Web 注册中心**：技能发布、搜索、安装
- **CLI 工具**：单文件 Python 脚本（纯 stdlib，零依赖）
- **RESTful API**：完整的 CRUD + 扫描 + 分享接口

**核心差异化：双向加密验证**:
- 发布者上传时扫描一次
- 消费者安装时独立再扫一次
- SHA-256 Tree Hash 确保字节级一致性
- 三档判定：verified（匹配）/ divergent（不一致，需审查）/ critical（哈希不匹配，阻止安装）

**技术特点**:
- 扫描文件类型：Python、JavaScript、TypeScript、Markdown
- 检测：恶意模式、凭证窃取、Prompt 注入
- 语义版本控制 + yank（标记不安全版本）能力
- 分享控制：默认私有，可撤销链接，过期设置
- 支持 10+ AI 工具：Claude Code、Cursor、Windsurf、Gemini、GitHub Copilot、Cline 等

**关键指标**:
- 5,100+ Skill
- 400+ 发布者
- 5,800+ 扫描报告
- 900+ 威胁捕获

**定价**:
| 版本 | 价格 | 存储 | API 请求/日 | 分享 |
|------|------|------|------------|------|
| Free | $0 | 50 MB | 100 | 5 个 |
| Pro | $9/月 ($90/年) | 5 GB | 1,000 | 无限 |
| Enterprise | $100/月起 | 10 GB+ | 10,000 | 无限 |

**API 端点**（base: `api.skillsafe.ai`）:
- `POST /v1/skills/@ns/name` — 保存 Skill
- `GET /v1/skills/@ns/name/download/{version}` — 下载
- `POST /v1/skills/.../verify` — 提交扫描报告（双向验证）
- `GET /v1/skills/search` — 全文搜索
- `POST /v1/skills/.../share` — 创建分享链接
- Badge API：verified/installs/eval 状态徽章

**CLI 命令**:
```
skillsafe scan ./skill      # 本地扫描
skillsafe save @ns/name     # 保存
skillsafe install @ns/name  # 下载 + 验证
skillsafe search "keyword"  # 搜索
skillsafe yank @ns/name     # 标记不安全
```

**优势**:
- 双向加密验证是独特的安全模型（发布者 + 消费者各扫一次）
- CLI 零依赖（单文件 Python，纯 stdlib）
- 定价亲民，免费版包含安全扫描
- "Security should never be gated behind a paywall" 理念
- 跨平台覆盖最广（10+ AI 工具）
- API 设计完善，有 Badge API 可嵌入 README

**劣势**:
- 扫描深度较浅（无 LLM 语义分析、无沙箱）
- 仅检测三类威胁（恶意模式、凭证窃取、Prompt 注入）
- 规模较小（5K Skill，vs Snyk 4K、Socket 60K、奇安信 50K）
- 社区较小（400 发布者）
- 无中文支持
- 无威胁情报集成

---

### 6. 其他玩家

| 产品 | 来源 | 特点 |
|------|------|------|
| Skills Directory | skillsdirectory.com | 50+ 规则扫描每个 Skill，36% 检出安全缺陷 |
| skill-security-scan | GitHub (huifer) | 开源 CLI，面向 Claude Skills |
| ClawHub Skill Scanner | ClawHub 内置 | 检测恶意软件、间谍软件、挖矿、恶意模式 |

---

## 三、竞品对比矩阵

| 维度 | ClawSafe (YiSec) | SafeSkill (奇安信) | Snyk Agent Scan | Cisco Skill Scanner | Socket | SkillSafe |
|------|:-:|:-:|:-:|:-:|:-:|:-:|
| **产品形态** | Skill + CLI | SaaS + Hub + 企业方案 | CLI + Web + 后台 | CLI + CI/CD | 平台集成 | Registry + CLI + API |
| **开源** | 是 (Apache 2.0) | 否 | 部分开源 | 是 (Apache 2.0) | 否 | CLI 开源 |
| **检测引擎** | LLM 语义 + 规则 + 情报 | Yara/YAML + AST + SLM + LLM + 沙箱 | LLM Judge + 规则 | AST + CFG + 数据流 | 静态 + AI | 规则 + 哈希验证 |
| **威胁情报** | Intel Studio + ip/domain-analysis | 奇安信情报 | Snyk 漏洞库 | 无 | Socket 供应链数据 | 无 |
| **沙箱执行** | 否 | 是 | 否 | 否 | 否 | 否 |
| **双向验证** | 否 | 否 | 否 | 否 | 否 | 是（SHA-256 Tree Hash） |
| **Skill Hub** | 否 | 是 (10K+) | 否 | 否 | skills.sh 集成 | 是 (5.1K+) |
| **CI/CD 集成** | CLI (JSON 输出) | 未知 | 是 | 是 (SARIF) | 是 | API + Badge |
| **跨平台支持** | OpenClaw Skills | 多平台 | Claude/Cursor/Gemini/Windsurf | Codex/Cursor | 5+ 平台 | 10+ 平台 |
| **中文支持** | 是 | 是 | 否 | 否 | 否 | 否 |
| **定价** | 免费 (开源) | 17,800-35,800 元/年 | 免费 + 商业版 | 免费 | 商业 | 免费 / $9月 / $100月 |

---

## 四、ClawSafe 差异化定位

### 我们有、别人没有的

1. **Skill-as-Scanner**：ClawSafe 本身是一个 Skill，运行在 Agent 内部，利用 Agent（Claude）的理解能力做语义分析。不需要单独安装扫描器，用户在 Agent 里直接说"扫描这个 skill"就行。
2. **威胁情报深度集成**：Intel Studio + ip-analysis + domain-analysis 三级情报关联，不只是静态规则匹配。
3. **意图-行为匹配分析**：不是"发现 eval 就扣分"，而是判断"这个 eval 在这个 skill 的上下文中是否合理"。

### 我们弱在

1. **没有沙箱执行**：奇安信有，我们没有
2. **没有 Skill Hub**：奇安信 safeskill.cn 有安全市场，我们没有
3. **扫描规模小**：Snyk 4K、Socket 60K、奇安信 50K，我们还在 MVP
4. **CI/CD 集成弱**：Cisco 有 SARIF + GitHub Actions，我们只有 JSON 输出
5. **跨平台覆盖窄**：目前只面向 OpenClaw Skills 格式

### 近期可补的差距

| 差距 | 优先级 | 工作量 |
|------|--------|--------|
| SARIF 输出 + GitHub Actions | P1 | 1-2 天 |
| 支持 Cursor Rules / MCP Server 格式 | P1 | 2-3 天 |
| 在线 Web 扫描器 | P2 | 1 周 |
| 集成到 SaaS 服务 (clawsafe.yisec.ai) | P2 | 1-2 周 |

### 不需要追的

- Skill Hub（重运营，不是我们的定位）
- 企业级端-网-云方案（太重，奇安信的优势）
- 60K 规模扫描（需要大量算力，不是 MVP 阶段目标）

---

## 五、关键洞察

1. **赛道窗口期很短**：2026 Q1 是爆发期，主要玩家都在 2-3 月入场。Q2 格局基本定型。
2. **开源是护城河**：Snyk 和 Cisco 都选择了开源，社区信任 > 闭源品牌。奇安信闭源 + 高价位限制了开发者社区渗透。
3. **LLM 语义分析是方向**：纯规则时代结束，Snyk 的 LLM Judge、奇安信的 SLM 意图检测、我们的 Skill-as-Scanner 都在往这个方向走。
4. **"Skill 扫描 Skill"是独特的**：竞品都是外部工具扫描 Skill，我们是 Agent 自己用 Skill 扫描 Skill。这个范式有独特的分发优势（用户不需要安装任何东西）。

---

## 六、信息来源

- [奇安信"龙虾安全伴侣"发布](https://m.c114.com.cn/w16-1306966.html)
- [SafeSkill.cn — 一站式 AI Agent 安全平台](https://safeskill.cn/)
- [Snyk Agent Scan (GitHub)](https://github.com/snyk/agent-scan)
- [Snyk Skill Inspector](https://labs.snyk.io/experiments/skill-scan/)
- [Cisco AI Defense Skill Scanner (GitHub)](https://github.com/cisco-ai-defense/skill-scanner)
- [Socket Brings Supply Chain Security to skills.sh](https://socket.dev/blog/socket-brings-supply-chain-security-to-skills)
- [AI Agent Skills 市场安全风险分析](https://www.gm7.org/archives/57524)
- [奇安信 2026 网络安全十大趋势](https://www.secrss.com/articles/86947)
- [奇安信：全球超 2 万个 OpenClaw 实例存在漏洞](https://finance.eastmoney.com/a/202603163673315439.html)
- [SkillSafe — 文档](https://skillsafe.ai/docs/)
- [SkillSafe — 定价](https://skillsafe.ai/pricing)
