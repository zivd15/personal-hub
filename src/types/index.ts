export type NoteColor = "yellow" | "blue" | "green" | "pink" | "purple";

export interface StickyNote {
  id: string;
  content: string;
  color: NoteColor;
  updatedAt: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string | null;
}

export type ActiveView = "notes" | "tasks";
