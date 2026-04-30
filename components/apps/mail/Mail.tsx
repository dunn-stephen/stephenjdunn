"use client";

import { useSound } from "@/hooks/useSound";
import { buildMailtoLink, siteConfig } from "@/lib/site";
import type { AppProps } from "@/types";

const MAIL_SUBJECT = "Hello from stephenjdunn.com";
const MAILTO_HREF = buildMailtoLink(MAIL_SUBJECT);
const RECIPIENT_EMAIL = siteConfig.socialLinks.email.replace(/^mailto:/, "").split("?")[0];

export function Mail(_: AppProps) {
  const { play: playClick } = useSound("click");

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#dadada] text-[#1f1f1f]">
      <div className="mx-1 mt-1 border border-black bg-[#dadada] px-3 py-2 shadow-[-1px_-1px_0_#9c9c9c,1px_1px_0_#ffffff,inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#b3b3b3]">
        <div className="mb-2 flex items-center gap-2">
          <label
            className="w-8 shrink-0 font-['Chicago'] text-[11px] text-[#3f3f3f]"
            htmlFor="mail-to-field"
          >
            To:
          </label>
          <input
            id="mail-to-field"
            className="min-w-0 flex-1 border border-black bg-white px-2 py-[3px] font-['Charcoal'] text-[12px] text-[#1f1f1f] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#b0b0b0] outline-none"
            readOnly
            value={RECIPIENT_EMAIL}
          />
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="w-8 shrink-0 font-['Chicago'] text-[11px] text-[#3f3f3f]">Subj:</span>
          <div className="min-w-0 flex-1 border border-black bg-white px-2 py-[3px] font-['Charcoal'] text-[12px] text-[#1f1f1f] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#b0b0b0]">
            {MAIL_SUBJECT}
          </div>
        </div>
      </div>

      <div className="relative mx-1 mb-1 mt-[-1px] flex min-h-0 flex-1 flex-col border border-black bg-white shadow-[-1px_-1px_0_#9c9c9c,1px_1px_0_#ffffff,inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#acacac]">
        <div className="app-scrollbar min-h-0 flex-1 overflow-auto px-4 py-3 font-['Charcoal'] text-[12px] leading-[1.45] text-[#2d2d2d]">
          <p className="m-0">This opens your default mail client with Stephen&apos;s address pre-filled.</p>
          <p className="mt-3">Use this when you want to send a real message instead of browsing around the desktop.</p>
        </div>
        <div className="flex justify-end border-t border-[#c7c7c7] bg-[#dadada] px-2 py-2">
          <a
            className="os9-button inline-flex min-h-[22px] rounded-none px-4 text-[11px]"
            href={MAILTO_HREF}
            onClick={() => playClick()}
          >
            Open in Mail
          </a>
        </div>
      </div>
    </div>
  );
}
