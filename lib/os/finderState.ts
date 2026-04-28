"use client";

import { create } from "zustand";
import type { FinderTreeRecord } from "@/lib/os/types";

type FinderState = {
  tree: FinderTreeRecord;
  selectionNodeIds: string[];
  initializeTree: (tree: FinderTreeRecord) => void;
  setSelection: (selectionNodeIds: string[]) => void;
};

export const useFinderStore = create<FinderState>((set) => ({
  tree: {},
  selectionNodeIds: [],
  initializeTree: (tree) => set({ tree }),
  setSelection: (selectionNodeIds) => set({ selectionNodeIds })
}));
