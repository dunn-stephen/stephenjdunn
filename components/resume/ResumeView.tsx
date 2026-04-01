import Link from "next/link";
import Image from "next/image";
import { Panel, ProgressMeter, SectionLabel, Tag } from "@/components/shared/Tui";
import { getResumeData } from "@/lib/content";
import { buildMailtoLink, profileData } from "@/lib/site";

export function ResumeView() {
  const resume = getResumeData();

  return (
    <div className="space-y-5">
      <Panel>
        <SectionLabel>Summary</SectionLabel>
        <p className="max-w-4xl text-[0.74rem] leading-7 text-muted">{resume.summary}</p>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Panel>
            <SectionLabel>Experience</SectionLabel>
            <div className="space-y-5">
              {resume.experience.map((role, index) => (
                <div key={`${role.company}-${role.role}`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-[0.88rem] text-text">{role.role}</h2>
                      <p className="mt-1 text-[0.68rem] uppercase tracking-[0.12em] text-accent">
                        {role.company}
                      </p>
                    </div>
                    <p className="text-[0.62rem] uppercase tracking-[0.12em] text-subtle">
                      {role.start} - {role.end}
                    </p>
                  </div>
                  <ul className="mt-3 space-y-2 pl-4 text-[0.72rem] leading-6 text-muted marker:text-accent">
                    {role.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  {index < resume.experience.length - 1 ? (
                    <div className="mt-5 border-t border-[#4b515a]" aria-hidden="true" />
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel>
            <SectionLabel>Skills</SectionLabel>
            <div className="space-y-2">
              {resume.skillRatings.map((rating) => (
                <ProgressMeter key={rating.label} label={rating.label} value={rating.value} />
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionLabel>Toolkit</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {resume.toolkit.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionLabel>Certificates</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              {resume.certificates.map((certificate) => (
                <div key={certificate.title} className="flex flex-col items-center px-2 py-1">
                  <a
                    href={certificate.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${certificate.title} credential link`}
                    className="group block"
                  >
                    <Image
                      src={certificate.badge}
                      alt={certificate.title}
                      width={260}
                      height={340}
                      className="mx-auto h-auto w-[68px] max-w-full transition duration-200 group-hover:-translate-y-1 sm:w-[74px]"
                    />
                  </a>
                  <p className="mt-2 text-center text-[0.58rem] leading-5 text-muted">{certificate.note}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionLabel>Interests</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {resume.interests.map((interest) => (
                <Tag key={interest}>{interest}</Tag>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionLabel>Platforms</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {resume.platforms.map((platform, index) => (
                <Tag key={platform} accent={index < 2}>
                  {platform}
                </Tag>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionLabel>Education</SectionLabel>
            <div className="space-y-3">
              <div>
                <p className="text-[0.82rem] text-text">
                  {resume.education.degree} · {resume.education.school}
                </p>
                <p className="mt-1 text-[0.62rem] uppercase tracking-[0.12em] text-subtle">
                  {resume.education.years}
                </p>
              </div>
              {resume.education.concentration ? (
                <p className="text-[0.7rem] leading-6 text-muted">
                  Concentration: {resume.education.concentration}
                </p>
              ) : null}
              {resume.education.highlights?.length ? (
                <div className="flex flex-wrap gap-2">
                  {resume.education.highlights.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </div>
              ) : null}
            </div>
          </Panel>

          <div className="flex flex-wrap gap-2">
            {profileData.resume.pdfPath ? (
              <a
                href={profileData.resume.pdfPath}
                className="inline-flex items-center gap-2 border border-border bg-panel px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted transition hover:border-[#6a320d] hover:text-accent"
                download
              >
                [ Download PDF ↗ ]
              </a>
            ) : null}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-border bg-panel px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-muted transition hover:border-[#6a320d] hover:text-accent"
            >
              [ Contact ► ]
            </Link>
            <a
              href={buildMailtoLink(profileData.contact.quickMessageSubject)}
              className="inline-flex items-center gap-2 border border-[#6a320d] bg-accent-surface px-3 py-2 text-[0.62rem] uppercase tracking-[0.14em] text-accent transition hover:bg-[#331b0b]"
            >
              [ Email ↗ ]
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
