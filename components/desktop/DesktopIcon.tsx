"use client";

import Image from "next/image";

interface DesktopIconProps {
  icon: string;
  label: string;
  position: {
    x: number;
    y: number;
  };
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onPointerDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function DesktopIcon({
  icon,
  label,
  position,
  selected,
  onClick,
  onDoubleClick,
  onPointerDown
}: DesktopIconProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onPointerDown}
      className={`pointer-events-auto absolute flex w-[84px] flex-col items-center gap-2 rounded-[4px] px-2 py-2 text-center ${
        selected ? "bg-[rgba(49,99,206,0.22)]" : ""
      }`}
      style={{
        left: position.x,
        top: position.y
      }}
      aria-label={label}
    >
      <Image
        src={icon}
        alt=""
        width={48}
        height={48}
        className="h-12 w-12 object-contain [image-rendering:pixelated]"
      />
      <span className="rounded-[3px] px-1 text-[11px] font-bold leading-tight text-[#1b1b1b]">
        {label}
      </span>
    </button>
  );
}
