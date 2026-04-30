"use client";

import { useEffect, useRef } from "react";
import { useSoundStore } from "@/lib/sound";
import type { AppProps } from "@/types";

export function SpaceInvaders(_: AppProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const soundEnabled = useSoundStore((state) => state.enabled);

  useEffect(() => {
    const iframe = iframeRef.current;

    iframe?.contentWindow?.postMessage(
      {
        type: "setMuted",
        muted: !soundEnabled
      },
      "*"
    );
  }, [soundEnabled]);

  return (
    <div className="h-full w-full overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src="/easter-eggs/space-invaders/game.html"
        title="Space Invaders"
        className="h-full w-full border-0"
        allow="autoplay"
        onLoad={() => {
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: "setMuted",
              muted: !soundEnabled
            },
            "*"
          );
        }}
      />
    </div>
  );
}
