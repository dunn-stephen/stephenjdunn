"use client";

import { siteConfig } from "@/lib/site";
import type { AppProps } from "@/types";

const RESUME_LINES = [
  "Stephen Dunn",
  "Software Engineer · New York, NY",
  "",
  "----------------------------------------",
  "EXPERIENCE",
  "",
  "Senior Software Engineer · Blueshift                         2022 – Present",
  "  Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "",
  "Software Engineer · Previous Company                         2019 – 2022",
  "  Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "  Sed do eiusmod tempor incididunt ut labore.",
  "",
  "----------------------------------------",
  "SKILLS",
  "",
  "Languages:    TypeScript, JavaScript, Swift, Python",
  "Frameworks:   Next.js, React, Node.js",
  "Tools:        MCP, Zustand, Tailwind CSS, Netlify",
  "Other:        System design, API integration, developer tooling",
  "",
  "----------------------------------------",
  "EDUCATION",
  "",
  "B.S. Computer Science · University                           [Year]",
  "",
  "----------------------------------------",
  "LINKS",
  "",
  "GitHub:    github.com/dunn-stephen",
  "LinkedIn:  linkedin.com/in/dunn-stephen",
  "Site:      stephenjdunn.com",
  "",
  "----------------------------------------",
  "PLACEHOLDER — Stephen to rewrite before launch."
];

export function SimpleText(_: AppProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#dadada]">
      <div className="relative mx-1 mt-1 flex min-h-0 flex-1 flex-col border border-black bg-white shadow-[-1px_-1px_0_#9c9c9c,1px_1px_0_#ffffff,inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#acacac]">
        <div className="app-scrollbar min-h-0 flex-1 overflow-auto px-4 py-3">
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-[1.45] text-[#1f1f1f]">
            {RESUME_LINES.join("\n")}
          </pre>
        </div>
      </div>
      <div className="flex items-center justify-end px-2 pb-2">
        <a
          className="os9-button inline-flex min-h-[22px] rounded-none px-3 text-[11px]"
          href={siteConfig.socialLinks.linkedin}
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
      </div>
    </div>
  );
}
