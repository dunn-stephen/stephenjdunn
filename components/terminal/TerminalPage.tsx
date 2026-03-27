import type { ReactNode } from "react";
import { shellHost, shellUser } from "@/lib/site";

type TerminalPageProps = {
  command: string;
  cwd?: string;
  children: ReactNode;
};

export function TerminalPage({ command, cwd = "~", children }: TerminalPageProps) {
  return (
    <article className="rounded-3xl border border-border bg-black/25">
      <div className="border-b border-border px-5 py-4">
        <p className="text-sm text-text">
          <span className="text-accent">
            {shellUser}@{shellHost}:{cwd}$
          </span>{" "}
          {command}
        </p>
      </div>
      <div className="px-5 py-5">{children}</div>
    </article>
  );
}
