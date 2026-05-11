"use client";

import { useState } from "react";
import type { GroceryItem, ItemStatus } from "@/types";

const STATUS: Record<ItemStatus, { icon: string; ring: string; text: string }> = {
  notbought: { icon: "○", ring: "border-gray-300 bg-white text-gray-400", text: "" },
  partial:   { icon: "◑", ring: "border-amber-400 bg-amber-50 text-amber-500", text: "" },
  bought:    { icon: "✓", ring: "border-green-500 bg-green-500 text-white", text: "line-through text-gray-400" },
};

interface Props {
  item: GroceryItem;
  onCycleStatus: (id: string, status: ItemStatus) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string, qty: string | null, unit: string | null) => void;
}

export default function ShopItemRow({ item, onCycleStatus, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.quantity ?? "");
  const [unit, setUnit] = useState(item.unit ?? "");

  const s = STATUS[item.status];

  const commit = () => {
    if (name.trim()) onUpdate(item.id, name.trim(), qty || null, unit || null);
    setEditing(false);
  };

  const cancel = () => {
    setName(item.name); setQty(item.quantity ?? ""); setUnit(item.unit ?? "");
    setEditing(false);
  };

  return (
    <div className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
      item.status === "bought" ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm"
    }`}>
      {/* Status toggle */}
      <button
        type="button"
        aria-label="Toggle status"
        onClick={() => onCycleStatus(item.id, item.status)}
        className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${s.ring}`}
      >
        {s.icon}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <input
              autoFocus
              dir="auto"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
              className="text-sm outline-none border-b border-indigo-500 pb-0.5 bg-transparent w-full"
            />
            <div className="flex items-center gap-2">
              <input value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty" className="text-xs outline-none border-b border-gray-200 pb-0.5 bg-transparent w-12 placeholder:text-gray-300 focus:border-indigo-400" />
              <input dir="auto" value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unit" className="text-xs outline-none border-b border-gray-200 pb-0.5 bg-transparent w-20 placeholder:text-gray-300 focus:border-indigo-400" />
              <button type="button" onClick={commit} className="text-xs text-indigo-600 font-medium hover:underline cursor-pointer ml-1">Save</button>
              <button type="button" onClick={cancel} className="text-xs text-gray-400 hover:underline cursor-pointer">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline gap-2 cursor-text" onClick={() => setEditing(true)}>
            <span dir="auto" className={`text-sm truncate ${s.text || "text-gray-900"}`}>{item.name}</span>
            {(item.quantity || item.unit) && (
              <span className="text-xs text-gray-400 shrink-0">{[item.quantity, item.unit].filter(Boolean).join(" ")}</span>
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      {!editing && (
        <button
          type="button"
          aria-label="Delete item"
          onClick={() => onDelete(item.id)}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
