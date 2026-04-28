export function MobileFallback() {
  return (
    <main className="fixed inset-0 flex items-center justify-center bg-[#C0C0C0] px-6 text-center text-[#222222]">
      <div className="space-y-3">
        <p className="font-['Chicago',system-ui,monospace] text-sm">Mac OS 9</p>
        <p className="max-w-xs text-sm">Mobile fallback placeholder</p>
      </div>
    </main>
  );
}
