import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { buildFinderTree } from "@/lib/os/finderTree";
import { DesktopShellBridge } from "@/components/os/DesktopShellBridge";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${siteConfig.domain}`),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    url: `https://${siteConfig.domain}`
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const initialFinderTree = buildFinderTree();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="app-scrollbar">
        <DesktopShellBridge initialFinderTree={initialFinderTree}>{children}</DesktopShellBridge>
      </body>
    </html>
  );
}
