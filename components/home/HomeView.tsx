import Link from "next/link";
import clsx from "clsx";
import { ProgressMeter, SectionLabel, StatusPill, Tag } from "@/components/shared/Tui";
import { homeDashboard } from "@/lib/home";

function DashboardCard({
  title,
  href,
  accent = false,
  children
}: {
  title: string;
  href: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={clsx(
        "group/card flex h-full flex-col border border-border bg-panel transition-[border-color,box-shadow] duration-200 hover:border-[#6a320d] hover:shadow-[0_0_0_1px_rgba(232,100,12,0.22),0_0_18px_rgba(232,100,12,0.12)]",
        accent && "border-[#6a320d] shadow-[inset_0_0_0_1px_rgba(232,100,12,0.16)]"
      )}
    >
      <div
        className={clsx(
          "flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-5",
          accent && "border-b-[#6a320d]"
        )}
      >
        <p className="text-[0.62rem] uppercase tracking-[0.24em] text-subtle">{title}</p>
        <Link
          href={href}
          className="text-[0.58rem] uppercase tracking-[0.16em] text-subtle"
        >
          open -&gt;
        </Link>
      </div>
      <div className="flex-1 px-4 py-4 sm:px-5">{children}</div>
    </section>
  );
}

const availabilityToneMap = {
  open: "bg-[#1a5a1a]",
  neutral: "bg-[#7a5a20]",
  closed: "bg-[#5a1a1a]"
} as const;

export function HomeView() {
  return (
    <div className="space-y-5">
      <section className="border border-border bg-panel px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-3 text-[0.6rem] uppercase tracking-[0.16em] text-subtle sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-[#27c93f]" aria-hidden="true" />
            <span>{homeDashboard.ticker.label}</span>
          </div>
          <div className="app-scrollbar flex min-w-0 flex-1 items-center gap-3 overflow-x-auto whitespace-nowrap text-muted">
            {homeDashboard.ticker.items.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                {index > 0 ? <span className="text-faint">•</span> : null}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border border-border bg-border">
        <div className="grid grid-cols-2 gap-px bg-border xl:grid-cols-4">
          {homeDashboard.stats.map((stat) => (
            <div key={stat.label} className="bg-panel px-4 py-5 text-center sm:px-5">
              <p className="text-[1.35rem] text-accent">{stat.value}</p>
              <p className="mt-2 text-[0.58rem] uppercase tracking-[0.28em] text-subtle">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div>
        <SectionLabel>Quick Access</SectionLabel>
        <div className="grid gap-5 lg:grid-cols-2">
          <DashboardCard title="Projects" href="/projects">
            <div className="space-y-4">
              {homeDashboard.projects.items.map((project, index) => (
                <div
                  key={project.index}
                  className={clsx(index < homeDashboard.projects.items.length - 1 && "border-b border-border pb-4")}
                >
                  <div className="grid gap-2 sm:grid-cols-[30px_minmax(0,1fr)]">
                    <span className="pt-1 text-[0.58rem] uppercase tracking-[0.18em] text-faint">
                      {project.index}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[0.8rem] uppercase tracking-[0.12em] text-text">{project.title}</p>
                        <StatusPill status={project.status} className="min-w-0 px-2 py-0.5" />
                      </div>
                      <p className="mt-2 text-[0.68rem] leading-6 text-muted">{project.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.tags.map((tag, tagIndex) => (
                          <Tag key={tag} accent={tagIndex === 0}>
                            {tag}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Latest Posts" href="/blog">
            <div className="space-y-4">
              {homeDashboard.posts.items.map((post, index) => (
                <div
                  key={`${post.date}-${post.title}`}
                  className={clsx(index < homeDashboard.posts.items.length - 1 && "border-b border-border pb-4")}
                >
                  <p className="text-[0.58rem] uppercase tracking-[0.16em] text-subtle">
                    {post.date} · {post.meta}
                  </p>
                  <h2 className="mt-2 text-[0.8rem] tracking-[0.08em] text-text">{post.title}</h2>
                  <p className="mt-2 text-[0.68rem] leading-6 text-muted">{post.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Resume" href="/resume">
            <div className="space-y-5">
              <div>
                <p className="text-[0.86rem] text-text">{homeDashboard.resume.role}</p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-accent">
                  {homeDashboard.resume.company} · {homeDashboard.resume.tenure}
                </p>
                <p className="mt-3 text-[0.7rem] leading-6 text-muted">{homeDashboard.resume.summary}</p>
              </div>
              <div className="space-y-2">
                {homeDashboard.resume.skills.map((skill) => (
                  <ProgressMeter key={skill.label} label={skill.label} value={skill.value} />
                ))}
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Contact" href="/contact">
            <div className="space-y-5">
              <div className="space-y-2">
                {homeDashboard.contact.methods.map((method) => (
                  <div
                    key={method.label}
                    className="flex flex-col gap-2 border border-border bg-surface px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-[0.68rem] uppercase tracking-[0.12em] text-subtle">{method.label}</span>
                    <span className="text-[0.68rem] text-accent sm:text-right">{method.value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                <div className="space-y-2">
                  {homeDashboard.contact.availability.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-[0.68rem] text-muted">
                      <span
                        className={clsx("h-1.5 w-1.5 rounded-full", availabilityToneMap[item.tone])}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
