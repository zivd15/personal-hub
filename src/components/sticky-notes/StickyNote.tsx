"use client";

import { useState } from "react";
import type { StickyNote as StickyNoteType, NoteColor } from "@/types";

const COLOR_CLASSES: Record<NoteColor, string> = {
  yellow: "bg-[--color-note-yellow]",
  blue:   "bg-[--color-note-blue]",
  green:  "bg-[--color-note-green]",
  pink:   "bg-[--color-note-pink]",
  purple: "bg-[--color-note-purple]",
};

const COLORS: NoteColor[] = ["yellow", "blue", "green", "pink", "purple"];

interface Props {
  note: StickyNoteType;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onColorChange: (id: string, color: NoteColor) => void;
}

export default function StickyNote({ note, onUpdate, onDelete, onColorChange }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <div
      className={`${COLOR_CLASSES[note.color]} rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow group min-h-36`}
    >
      {/* toolbar — always visible on touch, hover-revealed on desktop */}
      <div className="flex items-center justify-between opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(note.id, c)}
              className={`w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                note.color === c ? "border-gray-500" : "border-transparent"
              } ${COLOR_CLASSES[c]}`}
            />
          ))}
        </div>
        <button
          onClick={() => onDelete(note.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* content */}
      {editing ? (
        <textarea
          autoFocus
          value={note.content}
          onChange={(e) => onUpdate(note.id, e.target.value)}
          onBlur={() => setEditing(false)}
          className="flex-1 bg-transparent resize-none outline-none text-sm text-gray-800 leading-relaxed placeholder:text-gray-400 w-full"
          placeholder="Write something…"
          rows={5}
        />
      ) : (
        <p
          onClick={() => setEditing(true)}
          className="flex-1 text-sm text-gray-800 leading-relaxed cursor-text whitespace-pre-wrap break-words"
        >
          {note.content || <span className="text-gray-400 italic">Click to edit…</span>}
        </p>
      )}

      <p className="text-[10px] text-gray-400 mt-auto">
        {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </p>
    </div>
  );
}
