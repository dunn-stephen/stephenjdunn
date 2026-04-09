import { StandaloneExperienceShell } from "@/components/easter-eggs/StandaloneExperienceShell";

type SpaceInvadersFrameProps = {
  src: string;
};

export function SpaceInvadersFrame({ src }: SpaceInvadersFrameProps) {
  return (
    <StandaloneExperienceShell eyebrow="Easter Egg" title="Space Invaders" bodyClassName="justify-center p-2 sm:p-4">
      <div className="flex w-full justify-center">
        <div className="w-full border border-border bg-black">
          <iframe
            src={src}
            title="Space Invaders"
            className="h-[70dvh] min-h-[360px] w-full sm:min-h-[420px]"
          />
        </div>
      </div>
    </StandaloneExperienceShell>
  );
}
