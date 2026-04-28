"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSoundStore } from "@/lib/sound";

const BOOT_DURATION_MS = 3200;
const WELCOME_DELAY_MS = 1850;
const WELCOME_HIDE_MS = 2900;
const CHIME_DELAY_MS = 350;

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const initializeSound = useSoundStore((state) => state.initializeFromInteraction);
  const playSound = useSoundStore((state) => state.play);
  const [showWelcome, setShowWelcome] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const chimeTimer = window.setTimeout(() => {
      void initializeSound().then(() => {
        playSound("boot");
      });
    }, CHIME_DELAY_MS);
    const welcomeTimer = window.setTimeout(() => {
      setShowWelcome(true);
    }, WELCOME_DELAY_MS);
    const hideWelcomeTimer = window.setTimeout(() => {
      setShowWelcome(false);
    }, WELCOME_HIDE_MS);
    const completeTimer = window.setTimeout(() => {
      onCompleteRef.current();
    }, BOOT_DURATION_MS);

    return () => {
      window.clearTimeout(chimeTimer);
      window.clearTimeout(welcomeTimer);
      window.clearTimeout(hideWelcomeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [initializeSound, playSound]);

  return (
    <motion.div
      className="os9-boot-screen fixed inset-0 z-[10000] flex items-center justify-center text-black"
      exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
      initial={{ opacity: 1 }}
      onClick={() => onCompleteRef.current()}
    >
      <div className="os9-boot-shell w-[420px] max-w-[calc(100vw-40px)] px-9 py-6">
        <div className="os9-boot-card px-8 py-6">
          <motion.div
            aria-hidden="true"
            className="os9-boot-logo"
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="os9-boot-logo-face">
              <span className="os9-boot-eye os9-boot-eye-left" />
              <span className="os9-boot-eye os9-boot-eye-right" />
              <span className="os9-boot-smile" />
              <span className="os9-boot-profile" />
            </div>
          </motion.div>
          <p className="os9-boot-wordmark text-center">Mac OS 9</p>
        </div>

        <div className="mt-4 space-y-3">
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-[12px] font-bold"
            initial={{ opacity: 0, y: 4 }}
            transition={{ delay: 0.25, duration: 0.3 }}
          >
            Starting Up...
          </motion.p>
          <div className="os9-boot-progress-track mx-auto">
            <div className="os9-boot-progress-bar" />
          </div>
          <motion.p
            animate={{ opacity: showWelcome ? 1 : 0 }}
            className="text-center text-[12px] font-bold tracking-[0.08em]"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Welcome to Mac OS 9
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
