"use client";

export function BootSequence() {
  return (
    <div className="os9-boot-screen fixed inset-0 z-[9999] flex items-center justify-center text-black">
      <div className="os9-boot-shell w-[420px] max-w-[calc(100vw-40px)] px-9 py-6">
        <div className="os9-boot-card px-8 py-6">
          <div className="os9-boot-logo" aria-hidden="true">
            <div className="os9-boot-logo-face">
              <span className="os9-boot-eye os9-boot-eye-left" />
              <span className="os9-boot-eye os9-boot-eye-right" />
              <span className="os9-boot-smile" />
              <span className="os9-boot-profile" />
            </div>
          </div>
          <p className="os9-boot-wordmark text-center">Mac OS 9</p>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-center text-[12px] font-bold">Starting Up...</p>
          <div className="os9-boot-progress-track mx-auto">
            <div className="os9-boot-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
