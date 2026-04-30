"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSoundStore } from "@/lib/sound";

const CHIME_DELAY_MS = 350;
const PROGRESS_STEPS = [
  { delayMs: 120, value: 20 },
  { delayMs: 520, value: 40 },
  { delayMs: 1180, value: 80 },
  { delayMs: 1540, value: 85 },
  { delayMs: 1900, value: 90 },
  { delayMs: 2320, value: 100 }
] as const;
const COMPLETE_HOLD_MS = 2000;
const COMPLETE_DELAY_MS = PROGRESS_STEPS[PROGRESS_STEPS.length - 1].delayMs + COMPLETE_HOLD_MS;
const REDUCED_MOTION_COMPLETE_DELAY_MS = 150;

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const initializeSound = useSoundStore((state) => state.initializeFromInteraction);
  const playSound = useSoundStore((state) => state.play);
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const bootDurationMs = reduceMotion ? REDUCED_MOTION_COMPLETE_DELAY_MS : COMPLETE_DELAY_MS;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const stepTimers = (reduceMotion ? [{ delayMs: 0, value: 100 }] : PROGRESS_STEPS).map((step) =>
      window.setTimeout(() => {
        setProgress(step.value);
      }, step.delayMs)
    );
    const chimeTimer = window.setTimeout(() => {
      if (typeof navigator !== "undefined" && "userActivation" in navigator && !navigator.userActivation.hasBeenActive) {
        return;
      }

      void initializeSound().then(() => {
        playSound("boot");
      });
    }, CHIME_DELAY_MS);
    const completeTimer = window.setTimeout(() => {
      onCompleteRef.current();
    }, bootDurationMs);

    return () => {
      stepTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(chimeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [bootDurationMs, initializeSound, playSound, reduceMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#c0c0c0] bg-[url('/wallpapers/os9-mac-pattern.png')] bg-repeat px-6 text-black [background-position:0_20px]"
      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.01 : 0.35, ease: "easeInOut" } }}
      initial={{ opacity: 1 }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-[321px] w-[420px] max-w-[calc(100vw-32px)] border border-black bg-[#dedede] shadow-[inset_1px_1px_0_#ffffff,inset_-1px_-1px_0_#acacac]"
        initial={{ opacity: 0, scale: 0.985 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.24, ease: "easeOut" }}
      >
        <div className="absolute left-1/2 top-[26px] flex h-[220px] w-[347px] -translate-x-1/2 items-center justify-center border border-black bg-white shadow-[-1px_-1px_0_#acacac,1px_1px_0_#ffffff]">
          <Image
            alt="Mac OS 9 startup logo"
            className="h-[186px] w-[233px] object-contain"
            height={186}
            priority
            src="/boot/startup-logo.png"
            width={233}
          />
        </div>

        <div className="absolute left-1/2 top-[269px] flex -translate-x-1/2 flex-col items-center text-center">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="m-0 whitespace-nowrap font-['Charcoal'] text-[12px] leading-none"
            initial={{ opacity: 0, y: 4 }}
            transition={{ delay: reduceMotion ? 0 : 0.12, duration: reduceMotion ? 0.01 : 0.18 }}
          >
            Starting Up...
          </motion.p>
          <div className="mt-[13px] w-[158px]">
            <div className="relative h-[10px] overflow-hidden border border-black bg-[#bdbdbd] shadow-[-1px_-1px_0_#acacac,1px_1px_0_#ffffff,inset_-1px_-1px_0_#dedede,inset_1px_1px_0_#8b8b8b]">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="absolute inset-y-0 left-0"
                initial={{ width: "0%" }}
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom, #31319c 0 11%, #6262cd 11% 22%, #9c9cff 22% 33%, #cdcdff 33% 44%, #eeeeee 44% 55%, #cdcdff 55% 66%, #9c9cff 66% 77%, #6262cd 77% 88%, #31319c 88% 100%)"
                }}
                transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: "linear" }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
