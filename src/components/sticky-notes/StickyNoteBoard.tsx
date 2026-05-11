"use client";

import type { StickyNote, NoteColor } from "@/types";
import StickyNoteCard from "./StickyNote";

interface Props {
  notes: StickyNote[];
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, color: NoteColor) => void;
}

export default function StickyNoteBoard({ notes, onUpdate, onDelete, onColorChange }: Props) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3 text-gray-500">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 opacity-30">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 8h8M8 12h5" strokeLinecap="round" />
        </svg>
        <p className="text-sm">No notes yet — hit <strong>New note</strong> to start.</p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="break-inside-avoid">
          <StickyNoteCard
            note={note}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onColorChange={onColorChange}
          />
        </div>
      ))}
    </div>
  );
}
