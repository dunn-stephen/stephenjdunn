import Link from "next/link";
import clsx from "clsx";
import type { Route } from "next";
import type { ReactNode } from "react";

export function Panel({
  children,
  className,
  id,
  accent = false
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  accent?: boolean;
}) {
  return (
    <section
      id={id}
      className={clsx("os9-panel rounded-[3px] px-4 py-4 sm:px-5", accent && "os9-panel-accent", className)}
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
    <p
      className={clsx(
        "mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-subtle",
        className
      )}
    >
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
        "inline-flex items-center rounded-[2px] border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
        accent
          ? "border-[#6a88b3] bg-accent-surface text-accent-ink"
          : "border-[#8c8c8c] bg-[#f3f3f3] text-subtle",
        className
      )}
    >
      {children}
    </span>
  );
}

export function ProgressMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[120px_minmax(0,1fr)_44px]">
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-subtle">{label}</span>
      <div className="os9-surface-inset h-4 overflow-hidden rounded-[2px]">
        <div
          className="h-full border-r border-[#5d7da6] bg-[linear-gradient(180deg,#7fb0e3_0%,#2e67a8_100%)]"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-right text-[11px] font-bold text-accent-ink">{value}%</span>
    </div>
  );
}

const statusToneMap = {
  active: "border-[#5d7da6] bg-[#dce9fb] text-accent-ink",
  done: "border-[#8c8c8c] bg-[#efefef] text-subtle",
  wip: "border-[#9a8a47] bg-[#fff4cc] text-[#705f11]"
} as const;

const statusLabelMap = {
  active: "Active",
  done: "Done",
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
        "inline-flex min-w-[60px] items-center justify-center rounded-[2px] border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
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
    <Link href={href} className="os9-button inline-flex rounded-[2px]">
      <span aria-hidden="true">◀</span>
      <span>{children}</span>
    </Link>
  );
}
