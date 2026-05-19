"use client";

import { useEffect, useRef, useState } from "react";
import { NOTES } from "@/lib/notes-config";
import type { AppProps } from "@/types";

interface NotePadWindowProps {
  noteId: number;
}

interface NoteDefinition {
  title: string;
  content: string;
}

const EMPTY_NOTE: NoteDefinition = {
  title: "Note Pad",
  content: ""
};

function isNotePadWindowProps(value: unknown): value is NotePadWindowProps {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.noteId === "number" && Number.isInteger(candidate.noteId);
}

function getNoteDefinition(noteId: number): NoteDefinition {
  return Object.prototype.hasOwnProperty.call(NOTES, noteId) ? NOTES[noteId] : EMPTY_NOTE;
}

function resolveNote(props: AppProps["props"]) {
  if (!isNotePadWindowProps(props)) {
    return {
      note: EMPTY_NOTE,
      noteId: 0
    };
  }

  const noteId = props.noteId;
  const note = getNoteDefinition(noteId);

  return {
    note,
    noteId
  };
}

export function NotePad({ props, windowId }: AppProps) {
  const { note, noteId } = resolveNote(props);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#dadada] p-1 text-[#2d2610]">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-black bg-[#fff7bf] p-[2px] shadow-[-1px_-1px_0_#c8be75,1px_1px_0_#fffbd3,inset_1px_1px_0_#fffde0,inset_-1px_-1px_0_#d8cd82]">
        <div className="border-b border-[#d8cd82] bg-[#fff2a0] px-3 py-2 font-['Chicago'] text-[11px] text-[#65530b]">
          {note.title}
        </div>

        <NotePadEditor
          key={`${windowId}:${noteId}`}
          note={note}
          noteId={noteId}
          windowId={windowId}
        />
      </div>
    </div>
  );
}

interface NotePadEditorProps {
  note: NoteDefinition;
  noteId: number;
  windowId: string;
}

function NotePadEditor({ note, noteId, windowId }: NotePadEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.focus();

    const cursorPosition = textarea.value.length;

    textarea.setSelectionRange(cursorPosition, cursorPosition);
  }, [noteId, windowId]);

  return (
    <div
      className="min-h-0 flex-1 overflow-hidden bg-[#fffde7] px-0 py-2"
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0 35px, rgba(197, 84, 84, 0.45) 35px 36px, transparent 36px 100%), repeating-linear-gradient(180deg, transparent 0 23px, rgba(189, 168, 70, 0.35) 23px 24px)",
        backgroundPosition: "0 0, 0 0"
      }}
    >
      <textarea
        ref={textareaRef}
        aria-label={`${note.title} text`}
        autoCapitalize="off"
        autoCorrect="off"
        className="app-scrollbar h-full w-full resize-none border-0 bg-transparent px-[52px] pb-3 pr-4 pt-0 font-mono text-[12px] leading-[24px] text-[#2d2610] outline-none"
        spellCheck={false}
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />
    </div>
  );
}
