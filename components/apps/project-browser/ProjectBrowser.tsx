"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getGenericFileIconPath, getTrashFileIconPath } from "@/lib/file-icons";
import { useWindowStore } from "@/lib/window-store";
import { TRASH_FILE_NAMES } from "@/lib/trash-files";
import type { AppProps, Project, ProjectFile } from "@/types";

interface ProjectBrowserFigure {
  icon: string;
  id: string;
  isAlias?: boolean;
  kind: "file" | "folder";
  label: string;
  onOpen: () => void;
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

function readSelectedFilePath(props: Record<string, unknown> | undefined) {
  return typeof props?.selectedFilePath === "string" ? props.selectedFilePath : null;
}

function readFolder(props: Record<string, unknown> | undefined) {
  return props?.folder === "trash" ? "trash" : "projects";
}

function getFileIconPath(file: ProjectFile) {
  return getGenericFileIconPath(file.type === "image" ? "image" : "document");
}

function getPreviewSource(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }

  return `/${path.replace(/^\.?\//, "")}`;
}

function renderItemCount(count: number) {
  return `${count} item${count === 1 ? "" : "s"}`;
}

function ProjectBrowserFigureButton({
  figure,
  isSelected,
  onSelect
}: {
  figure: ProjectBrowserFigure;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className="os9-icon-tile group px-0 py-0 text-center"
      data-selected={isSelected}
      onClick={onSelect}
      onDoubleClick={figure.onOpen}
    >
      <span className="inline-flex h-[54px] w-[54px] items-center justify-center">
        <Image
          src={figure.icon}
          alt=""
          width={48}
          height={48}
          className={`h-12 w-12 object-contain [image-rendering:pixelated] ${isSelected ? "brightness-[0.4]" : ""}`}
        />
      </span>
      <span
        className={[
          "os9-icon-tile__label",
          isSelected ? "" : "bg-[rgba(255,255,255,0.52)] text-black",
          figure.isAlias ? "italic" : ""
        ].join(" ")}
      >
        {figure.label}
      </span>
    </button>
  );
}

function ProjectBrowserStatusBar({ text }: { text: string }) {
  return (
    <div className="os9-status-bar os9-content-well os9-content-well--compact mt-1 border-black">
      <div className="os9-status-bar__segment truncate text-[#111111]">{text}</div>
    </div>
  );
}

function ProjectBrowserContents({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="os9-content-well os9-content-well--compact mb-1 flex min-h-0 flex-1 flex-col">
      <div className="app-scrollbar min-h-0 flex-1 overflow-auto">
        {children}
      </div>
      <div aria-hidden="true" className="os9-resize-corner" />
    </div>
  );
}

export function ProjectBrowser({ props }: AppProps) {
  const openWindow = useWindowStore((state) => state.openWindow);
  const projects = useMemo(() => readProjects(props), [props]);
  const folder = useMemo(() => readFolder(props), [props]);
  const selectedProjectSlug = useMemo(() => readSelectedProjectSlug(props), [props]);
  const selectedFilePath = useMemo(() => readSelectedFilePath(props), [props]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.slug === selectedProjectSlug) ?? null,
    [projects, selectedProjectSlug]
  );

  const previewFile = useMemo(
    () => selectedProject?.files.find((file) => file.path === selectedFilePath) ?? null,
    [selectedFilePath, selectedProject]
  );

  const figures = useMemo<ProjectBrowserFigure[]>(() => {
    if (folder === "trash") {
      return TRASH_FILE_NAMES.map((fileName) => ({
        id: fileName,
        icon: getTrashFileIconPath(fileName),
        kind: "file" as const,
        label: fileName,
        onOpen: () => {
          openWindow("corrupted-file-dialog", {
            fileName,
            title: "Cannot Open File"
          });
        }
      }));
    }

    if (selectedProject) {
      return selectedProject.files.map((file) => ({
        id: file.path,
        icon: getFileIconPath(file),
        kind: "file" as const,
        label: file.name,
        onOpen: () => {
          if (file.type === "mdx") {
            openWindow("textedit", {
              content: file.content ?? "",
              title: file.name
            });
            return;
          }

          openWindow("project-browser", {
            projects,
            selectedFilePath: file.path,
            selectedProjectSlug: selectedProject.slug,
            title: file.name
          });
        }
      }));
    }

    return projects.map((project) => ({
      id: project.slug,
      icon: "/icons/png/37.png",
      kind: "folder" as const,
      label: project.title,
      onOpen: () => {
        openWindow("project-browser", {
          projects,
          selectedProjectSlug: project.slug,
          title: project.title
        });
      }
    }));
  }, [folder, openWindow, projects, selectedProject]);

  if (folder !== "trash" && projects.length === 0) {
    return (
      <div className="os9-app-shell flex h-full flex-col">
        <ProjectBrowserStatusBar text="0 items, Finder folder" />
        <ProjectBrowserContents>
          <div className="os9-empty-state text-[#525252]">
            No project data is available for this window.
          </div>
        </ProjectBrowserContents>
      </div>
    );
  }

  if (folder === "trash") {
    const statusText = `${renderItemCount(figures.length)}, Trash folder`;

    return (
      <div className="os9-app-shell flex h-full min-h-0 flex-col text-black">
        <ProjectBrowserStatusBar text={statusText} />
        <ProjectBrowserContents>
          <div className="flex min-h-full flex-wrap content-start items-start gap-x-[30px] gap-y-0 px-4 pb-4 pt-0">
            {figures.map((figure) => (
              <ProjectBrowserFigureButton
                key={figure.id}
                figure={figure}
                isSelected={selectedItemId === figure.id}
                onSelect={() => setSelectedItemId(figure.id)}
              />
            ))}
          </div>
        </ProjectBrowserContents>
      </div>
    );
  }

  if (previewFile?.type === "image") {
    const previewSource = previewFile.content && previewFile.content.startsWith("data:")
      ? previewFile.content
      : getPreviewSource(previewFile.path);
    const statusText = `${previewFile.name}, ${selectedProject?.title ?? "Projects"}`;

    return (
      <div className="os9-app-shell flex h-full flex-col">
        <ProjectBrowserStatusBar text={statusText} />
        <ProjectBrowserContents>
          <div className="flex h-full min-h-[220px] items-center justify-center bg-[#efefef] p-4">
            <div className="relative h-full max-h-full w-full border border-[#8c8c8c] bg-white p-1 shadow-[inset_1px_1px_0_#ffffff]">
              <div className="relative h-full min-h-[180px] w-full">
                <Image
                  src={previewSource}
                  alt={previewFile.name}
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </ProjectBrowserContents>
      </div>
    );
  }

  const folderLabel = selectedProject?.title ?? "Projects";
  const statusText = `${renderItemCount(figures.length)}, ${folderLabel} folder`;

  return (
    <div className="os9-app-shell flex h-full min-h-0 flex-col text-black">
      <ProjectBrowserStatusBar text={statusText} />
      <ProjectBrowserContents>
        <div className="flex min-h-full flex-wrap content-start items-start gap-x-[30px] gap-y-0 px-4 pb-4 pt-0">
          {figures.map((figure) => (
            <ProjectBrowserFigureButton
              key={figure.id}
              figure={figure}
              isSelected={selectedItemId === figure.id}
              onSelect={() => setSelectedItemId(figure.id)}
            />
          ))}
        </div>
      </ProjectBrowserContents>
    </div>
  );
}
