"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface DesktopIconProps {
  eager?: boolean;
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
  eager = false,
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
          ? { opacity: 0, y: 4 }
          : { opacity: 1, y: 0 }
      }
      className="pointer-events-auto absolute flex w-[75px] flex-col items-center px-0 py-[6px] text-center"
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
        loading={eager ? "eager" : "lazy"}
        className={`h-12 w-12 object-contain [image-rendering:pixelated] ${
          selected ? "brightness-[0.4]" : ""
        }`}
      />
      <span
        className={[
          "mt-[-4px] inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-[2px] py-[1px] font-['Arial'] text-[10.5px] leading-[1.15] tracking-[0.4px]",
          selected ? "bg-black text-white" : "bg-[rgba(255,255,255,0.5)] text-black"
        ].join(" ")}
      >
        {label}
      </span>
    </motion.button>
  );
}
