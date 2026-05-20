"use client";

import { useWindowStore } from "@/lib/window-store";
import type { AppProps } from "@/types";

interface CorruptedFileDialogProps {
  fileName: string;
}

function isCorruptedFileDialogProps(value: unknown): value is CorruptedFileDialogProps {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.fileName === "string";
}

export function CorruptedFileDialog({ windowId, props }: AppProps) {
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const fileName = isCorruptedFileDialogProps(props) ? props.fileName : "Unknown File";

  return (
    <div className="flex h-full flex-col justify-between bg-[#dadada] p-4">
      <div className="border border-black bg-[#efefef] p-4 shadow-[-1px_-1px_0_#9c9c9c,1px_1px_0_#ffffff,inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#b3b3b3]">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#7b5800] bg-[radial-gradient(circle_at_40%_35%,#fff4a8_0_22%,#ffd35a_22%_65%,#e0a500_65%_100%)] font-['Chicago'] text-[18px] text-[#5a3b00]">
            !
          </div>
          <div className="min-w-0">
            <p className="font-['Chicago'] text-[12px] leading-[1.35] text-[#202020] [overflow-wrap:anywhere]">
              {fileName}
            </p>
            <p className="mt-2 font-['Arial'] text-[12px] leading-[1.45] text-[#303030]">
              The data in this file has been corrupted and cannot be opened.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="os9-button min-h-[22px] min-w-[74px] rounded-none px-3 text-[11px]"
          onClick={() => closeWindow(windowId)}
        >
          OK
        </button>
      </div>
    </div>
  );
}
