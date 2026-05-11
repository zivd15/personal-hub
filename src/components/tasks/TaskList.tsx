"use client";

import { useState, useRef, type RefObject } from "react";
import type { Task } from "@/types";
import TaskItem from "./TaskItem";

type Filter = "all" | "active" | "done";

interface Props {
  tasks: Task[];
  inputRef: RefObject<HTMLInputElement | null>;
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, dueDate: string | null) => void;
}

export default function TaskList({ tasks, inputRef, onAdd, onToggle, onDelete, onUpdate }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [draft, setDraft] = useState("");

  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    onAdd(t);
    setDraft("");
  };

  const active = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);
  const visible = filter === "all" ? tasks : filter === "active" ? active : done;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Quick-add input */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white focus-within:border-indigo-400 focus-within:shadow-sm transition-all">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400 shrink-0">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="New task… press Enter to add"
          dir="auto"
          className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
        />
        {draft.trim() && (
          <button
            type="button"
            onClick={submit}
            className="text-xs font-medium text-white bg-indigo-600 px-2.5 py-1 rounded-md hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Add
          </button>
        )}
      </div>

      {tasks.length > 0 && (
        <>
          {/* Filter tabs */}
          <div className="flex gap-1">
            {(["all", "active", "done"] as Filter[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors cursor-pointer ${
                  filter === f ? "bg-indigo-600 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {f === "all" ? `All (${tasks.length})` : f === "active" ? `Active (${active.length})` : `Done (${done.length})`}
              </button>
            ))}
          </div>

          {/* Task list */}
          {visible.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No {filter} tasks.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {visible.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-center gap-3 text-gray-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 opacity-30">
            <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="3" y="3" width="18" height="18" rx="3" />
          </svg>
          <p className="text-sm">Type a task above and press Enter.</p>
        </div>
      )}
    </div>
  );
}
