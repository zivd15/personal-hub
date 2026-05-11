"use client";

import type { ActiveView } from "@/types";

const TITLES: Record<ActiveView, string> = {
  notes: "Sticky Notes",
  tasks: "Tasks",
  shopping: "Shopping",
};

const SUBTITLES: Record<ActiveView, string> = {
  notes: "Capture ideas, fast",
  tasks: "Stay on top of what matters",
  shopping: "Lists you can share",
};

const ADD_LABELS: Record<ActiveView, string> = {
  notes: "New note",
  tasks: "Add task",
  shopping: "Add item",
};

export default function Header({ active, onAdd }: { active: ActiveView; onAdd: () => void }) {
  return (
    <header className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white shrink-0">
      <div>
        <h1 className="text-lg font-semibold leading-tight text-gray-900">{TITLES[active]}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{SUBTITLES[active]}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        {ADD_LABELS[active]}
      </button>
    </header>
  );
}
