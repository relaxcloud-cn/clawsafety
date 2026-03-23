import type { Metadata } from "next";
import { Chakra_Petch, DM_Sans, IBM_Plex_Mono } from "next/font/google";

import { SiteShell } from "@/components/site-shell";
import "./globals.css";

const bodySans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displaySans = Chakra_Petch({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ClawSafety Registry",
  description:
    "VirusTotal-inspired search and SkillSafe-style verified distribution for Agent Skills, built on ClawSafety's scanner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body
        className={`${bodySans.variable} ${displaySans.variable} ${bodyMono.variable} antialiased`}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
