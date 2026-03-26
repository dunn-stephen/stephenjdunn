"use client";

import { useEffect, useMemo, useState } from "react";

const ascii = String.raw`
  _________ __                 __                    .___
 /   _____//  |_  ____ ______ |  |__   ____   ____  |   |
 \_____  \\   __\/ __ \\____ \|  |  \_/ __ \ /    \ |   |
 /        \|  | \  ___/|  |_> >   Y  \  ___/|   |  \|   |
/_______  /|__|  \___  >   __/|___|  /\___  >___|  /|___|
        \/           \/|__|        \/     \/     \/
`;

export function AsciiBanner() {
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += 8;
      setVisibleLength(Math.min(frame, ascii.length));
      if (frame >= ascii.length) {
        window.clearInterval(timer);
      }
    }, 16);
    return () => window.clearInterval(timer);
  }, []);

  const output = useMemo(() => ascii.slice(0, visibleLength), [visibleLength]);

  return (
    <pre className="overflow-x-auto rounded-3xl border border-border bg-black/35 p-5 text-[0.48rem] leading-[1.15] text-accent shadow-[inset_0_0_32px_rgba(255,140,26,0.08)] sm:text-[0.68rem] lg:text-[0.8rem]">
      {output}
    </pre>
  );
}
