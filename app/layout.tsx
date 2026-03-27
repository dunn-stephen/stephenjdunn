import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { TerminalShell } from "@/components/terminal/TerminalShell";
import { HomeWorkspace } from "@/components/views/HomeWorkspace";

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
  const projects = getAllProjects().map(({ title, slug }) => ({ title, slug }));
  const posts = getAllPosts().map(({ title, slug }) => ({ title, slug }));

  return (
    <html lang="en">
      <body className="tui-scrollbar">
        <TerminalShell projects={projects} posts={posts} workspace={<HomeWorkspace />}>
          {children}
        </TerminalShell>
      </body>
    </html>
  );
}
