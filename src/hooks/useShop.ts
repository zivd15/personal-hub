"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { GroceryList, GroceryItem, ItemStatus } from "@/types";

const STORAGE_KEY = "shop_list_ids";

const STATUS_CYCLE: Record<ItemStatus, ItemStatus> = {
  notbought: "partial",
  partial: "bought",
  bought: "notbought",
};

function getStoredIds(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}

function saveIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useShop() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [listsLoading, setListsLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    const ids = getStoredIds();
    if (ids.length === 0) { setLists([]); setListsLoading(false); return; }
    const { data } = await supabase
      .from("grocery_lists").select("*").in("id", ids).order("created_at", { ascending: false });
    setLists((data as GroceryList[]) ?? []);
    setListsLoading(false);
  }, []);

  const fetchItems = useCallback(async (listId: string) => {
    const { data } = await supabase
      .from("grocery_items").select("*").eq("list_id", listId).order("created_at", { ascending: true });
    setItems((data as GroceryItem[]) ?? []);
  }, []);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  useEffect(() => {
    if (!selectedListId) { setItems([]); return; }
    fetchItems(selectedListId);
    const ch = supabase
      .channel(`items-${selectedListId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "grocery_items", filter: `list_id=eq.${selectedListId}` }, () => fetchItems(selectedListId))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selectedListId, fetchItems]);

  const createList = async (name: string) => {
    const { data, error } = await supabase.from("grocery_lists").insert({ name }).select("id").single();
    if (error || !data) return;
    const ids = [...getStoredIds(), data.id];
    saveIds(ids);
    await fetchLists();
    setSelectedListId(data.id);
  };

  const joinList = async (code: string): Promise<boolean> => {
    const { data } = await supabase.from("grocery_lists").select("id").eq("id", code.toUpperCase()).single();
    if (!data) return false;
    const ids = [...new Set([...getStoredIds(), data.id])];
    saveIds(ids);
    await fetchLists();
    setSelectedListId(data.id);
    return true;
  };

  const leaveList = (id: string) => {
    const ids = getStoredIds().filter(i => i !== id);
    saveIds(ids);
    setLists(prev => prev.filter(l => l.id !== id));
    if (selectedListId === id) setSelectedListId(null);
  };

  const addItem = async (name: string, quantity?: string, unit?: string) => {
    if (!selectedListId) return;
    const tempId = `temp-${Date.now()}`;
    setItems(prev => [...prev, { id: tempId, list_id: selectedListId, name, quantity: quantity ?? null, unit: unit ?? null, status: "notbought", comments: null, created_at: new Date().toISOString() }]);
    const { data, error } = await supabase
      .from("grocery_items").insert({ list_id: selectedListId, name, quantity: quantity || null, unit: unit || null, status: "notbought" }).select("id").single();
    if (error || !data) { setItems(prev => prev.filter(i => i.id !== tempId)); }
    else { setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: data.id } : i)); }
  };

  const cycleStatus = async (id: string, current: ItemStatus) => {
    const next = STATUS_CYCLE[current];
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: next } : i));
    await supabase.from("grocery_items").update({ status: next }).eq("id", id);
  };

  const updateItem = async (id: string, name: string, quantity: string | null, unit: string | null) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, name, quantity, unit } : i));
    await supabase.from("grocery_items").update({ name, quantity, unit }).eq("id", id);
  };

  const deleteItem = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await supabase.from("grocery_items").delete().eq("id", id);
  };

  const clearBought = async () => {
    const ids = items.filter(i => i.status === "bought").map(i => i.id);
    if (!ids.length) return;
    setItems(prev => prev.filter(i => i.status !== "bought"));
    await supabase.from("grocery_items").delete().in("id", ids);
  };

  return { lists, selectedListId, setSelectedListId, items, listsLoading, createList, joinList, leaveList, addItem, cycleStatus, updateItem, deleteItem, clearBought };
}
