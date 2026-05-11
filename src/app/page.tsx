"use client";

import { useState } from "react";
import type { StickyNote, Task, ActiveView, NoteColor } from "@/types";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import StickyNoteBoard from "@/components/sticky-notes/StickyNoteBoard";
import TaskList from "@/components/tasks/TaskList";

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_NOTES: StickyNote[] = [
  {
    id: "n1",
    content: "Ship dashboard MVP\nWire up Supabase auth\nDeploy to Cloudflare Pages",
    color: "yellow",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "n2",
    content: "Reading list:\n- Designing Data-Intensive Applications\n- The Pragmatic Programmer",
    color: "blue",
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "n3",
    content: "Coffee order: oat milk flat white, no sugar",
    color: "green",
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "n4",
    content: "Ideas for side project: habit tracker with streaks, minimal UI, offline-first",
    color: "purple",
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

const MOCK_TASKS: Task[] = [
  { id: "t1", text: "Review project proposal with the team", completed: false, dueDate: new Date().toISOString().slice(0, 10) },
  { id: "t2", text: "Set up Supabase database schema", completed: false, dueDate: new Date(Date.now() + 172800000).toISOString().slice(0, 10) },
  { id: "t3", text: "Write CLAUDE.md for personal-hub", completed: false, dueDate: null },
  { id: "t4", text: "Buy groceries", completed: true, dueDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10) },
  { id: "t5", text: "Book dentist appointment", completed: false, dueDate: new Date(Date.now() + 432000000).toISOString().slice(0, 10) },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const NOTE_COLORS: NoteColor[] = ["yellow", "blue", "green", "pink", "purple"];

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [view, setView] = useState<ActiveView>("tasks");
  const [notes, setNotes] = useState<StickyNote[]>(MOCK_NOTES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  // Note handlers
  const addNote = () => {
    const color = NOTE_COLORS[notes.length % NOTE_COLORS.length];
    setNotes((prev) => [
      { id: uid(), content: "", color, updatedAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const updateNote = (id: string, content: string) =>
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content, updatedAt: new Date().toISOString() } : n))
    );

  const deleteNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id));

  const changeNoteColor = (id: string, color: NoteColor) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, color } : n)));

  // Task handlers
  const addTask = () => {
    const newTask: Task = { id: uid(), text: "New task", completed: false, dueDate: null };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const updateTask = (id: string, text: string, dueDate: string | null) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text, dueDate } : t)));

  return (
    <div className="flex h-full">
      <Sidebar active={view} onChange={setView} />

      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header active={view} onAdd={view === "notes" ? addNote : addTask} />

        <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-6">
          {view === "notes" ? (
            <StickyNoteBoard
              notes={notes}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onColorChange={changeNoteColor}
            />
          ) : (
            <TaskList
              tasks={tasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onUpdate={updateTask}
            />
          )}
        </main>
      </div>
    </div>
  );
}
