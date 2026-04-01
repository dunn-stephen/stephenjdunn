"use client";

import { useState } from "react";
import { buildMailtoLink, profileData } from "@/lib/site";

export function QuickMessageForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const isDisabled = message.trim().length === 0;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (isDisabled) {
          return;
        }

        const body = [`Name: ${name || "Anonymous"}`, "", message].join("\n");
        window.location.href = buildMailtoLink(profileData.contact.quickMessageSubject, body);
      }}
      className="p-4"
    >
      <div className="mb-3">
        <label
          htmlFor="contact-name"
          className="mb-1 block text-[0.58rem] uppercase tracking-[0.14em] text-subtle"
        >
          Name
        </label>
        <input
          id="contact-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full border border-border bg-surface px-3 py-2 text-[0.72rem] text-text outline-none transition placeholder:text-subtle focus:border-[#6a320d]"
          placeholder="Your name"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="contact-message"
          className="mb-1 block text-[0.58rem] uppercase tracking-[0.14em] text-subtle"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="w-full resize-y border border-border bg-surface px-3 py-2 text-[0.72rem] leading-6 text-text outline-none transition placeholder:text-subtle focus:border-[#6a320d]"
          placeholder="Tell me what you need shipped, fixed, or untangled."
        />
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className="inline-flex items-center gap-2 border border-border bg-panel px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted transition enabled:hover:border-[#6a320d] enabled:hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        [ Send ► ]
      </button>
    </form>
  );
}
