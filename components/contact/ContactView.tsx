import { QuickMessageForm } from "@/components/contact/QuickMessageForm";
import { Panel, SectionLabel } from "@/components/shared/Tui";
import { siteConfig } from "@/lib/site";

const contactMethods = [
  {
    label: "Email",
    value: "stephendunn2424@gmail.com",
    href: siteConfig.socialLinks.email
  },
  {
    label: "GitHub",
    value: "github.com/dunn-stephen",
    href: siteConfig.socialLinks.github
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/stephendunn24",
    href: siteConfig.socialLinks.linkedin
  }
];

export function ContactView() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
      <div className="space-y-5">
        <Panel>
          <SectionLabel>Reach Out</SectionLabel>
          <div className="space-y-2">
            {contactMethods.map((method) => (
              <a
                key={method.label}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noreferrer" : undefined}
                className="flex items-center gap-3 border border-border bg-panel px-3 py-3 text-[0.72rem] transition hover:border-[#6a320d]"
              >
                <span className="flex-1 text-muted">{method.label}</span>
                <span className="text-[0.62rem] uppercase tracking-[0.12em] text-accent">
                  {method.value} ↗
                </span>
              </a>
            ))}
          </div>
        </Panel>
      </div>

      <Panel>
        <SectionLabel>Quick Message</SectionLabel>
        <QuickMessageForm />
      </Panel>
    </div>
  );
}
