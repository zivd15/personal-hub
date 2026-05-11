"use client";

import type { ActiveView } from "@/types";

const TITLES: Record<ActiveView, string> = {
  notes: "Sticky Notes",
  tasks: "Tasks",
};

const SUBTITLES: Record<ActiveView, string> = {
  notes: "Capture ideas, fast",
  tasks: "Stay on top of what matters",
};

export default function Header({ active, onAdd }: { active: ActiveView; onAdd: () => void }) {
  return (
    <header className="flex items-center justify-between px-6 py-5 border-b border-[--color-border] bg-white shrink-0">
      <div>
        <h1 className="text-lg font-semibold leading-tight">{TITLES[active]}</h1>
        <p className="text-sm text-[--color-muted] mt-0.5">{SUBTITLES[active]}</p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-[--color-accent] text-white text-sm font-medium rounded-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        {active === "notes" ? "New note" : "Add task"}
      </button>
    </header>
  );
}
