"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type StandaloneExperienceShellProps = {
  eyebrow?: string;
  title: string;
  meta?: string;
  headerActions?: ReactNode;
  children: ReactNode;
  shellClassName?: string;
  bodyClassName?: string;
  titleClassName?: string;
};

export function StandaloneExperienceShell({
  eyebrow,
  title,
  meta,
  headerActions,
  children,
  shellClassName,
  bodyClassName,
  titleClassName
}: StandaloneExperienceShellProps) {
  return (
    <section
      className={clsx(
        "mx-auto flex min-h-0 w-full max-w-[1040px] flex-col overflow-hidden border border-border bg-surface shadow-terminal",
        shellClassName
      )}
    >
      <div className="shrink-0 flex items-center justify-between gap-4 border-b border-border bg-panel px-4 py-3">
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            {eyebrow ? <p className="text-[0.6rem] uppercase tracking-[0.22em] text-subtle">{eyebrow}</p> : null}
            <div className={clsx("flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4", eyebrow ? "mt-1" : undefined)}>
              <p className={clsx("text-[0.72rem] uppercase tracking-[0.18em] text-accent", titleClassName)}>{title}</p>
              {meta ? <p className="text-[0.52rem] uppercase tracking-[0.26em] text-faint">{meta}</p> : null}
            </div>
          </div>
          {headerActions ? <div className="min-w-0 w-full lg:w-auto lg:max-w-[700px]">{headerActions}</div> : null}
        </div>
      </div>

      <div className={clsx("flex min-h-0 flex-1 overflow-hidden bg-shell", bodyClassName)}>{children}</div>
    </section>
  );
}
