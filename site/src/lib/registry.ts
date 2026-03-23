export type VerificationState = "verified" | "divergent" | "critical";

export type SkillType = "skill" | "skillset";

export type SkillFinding = {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  detail: string;
  fix: string;
};

export type ScanStep = {
  title: string;
  detail: string;
  state: "done" | "warning" | "pass";
  timestamp: string;
};

export type SkillRecord = {
  publisher: string;
  publisherLabel: string;
  slug: string;
  name: string;
  type: SkillType;
  category: string;
  summary: string;
  tagline: string;
  description: string;
  repoUrl: string;
  support: string[];
  highlights: string[];
  useCases: string[];
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  verification: VerificationState;
  installs: number;
  weeklyInstalls: number;
  stars: number;
  versions: number;
  updatedAt: string;
  latestVersion: string;
  treeHash: string;
  intentMatch: number;
  sharePolicy: string;
  installCommand: string;
  shareCommand: string;
  saveCommand: string;
  findings: SkillFinding[];
  scanSteps: ScanStep[];
};

export type SearchEntry = {
  kind: "page" | "skill";
  label: string;
  detail: string;
  href: string;
};

export type DocsSection = {
  id: string;
  title: string;
  body: string;
  commands?: string[];
};

export const compatibleTools = [
  "Claude Code",
  "Cursor",
  "Windsurf",
  "Codex",
  "Gemini CLI",
  "OpenClaw",
  "Cline",
  "Roo",
  "Goose",
  "Copilot",
  "Kiro",
  "Trae",
];

export const navLinks = [
  { href: "/skills", label: "技能库" },
  { href: "/demos", label: "演示" },
  { href: "/arena", label: "对比" },
  { href: "/docs", label: "文档" },
  { href: "/blog", label: "博客" },
  { href: "/security", label: "安全" },
  { href: "/pricing", label: "定价" },
  { href: "/dashboard", label: "控制台" },
];

export const homeStats = [
  { value: "20", label: "扫描规则" },
  { value: "5", label: "风险类别" },
  { value: "312", label: "已索引技能" },
  { value: "47", label: "已拦截异常安装" },
  { value: "8", label: "IOC 情报源" },
  { value: "99.3%", label: "验证通过安装" },
];

export const trustPrograms = [
  {
    title: "双向验证",
    body: "发布者在分享前扫描一次，使用者在安装时再次扫描。tree hash 必须匹配，ClawSafety 才会标记技能为已验证。",
  },
  {
    title: "注册中心级搜索",
    body: "粘贴 GitHub URL、按名称搜索或浏览已验证技能。同一搜索框完成导入、发现和分类。",
  },
  {
    title: "可操作的报告",
    body: "每条发现都包含严重级别、文件路径、IOC 上下文和具体修复建议。报告便于人工阅读，也支持自动化导出。",
  },
];

export const verificationModes = [
  {
    title: "发布者扫描",
    detail: "技能在可分享之前，需完成静态分析、IOC 关联、提示词注入审查和权限建模。",
  },
  {
    title: "使用者复验",
    detail: "ClawSafety 在安装时重新计算 tree hash 并重跑高置信度规则，检测篡改和漂移。",
  },
  {
    title: "运行时交接",
    detail: "最终安装载荷保持透明：哪些文件被修改、哪些工具被调用、哪些网络范围被请求。",
  },
];

export const pricingPlans = [
  {
    name: "Explorer",
    price: "$0",
    description: "个人使用及公开注册中心浏览。",
    features: [
      "公开技能搜索",
      "本地扫描报告",
      "1 个私有保存技能",
      "社区威胁情报源",
    ],
  },
  {
    name: "Builder",
    price: "$19",
    description: "在团队内分享和分发已验证技能。",
    features: [
      "无限私有保存",
      "带过期时间的分享链接",
      "已验证安装徽章",
      "API 访问及 JSON 导出",
    ],
  },
  {
    name: "Team",
    price: "$49",
    description: "管控团队在多仓库和 AI 工具中的技能引入。",
    features: [
      "按评级的策略准入",
      "控制台历史记录",
      "Webhook 告警",
      "使用者验证分析",
    ],
  },
  {
    name: "Enterprise",
    price: "联系我们",
    description: "私有部署、SSO 及安全团队的注册中心联邦。",
    features: [
      "私有镜像注册中心",
      "SCIM 和 SSO",
      "自定义扫描规则",
      "SLA 保障支持",
    ],
  },
];

export const demos = [
  {
    title: "被篡改的 ZIP 安装",
    summary: "使用者侧验证检测到单个文件变更，在 agent 导入技能前拦截了安装。",
    result: "已拦截",
  },
  {
    title: "SKILL.md 中的提示词注入",
    summary: "某注册中心技能声称用于代码检查，但其提示词试图覆盖系统指令并获取密钥。",
    result: "严重",
  },
  {
    title: "可信恢复流程",
    summary: "发布者撤回版本 1.4.1，重新发布 1.4.2，使用者以新的已验证 tree hash 完成安装。",
    result: "已恢复",
  },
];

export const arenaCards = [
  {
    name: "ClawSafety Registry",
    score: "99.3",
    note: "安装时完整性验证和可读修复建议最优。",
  },
  {
    name: "开放注册中心基线",
    score: "61.2",
    note: "发现速度快，但无复验机制，也无注册中心侧策略准入。",
  },
  {
    name: "仅 ZIP 分享",
    score: "44.8",
    note: "上手容易，但版本漂移后无法在规模化场景中建立信任。",
  },
];

export const blogPosts = [
  {
    slug: "dual-verification-playbook",
    title: "AI 技能双向验证：安装前必须匹配什么",
    excerpt: "关于 tree hash、意图漂移和使用者侧复验的实操指南。",
    date: "2026-03-18",
  },
  {
    slug: "registry-threat-model",
    title: "ClawHavoc 之后的技能注册中心威胁建模",
    excerpt: "恶意 SKILL.md、投毒 URL 和漂移 ZIP 在安装路径中的实际出现位置。",
    date: "2026-03-13",
  },
  {
    slug: "verified-distribution",
    title: "为什么验证分发优于裸 GitHub URL",
    excerpt: "Git URL 适合审查，但不适合作为生产环境 agent 的最后信任边界。",
    date: "2026-03-09",
  },
];

export const docsSections: DocsSection[] = [
  {
    id: "overview",
    title: "概述",
    body:
      "ClawSafety Registry 结合了 VirusTotal 风格的搜索、SkillSafe 风格的验证分发以及 ClawSafety 自有的规则引擎。发布者保存并扫描技能，使用者在安装时再次验证，双方看到同一个 tree hash。",
  },
  {
    id: "quickstart",
    title: "快速开始",
    body:
      "像普通搜索中心一样使用注册中心：粘贴 GitHub URL、查看评分，然后通过签名命令或可导出的 ZIP 流程安装。团队可以通过 API 和策略准入完成相同操作。",
    commands: [
      "clawsafety scan ./my-skill --format json",
      "clawsafety registry save ./my-skill --version 1.0.0",
      "clawsafety registry share @team/repo-audit --version 1.0.0",
      "clawsafety registry install @team/repo-audit@1.0.0",
    ],
  },
  {
    id: "auth",
    title: "认证",
    body:
      "登录后可使用保存的技能、分享链接、API 密钥、账单和控制台历史。UI 自带本地演示认证流程，在接入真实身份后端之前保持可交互。",
  },
  {
    id: "api",
    title: "API 接口",
    body:
      "注册中心遵循 SkillSafe 的操作模型，提供扫描、保存、分享、安装、徽章和反馈接口。当前原型中，接口格式已定义，UI 已准备好对接真实端点。",
    commands: [
      "POST /api/scan",
      "POST /v1/registry/save",
      "POST /v1/registry/share",
      "GET /v1/registry/skill/@publisher/name",
      "GET /v1/badge/@publisher/name/verified",
    ],
  },
  {
    id: "verification",
    title: "验证状态",
    body:
      "Verified 表示发布者和使用者的 tree hash 匹配。Divergent 表示安装载荷与分享包不一致，需要人工审查。Critical 表示检测到已知恶意模式或严重不匹配，安装被阻断。",
  },
];

export const securityPrinciples = [
  {
    title: "Tree hash 完整性",
    body: "每个版本生成不可变的 SHA-256 tree hash，任何单字节变更都会在安装报告中可见。",
  },
  {
    title: "意图感知扫描",
    body: "ClawSafety 将技能声明的用途与其请求的工具、访问的文件和出站网络模式进行比对。",
  },
  {
    title: "注册中心优先分享",
    body: "分享链接可撤销、有时间限制，并绑定到特定版本，而非可变的仓库分支。",
  },
  {
    title: "运维可见性",
    body: "控制台展示保存事件、安装记录、漂移情况、评级变化和待修复项，无需人工解析原始 JSON。",
  },
];

export const dashboardMetrics = [
  { label: "验证通过安装", value: "2,481" },
  { label: "已分享技能", value: "28" },
  { label: "已拦截漂移", value: "11" },
  { label: "待处理发现", value: "7" },
];

export const dashboardActivity = [
  {
    title: "repo-audit@1.4.2 验证通过",
    detail: "使用者在 Cursor 上的安装与发布者 tree hash 匹配。评级 A 保持不变。",
    time: "3 分钟前",
  },
  {
    title: "incident-triage@0.9.1 已拦截",
    detail: "使用者载荷与分享的 ZIP 产生漂移。安装已暂停等待审查。",
    time: "18 分钟前",
  },
  {
    title: "提示词注入规则已调优",
    detail: "规则 CS-CFG-004 现可捕获 markdown 代码块中的混淆覆盖字符串。",
    time: "2 小时前",
  },
];

export const registrySkills: SkillRecord[] = [
  {
    publisher: "clawsafe",
    publisherLabel: "@clawsafe",
    slug: "repo-audit",
    name: "Repo Audit",
    type: "skill",
    category: "安全",
    summary: "仓库级技能审计，含 IOC 关联、修复建议和安装时验证。",
    tagline: "在 agent 信任技能之前，先扫描其仓库。",
    description:
      "Repo Audit 将 ClawSafety 的静态规则与注册中心感知的安装流程结合。发布者保存并分享签名版本，使用者在安装前复验同一载荷。结果的阅读体验类似 VirusTotal，但行为上是有准入控制的分发通道。",
    repoUrl: "https://github.com/relaxcloud-cn/clawsafety",
    support: ["Claude Code", "Cursor", "Windsurf", "Codex", "Gemini CLI"],
    highlights: [
      "20 条确定性规则",
      "IOC 情报源关联",
      "逐条发现的修复建议",
      "带版本的分享链接",
    ],
    useCases: [
      "安装前审查第三方技能",
      "为内部团队设定最低评级要求",
      "通过分享链接发布已验证技能",
    ],
    score: 96,
    grade: "A",
    verification: "verified",
    installs: 1880,
    weeklyInstalls: 326,
    stars: 412,
    versions: 14,
    updatedAt: "2026-03-20",
    latestVersion: "1.4.2",
    treeHash: "c5a4d7137b5a10d2f5e6f7bc108d30becc54e12761fe8d9a2c51beed9f742101",
    intentMatch: 98,
    sharePolicy: "公开分享链接，30 天缓存，使用者侧复验。",
    installCommand: "clawsafety registry install @clawsafe/repo-audit@1.4.2",
    shareCommand: "clawsafety registry share @clawsafe/repo-audit --version 1.4.2",
    saveCommand: "clawsafety registry save ./repo-audit --version 1.4.2",
    findings: [
      {
        id: "CS-CFG-004",
        severity: "low",
        title: "示例 fixture 中存在提示词覆盖字符串",
        detail: "一个 fixture 文件仍包含用于回归测试的转义覆盖字符串。该规则在生产路径中已正确抑制。",
        fix: "保持 fixture 隔离并记录在文档中。不阻断安装。",
      },
      {
        id: "CS-DEP-002",
        severity: "low",
        title: "一个可选示例依赖使用了版本范围",
        detail: "仅文档中的示例引用了 semver 范围，用于演示目的。",
        fix: "固定示例版本，或标注该代码片段为有意的示范。",
      },
    ],
    scanSteps: [
      { timestamp: "21:14:02", title: "导入", detail: "从发布者保存流程导入仓库。", state: "done" },
      { timestamp: "21:14:08", title: "静态扫描", detail: "对 markdown、shell 和配置文件执行 20 条规则。", state: "pass" },
      { timestamp: "21:14:15", title: "IOC 审查", detail: "在活跃恶意 IP 和域名情报源中未匹配。", state: "pass" },
      { timestamp: "21:14:21", title: "Tree hash", detail: "发布者哈希已存储，供使用者侧验证。", state: "done" },
      { timestamp: "21:14:34", title: "安装重放", detail: "使用者重放与发布者字节完全匹配。", state: "pass" },
    ],
  },
  {
    publisher: "yisec",
    publisherLabel: "@yisec",
    slug: "incident-triage",
    name: "Incident Triage",
    type: "skill",
    category: "运维",
    summary: "收集事件上下文、关联指标，并为响应人员生成可复现的分类笔记。",
    tagline: "权限收敛的快速事件上下文收集。",
    description:
      "Incident Triage 受应急响应团队欢迎，因为它保持权限面收敛，同时提供 IOC 关联和可读笔记。最新公开版本无问题，但有一个旧版使用者安装产生了漂移并被拦截。",
    repoUrl: "https://github.com/relaxcloud-cn/clawsafety/tree/main/skill",
    support: ["Claude Code", "Cursor", "OpenClaw", "Cline"],
    highlights: [
      "受限的只读工作流",
      "IOC 富化模板",
      "Markdown 事件笔记",
      "控制台中可见漂移历史",
    ],
    useCases: [
      "事件首响处置",
      "SOC 换班交接",
      "已验证的事件笔记生成",
    ],
    score: 84,
    grade: "B",
    verification: "divergent",
    installs: 914,
    weeklyInstalls: 140,
    stars: 188,
    versions: 9,
    updatedAt: "2026-03-17",
    latestVersion: "0.9.1",
    treeHash: "ab11d4017166f3009bda3a2056aee9de9dd1e71f960d8b861b7d92f7f9d4f81d",
    intentMatch: 89,
    sharePolicy: "默认私有。分享链接可撤销或限制为 72 小时有效。",
    installCommand: "clawsafety registry install @yisec/incident-triage@0.9.1",
    shareCommand: "clawsafety registry share @yisec/incident-triage --version 0.9.1 --expires 72h",
    saveCommand: "clawsafety registry save ./incident-triage --version 0.9.1",
    findings: [
      {
        id: "CS-PRM-003",
        severity: "medium",
        title: "遗留辅助脚本中的环境变量枚举",
        detail: "一个用于历史调试的辅助脚本仍在枚举所有环境变量。",
        fix: "限制为显式读取指定变量名，移除全量遍历。",
      },
      {
        id: "CS-DEP-004",
        severity: "low",
        title: "外部案例模板 URL 缺少校验和",
        detail: "事件模板从裸 GitHub URL 下载，未固定哈希值。",
        fix: "添加 SHA-256 校验，或将模板内置到发布产物中。",
      },
    ],
    scanSteps: [
      { timestamp: "10:22:04", title: "导入", detail: "发布者包已导入并索引。", state: "done" },
      { timestamp: "10:22:12", title: "静态扫描", detail: "在辅助脚本中发现两个中等信号问题。", state: "warning" },
      { timestamp: "10:22:18", title: "IOC 审查", detail: "未匹配到活跃基础设施。", state: "pass" },
      { timestamp: "10:24:54", title: "使用者重放", detail: "一次安装尝试与已发布的 tree hash 产生漂移，已拦截。", state: "warning" },
      { timestamp: "10:25:03", title: "结论", detail: "注册中心列表保持可见，附带漂移警告。", state: "warning" },
    ],
  },
  {
    publisher: "nightwatch",
    publisherLabel: "@nightwatch",
    slug: "frontend-probe",
    name: "Frontend Probe",
    type: "skill",
    category: "测试",
    summary: "捕获 UI 回归、控制台日志和页面流快照，用于发布验证。",
    tagline: "带网络范围管控的可复现浏览器测试工具。",
    description:
      "Frontend Probe 将轻量的 Playwright 编排与 ClawSafety 防护结合，让团队可以发布可审查的 UI 测试技能。已验证，安装量高，在预发布流水线中广泛使用。",
    repoUrl: "https://github.com/nightwatch/frontend-probe",
    support: ["Cursor", "Claude Code", "Windsurf", "Codex"],
    highlights: [
      "确定性浏览器脚本",
      "内联截图清单",
      "出站主机白名单",
      "干净的安装历史",
    ],
    useCases: [
      "预发布冒烟测试",
      "视觉回归捕获",
      "控制台日志分类",
    ],
    score: 92,
    grade: "A",
    verification: "verified",
    installs: 1264,
    weeklyInstalls: 204,
    stars: 273,
    versions: 11,
    updatedAt: "2026-03-21",
    latestVersion: "2.2.0",
    treeHash: "7f2a9c1ae85f21f18c27a0e9edb8140028adbe8d021ab37ecbd06cf0e3bb8b12",
    intentMatch: 94,
    sharePolicy: "公开、已验证，并镜像至 ClawSafety 企业缓存。",
    installCommand: "clawsafety registry install @nightwatch/frontend-probe@2.2.0",
    shareCommand: "clawsafety registry share @nightwatch/frontend-probe --version 2.2.0",
    saveCommand: "clawsafety registry save ./frontend-probe --version 2.2.0",
    findings: [
      {
        id: "CS-PRM-001",
        severity: "low",
        title: "写入范围超出文档中声明的截图目录",
        detail: "该技能可写入上级 snapshots 目录以支持多项目。",
        fix: "在文档中说明更大的写入范围，或收窄至项目子目录。",
      },
    ],
    scanSteps: [
      { timestamp: "08:08:11", title: "导入", detail: "版本 2.2.0 从发布者 CLI 上传。", state: "done" },
      { timestamp: "08:08:19", title: "静态扫描", detail: "一条低风险范围备注，无安装阻断项。", state: "pass" },
      { timestamp: "08:08:31", title: "权限模型", detail: "网络范围限制在提供的主机白名单内。", state: "pass" },
      { timestamp: "08:08:40", title: "Tree hash", detail: "已存储并签名，用于公开注册中心列表。", state: "done" },
      { timestamp: "08:09:17", title: "使用者重放", detail: "最近四次安装与发布者载荷匹配。", state: "pass" },
    ],
  },
  {
    publisher: "forensics-lab",
    publisherLabel: "@forensics-lab",
    slug: "artifact-extract",
    name: "Artifact Extract",
    type: "skillset",
    category: "取证",
    summary: "多步骤取证提取流程，支持 Office 文档、PDF 和编码数据，默认安全配置。",
    tagline: "用于提取证据而非密钥的已验证技能集。",
    description:
      "Artifact Extract 将多个子技能打包为单个已验证技能集。工具面收敛，输出可防御，并为做文档分类的团队提供独立的安装和分享命令。",
    repoUrl: "https://github.com/forensics-lab/artifact-extract",
    support: ["Claude Code", "Codex", "OpenClaw", "Goose"],
    highlights: [
      "技能集打包",
      "文件类型感知提取",
      "证据优先的输出格式",
      "注册中心策略标签",
    ],
    useCases: [
      "从可疑文件中提取证据",
      "Office 和 PDF 分类处置",
      "可重复的恶意软件狩猎流程",
    ],
    score: 78,
    grade: "B",
    verification: "verified",
    installs: 502,
    weeklyInstalls: 77,
    stars: 119,
    versions: 6,
    updatedAt: "2026-03-15",
    latestVersion: "0.8.4",
    treeHash: "f2b4a61cb97e34b6b2cd43358e19c350a88396be0df3f4be1be75a4d6dbf91a9",
    intentMatch: 88,
    sharePolicy: "仅团队分发，使用签名的内部链接。",
    installCommand: "clawsafety registry install @forensics-lab/artifact-extract@0.8.4",
    shareCommand: "clawsafety registry share @forensics-lab/artifact-extract --version 0.8.4 --private",
    saveCommand: "clawsafety registry save ./artifact-extract --version 0.8.4",
    findings: [
      {
        id: "CS-CFG-003",
        severity: "medium",
        title: "一个子技能仍缺少显式 allowed-tools 声明",
        detail: "父技能集声明正确，但一个子技能依赖继承的默认值。",
        fix: "在子技能的 SKILL.md 文件中添加显式工具声明。",
      },
      {
        id: "CS-SEC-004",
        severity: "low",
        title: "文档 URL 中的示例包含临时 token",
        detail: "该 token 已失效，但不应出现在公开示例中。",
        fix: "轮换示例内容并清理文档快照。",
      },
    ],
    scanSteps: [
      { timestamp: "13:01:42", title: "导入", detail: "私有团队包已上传。", state: "done" },
      { timestamp: "13:01:51", title: "技能集展开", detail: "三个子技能已枚举并逐一扫描。", state: "done" },
      { timestamp: "13:02:10", title: "配置审查", detail: "在一个子技能中发现缺少 allowed-tools 声明。", state: "warning" },
      { timestamp: "13:02:24", title: "IOC 审查", detail: "未匹配到恶意基础设施。", state: "pass" },
      { timestamp: "13:02:39", title: "验证", detail: "发布者和使用者的 tree hash 匹配。", state: "pass" },
    ],
  },
];

export const pageSearchIndex: SearchEntry[] = [
  { kind: "page", label: "搜索中心", detail: "VirusTotal 风格的 URL、技能和哈希检索入口。", href: "/" },
  { kind: "page", label: "注册中心", detail: "浏览已验证技能、筛选条件和导入路径。", href: "/skills" },
  { kind: "page", label: "文档", detail: "快速开始、认证、验证和 API 接口。", href: "/docs" },
  { kind: "page", label: "安全", detail: "威胁模型、完整性控制和漏洞披露路径。", href: "/security" },
  { kind: "page", label: "定价", detail: "Explorer、Builder、Team 和 Enterprise 方案。", href: "/pricing" },
  { kind: "page", label: "控制台", detail: "保存的技能、安装记录、漂移和 API 密钥。", href: "/dashboard" },
  { kind: "page", label: "演示", detail: "篡改拦截和安装验证示例。", href: "/demos" },
  { kind: "page", label: "对比", detail: "注册中心能力与宽松基线的对比。", href: "/arena" },
  { kind: "page", label: "博客", detail: "威胁建模和注册中心策略笔记。", href: "/blog" },
];

export function buildSearchIndex(): SearchEntry[] {
  return [
    ...pageSearchIndex,
    ...registrySkills.map((skill) => ({
      kind: "skill" as const,
      label: `${skill.publisherLabel}/${skill.slug}`,
      detail: `${skill.name} · ${skill.category} · 评级 ${skill.grade}`,
      href: skillHref(skill),
    })),
  ];
}

export function skillHref(skill: SkillRecord): string {
  return `/skill/${skill.publisher}/${skill.slug}`;
}

export function findSkill(publisher: string, slug: string): SkillRecord | undefined {
  return registrySkills.find(
    (skill) => skill.publisher === publisher && skill.slug === slug,
  );
}

export function resolveSkillFromQuery(query: string): SkillRecord {
  const lowered = query.toLowerCase();

  return (
    registrySkills.find((skill) => {
      return (
        lowered.includes(skill.slug) ||
        lowered.includes(skill.publisher) ||
        lowered.includes(skill.name.toLowerCase()) ||
        lowered.includes(skill.repoUrl.toLowerCase())
      );
    }) ?? registrySkills[0]
  );
}
