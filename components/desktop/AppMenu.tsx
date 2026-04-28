interface AppMenuProps {
  label: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSelect: () => void;
}

export function AppMenu({ label, isOpen, onToggleOpen, onSelect }: AppMenuProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggleOpen}
        className={`os9-menubar-button ${isOpen ? "os9-menubar-button-active" : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {label}
      </button>
      {isOpen ? (
        <div className="os9-menu-dropdown absolute left-0 top-[calc(100%+1px)] min-w-[160px] p-1">
          <button
            type="button"
            onClick={onSelect}
            className="flex w-full items-center px-2 py-1 text-left text-[11px] hover:bg-[#dce9fb]"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
