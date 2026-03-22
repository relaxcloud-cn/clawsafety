# ClawSafety - Scan Rules Specification

## 规则体系概览

ClawSafety 扫描规则分为 5 大类，MVP 阶段实现 20 条核心规则。

每条规则包含：
- **ID**: `CS-{类别}-{编号}` (e.g., CS-INJ-001)
- **严重性**: Critical / High / Medium / Low / Info
- **扫描目标**: SKILL.md / scripts/ / config/ / dependencies
- **检测方式**: 正则匹配 / AST 分析 / 依赖查询

---

## 1. 命令注入与代码执行 (INJ)

### CS-INJ-001: Shell 命令注入
- **严重性**: Critical
- **目标**: `scripts/*.sh`, `scripts/*.py`
- **检测**: 未转义的变量直接拼入 shell 命令
- **模式**:
  ```
  # Bash: 变量未引用直接进入命令
  eval $USER_INPUT
  bash -c "$CMD"
  $(echo $PARAM)

  # Python: subprocess 使用 shell=True + 拼接
  subprocess.run(f"cmd {user_input}", shell=True)
  os.system(f"rm {filename}")
  ```
- **修复**: 使用参数化调用，避免 shell=True

### CS-INJ-002: SQL 注入
- **严重性**: Critical
- **目标**: `scripts/*.sh`, `scripts/*.py`
- **检测**: 字符串拼接构造 SQL 语句
- **模式**:
  ```
  # Bash + DuckDB/SQLite
  duckdb "$DB" "INSERT INTO t VALUES ('$NAME')"

  # Python
  cursor.execute(f"SELECT * FROM t WHERE id = '{user_id}'")
  ```
- **修复**: 使用参数化查询

### CS-INJ-003: 危险函数调用
- **严重性**: High
- **目标**: `scripts/*.py`
- **检测**: 使用 eval/exec/compile 等危险函数
- **模式**:
  ```python
  eval(user_data)
  exec(code_string)
  compile(source, filename, mode)
  __import__(module_name)
  ```
- **修复**: 使用安全的替代方案

### CS-INJ-004: 反弹 Shell / 远程代码执行
- **严重性**: Critical
- **目标**: 全部文件
- **检测**: 反弹 shell 特征模式
- **模式**:
  ```
  bash -i >& /dev/tcp/
  nc -e /bin/sh
  python -c 'import socket,subprocess'
  curl ... | bash
  wget ... -O - | sh
  ```
- **修复**: 标记为恶意，建议移除

---

## 2. 敏感信息泄露 (SEC)

### CS-SEC-001: 硬编码密码
- **严重性**: Critical
- **目标**: 全部文件
- **检测**: 密码、密钥字面量
- **模式**:
  ```
  password = "hardcoded123"
  PASSWORD="admin123"
  neo4j_password.*=.*"[^"]{4,}"
  ```
- **排除**: 明显的占位符（`changeme`、`xxx`、`TODO`）

### CS-SEC-002: 硬编码 API Key / Token
- **严重性**: Critical
- **目标**: 全部文件
- **检测**: API Key、Token、Secret 字面量
- **模式**:
  ```
  # 通用模式
  api_key\s*=\s*["'][A-Za-z0-9_\-]{20,}["']
  token\s*=\s*["'][A-Za-z0-9_\-]{20,}["']

  # 特定平台
  sk-[A-Za-z0-9]{32,}          # OpenAI
  ghp_[A-Za-z0-9]{36}          # GitHub PAT
  AKIA[0-9A-Z]{16}             # AWS Access Key
  AIza[0-9A-Za-z_\-]{35}       # Google API Key
  ```
- **修复**: 使用环境变量

### CS-SEC-003: 私钥文件
- **严重性**: Critical
- **目标**: 全部文件
- **检测**: 包含私钥内容或引用私钥文件
- **模式**:
  ```
  -----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----
  .pem, .key 文件在仓库中
  ```
- **修复**: 加入 .gitignore，使用密钥管理服务

### CS-SEC-004: URL 中包含凭证
- **严重性**: High
- **目标**: 全部文件
- **检测**: URL 中嵌入用户名密码或 key 参数
- **模式**:
  ```
  https?://[^:]+:[^@]+@          # user:pass@host
  [?&]key=[A-Za-z0-9]{16,}       # ?key=xxx
  [?&]token=[A-Za-z0-9]{16,}     # ?token=xxx
  ```
- **修复**: 使用 header 传递认证信息

---

## 3. 依赖与供应链 (DEP)

### CS-DEP-001: 不安全的依赖安装
- **严重性**: High
- **目标**: `scripts/*.sh`, `skill.yaml`
- **检测**: curl pipe bash、不验证下载内容
- **模式**:
  ```bash
  curl ... | bash
  curl ... | sh
  wget ... -O - | sh
  pip install --break-system-packages
  ```
- **修复**: 验证下载内容的签名/哈希

### CS-DEP-002: 依赖版本未锁定
- **严重性**: Medium
- **目标**: `skill.yaml`, `requirements.txt`, `pyproject.toml`
- **检测**: 版本范围过宽或无版本约束
- **模式**:
  ```
  requests>=2.0          # 范围过宽
  requests               # 无版本约束
  ```
- **修复**: 使用精确版本或窄范围（`requests==2.31.0` 或 `~=2.31`）

### CS-DEP-003: 已知漏洞依赖
- **严重性**: High (根据 CVE 等级动态调整)
- **目标**: `skill.yaml`, `requirements.txt`
- **检测**: 查询 OSV / NVD 数据库
- **实现**: 解析依赖列表 → 查询漏洞数据库 → 报告 CVE
- **修复**: 升级到修复版本

### CS-DEP-004: 从不可信源下载数据
- **严重性**: Medium
- **目标**: `skill.yaml`, `scripts/*`
- **检测**: 从非官方源下载可执行文件或配置
- **模式**:
  ```yaml
  data_files:
    - url: https://raw.githubusercontent.com/...  # 无签名验证
  ```
- **修复**: 添加 SHA256 校验

---

## 4. 权限与隔离 (PRM)

### CS-PRM-001: 权限过度申请
- **严重性**: Medium
- **目标**: `SKILL.md`
- **检测**: Skill 声明了不必要的权限
- **规则**:
  - 读取型 skill 不应申请写权限
  - 分析型 skill 不应申请网络外连权限
  - 对比 skill 描述与实际 allowed-tools

### CS-PRM-002: 访问敏感系统路径
- **严重性**: High
- **目标**: `scripts/*`
- **检测**: 读写系统敏感路径
- **模式**:
  ```
  /etc/shadow
  /etc/passwd
  ~/.ssh/
  ~/.aws/credentials
  ~/.claude/
  /proc/
  /sys/
  ```
- **修复**: 使用最小必要路径

### CS-PRM-003: 环境变量滥用
- **严重性**: Medium
- **目标**: `scripts/*`
- **检测**: 读取大量不相关的环境变量
- **规则**: skill 只应读取自己声明需要的环境变量
- **模式**:
  ```python
  os.environ  # 读取全部环境变量
  for key in os.environ:  # 遍历环境变量
  ```
- **修复**: 使用 `os.environ.get("SPECIFIC_VAR")`

### CS-PRM-004: 不安全的文件权限
- **严重性**: Low
- **目标**: `scripts/*`
- **检测**: 脚本设置过于宽松的文件权限
- **模式**:
  ```
  chmod 777
  chmod a+rwx
  os.chmod(path, 0o777)
  ```
- **修复**: 使用最小必要权限（如 0o755 或 0o600）

---

## 5. Skill 配置与规范 (CFG)

### CS-CFG-001: 缺少 SKILL.md
- **严重性**: High
- **目标**: 项目根目录
- **检测**: 没有 SKILL.md 文件
- **修复**: 创建 SKILL.md，声明 skill 基本信息

### CS-CFG-002: 缺少版本声明
- **严重性**: Low
- **目标**: `SKILL.md`
- **检测**: SKILL.md 中没有版本号
- **修复**: 在 SKILL.md 中添加版本号

### CS-CFG-003: 缺少权限声明
- **严重性**: Medium
- **目标**: `SKILL.md`
- **检测**: 没有声明 allowed-tools 或权限需求
- **修复**: 明确声明 skill 需要的工具和权限

### CS-CFG-004: SKILL.md Prompt Injection 风险
- **严重性**: Medium
- **目标**: `SKILL.md`
- **检测**: SKILL.md 中包含可能的 prompt injection 载荷
- **模式**:
  ```
  Ignore previous instructions
  You are now
  Disregard all prior
  System:
  <system>
  ```
- **修复**: 移除可疑指令

---

## 规则严重性统计

| 严重性 | 数量 | 规则 |
|--------|------|------|
| **Critical** | 5 | INJ-001, INJ-002, INJ-004, SEC-001, SEC-002, SEC-003 |
| **High** | 6 | INJ-003, SEC-004, DEP-001, DEP-003, PRM-002, CFG-001 |
| **Medium** | 6 | DEP-002, DEP-004, PRM-001, PRM-003, CFG-003, CFG-004 |
| **Low** | 3 | PRM-004, CFG-002 |

---

## 规则引擎设计

### 规则定义格式 (YAML)

```yaml
id: CS-INJ-001
name: Shell Command Injection
severity: critical
category: injection
targets:
  - "scripts/*.sh"
  - "scripts/*.py"
patterns:
  - regex: 'eval\s+\$'
    language: bash
    description: "eval with unquoted variable"
  - regex: 'subprocess\.run\(f["\'].*\{.*\}.*["\'],\s*shell\s*=\s*True'
    language: python
    description: "subprocess with shell=True and f-string"
fix_suggestion: "Use parameterized commands instead of string interpolation"
references:
  - "https://owasp.org/www-community/attacks/Command_Injection"
cwe: CWE-78
```

### 扫描流程

```
1. 解析目标目录结构
2. 识别 Skill 类型（检查 SKILL.md 存在）
3. 按文件类型匹配适用规则
4. 执行规则检查（正则 / AST / 外部查询）
5. 收集 findings
6. 计算安全评分
7. 生成报告（终端 / JSON / SARIF）
```

### 评分计算

```
base_score = 100
for finding in findings:
    if finding.severity == "critical":
        base_score -= 25
    elif finding.severity == "high":
        base_score -= 15
    elif finding.severity == "medium":
        base_score -= 8
    elif finding.severity == "low":
        base_score -= 3

final_score = max(0, base_score)

grade = match final_score:
    90..=100 => "A"
    75..=89  => "B"
    60..=74  => "C"
    40..=59  => "D"
    _        => "F"
```
