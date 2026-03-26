type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <header className="space-y-3">
      <p className="text-xs uppercase tracking-[0.35em] text-dim">{eyebrow}</p>
      <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">{title}</h1>
      {description ? <p className="max-w-3xl text-base leading-7 text-dim">{description}</p> : null}
    </header>
  );
}
