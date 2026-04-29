import Link from "next/link";
import { Panel, SectionLabel } from "@/components/shared/Tui";

export default function NotFoundPage() {
  return (
    <Panel className="max-w-3xl">
      <SectionLabel>404</SectionLabel>
      <h1 className="text-[1rem] uppercase tracking-[0.2em] text-text">File not found.</h1>
      <p className="mt-4 max-w-2xl text-[0.72rem] leading-7 text-muted">
        The requested path does not exist in this portfolio tree.
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-2 border border-border bg-panel px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted transition hover:border-[#6a320d] hover:text-accent"
      >
        return to home
      </Link>
    </Panel>
  );
}
