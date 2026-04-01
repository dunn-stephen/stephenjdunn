import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { buildSiteSearchItems } from "@/lib/search";
import { siteConfig } from "@/lib/site";
import { SiteChrome } from "@/components/chrome/SiteChrome";

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
  const paletteItems = buildSiteSearchItems();

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="app-scrollbar">
        <SiteChrome paletteItems={paletteItems}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
