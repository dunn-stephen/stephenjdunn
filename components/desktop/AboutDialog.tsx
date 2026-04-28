interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-[rgba(0,0,0,0.18)] px-4">
      <div className="os9-window w-full max-w-[360px] bg-[#d6d6d6]">
        <div className="os9-titlebar">
          <div className="os9-titlebar-label">About This Computer</div>
          <button
            type="button"
            onClick={onClose}
            className="os9-menubar-button px-2"
          >
            Close
          </button>
        </div>
        <div className="space-y-3 p-5 text-[12px]">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[6px] border border-[#7d7d7d] bg-[#f4f4f4] text-3xl">
              💻
            </div>
            <div>
              <p className="font-['Chicago',system-ui,monospace] text-[13px]">Mac OS 9.2.2</p>
              <p className="text-[#303030]">Stephen OS preview shell</p>
            </div>
          </div>
          <div className="space-y-1 text-[#303030]">
            <p>Power Mac G4 (pretend)</p>
            <p>256 MB built for portfolio duties</p>
            <p>About dialog stub active for Task 1.2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
