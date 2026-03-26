import { SectionHeading } from "@/components/shared/SectionHeading";
import { getResumeData } from "@/lib/content";

const skillToneMap = {
  accent: "text-accent",
  green: "text-green",
  pink: "text-pink",
  cyan: "text-cyan"
} as const;

export default function ResumePage() {
  const resume = getResumeData();

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="resume.md"
        title="Professional experience presented like a terminal readout, not a PDF dump."
        description={resume.summary}
      />

      <section className="rounded-3xl border border-border bg-black/25 p-6">
        <div className="border-b border-border pb-4">
          <p className="text-xs uppercase tracking-[0.28em] text-dim">summary</p>
        </div>
        <p className="mt-5 max-w-3xl leading-7 text-text">{resume.summary}</p>
      </section>

      <section className="rounded-3xl border border-border bg-black/25 p-6">
        <p className="border-b border-border pb-4 text-xs uppercase tracking-[0.28em] text-dim">experience</p>
        <div className="mt-6 space-y-6">
          {resume.experience.map((role) => (
            <article key={`${role.company}-${role.role}`} className="border-l-2 border-accent pl-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl text-text">{role.role}</h2>
                  <p className="mt-1 text-dim">{role.company}</p>
                </div>
                <p className="text-sm text-dim">
                  {role.start} - {role.end}
                </p>
              </div>
              <ul className="mt-4 list-disc space-y-3 pl-5 marker:text-accent">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="leading-7 text-text">
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-3xl border border-border bg-black/25 p-6">
          <p className="border-b border-border pb-4 text-xs uppercase tracking-[0.28em] text-dim">skills</p>
          <div className="mt-6 grid gap-5">
            {resume.skills.map((group) => (
              <div key={group.category}>
                <h2 className={`text-sm uppercase tracking-[0.28em] ${skillToneMap[group.color]}`}>
                  {group.category}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span key={item} className="rounded-full border border-border px-3 py-1 text-sm text-text">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-black/25 p-6">
          <p className="border-b border-border pb-4 text-xs uppercase tracking-[0.28em] text-dim">interests</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {resume.interests.map((interest) => (
              <span key={interest} className="rounded-full border border-border px-3 py-1 text-sm text-cyan">
                {interest}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
