"use client";

import type { AppProps } from "@/types";
import { MdxDocument } from "@/components/apps/textedit/MdxDocument";

interface TextEditWindowProps {
  content: string;
  title: string;
}

function isTextEditWindowProps(value: unknown): value is TextEditWindowProps {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.content === "string" && typeof candidate.title === "string";
}

export function TextEdit({ props }: AppProps) {
  const documentProps = isTextEditWindowProps(props)
    ? props
    : { content: "", title: "Untitled" };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#dadada]">
      <div className="relative mx-1 my-1 flex min-h-0 flex-1 flex-col border border-black bg-white shadow-[-1px_-1px_0_#9c9c9c,1px_1px_0_#ffffff,inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#acacac]">
        <div className="app-scrollbar min-h-0 flex-1 overflow-auto px-5 py-4">
          <MdxDocument source={documentProps.content} />
        </div>
      </div>
    </div>
  );
}
