"use client";

import type { Route } from "next";
import clsx from "clsx";
import { ChevronDown, ChevronRight, FileText, FolderClosed, FolderOpen, Mail } from "lucide-react";
import { useState } from "react";
import { SocialLinks } from "@/components/home/SocialLinks";
import { TerminalNavLink } from "@/components/terminal/TerminalNavLink";

type SidebarProps = {
  pathname: string;
  open: boolean;
  onClose: () => void;
  projects: Array<{ title: string; slug: string }>;
  posts: Array<{ title: string; slug: string }>;
};

function TreeLink({
  href,
  label,
  active,
  prefix,
  onClick
}: {
  href: Route;
  label: string;
  active: boolean;
  prefix: string;
  onClick: () => void;
}) {
  return (
    <TerminalNavLink
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition",
        active
          ? "border border-accent/30 bg-accent/10 text-accent"
          : "border border-transparent text-dim hover:bg-white/5 hover:text-text"
      )}
    >
      <span className="text-border">{active ? ">" : prefix}</span>
      <FileText className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </TerminalNavLink>
  );
}

export function Sidebar({ pathname, open, onClose, projects, posts }: SidebarProps) {
  const [showProjects, setShowProjects] = useState(true);
  const [showPosts, setShowPosts] = useState(true);
  // Keep the active directory visible even if the user previously collapsed it.
  const projectsExpanded = showProjects || pathname.startsWith("/projects");
  const postsExpanded = showPosts || pathname.startsWith("/blog");

  return (
    <>
      <aside
        className={clsx(
          "tui-scrollbar fixed inset-y-0 left-0 z-30 w-[86vw] max-w-[320px] overflow-y-auto border-r border-border bg-surface px-4 py-5 transition-all duration-300 ease-out lg:static lg:h-full lg:max-w-none",
          open
            ? "translate-x-0 opacity-100 lg:w-full"
            : "-translate-x-full opacity-0 lg:w-0 lg:translate-x-0 lg:border-r-0 lg:px-0 lg:py-0"
        )}
      >
        <div className={clsx("space-y-4", !open && "lg:pointer-events-none lg:opacity-0")}>
          <div className="rounded-2xl border border-border bg-black/30 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
            <p className="text-xs uppercase tracking-[0.28em] text-dim">~/stephen</p>
            <div className="mt-3 space-y-1">
              <TreeLink
                href="/"
                label="README.md"
                prefix="├──"
                active={pathname === "/"}
                onClick={onClose}
              />

              <button
                type="button"
                onClick={() => setShowProjects((value) => !value)}
                className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-sm text-dim transition hover:bg-white/5 hover:text-text"
              >
                <span className="text-border">├──</span>
                {projectsExpanded ? <FolderOpen className="h-4 w-4" /> : <FolderClosed className="h-4 w-4" />}
                <span className="flex-1">projects/</span>
                {projectsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {projectsExpanded ? (
                <div className="space-y-1 pl-5">
                  {projects.map((project, index) => (
                    <TreeLink
                      key={project.slug}
                      href={`/projects/${project.slug}` as Route}
                      label={project.slug}
                      prefix={index === projects.length - 1 ? "└──" : "├──"}
                      active={pathname === `/projects/${project.slug}`}
                      onClick={onClose}
                    />
                  ))}
                </div>
              ) : null}

              <TreeLink
                href="/resume"
                label="resume.md"
                prefix="├──"
                active={pathname === "/resume"}
                onClick={onClose}
              />

              <button
                type="button"
                onClick={() => setShowPosts((value) => !value)}
                className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-sm text-dim transition hover:bg-white/5 hover:text-text"
              >
                <span className="text-border">├──</span>
                {postsExpanded ? <FolderOpen className="h-4 w-4" /> : <FolderClosed className="h-4 w-4" />}
                <span className="flex-1">blog/</span>
                {postsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {postsExpanded ? (
                <div className="space-y-1 pl-5">
                  {posts.map((post, index) => (
                    <TreeLink
                      key={post.slug}
                      href={`/blog/${post.slug}` as Route}
                      label={post.slug}
                      prefix={index === posts.length - 1 ? "└──" : "├──"}
                      active={pathname === `/blog/${post.slug}`}
                      onClick={onClose}
                    />
                  ))}
                </div>
              ) : null}

              <TerminalNavLink
                href="/contact"
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm transition",
                  pathname === "/contact"
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-transparent text-dim hover:bg-white/5 hover:text-text"
                )}
              >
                <span className="text-border">{pathname === "/contact" ? ">" : "└──"}</span>
                <Mail className="h-4 w-4" />
                <span>contact.md</span>
              </TerminalNavLink>
            </div>
          </div>

          <SocialLinks />

          <div className="rounded-2xl border border-border bg-black/30 p-4 text-sm text-dim">
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-green">shortcuts</p>
            <p>`1-5` jump pages</p>
            <p>`Cmd+B` toggle tree</p>
            <p>`Cmd+K` or `/` open palette</p>
            <p>`help` in command bar</p>
            <p>`Esc` close sidebar</p>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-label="Close sidebar overlay"
        />
      ) : null}
    </>
  );
}
