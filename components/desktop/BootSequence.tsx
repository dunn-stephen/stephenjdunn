"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSoundStore } from "@/lib/sound";

const CHIME_DELAY_MS = 350;
const PROGRESS_DURATION_MS = 3000;
const WELCOME_DISPLAY_MS = 650;

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const initializeSound = useSoundStore((state) => state.initializeFromInteraction);
  const playSound = useSoundStore((state) => state.play);
  const reduceMotion = useReducedMotion();
  const [showWelcome, setShowWelcome] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const progressDurationMs = reduceMotion ? 1 : PROGRESS_DURATION_MS;
  const bootDurationMs = progressDurationMs + (reduceMotion ? 120 : WELCOME_DISPLAY_MS);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
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
    }, progressDurationMs);
    const completeTimer = window.setTimeout(() => {
      onCompleteRef.current();
    }, bootDurationMs);

    return () => {
      window.clearTimeout(chimeTimer);
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [bootDurationMs, initializeSound, playSound, progressDurationMs]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#C0C0C0] px-6 text-black"
      exit={{ opacity: 0, transition: { duration: reduceMotion ? 0.01 : 0.35, ease: "easeInOut" } }}
      initial={{ opacity: 1 }}
      onClick={() => onCompleteRef.current()}
    >
      <div className="flex w-full max-w-[360px] flex-col items-center gap-4">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.35, ease: "easeOut" }}
        >
          <Image
            alt="Finder icon"
            className="h-24 w-24 object-contain"
            height={96}
            priority
            src="/icons/png/37.png"
            width={96}
          />
        </motion.div>

        <div className="space-y-3 text-center">
          <p className="m-0 font-['Times_New_Roman',Times,serif] text-[52px] leading-none tracking-[-0.08em]">
            Mac OS 9
          </p>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="m-0 font-['Chicago'] text-[12px] leading-none"
            initial={{ opacity: 0, y: 4 }}
            transition={{ delay: reduceMotion ? 0 : 0.15, duration: reduceMotion ? 0.01 : 0.2 }}
          >
            Starting Up...
          </motion.p>
          <div className="mx-auto w-[220px]">
            <div className="relative h-2 overflow-hidden border border-[#5b5b5b] bg-[#d4d4d4]">
              <motion.div
                animate={{ width: "100%" }}
                className="absolute inset-y-0 left-0 bg-[#3f3f3f]"
                initial={{ width: "0%" }}
                transition={{ duration: progressDurationMs / 1000, ease: "linear" }}
              />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {showWelcome ? (
              <motion.p
                key="welcome"
                animate={{ opacity: 1 }}
                className="m-0 font-['Chicago'] text-[12px] leading-none"
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
      </div>
    </motion.div>
  );
}
