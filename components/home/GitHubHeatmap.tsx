const weeks = Array.from({ length: 18 }, (_, week) =>
  Array.from({ length: 7 }, (_, day) => ((week * 5 + day * 3) % 5))
);

const intensity = [
  "bg-white/5",
  "bg-accent/20",
  "bg-accent/40",
  "bg-accent/65",
  "bg-accent"
];

export function GitHubHeatmap() {
  return (
    <section className="rounded-3xl border border-border bg-black/35 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-dim">github.activity</p>
          <h2 className="mt-2 text-xl text-text">Contribution snapshot</h2>
        </div>
        <p className="text-sm text-dim">static fallback</p>
      </div>

      <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1.5">
        {weeks.flatMap((week, weekIndex) =>
          week.map((value, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`aspect-square rounded-[6px] border border-black/20 ${intensity[value]}`}
            />
          ))
        )}
      </div>
    </section>
  );
}
