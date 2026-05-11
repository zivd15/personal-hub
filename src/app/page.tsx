"use client";

import { useState } from "react";
import type { ActiveView } from "@/types";
import { useNotes } from "@/hooks/useNotes";
import { useTasks } from "@/hooks/useTasks";
import { isConfigured } from "@/lib/supabase";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import StickyNoteBoard from "@/components/sticky-notes/StickyNoteBoard";
import TaskList from "@/components/tasks/TaskList";

export default function Dashboard() {
  const [view, setView] = useState<ActiveView>("tasks");

  const { notes, loading: notesLoading, addNote, updateNote, deleteNote, changeNoteColor } = useNotes();
  const { tasks, loading: tasksLoading, addTask, toggleTask, updateTask, deleteTask } = useTasks();

  const loading = view === "notes" ? notesLoading : tasksLoading;

  if (!isConfigured) {
    return (
      <div className="flex h-full items-center justify-center text-center px-6">
        <div className="max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-[--color-accent-light] flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-[--color-accent]">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Supabase not configured</h2>
          <p className="text-sm text-[--color-muted]">
            Add <code className="bg-gray-100 px-1 rounded text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your
            environment variables, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <Sidebar active={view} onChange={setView} />

      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header active={view} onAdd={view === "notes" ? () => addNote("yellow") : addTask} />

        <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 rounded-full border-2 border-[--color-accent] border-t-transparent animate-spin" />
            </div>
          ) : view === "notes" ? (
            <StickyNoteBoard
              notes={notes}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onColorChange={changeNoteColor}
            />
          ) : (
            <TaskList
              tasks={tasks}
              onToggle={(id) => {
                const task = tasks.find((t) => t.id === id);
                if (task) toggleTask(id, !task.completed);
              }}
              onDelete={deleteTask}
              onUpdate={updateTask}
            />
          )}
        </main>
      </div>
    </div>
  );
}
