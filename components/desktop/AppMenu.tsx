import { useSound } from "@/hooks/useSound";

interface AppMenuProps {
  label: string;
  isOpen: boolean;
  canClose: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
}

export function AppMenu({ label, isOpen, canClose, onToggleOpen, onClose }: AppMenuProps) {
  const { play: playClick } = useSound("click");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          playClick();
          onToggleOpen();
        }}
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
            onClick={() => {
              playClick();
              onClose();
            }}
            disabled={!canClose}
            className="flex w-full cursor-pointer items-center px-2 py-1 text-left text-[11px] hover:bg-[#dce9fb] disabled:cursor-default disabled:text-[#8a8a8a] disabled:hover:bg-transparent"
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
