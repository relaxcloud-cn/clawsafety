"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { buildSearchIndex, navLinks } from "@/lib/registry";

type Session = {
  name: string;
  email: string;
};

type AuthStep = "signin" | "signup" | "verify" | "forgot";

const SESSION_KEY = "clawsafety-registry-session";
const FEEDBACK_KEY = "clawsafety-registry-feedback";

function isInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest("input, textarea, select, button, [contenteditable='true']"),
  );
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function statusTone(state: "verified" | "divergent" | "critical") {
  if (state === "verified") {
    return "safe";
  }
  if (state === "divergent") {
    return "warn";
  }
  return "danger";
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.localStorage.getItem(SESSION_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as Session;
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
  });
  const [toast, setToast] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("bug");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const deferredQuery = useDeferredValue(searchText);
  const searchResults = buildSearchIndex().filter((entry) => {
    if (!deferredQuery.trim()) {
      return true;
    }

    const needle = deferredQuery.toLowerCase();
    return (
      entry.label.toLowerCase().includes(needle) ||
      entry.detail.toLowerCase().includes(needle)
    );
  });

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && !isInputTarget(event.target)) {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setAuthOpen(false);
        setFeedbackOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const submitAuth = () => {
    if (!email.trim()) {
      setToast("请输入邮箱以继续");
      return;
    }

    if (authStep === "signup") {
      setAuthStep("verify");
      setToast("验证码已发送至邮箱");
      return;
    }

    const nextSession = {
      name: email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "") || "operator",
      email,
    };

    setSession(nextSession);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setAuthOpen(false);
    setToast("已登录");
  };

  const verifySignup = () => {
    if (verifyCode.trim().length < 4) {
      setToast("请输入验证码");
      return;
    }

    submitAuth();
  };

  const signOut = () => {
    setSession(null);
    window.localStorage.removeItem(SESSION_KEY);
    setToast("已退出登录");
  };

  const submitFeedback = () => {
    if (feedbackMessage.trim().length < 10) {
      setToast("反馈内容至少需要 10 个字符");
      return;
    }

    const payload = {
      type: feedbackType,
      message: feedbackMessage.trim(),
      pathname,
      submittedAt: new Date().toISOString(),
    };

    const existing = window.localStorage.getItem(FEEDBACK_KEY);
    const items = existing ? JSON.parse(existing) : [];
    items.push(payload);
    window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(items));

    setFeedbackMessage("");
    setFeedbackOpen(false);
    setToast("反馈已保存");
  };

  return (
    <>
      <header className="registry-header">
        <div className="container shell-topbar">
          <Link href="/" className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">
              <span />
            </span>
            <span className="brand-wordmark">CLAWSAFETY</span>
          </Link>

          <button
            type="button"
            className="top-search-trigger"
            onClick={() => setSearchOpen(true)}
            aria-label="Search the registry"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span>URL、GitHub 仓库、技能名称或哈希</span>
            <kbd>/</kbd>
          </button>

          <div className="top-actions">
            <Link href="/dashboard" className="ghost-button compact-button">
              控制台
            </Link>
            {session ? (
              <button type="button" className="primary-button compact-button" onClick={signOut}>
                {session.name}
              </button>
            ) : (
              <button
                type="button"
                className="primary-button compact-button"
                onClick={() => {
                  setAuthStep("signin");
                  setAuthOpen(true);
                }}
              >
                登录
              </button>
            )}
          </div>
        </div>

        <div className="container shell-nav">
          <nav className="nav-row" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(pathname, link.href) ? "nav-link active" : "nav-link"}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="nav-note">
            已验证注册表，消费端复检已开启
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <div className="footer-title">ClawSafety 注册表</div>
            <p className="footer-copy">
              Agent Skill 安全搜索、扫描与分发平台
            </p>
          </div>
          <div>
            <div className="footer-title">搜索</div>
            <div className="footer-links">
              <Link href="/">首页</Link>
              <Link href="/scan">扫描</Link>
              <Link href="/skills">技能库</Link>
              <Link href="/docs">文档</Link>
            </div>
          </div>
          <div>
            <div className="footer-title">治理</div>
            <div className="footer-links">
              <Link href="/security">安全</Link>
              <Link href="/pricing">定价</Link>
              <Link href="/dashboard">控制台</Link>
              <Link href="/blog">研究</Link>
            </div>
          </div>
          <div>
            <div className="footer-title">分发</div>
            <div className="footer-links">
              <a href="https://github.com/relaxcloud-cn/clawsafety" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="/skill.md">AI 工具安装</a>
              <button type="button" className="footer-button" onClick={() => setFeedbackOpen(true)}>
                反馈
              </button>
            </div>
          </div>
        </div>
      </footer>

      {searchOpen ? (
        <div className="overlay-shell" role="dialog" aria-modal="true" aria-label="Search">
          <div className="overlay-panel search-panel">
            <div className="overlay-head">
              <div>
                <div className="eyebrow">搜索</div>
                <h2>搜索技能、页面和验证安装路径</h2>
              </div>
              <button type="button" className="ghost-button compact-button" onClick={() => setSearchOpen(false)}>
                关闭
              </button>
            </div>

            <label className="search-field">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                autoFocus
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="搜索技能、发布者、页面..."
              />
            </label>

            <div className="overlay-results">
              {searchResults.slice(0, 10).map((entry) => (
                <button
                  key={`${entry.kind}-${entry.href}`}
                  type="button"
                  className="search-result"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchText("");
                    router.push(entry.href);
                  }}
                >
                  <span className={`mini-pill ${entry.kind === "skill" ? "warn" : "neutral"}`}>
                    {entry.kind}
                  </span>
                  <div>
                    <strong>{entry.label}</strong>
                    <p>{entry.detail}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {authOpen ? (
        <div className="overlay-shell" role="dialog" aria-modal="true" aria-label="Authentication">
          <div className="overlay-panel auth-panel">
            <div className="overlay-head">
              <div>
                <div className="eyebrow">账号</div>
                <h2>
                  {authStep === "signin"
                    ? "登录以保存和分享"
                    : authStep === "signup"
                      ? "创建账号"
                      : authStep === "verify"
                        ? "验证邮箱"
                        : "重置密码"}
                </h2>
              </div>
              <button type="button" className="ghost-button compact-button" onClick={() => setAuthOpen(false)}>
                关闭
              </button>
            </div>

            {(authStep === "signin" || authStep === "signup" || authStep === "forgot") && (
              <div className="auth-fields">
                <label>
                  邮箱
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="operator@team.dev"
                    type="email"
                  />
                </label>
                {authStep !== "forgot" ? (
                  <label>
                    密码
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="输入任意密码"
                      type="password"
                    />
                  </label>
                ) : null}
              </div>
            )}

            {authStep === "verify" ? (
              <div className="auth-fields">
                <label>
                  验证码
                  <input
                    value={verifyCode}
                    onChange={(event) => setVerifyCode(event.target.value)}
                    placeholder="000000"
                    inputMode="numeric"
                  />
                </label>
              </div>
            ) : null}

            <div className="auth-actions">
              {authStep === "signin" ? (
                <>
                  <button type="button" className="primary-button" onClick={submitAuth}>
                    登录
                  </button>
                  <button type="button" className="ghost-button" onClick={() => setAuthStep("signup")}>
                    注册账号
                  </button>
                  <button type="button" className="ghost-button" onClick={() => setAuthStep("forgot")}>
                    忘记密码
                  </button>
                </>
              ) : null}

              {authStep === "signup" ? (
                <>
                  <button type="button" className="primary-button" onClick={submitAuth}>
                    发送验证码
                  </button>
                  <button type="button" className="ghost-button" onClick={() => setAuthStep("signin")}>
                    返回登录
                  </button>
                </>
              ) : null}

              {authStep === "verify" ? (
                <>
                  <button type="button" className="primary-button" onClick={verifySignup}>
                    验证
                  </button>
                  <button type="button" className="ghost-button" onClick={() => setAuthStep("signin")}>
                    返回
                  </button>
                </>
              ) : null}

              {authStep === "forgot" ? (
                <>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      setToast("重置链接已发送至邮箱");
                      setAuthStep("signin");
                    }}
                  >
                    发送重置链接
                  </button>
                  <button type="button" className="ghost-button" onClick={() => setAuthStep("signin")}>
                    返回
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="feedback-trigger"
        onClick={() => setFeedbackOpen((value) => !value)}
      >
        反馈
      </button>

      {feedbackOpen ? (
        <aside className="feedback-panel" aria-label="Send feedback">
          <div className="feedback-head">
            <div>
              <div className="eyebrow">产品反馈</div>
              <h3>报告问题或功能建议</h3>
            </div>
            <button type="button" className="ghost-button compact-button" onClick={() => setFeedbackOpen(false)}>
              关闭
            </button>
          </div>

          <div className="feedback-types">
            {["bug", "feature", "other"].map((type) => (
              <button
                key={type}
                type="button"
                className={feedbackType === type ? "mini-pill safe" : "mini-pill neutral"}
                onClick={() => setFeedbackType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <textarea
            value={feedbackMessage}
            onChange={(event) => setFeedbackMessage(event.target.value)}
            placeholder="描述问题、缺失的流程或设计不一致之处"
          />

          <button type="button" className="primary-button" onClick={submitFeedback}>
            提交
          </button>
        </aside>
      ) : null}

      {session ? (
        <div className="session-chip">
          <span className={`mini-pill ${statusTone("verified")}`}>demo</span>
          已登录：{session.email}
        </div>
      ) : null}

      {toast ? <div className="toast">{toast}</div> : null}
    </>
  );
}
