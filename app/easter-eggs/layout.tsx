import type { ReactNode } from "react";

export default function EasterEggLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="flex min-h-dvh items-center justify-center px-2 py-3 sm:px-4 sm:py-4">{children}</div>;
}
