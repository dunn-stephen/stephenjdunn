"use client";

import { useEffect } from "react";

type SpaceInvadersModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SpaceInvadersModal({ open, onClose }: SpaceInvadersModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/82 px-4 py-6 backdrop-blur-[2px] sm:px-6">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close Space Invaders overlay"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Space Invaders"
        className="relative z-10 flex h-full max-h-[calc(100dvh-3rem)] w-full max-w-[calc(100vw-2rem)] flex-col overflow-hidden border border-border bg-surface shadow-terminal sm:max-h-[calc(100dvh-3rem)]"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border bg-panel px-4 py-3">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-subtle">Easter Egg</p>
            <p className="mt-1 text-[0.72rem] uppercase tracking-[0.18em] text-accent">Space Invaders</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-border bg-surface px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-subtle transition hover:border-[#6a320d] hover:text-accent"
          >
            Close
          </button>
        </div>

        <div className="flex flex-1 justify-center overflow-hidden bg-shell p-1 sm:p-4">
          <div className="h-full w-full">
            <iframe
              src="/easter-eggs/space-invaders/index.html"
              title="Space Invaders"
              className="h-full w-full border border-border bg-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
