"use client";

import { useMemo, useState } from "react";
import { MdxDocument } from "@/components/apps/textedit/MdxDocument";
import { useWindowStore } from "@/lib/window-store";
import type { AppProps, Project, ProjectFile } from "@/types";

interface FinderWindowProps {
  projects: Project[];
  selectedProjectSlug?: string;
}

interface ImagePreviewProps {
  file: ProjectFile;
}

function isProjectFile(value: unknown): value is ProjectFile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === "string" &&
    (candidate.type === "mdx" || candidate.type === "image") &&
    typeof candidate.path === "string" &&
    (candidate.content === undefined || typeof candidate.content === "string")
  );
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.slug === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    typeof candidate.year === "number" &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === "string") &&
    typeof candidate.github === "string" &&
    typeof candidate.icon === "string" &&
    Array.isArray(candidate.files) &&
    candidate.files.every(isProjectFile)
  );
}

function readProjects(props: Record<string, unknown> | undefined) {
  const candidate = props?.projects;

  if (!Array.isArray(candidate)) {
    return [] as Project[];
  }

  return candidate.filter(isProject);
}

function readSelectedProjectSlug(props: Record<string, unknown> | undefined) {
  return typeof props?.selectedProjectSlug === "string" ? props.selectedProjectSlug : null;
}

function getFileIconPath(file: ProjectFile) {
  return file.type === "image" ? "/icons/png/69.png" : "/icons/png/28.png";
}

function getPreviewSource(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  return `/${path.replace(/^\.?\//, "")}`;
}

function ImagePreview({ file }: ImagePreviewProps) {
  const [failed, setFailed] = useState(false);
  const source = file.content && file.content.startsWith("data:")
    ? file.content
    : getPreviewSource(file.path);

  if (failed) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-[12px] text-[#5a5a5a]">
        <div className="space-y-2">
          <p className="font-['Chicago'] text-[#222222]">{file.name}</p>
          <p>Image preview is unavailable for the current file path.</p>
          <p className="font-mono text-[11px] text-[#6d6d6d]">{file.path}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#efefef] p-4">
      <img
        alt={file.name}
        className="max-h-full max-w-full border border-[#8c8c8c] bg-[#ffffff] p-1 shadow-[inset_1px_1px_0_#ffffff]"
        src={source}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function Finder({ props }: AppProps) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const projects = useMemo(() => readProjects(props), [props]);
  const requestedProjectSlug = useMemo(() => readSelectedProjectSlug(props), [props]);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(() => requestedProjectSlug ?? projects[0]?.slug ?? null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(() => {
    const initialProject = projects.find((project) => project.slug === requestedProjectSlug) ?? projects[0];
    return initialProject?.files[0]?.path ?? null;
  });

  const selectedProject = useMemo(
    () => (
      projects.find((project) => project.slug === selectedProjectSlug)
        ?? projects[0]
        ?? null
    ),
    [projects, selectedProjectSlug]
  );

  const selectedFile = useMemo(
    () => (
      selectedProject?.files.find((file) => file.path === selectedFilePath)
        ?? selectedProject?.files[0]
        ?? null
    ),
    [selectedFilePath, selectedProject]
  );

  if (projects.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-[#efefef] p-6 text-center text-[12px] text-[#555555]">
        <div className="space-y-2">
          <p className="font-['Chicago'] text-[13px] text-[#222222]">Finder</p>
          <p>No project data is available for this window.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#d4d0c8] text-[12px] text-[#1d1d1d]">
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[180px] min-w-[180px] flex-col border-r border-[#8f8f8f] bg-[#efefef]">
          <div className="border-b border-[#b0b0b0] bg-[#d8d8d8] px-3 py-2 font-['Chicago'] text-[11px] uppercase tracking-[0.08em] text-[#555555]">
            Projects
          </div>
          <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {projects.map((project) => {
                const selected = project.slug === selectedProject?.slug;

                return (
                  <li key={project.slug}>
                    <button
                      className={`flex w-full items-center gap-2 rounded-none px-2 py-1 text-left ${
                        selected
                          ? "bg-[#1b5fa7] text-[#ffffff]"
                          : "bg-transparent text-[#1d1d1d] hover:bg-[#dbe9fb]"
                      }`}
                      type="button"
                      onClick={() => {
                        setSelectedProjectSlug(project.slug);
                        setSelectedFilePath(project.files[0]?.path ?? null);
                      }}
                    >
                      <img
                        alt=""
                        className="h-4 w-4 shrink-0"
                        src="/icons/png/37.png"
                      />
                      <span className="truncate">{project.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col bg-[#f5f5f5]">
          <div className="app-scrollbar grid min-h-[168px] grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-3 overflow-auto border-b border-[#8f8f8f] bg-[#ffffff] p-3">
            {(selectedProject?.files ?? []).map((file) => {
              const selected = file.path === selectedFile?.path;

              return (
                <button
                  key={file.path}
                  className={`flex min-h-[76px] flex-col items-center justify-start gap-2 border px-2 py-2 text-center ${
                    selected
                      ? "border-[#0f3f76] bg-[#dbe9fb] text-[#0f3561]"
                      : "border-transparent bg-transparent text-[#1d1d1d] hover:border-[#b9cbe3] hover:bg-[#edf4fd]"
                  }`}
                  type="button"
                  onClick={() => setSelectedFilePath(file.path)}
                  onDoubleClick={() => {
                    if (file.type !== "mdx" || !file.content) {
                      return;
                    }

                    openWindow("textedit", {
                      content: file.content,
                      title: file.name
                    });
                  }}
                >
                  <img
                    alt=""
                    className="h-8 w-8 shrink-0"
                    src={getFileIconPath(file)}
                  />
                  <span className="break-words text-[11px] leading-4">{file.name}</span>
                </button>
              );
            })}
          </div>
          <div className="app-scrollbar min-h-0 flex-1 overflow-auto bg-[#ffffff] p-4">
            {selectedFile ? (
              selectedFile.type === "mdx" ? (
                <MdxDocument
                  compact
                  source={selectedFile.content ?? ""}
                />
              ) : (
                <ImagePreview file={selectedFile} />
              )
            ) : (
              <div className="flex h-full items-center justify-center text-center text-[12px] text-[#5a5a5a]">
                <p>Select a file to preview it.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <footer className="flex items-center justify-between border-t border-[#8f8f8f] bg-[#d8d8d8] px-3 py-1 font-['Chicago'] text-[11px] text-[#3d3d3d]">
        <span>
          {selectedProject ? `Projects > ${selectedProject.title}` : "Projects"}
        </span>
        <span>
          {selectedProject ? `${selectedProject.files.length} item${selectedProject.files.length === 1 ? "" : "s"}` : "0 items"}
        </span>
      </footer>
    </div>
  );
}
