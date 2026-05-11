export type NoteColor = "yellow" | "blue" | "green" | "pink" | "purple";

export interface StickyNote {
  id: string;
  content: string;
  color: NoteColor;
  updated_at: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  due_date: string | null;
}

export type ActiveView = "notes" | "tasks";
