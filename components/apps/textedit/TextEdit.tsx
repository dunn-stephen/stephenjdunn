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
    <div className="flex h-full flex-col bg-[#d4d0c8]">
      <div className="border-b border-[#8f8f8f] bg-[#d9d9d9] px-4 py-1 font-['Chicago'] text-[11px] text-[#3f3f3f]">
        {documentProps.title}
      </div>
      <div className="min-h-0 flex-1 bg-[#e5e5e5] p-3">
        <div className="app-scrollbar h-full overflow-auto border border-[#8c8c8c] bg-[#ffffff] p-4 shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#d0d0d0]">
          <MdxDocument source={documentProps.content} />
        </div>
      </div>
    </div>
  );
}
