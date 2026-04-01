import { QuickMessageForm } from "@/components/contact/QuickMessageForm";
import { Panel, SectionLabel } from "@/components/shared/Tui";
import { profileData, siteConfig } from "@/lib/site";

const contactMethods = [
  {
    label: "Email",
    value: "stephen@stephenjdunn.com",
    href: siteConfig.socialLinks.email
  },
  {
    label: "GitHub",
    value: "github.com/dunn-stephen",
    href: siteConfig.socialLinks.github
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/stephendunn",
    href: siteConfig.socialLinks.linkedin
  },
  {
    label: "Apollo Labs",
    value: "apollolabsconsulting.com",
    href: siteConfig.socialLinks.apolloLabs
  }
];

const availabilityToneMap = {
  open: "bg-[#1a5a1a]",
  neutral: "bg-[#2a2a2a]",
  closed: "bg-[#5a1a1a]"
} as const;

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

        <Panel>
          <SectionLabel>Availability</SectionLabel>
          <div className="space-y-2">
            {profileData.contact.availability.map((item) => (
              <div key={item.label} className="flex items-center gap-2 border-b border-border py-2 last:border-b-0">
                <span
                  className={`h-[5px] w-[5px] rounded-full ${availabilityToneMap[item.tone]}`}
                  aria-hidden="true"
                />
                <span className="text-[0.72rem] text-muted">{item.label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div>
        <SectionLabel>Quick Message</SectionLabel>
        <QuickMessageForm />
      </div>
    </div>
  );
}
