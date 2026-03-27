import { TerminalPage } from "@/components/terminal/TerminalPage";
import { siteConfig } from "@/lib/site";

export default function ContactPage() {
  return (
    <TerminalPage command="cat contact.md" cwd="~">
      <div className="mb-6 space-y-2 text-sm leading-7 text-dim">
        <p>Reach out if you need software shipped, untangled, or explained clearly.</p>
      </div>
      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-border bg-black/25 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-dim">consulting</p>
          <h2 className="mt-3 text-2xl text-text">Apollo Labs</h2>
          <p className="mt-4 max-w-2xl leading-7 text-dim">
            I work with teams that need engineering execution without excess ceremony: product delivery, AI workflow implementation, debugging, and system cleanup.
          </p>
          <a
            href={siteConfig.socialLinks.apolloLabs}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-2xl border border-accent px-4 py-3 text-sm text-accent transition hover:bg-accent hover:text-black"
          >
            open Apollo Labs
          </a>
        </div>

        <div className="rounded-3xl border border-border bg-black/25 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-dim">direct</p>
          <div className="mt-5 grid gap-3">
            <a
              href={siteConfig.socialLinks.email}
              className="rounded-2xl border border-border px-4 py-3 text-dim transition hover:border-accent hover:text-accent"
            >
              mailto: stephen@stephenjdunn.com
            </a>
            <a
              href={siteConfig.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-border px-4 py-3 text-dim transition hover:border-accent hover:text-accent"
            >
              github.com/stephendunn
            </a>
            <a
              href={siteConfig.socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-border px-4 py-3 text-dim transition hover:border-accent hover:text-accent"
            >
              linkedin.com/in/stephenjdunn
            </a>
          </div>
        </div>
      </section>
    </TerminalPage>
  );
}
