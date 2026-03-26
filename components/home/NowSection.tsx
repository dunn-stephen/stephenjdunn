type NowSectionProps = {
  content: string;
};

export function NowSection({ content }: NowSectionProps) {
  return (
    <section className="rounded-3xl border border-border bg-black/35 p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-dim">now.md</p>
      <div className="mt-4 space-y-3 text-text">
        {content.split("\n").map((line) => (
          <p key={line} className="leading-7">
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
