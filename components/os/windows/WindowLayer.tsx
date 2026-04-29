"use client";

import { WindowFrame } from "@/components/os/windows/WindowFrame";
import type { FinderTreeRecord, WindowInstance } from "@/lib/os/types";
import { FinderApp } from "@/components/os/finder/FinderApp";
import { AboutStephenApp } from "@/components/os/apps/AboutStephenApp";
import { ProjectsIndexApp } from "@/components/os/apps/ProjectsIndexApp";
import { ProjectDocumentApp } from "@/components/os/apps/ProjectDocumentApp";
import { WritingIndexApp } from "@/components/os/apps/WritingIndexApp";
import { PostDocumentApp } from "@/components/os/apps/PostDocumentApp";
import { ResumeApp } from "@/components/os/apps/ResumeApp";
import { ContactApp } from "@/components/os/apps/ContactApp";
import { ExtrasApp } from "@/components/os/apps/ExtrasApp";
import { WeatherApp } from "@/components/os/apps/WeatherApp";
import { HelpApp } from "@/components/os/apps/HelpApp";

type WindowLayerProps = {
  windows: WindowInstance[];
  tree: FinderTreeRecord;
  selectionNodeIds: string[];
  onSelectFinderNode: (nodeId: string) => void;
  onOpenFinderNode: (nodeId: string) => void;
  onOpenProject: (slug: string) => void;
  onOpenPost: (slug: string) => void;
  onOpenWeather: () => void;
  onOpenHelp: () => void;
  onFocus: (windowId: string) => void;
  onClose: (windowId: string) => void;
  onCollapse: (windowId: string) => void;
  onZoom: (windowId: string) => void;
  onMove: (windowId: string, x: number, y: number) => void;
  onResize: (windowId: string, width: number, height: number) => void;
};

function getWindowContent(
  window: WindowInstance,
  props: Omit<WindowLayerProps, "windows" | "onFocus" | "onClose" | "onCollapse" | "onZoom" | "onMove" | "onResize">
) {
  switch (window.appId) {
    case "finder":
      return (
        <FinderApp
          tree={props.tree}
          nodeId={window.nodeId ?? "volume-stephen-hd"}
          selectionNodeIds={props.selectionNodeIds}
          onSelect={props.onSelectFinderNode}
          onOpenNode={props.onOpenFinderNode}
        />
      );
    case "about-stephen":
      return <AboutStephenApp />;
    case "projects-index":
      return <ProjectsIndexApp onOpenProject={props.onOpenProject} />;
    case "project-document":
      return <ProjectDocumentApp slug={window.nodeId?.replace(/^project-/, "") ?? ""} />;
    case "writing-index":
      return <WritingIndexApp onOpenPost={props.onOpenPost} />;
    case "post-document":
      return <PostDocumentApp slug={window.nodeId?.replace(/^post-/, "") ?? ""} />;
    case "resume":
      return <ResumeApp />;
    case "contact":
      return <ContactApp />;
    case "extras":
      return <ExtrasApp onOpenWeather={props.onOpenWeather} onOpenHelp={props.onOpenHelp} />;
    case "weather":
      return <WeatherApp />;
    case "help":
      return <HelpApp />;
    default:
      return <p className="text-[11px] text-subtle">App content unavailable.</p>;
  }
}

export function WindowLayer({ windows, ...props }: WindowLayerProps) {
  return (
    <>
      {windows.map((window) => (
        <WindowFrame
          key={window.id}
          window={window}
          onFocus={props.onFocus}
          onClose={props.onClose}
          onCollapse={props.onCollapse}
          onZoom={props.onZoom}
          onMove={props.onMove}
          onResize={props.onResize}
        >
          {getWindowContent(window, props)}
        </WindowFrame>
      ))}
    </>
  );
}
