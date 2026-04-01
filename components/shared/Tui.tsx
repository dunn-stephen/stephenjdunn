import Link from "next/link";
import clsx from "clsx";
import type { Route } from "next";
import type { ReactNode } from "react";

export function Panel({
  children,
  className,
  accent = false
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <section
      className={clsx(
        "border border-border bg-panel px-4 py-4 sm:px-5",
        accent && "border-l-2 border-l-accent",
        className
      )}
    >
      {children}
    </section>
  );
}

export function SectionLabel({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={clsx("mb-3 text-[0.6rem] uppercase tracking-[0.32em] text-subtle", className)}>
      {children}
    </p>
  );
}

export function Tag({
  children,
  accent = false,
  className
}: {
  children: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center border px-2 py-1 text-[0.6rem] uppercase tracking-[0.16em]",
        accent ? "border-[#6a320d] bg-accent-surface text-accent" : "border-border bg-surface text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ProgressMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="min-w-[128px] text-[0.68rem] text-muted">{label}</span>
      <div className="h-[6px] flex-1 border border-border bg-surface">
        <div className="h-full bg-accent" style={{ width: `${value}%` }} />
      </div>
      <span className="min-w-[34px] text-right text-[0.6rem] text-accent">{value}%</span>
    </div>
  );
}

const statusToneMap = {
  active: "border-[#3a1800] text-accent",
  done: "border-border bg-surface text-subtle",
  wip: "border-[#5f471d] bg-[#2a1e0f] text-[#d59a56]"
} as const;

const statusLabelMap = {
  active: "ACTIVE",
  done: "DONE",
  wip: "WIP"
} as const;

export function StatusPill({
  status,
  className
}: {
  status: keyof typeof statusToneMap;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex min-w-[58px] items-center justify-center border px-2 py-1 text-[0.58rem] uppercase tracking-[0.18em]",
        statusToneMap[status],
        className
      )}
    >
      {statusLabelMap[status]}
    </span>
  );
}

export function BackLink({
  href,
  children
}: {
  href: Route;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 border border-border bg-panel px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-muted transition hover:border-[#6a320d] hover:text-accent"
    >
      <span aria-hidden="true">◄</span>
      <span>{children}</span>
    </Link>
  );
}
