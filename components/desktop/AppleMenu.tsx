interface AppleMenuProps {
  isOpen: boolean;
  soundEnabled: boolean;
  onToggleOpen: () => void;
  onAbout: () => void;
  onToggleSound: () => void;
  onShutDown: () => void;
}

export function AppleMenu({
  isOpen,
  soundEnabled,
  onToggleOpen,
  onAbout,
  onToggleSound,
  onShutDown
}: AppleMenuProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggleOpen}
        className={`os9-menubar-button ${isOpen ? "os9-menubar-button-active" : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        
      </button>
      {isOpen ? (
        <div className="os9-menu-dropdown absolute left-0 top-[calc(100%+1px)] min-w-[220px] p-1">
          <button
            type="button"
            onClick={onAbout}
            className="flex w-full items-center px-2 py-1 text-left text-[11px] hover:bg-[#dce9fb]"
          >
            About This Computer
          </button>
          <div className="my-1 h-px bg-[#9f9f9f]" />
          <button
            type="button"
            onClick={onToggleSound}
            className="flex w-full items-center justify-between px-2 py-1 text-left text-[11px] hover:bg-[#dce9fb]"
          >
            <span>Sound</span>
            <span>{soundEnabled ? "On" : "Off"}</span>
          </button>
          <div className="my-1 h-px bg-[#9f9f9f]" />
          <button
            type="button"
            onClick={onShutDown}
            className="flex w-full items-center px-2 py-1 text-left text-[11px] hover:bg-[#dce9fb]"
          >
            Shut Down
          </button>
        </div>
      ) : null}
    </div>
  );
}
