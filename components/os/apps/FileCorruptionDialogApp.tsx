"use client";

type FileCorruptionDialogAppProps = {
  fileName?: unknown;
  onDismiss: () => void;
};

export function FileCorruptionDialogApp({ fileName, onDismiss }: FileCorruptionDialogAppProps) {
  const resolvedFileName = typeof fileName === "string" && fileName.trim() ? fileName : "Unknown file";

  return (
    <div className="flex h-full flex-col justify-between gap-4 p-4">
      <div className="os9-panel rounded-[2px] px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[#8e8e8e] bg-[#f7f7f7] text-[20px]">
            !
          </div>
          <div className="space-y-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-accent-ink">{resolvedFileName}</p>
            <p className="text-[12px] leading-6 text-muted">The data in this file has been corrupted and cannot be opened.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="button" className="os9-button rounded-[2px] min-w-[88px]" onClick={onDismiss}>
          OK
        </button>
      </div>
    </div>
  );
}
