"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Task } from "@/types";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    setTasks((data as Task[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
    const channel = supabase
      .channel("tasks-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchTasks)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchTasks]);

  const addTask = async (text: string) => {
    const tempId = `temp-${Date.now()}`;
    setTasks(prev => [{ id: tempId, text, completed: false, due_date: null }, ...prev]);
    const { data, error } = await supabase
      .from("tasks")
      .insert({ text, completed: false, due_date: null })
      .select("id")
      .single();
    if (error || !data) {
      setTasks(prev => prev.filter(t => t.id !== tempId));
    } else {
      setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: data.id } : t));
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t));
    await supabase.from("tasks").update({ completed }).eq("id", id);
  };

  const updateTask = async (id: string, text: string, due_date: string | null) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text, due_date } : t));
    await supabase.from("tasks").update({ text, due_date }).eq("id", id);
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  };

  return { tasks, loading, addTask, toggleTask, updateTask, deleteTask };
}
