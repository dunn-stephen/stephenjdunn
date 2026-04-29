import { StandaloneExperienceShell } from "@/components/easter-eggs/StandaloneExperienceShell";

type StarWarsFrameProps = {
  src: string;
};

export function StarWarsFrame({ src }: StarWarsFrameProps) {
  return (
    <StandaloneExperienceShell
      eyebrow="Easter Egg"
      title="Star Wars Console"
      meta="ASCII crawl live"
      bodyClassName="justify-center p-2 sm:p-4"
    >
      <div className="flex w-full justify-center">
        <div className="w-full border border-border bg-black">
          <iframe src={src} title="Star Wars" className="h-[74dvh] min-h-[420px] w-full" />
        </div>
      </div>
    </StandaloneExperienceShell>
  );
}
