"use client";

import type { Task } from "@/types";
import TaskItem from "./TaskItem";

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string, dueDate: string | null) => void;
}

export default function TaskList({ tasks, onToggle, onDelete, onUpdate }: Props) {
  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3 text-[--color-muted]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 opacity-30">
          <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="3" width="18" height="18" rx="3" />
        </svg>
        <p className="text-sm">No tasks yet — hit <strong>Add task</strong> to begin.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {open.length > 0 && (
        <section className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[--color-muted] px-1">
            To do · {open.length}
          </p>
          <div className="flex flex-col gap-2">
            {open.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
            ))}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[--color-muted] px-1">
            Completed · {done.length}
          </p>
          <div className="flex flex-col gap-2">
            {done.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
