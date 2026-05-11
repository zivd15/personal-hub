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

  const addTask = async (): Promise<string | null> => {
    const { data } = await supabase
      .from("tasks")
      .insert({ text: "New task", completed: false, due_date: null })
      .select("id")
      .single();
    await fetchTasks();
    return data?.id ?? null;
  };

  const toggleTask = async (id: string, completed: boolean) => {
    await supabase.from("tasks").update({ completed }).eq("id", id);
    await fetchTasks();
  };

  const updateTask = async (id: string, text: string, due_date: string | null) => {
    await supabase.from("tasks").update({ text, due_date }).eq("id", id);
    await fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    await fetchTasks();
  };

  return { tasks, loading, addTask, toggleTask, updateTask, deleteTask };
}
