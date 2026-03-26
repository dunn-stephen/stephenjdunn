import { siteConfig } from "@/lib/site";

export function ApolloLabsCta() {
  return (
    <section className="rounded-3xl border border-accent/40 bg-accent/5 p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-accent">apollo.labs</p>
      <h2 className="mt-3 text-2xl text-text">Need a consultant who can ship and explain the tradeoffs?</h2>
      <p className="mt-3 max-w-2xl leading-7 text-dim">
        Apollo Labs is where I package hands-on engineering work for teams that need product delivery, debugging, or AI workflow implementation without layers of process.
      </p>
      <a
        href={siteConfig.socialLinks.apolloLabs}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex rounded-2xl border border-accent px-4 py-3 text-sm text-accent transition hover:bg-accent hover:text-black"
      >
        $ open apollo-labs
      </a>
    </section>
  );
}
