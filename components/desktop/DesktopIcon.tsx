"use client";

import { motion } from "framer-motion";
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
  revealMode: "hidden" | "shown" | "stagger";
  revealIndex: number;
}

export function DesktopIcon({
  icon,
  label,
  position,
  selected,
  onClick,
  onDoubleClick,
  onPointerDown,
  revealMode,
  revealIndex
}: DesktopIconProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onPointerDown}
      animate={
        revealMode === "hidden"
          ? { opacity: 0, y: 8 }
          : { opacity: 1, y: 0 }
      }
      className={`pointer-events-auto absolute flex w-[96px] flex-col items-center gap-1 rounded-[4px] px-2 py-2 text-center ${
        selected ? "bg-[rgba(49,99,206,0.22)]" : ""
      }`}
      initial={false}
      style={{
        left: position.x,
        top: position.y
      }}
      transition={
        revealMode === "stagger"
          ? { delay: revealIndex * 0.06, duration: 0.18, ease: "easeOut" }
          : { duration: 0.12, ease: "easeOut" }
      }
      aria-label={label}
    >
      <Image
        src={icon}
        alt=""
        width={64}
        height={64}
        className="h-16 w-16 object-contain [image-rendering:pixelated]"
      />
      <span className="rounded-[3px] px-1 text-[11px] font-bold leading-tight text-[#1b1b1b]">
        {label}
      </span>
    </motion.button>
  );
}
