"use client";

import { useState } from "react";
import type { ActiveView } from "@/types";
import { useNotes } from "@/hooks/useNotes";
import { useTasks } from "@/hooks/useTasks";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import StickyNoteBoard from "@/components/sticky-notes/StickyNoteBoard";
import TaskList from "@/components/tasks/TaskList";

export default function Dashboard() {
  const [view, setView] = useState<ActiveView>("tasks");

  const { notes, loading: notesLoading, addNote, updateNote, deleteNote, changeNoteColor } = useNotes();
  const { tasks, loading: tasksLoading, addTask, toggleTask, updateTask, deleteTask } = useTasks();

  const loading = view === "notes" ? notesLoading : tasksLoading;

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
