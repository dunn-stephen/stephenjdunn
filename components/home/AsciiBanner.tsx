"use client";

import { useEffect, useMemo, useState } from "react";
import { bannerArt, bannerSlogan } from "@/lib/asciiArt";

type AsciiBannerProps = {
  inline?: boolean;
};

export function AsciiBanner({ inline = false }: AsciiBannerProps) {
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 8;
      setVisibleLength(Math.min(frame, bannerArt.length));
      if (frame >= bannerArt.length) {
        window.clearInterval(timer);
      }
    }, 16);
    return () => window.clearInterval(timer);
  }, []);

  const output = useMemo(() => bannerArt.slice(0, visibleLength), [visibleLength]);

  return (
    <pre
      className={
        inline
          ? "overflow-x-auto text-[0.48rem] leading-[1.15] text-accent sm:text-[0.68rem] lg:text-[0.8rem]"
          : "overflow-x-auto rounded-3xl border border-border bg-black/35 p-5 text-[0.48rem] leading-[1.15] text-accent shadow-[inset_0_0_32px_rgba(255,140,26,0.08)] sm:text-[0.68rem] lg:text-[0.8rem]"
      }
    >
      {output}
      {visibleLength >= bannerArt.length ? `\n\n${bannerSlogan}` : ""}
    </pre>
  );
}
