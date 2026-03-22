# ClawSafety - MVP Roadmap

## 版本演进路线

```
v0.1 (CLI)  →  v0.2 (GitHub)  →  v0.3 (Auto-Fix)  →  v1.0 (Enterprise)
  2 周             3 周              2 周                4 周
```

---

## v0.1 — CLI 扫描器 (MVP)

> 目标：一行命令扫描 skill，输出安全报告

### 里程碑

| # | 任务 | 产出 | 时间 |
|---|------|------|------|
| 1 | 项目骨架 | CLI 框架 + Rule trait + Scanner trait | Day 1-2 |
| 2 | 注入类规则 (INJ) | CS-INJ-001 ~ 004，4 条规则 | Day 3-4 |
| 3 | 敏感信息规则 (SEC) | CS-SEC-001 ~ 004，4 条规则 | Day 5-6 |
| 4 | 依赖规则 (DEP) | CS-DEP-001 ~ 004，4 条规则 | Day 7-8 |
| 5 | 权限规则 (PRM) + 配置规则 (CFG) | CS-PRM-001 ~ 004 + CS-CFG-001 ~ 004 | Day 9-10 |
| 6 | 评分系统 + 报告生成 | Terminal/JSON/SARIF 输出 | Day 11-12 |
| 7 | 测试 + 文档 | 集成测试、README、发布 | Day 13-14 |

### 验收标准

- [ ] `clawsafety scan <path>` 正常运行
- [ ] 20 条规则全部实现且有测试
- [ ] 对 cybersec-skills 中 5 个 skill 进行实测，结果合理
- [ ] 终端输出彩色、可读
- [ ] JSON/SARIF 输出格式正确
- [ ] README 包含安装和使用说明
- [ ] GitHub Release 发布预编译二进制（macOS arm64 + Linux amd64）

### 发布动作

- [ ] GitHub 开源发布
- [ ] 发 Twitter 宣传（结合 ClawHavoc 事件）
- [ ] 在 OpenClaw 社区发帖
- [ ] 给 cybersec-skills 的 30+ skill 跑一遍扫描，发布安全报告

---

## v0.2 — GitHub 集成

> 目标：连接 GitHub 仓库，每次 PR 自动扫描

### 里程碑

| # | 任务 | 产出 |
|---|------|------|
| 1 | GitHub App 注册 + OAuth 流程 | 用户可以 GitHub 登录 |
| 2 | Webhook 处理 | 接收 push/PR 事件，触发扫描 |
| 3 | 异步扫描队列 | Redis + Worker，支持并发扫描 |
| 4 | PR Comment | 扫描结果自动评论到 PR |
| 5 | Check Run (SARIF) | 集成 GitHub Code Scanning |
| 6 | Web Dashboard | 扫描历史、评分趋势、仓库管理 |
| 7 | Badge API | 动态评分徽章，嵌入 README |

### 验收标准

- [ ] GitHub OAuth 登录 → 选择仓库 → 自动扫描，全流程 < 60 秒
- [ ] PR 提交后 30 秒内出扫描评论
- [ ] Dashboard 可查看历史扫描和趋势
- [ ] Badge 实时更新评分

---

## v0.3 — 自动修复 + 公开扫描

> 目标：自动生成修复 PR；任何人可以扫描任何公开 skill

### 里程碑

| # | 任务 | 产出 |
|---|------|------|
| 1 | 修复代码生成 | 基于规则自动生成修复 diff |
| 2 | 自动修复 PR | 检测到问题后自动创建修复分支和 PR |
| 3 | URL 即时扫描 | 粘贴 GitHub URL，无需登录即可扫描 |
| 4 | ClawHub 全量扫描 | 自动爬取 + 扫描所有公开 skill |
| 5 | 安全排行榜 | 公开 skill 安全评分排名 |

### 验收标准

- [ ] 自动修复 PR 覆盖 60%+ 的常见问题
- [ ] URL 扫描 < 30 秒出结果
- [ ] ClawHub Top 100 skill 全部有评分

---

## v1.0 — Enterprise

> 目标：团队管理 + 运行时监控 + 商业化

### 功能

| 功能 | 描述 |
|------|------|
| Team Dashboard | 团队 skill 资产全景、成员管理 |
| 合规策略 | 设置最低评分阈值，低于阈值自动阻断 |
| 自定义规则 | 用户编写自定义扫描规则 |
| SBOM 生成 | 生成 Skill 的 Software Bill of Materials |
| 审计日志 | 完整的操作和扫描审计记录 |
| 运行时监控 | Skill 执行行为监控（v1.0+） |
| Skill 签名 | 数字签名发布和验证 |
| 私有部署 | 支持企业私有化部署 |

---

## Do Things That Don't Scale（MVP 阶段）

在 v0.1 ~ v0.2 期间，手动完成以下动作：

| 动作 | 目的 |
|------|------|
| 手动扫描 ClawHub Top 50 skill，给作者发邮件/PR | 获取首批用户 |
| 在 ClawHavoc 相关讨论帖中发 ClawSafety | 蹭热点引流 |
| 给安全问题较多的 skill 主动提交修复 PR | 建立社区信任 |
| 在 Twitter/X 发布 skill 安全报告 | 内容营销 |
| 联系 OpenClaw 核心团队，争取官方推荐 | 平台背书 |

---

## 关键里程碑时间线

```
Week 1-2:   v0.1 CLI 扫描器发布
Week 3:     对 ClawHub Top 50 skill 跑扫描，发布安全报告
Week 4-6:   v0.2 GitHub 集成上线
Week 7:     首批 Pro 付费用户
Week 8-9:   v0.3 自动修复 + 公开扫描
Week 10-11: ClawHub 官方集成
Week 12+:   v1.0 Enterprise 功能
```
