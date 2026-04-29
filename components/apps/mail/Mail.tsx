"use client";

import { buildMailtoLink, siteConfig } from "@/lib/site";
import type { AppProps } from "@/types";

const MAIL_SUBJECT = "Hello from stephenjdunn.com";
const MAILTO_HREF = buildMailtoLink(MAIL_SUBJECT);
const RECIPIENT_EMAIL = siteConfig.socialLinks.email.replace(/^mailto:/, "").split("?")[0];

export function Mail(_: AppProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#d4d0c8] text-[#1f1f1f]">
      <div className="border-b border-[#8f8f8f] bg-[#d9d9d9] px-4 py-2">
        <h2 className="m-0 font-['Chicago'] text-[11px] text-[#3f3f3f]">New Message</h2>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 bg-[#e5e5e5] p-3">
        <div className="os9-surface-outset flex flex-col gap-3 bg-[#ececec] p-3">
          <div className="flex items-center gap-3">
            <label
              className="w-9 shrink-0 font-['Chicago'] text-[11px] uppercase tracking-[0.04em] text-[#4b4b4b]"
              htmlFor="mail-to-field"
            >
              To:
            </label>
            <input
              id="mail-to-field"
              className="os9-surface-inset min-w-0 flex-1 bg-white px-3 py-2 text-[12px] text-[#1f1f1f] outline-none"
              readOnly
              value={RECIPIENT_EMAIL}
            />
          </div>

          <div className="os9-surface-inset flex min-h-0 flex-1 flex-col justify-between gap-4 bg-white p-4">
            <div className="space-y-3 text-[12px] leading-5 text-[#303030]">
              <p className="m-0 font-['Chicago'] text-[11px] uppercase tracking-[0.05em] text-[#5b5b5b]">
                Message
              </p>
              <p className="m-0">
                This launcher opens your default mail client with Stephen&apos;s address and a pre-filled
                subject line.
              </p>
              <p className="m-0 text-[#5a5a5a]">
                Subject: <span className="text-[#1f1f1f]">{MAIL_SUBJECT}</span>
              </p>
            </div>

            <div className="flex justify-end">
              <a className="os9-button inline-flex rounded-[2px] px-4 py-1 text-[11px]" href={MAILTO_HREF}>
                Open in Mail
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
