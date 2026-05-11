"use client";

import { useState, type RefObject } from "react";
import { useShop } from "@/hooks/useShop";
import ShopItemRow from "./ShopItemRow";

interface Props {
  itemInputRef: RefObject<HTMLInputElement | null>;
}

export default function ShopView({ itemInputRef }: Props) {
  const { lists, selectedListId, setSelectedListId, items, listsLoading, createList, joinList, leaveList, addItem, cycleStatus, updateItem, deleteItem, clearBought } = useShop();

  const [newListName, setNewListName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinError, setJoinError] = useState(false);
  const [itemDraft, setItemDraft] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [copied, setCopied] = useState(false);
  const [createError, setCreateError] = useState(false);

  const selectedList = lists.find(l => l.id === selectedListId);

  const handleCreateList = async () => {
    const name = newListName.trim();
    if (!name) return;
    setCreateError(false);
    const ok = await createList(name);
    if (ok) { setNewListName(""); setShowCreate(false); }
    else setCreateError(true);
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    const ok = await joinList(code);
    if (ok) { setJoinCode(""); setShowJoin(false); setJoinError(false); }
    else setJoinError(true);
  };

  const handleAddItem = () => {
    const name = itemDraft.trim();
    if (!name) return;
    addItem(name, itemQty.trim() || undefined, itemUnit || undefined);
    setItemDraft(""); setItemQty(""); setItemUnit("");
    setTimeout(() => itemInputRef.current?.focus(), 0);
  };

  const handleCopy = () => {
    if (!selectedList) return;
    navigator.clipboard?.writeText(selectedList.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const notBought = items.filter(i => i.status === "notbought");
  const partial = items.filter(i => i.status === "partial");
  const bought = items.filter(i => i.status === "bought");

  if (listsLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (lists.length === 0 && !showCreate && !showJoin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 text-gray-300">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-sm text-gray-500">No shopping lists yet</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowCreate(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
            Create list
          </button>
          <button type="button" onClick={() => setShowJoin(true)} className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            Join by code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">

      {/* List selector row */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={selectedListId ?? ""}
          onChange={e => setSelectedListId(e.target.value || null)}
          className="flex-1 min-w-0 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 cursor-pointer"
        >
          <option value="">— pick a list —</option>
          {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <button type="button" onClick={() => { setShowCreate(v => !v); setShowJoin(false); }} className="px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 bg-indigo-50 rounded-lg hover:bg-indigo-100 cursor-pointer transition-colors whitespace-nowrap">
          + New
        </button>
        <button type="button" onClick={() => { setShowJoin(v => !v); setShowCreate(false); }} className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
          Join
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <input
              autoFocus dir="auto"
              value={newListName}
              onChange={e => { setNewListName(e.target.value); setCreateError(false); }}
              onKeyDown={e => { if (e.key === "Enter") handleCreateList(); if (e.key === "Escape") setShowCreate(false); }}
              placeholder="List name…"
              className={`flex-1 text-sm border rounded-lg px-3 py-2 outline-none ${createError ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
            />
            <button type="button" onClick={handleCreateList} className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 cursor-pointer">Create</button>
            <button type="button" onClick={() => { setShowCreate(false); setCreateError(false); }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
          </div>
          {createError && <p className="text-xs text-red-500 pl-1">Failed to create list — make sure the Supabase tables exist.</p>}
        </div>
      )}

      {/* Join form */}
      {showJoin && (
        <div className="flex gap-2 items-center flex-wrap">
          <input
            autoFocus
            value={joinCode}
            onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(false); }}
            onKeyDown={e => { if (e.key === "Enter") handleJoin(); if (e.key === "Escape") setShowJoin(false); }}
            placeholder="6-char code"
            maxLength={6}
            className={`w-36 text-sm border rounded-lg px-3 py-2 outline-none uppercase tracking-widest font-mono ${joinError ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-indigo-400"}`}
          />
          <button type="button" onClick={handleJoin} className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 cursor-pointer">Join</button>
          <button type="button" onClick={() => { setShowJoin(false); setJoinError(false); }} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Cancel</button>
          {joinError && <span className="text-xs text-red-500">List not found</span>}
        </div>
      )}

      {/* Share code bar */}
      {selectedList && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
          <span className="text-xs text-indigo-400 font-medium">Share code</span>
          <span className="font-mono text-sm font-bold tracking-widest text-indigo-700 flex-1">{selectedList.id}</span>
          <button type="button" onClick={handleCopy} className="text-xs text-indigo-500 hover:text-indigo-700 cursor-pointer transition-colors font-medium">
            {copied ? "Copied!" : "Copy"}
          </button>
          <button type="button" onClick={() => leaveList(selectedList.id)} className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors">Leave</button>
        </div>
      )}

      {/* Item quick-add */}
      {selectedListId && (
        <div className="flex flex-col gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white focus-within:border-indigo-400 focus-within:shadow-sm transition-all">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400 shrink-0">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <input
              ref={itemInputRef}
              value={itemDraft}
              dir="auto"
              onChange={e => setItemDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddItem(); } }}
              placeholder="Add item… press Enter"
              className="flex-1 text-sm outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
            />
            {itemDraft.trim() && (
              <button type="button" onClick={handleAddItem} className="text-xs font-medium text-white bg-indigo-600 px-2.5 py-1 rounded-md hover:bg-indigo-700 cursor-pointer transition-colors shrink-0">
                Add
              </button>
            )}
          </div>
          <div className="flex gap-3 pl-6">
            <input
              value={itemQty}
              onChange={e => setItemQty(e.target.value)}
              placeholder="Qty"
              className="text-xs outline-none border-b border-gray-200 pb-0.5 bg-transparent w-14 placeholder:text-gray-300 focus:border-indigo-400"
            />
            <select
              value={itemUnit}
              onChange={e => setItemUnit(e.target.value)}
              className="text-xs outline-none border-b border-gray-200 pb-0.5 bg-transparent text-gray-600 cursor-pointer focus:border-indigo-400"
            >
              <option value="">Unit</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
              <option value="pack">pack</option>
              <option value="pcs">pcs</option>
            </select>
          </div>
        </div>
      )}

      {/* Empty state */}
      {selectedListId && items.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
          <p className="text-sm">List is empty — type an item above.</p>
        </div>
      )}

      {/* Item groups */}
      {[
        { label: "TO BUY", data: notBought },
        { label: "PARTIAL", data: partial },
        { label: "DONE", data: bought },
      ].filter(g => g.data.length > 0).map(group => (
        <section key={group.label} className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{group.label} · {group.data.length}</p>
            {group.label === "DONE" && (
              <button type="button" onClick={clearBought} className="text-xs text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
                Clear done
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {group.data.map(item => (
              <ShopItemRow
                key={item.id}
                item={item}
                onCycleStatus={cycleStatus}
                onDelete={deleteItem}
                onUpdate={updateItem}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
