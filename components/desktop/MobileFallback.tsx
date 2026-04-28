import { buildMailtoLink, siteConfig } from "@/lib/site";
import type { Project } from "@/types";

interface MobileFallbackProps {
  projects: Project[];
}

export function MobileFallback({ projects }: MobileFallbackProps) {
  return (
    <main className="fixed inset-0 overflow-y-auto bg-[#c0c0c0] px-5 py-10 text-[#1b1b1b] md:hidden">
      <div className="mx-auto flex min-h-full max-w-[420px] flex-col items-center justify-center gap-6">
        <div className="os9-window w-full max-w-[360px] bg-[#d6d6d6] p-5 text-center">
          <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-[10px] border border-[#6d6d6d] bg-[#efefef] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#a1a1a1]">
            <div className="space-y-2">
              <div className="mx-auto h-16 w-20 rounded-[6px] border border-[#505050] bg-[#f6f6f6]">
                <div className="flex h-full items-center justify-center text-4xl leading-none">☹</div>
              </div>
              <div className="mx-auto h-3 w-10 rounded-[999px] bg-[#7a7a7a]" />
            </div>
          </div>
          <p className="font-['Chicago',system-ui,monospace] text-[15px]">stephenjdunn.com</p>
          <p className="mt-3 text-[13px] leading-6">
            This experience is designed for desktop. Come back on a real computer.
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="os9-window bg-[#dcdcdc] p-4">
            <p className="font-['Chicago',system-ui,monospace] text-[12px]">While You&apos;re Here</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] font-bold">
              <a className="os9-surface-outset px-3 py-2 text-center" href={siteConfig.socialLinks.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="os9-surface-outset px-3 py-2 text-center" href={siteConfig.socialLinks.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
              <a className="os9-surface-outset px-3 py-2 text-center" href={buildMailtoLink("Hello Stephen")} rel="noreferrer">
                Email Stephen
              </a>
              <a className="os9-surface-outset px-3 py-2 text-center" href="https://www.linkedin.com/in/stephendunn24/" target="_blank" rel="noreferrer">
                View Resume
              </a>
            </div>
          </div>

          <div className="os9-window bg-[#dcdcdc] p-4">
            <p className="font-['Chicago',system-ui,monospace] text-[12px]">Projects</p>
            <div className="mt-3 space-y-2 text-[12px]">
              {projects.map((project) => (
                <a
                  key={project.slug}
                  className="os9-surface-outset flex items-center justify-between gap-3 px-3 py-2"
                  href={project.live ?? project.github}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{project.title}</span>
                  <span className="text-[11px] text-[#4d4d4d]">{project.live ? "Live" : "GitHub"}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
