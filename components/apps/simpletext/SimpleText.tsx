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
    <div className="flex h-full min-h-0 flex-col bg-[#d4d0c8]">
      <div className="flex items-center justify-between border-b border-[#8f8f8f] bg-[#d9d9d9] px-4 py-2">
        <span className="font-['Chicago'] text-[11px] text-[#3f3f3f]">Resume</span>
        <a
          className="os9-button inline-flex rounded-[2px] px-3 py-1 text-[11px]"
          href={siteConfig.socialLinks.linkedin}
          target="_blank"
          rel="noreferrer"
        >
          View on LinkedIn
        </a>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-[#efefef] p-3 app-scrollbar">
        <div className="min-h-full border border-[#8f8f8f] bg-white p-4 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#d0d0d0]">
          <pre className="whitespace-pre-wrap font-mono text-[12px] leading-5 text-[#1f1f1f]">
            {RESUME_LINES.join("\n")}
          </pre>
        </div>
      </div>
    </div>
  );
}
