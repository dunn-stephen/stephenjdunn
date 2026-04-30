"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
const WELCOME_DISPLAY_MS = 700;
const COMPLETE_DELAY_MS = PROGRESS_STEPS[PROGRESS_STEPS.length - 1].delayMs + WELCOME_DISPLAY_MS;
const REDUCED_MOTION_COMPLETE_DELAY_MS = 150;

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const initializeSound = useSoundStore((state) => state.initializeFromInteraction);
  const playSound = useSoundStore((state) => state.play);
  const reduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
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
    const welcomeTimer = window.setTimeout(() => {
      setShowWelcome(true);
    }, reduceMotion ? 20 : PROGRESS_STEPS[PROGRESS_STEPS.length - 1].delayMs);
    const completeTimer = window.setTimeout(() => {
      onCompleteRef.current();
    }, bootDurationMs);

    return () => {
      stepTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(chimeTimer);
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [bootDurationMs, initializeSound, playSound, reduceMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#C0C0C0] px-6 text-black"
      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.01 : 0.35, ease: "easeInOut" } }}
      initial={{ opacity: 1 }}
      onClick={() => onCompleteRef.current()}
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

        <div className="absolute left-1/2 top-[263px] flex -translate-x-1/2 flex-col items-center gap-2 text-center">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="m-0 whitespace-nowrap font-['Charcoal'] text-[12px] leading-none"
            initial={{ opacity: 0, y: 4 }}
            transition={{ delay: reduceMotion ? 0 : 0.12, duration: reduceMotion ? 0.01 : 0.18 }}
          >
            Starting Up...
          </motion.p>
          <div className="w-[158px]">
            <div className="relative h-[8px] overflow-hidden border border-black bg-[#c7c7c7] shadow-[-1px_-1px_0_#acacac,1px_1px_0_#ffffff,inset_-1px_-1px_0_#dedede,inset_1px_1px_0_#8b8b8b]">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="absolute inset-y-0 left-0 bg-[#5d5d5d]"
                initial={{ width: "0%" }}
                transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: "linear" }}
              />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {showWelcome ? (
              <motion.p
                key="welcome"
                animate={{ opacity: 1 }}
                className="m-0 whitespace-nowrap font-['Charcoal'] text-[11px] leading-none"
                initial={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
              >
                Welcome to Mac OS 9
              </motion.p>
            ) : (
              <div key="welcome-spacer" className="h-[12px]" />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
