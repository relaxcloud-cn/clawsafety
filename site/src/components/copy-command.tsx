"use client";

import { useState } from "react";

export function CopyCommand({
  command,
  label = "复制",
  className = "",
}: {
  command: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={className || "ghost-button compact-button"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(command);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "已复制" : label}
    </button>
  );
}
