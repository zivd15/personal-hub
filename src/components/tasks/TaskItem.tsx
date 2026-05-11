"use client";

import { useState } from "react";
import type { Task } from "@/types";

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, dueDate: string | null) => void;
}

function formatDue(date: string): { label: string; urgent: boolean } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date + "T00:00:00");
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { label: "Overdue", urgent: true };
  if (diff === 0) return { label: "Today", urgent: true };
  if (diff === 1) return { label: "Tomorrow", urgent: false };
  return { label: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }), urgent: false };
}

export default function TaskItem({ task, onToggle, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(task.text);
  const [dueDate, setDueDate] = useState(task.due_date ?? "");

  const startEditing = () => {
    setText(task.text);
    setDueDate(task.due_date ?? "");
    setEditing(true);
  };

  const commit = () => {
    const trimmed = text.trim();
    if (trimmed) onUpdate(task.id, trimmed, dueDate || null);
    setEditing(false);
  };

  const cancel = () => {
    setText(task.text);
    setDueDate(task.due_date ?? "");
    setEditing(false);
  };

  const due = task.due_date ? formatDue(task.due_date) : null;

  return (
    <div className={`group flex items-start gap-3 px-4 py-3.5 rounded-xl border transition-all ${
      task.completed ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm"
    }`}>
      <button
        type="button"
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all cursor-pointer ${
          task.completed ? "bg-indigo-600 border-indigo-600" : "border-gray-300 hover:border-indigo-500"
        }`}
      >
        {task.completed && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-3 h-3">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-2">
            <input
              autoFocus
              aria-label="Task text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
              dir="auto"
              className="text-sm outline-none border-b border-indigo-500 pb-0.5 w-full bg-transparent"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="date"
                aria-label="Due date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs text-gray-500 outline-none bg-transparent cursor-pointer"
              />
              <button type="button" onClick={commit} className="text-xs text-indigo-600 font-medium cursor-pointer hover:underline">Save</button>
              <button type="button" onClick={cancel} className="text-xs text-gray-400 cursor-pointer hover:underline">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p
              onClick={() => !task.completed && startEditing()}
              dir="auto"
              className={`text-sm leading-snug ${
                task.completed ? "line-through text-gray-400" : "text-gray-900 cursor-text"
              }`}
            >
              {task.text}
            </p>
            {due && (
              <span className={`inline-block mt-1 text-[11px] font-medium px-1.5 py-0.5 rounded-md ${
                due.urgent ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500"
              }`}>
                {due.label}
              </span>
            )}
          </>
        )}
      </div>

      {!editing && (
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
          <button type="button" aria-label="Edit task" onClick={startEditing} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
              <path d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 012.828 2.828L11.828 13.828A2 2 0 0110 14H8v-2a2 2 0 01.586-1.414z" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" aria-label="Delete task" onClick={() => onDelete(task.id)} className="p-1 text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
