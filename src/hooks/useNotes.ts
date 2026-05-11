"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { StickyNote, NoteColor } from "@/types";

export function useNotes() {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });
    setNotes((data as StickyNote[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();

    const channel = supabase
      .channel("notes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, fetchNotes)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchNotes]);

  const addNote = async (color: NoteColor) => {
    await supabase.from("notes").insert({ content: "", color });
  };

  const updateNote = async (id: string, content: string) => {
    await supabase.from("notes").update({ content, updated_at: new Date().toISOString() }).eq("id", id);
  };

  const deleteNote = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
  };

  const changeNoteColor = async (id: string, color: NoteColor) => {
    await supabase.from("notes").update({ color }).eq("id", id);
  };

  return { notes, loading, addNote, updateNote, deleteNote, changeNoteColor };
}
