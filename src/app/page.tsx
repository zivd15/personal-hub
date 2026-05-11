"use client";

import { useState, useRef } from "react";
import type { ActiveView } from "@/types";
import { useNotes } from "@/hooks/useNotes";
import { useTasks } from "@/hooks/useTasks";
import { isConfigured } from "@/lib/supabase";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import StickyNoteBoard from "@/components/sticky-notes/StickyNoteBoard";
import TaskList from "@/components/tasks/TaskList";
import ShopView from "@/components/shopping/ShopView";

export default function Dashboard() {
  const [view, setView] = useState<ActiveView>("tasks");
  const [newNoteId, setNewNoteId] = useState<string | null>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);
  const shopItemInputRef = useRef<HTMLInputElement>(null);

  const { notes, loading: notesLoading, addNote, updateNote, deleteNote, changeNoteColor } = useNotes();
  const { tasks, loading: tasksLoading, addTask, toggleTask, updateTask, deleteTask } = useTasks();

  const loading = view === "notes" ? notesLoading : view === "tasks" ? tasksLoading : false;

  const handleAddNote = async () => {
    const id = await addNote("yellow");
    setNewNoteId(id);
    setTimeout(() => setNewNoteId(null), 1000);
  };

  const handleAdd = () => {
    if (view === "notes") handleAddNote();
    else if (view === "tasks") taskInputRef.current?.focus();
    else shopItemInputRef.current?.focus();
  };

  if (!isConfigured) {
    return (
      <div className="flex h-full items-center justify-center text-center px-6">
        <div className="max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-indigo-600">
              <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Supabase not configured</h2>
          <p className="text-sm text-gray-500">
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
        <Header active={view} onAdd={handleAdd} />

        <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-6">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            </div>
          ) : view === "notes" ? (
            <StickyNoteBoard
              notes={notes}
              newNoteId={newNoteId}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onColorChange={changeNoteColor}
            />
          ) : view === "tasks" ? (
            <TaskList
              tasks={tasks}
              inputRef={taskInputRef}
              onAdd={addTask}
              onToggle={(id) => {
                const task = tasks.find((t) => t.id === id);
                if (task) toggleTask(id, !task.completed);
              }}
              onDelete={deleteTask}
              onUpdate={updateTask}
            />
          ) : (
            <ShopView itemInputRef={shopItemInputRef} />
          )}
        </main>
      </div>
    </div>
  );
}
