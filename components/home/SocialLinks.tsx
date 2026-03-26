import { siteConfig } from "@/lib/site";

const items = [
  { label: "github", href: siteConfig.socialLinks.github },
  { label: "linkedin", href: siteConfig.socialLinks.linkedin },
  { label: "email", href: siteConfig.socialLinks.email }
];

export function SocialLinks() {
  return (
    <section className="rounded-3xl border border-border bg-black/35 p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-dim">links</p>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith("http") ? "_blank" : undefined}
            rel={item.href.startsWith("http") ? "noreferrer" : undefined}
            className="rounded-2xl border border-border px-4 py-3 text-sm text-dim transition hover:border-accent hover:text-accent"
          >
            $ open {item.label}
          </a>
        ))}
      </div>
    </section>
  );
}
