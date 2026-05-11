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

export type ActiveView = "notes" | "tasks" | "shopping";

export type ItemStatus = "notbought" | "partial" | "bought";

export interface GroceryList {
  id: string;
  name: string;
  created_at: string;
}

export interface GroceryItem {
  id: string;
  list_id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  status: ItemStatus;
  comments: string | null;
  created_at: string;
}
