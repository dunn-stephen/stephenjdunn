"use client";

import { useState } from "react";

type WelcomeSetupProps = {
  defaultSoundEnabled: boolean;
  defaultOpenIntroWindows: boolean;
  onEnter: (values: { soundEnabled: boolean; openIntroWindows: boolean }) => void | Promise<void>;
};

export function WelcomeSetup({
  defaultSoundEnabled,
  defaultOpenIntroWindows,
  onEnter
}: WelcomeSetupProps) {
  const [soundEnabled, setSoundEnabled] = useState(defaultSoundEnabled);
  const [openIntroWindows, setOpenIntroWindows] = useState(defaultOpenIntroWindows);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(89,124,149,0.42)] px-4">
      <div className="os9-window w-[420px] max-w-full">
        <div className="os9-titlebar">
          <div className="os9-titlebar-label">Welcome to Stephen OS</div>
        </div>
        <div className="os9-window-body px-5 py-5">
          <p className="text-[12px] leading-6 text-muted">
            Choose your initial preferences, then enter the desktop.
          </p>

          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 text-[12px]">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(event) => setSoundEnabled(event.target.checked)}
              />
              <span>Enable startup and UI sounds</span>
            </label>

            <label className="flex items-center gap-3 text-[12px]">
              <input
                type="checkbox"
                checked={openIntroWindows}
                onChange={(event) => setOpenIntroWindows(event.target.checked)}
              />
              <span>Open About Stephen and Finder on first entry</span>
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => {
                void onEnter({
                  soundEnabled,
                  openIntroWindows
                });
              }}
              className="os9-button rounded-[2px]"
            >
              Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
