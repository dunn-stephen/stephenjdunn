"use client";

import { useEffect, useState } from "react";

const sequence = [
  {
    command: "cat about.txt",
    output:
      "Software engineer building product-focused web applications, internal tools, and agent-native workflows."
  },
  {
    command: "cat focus.txt",
    output:
      "Current focus: modern React systems, clean developer experience, marketing automation, and experiments that stay maintainable."
  },
  {
    command: "cat interests.txt",
    output:
      "Cycling, numismatics, language study, and writing technical notes that people can actually use."
  },
  {
    command: "help",
    output: "Navigate with the sidebar, click into projects, or jump with keys 1-4."
  }
];

export function TypedIntro() {
  const [rows, setRows] = useState<Array<{ command: string; output: string }>>([]);

  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      setRows(sequence.slice(0, index + 1));
      index += 1;

      if (index >= sequence.length) {
        window.clearInterval(timer);
      }
    }, 480);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="rounded-3xl border border-border bg-black/35 p-5">
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.command} className="space-y-2">
            <p className="text-sm text-accent">
              <span className="text-dim">stephen@portfolio:~$ </span>
              {row.command}
            </p>
            <p className="leading-7 text-text">{row.output}</p>
          </div>
        ))}
        <p className="text-sm text-dim">
          <span className="text-accent">stephen@portfolio:~$</span> <span className="animate-blink">_</span>
        </p>
      </div>
    </div>
  );
}
