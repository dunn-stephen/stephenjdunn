import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="rounded-3xl border border-border bg-black/25 p-8">
      <p className="text-xs uppercase tracking-[0.28em] text-dim">404</p>
      <h1 className="mt-3 text-4xl text-text">File not found.</h1>
      <p className="mt-4 max-w-2xl leading-7 text-dim">
        The requested path does not exist in this portfolio tree.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-2xl border border-accent px-4 py-3 text-sm text-accent transition hover:bg-accent hover:text-black"
      >
        return to README.md
      </Link>
    </div>
  );
}
