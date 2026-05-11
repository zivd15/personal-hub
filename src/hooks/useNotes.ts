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

  const addNote = async (color: NoteColor): Promise<string> => {
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    setNotes(prev => [{ id: tempId, content: "", color, updated_at: now }, ...prev]);
    const { data, error } = await supabase
      .from("notes")
      .insert({ content: "", color })
      .select("id, updated_at")
      .single();
    if (error || !data) {
      setNotes(prev => prev.filter(n => n.id !== tempId));
      return tempId;
    }
    setNotes(prev => prev.map(n => n.id === tempId ? { ...n, id: data.id, updated_at: data.updated_at } : n));
    return data.id;
  };

  const updateNote = async (id: string, content: string) => {
    const now = new Date().toISOString();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content, updated_at: now } : n));
    await supabase.from("notes").update({ content, updated_at: now }).eq("id", id);
  };

  const deleteNote = async (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    await supabase.from("notes").delete().eq("id", id);
  };

  const changeNoteColor = async (id: string, color: NoteColor) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, color } : n));
    await supabase.from("notes").update({ color }).eq("id", id);
  };

  return { notes, loading, addNote, updateNote, deleteNote, changeNoteColor };
}
