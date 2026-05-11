"use client";

import type { ActiveView } from "@/types";

const NAV = [
  {
    view: "notes" as ActiveView,
    label: "Notes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    view: "tasks" as ActiveView,
    label: "Tasks",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" />
      </svg>
    ),
  },
];

interface SidebarProps {
  active: ActiveView;
  onChange: (v: ActiveView) => void;
}

export default function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 h-full bg-white border-r border-[--color-border] px-3 py-6">
        <div className="flex items-center gap-2 px-3 mb-8">
          <div className="w-7 h-7 rounded-lg bg-[--color-accent] flex items-center justify-center">
            <span className="text-white text-xs font-bold">H</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Personal Hub</span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ view, label, icon }) => (
            <button
              key={view}
              onClick={() => onChange(view)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                active === view
                  ? "bg-[--color-accent-light] text-[--color-accent]"
                  : "text-[--color-muted] hover:bg-gray-50 hover:text-[--color-foreground]"
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[--color-border] flex z-50">
        {NAV.map(({ view, label, icon }) => (
          <button
            key={view}
            onClick={() => onChange(view)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors cursor-pointer ${
              active === view ? "text-[--color-accent]" : "text-[--color-muted]"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
