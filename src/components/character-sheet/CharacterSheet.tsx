"use client";

import { useState } from "react";
import type { Sheet } from "@/lib/character";

// Editor for the generic character sheet (stats/skills are key→number maps).
function KeyNumberEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Record<string, number>;
  onChange: (v: Record<string, number>) => void;
}) {
  const [key, setKey] = useState("");
  const entries = Object.entries(value);

  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-300">{label}</h3>
      <ul className="mt-2 space-y-1">
        {entries.map(([k, v]) => (
          <li key={k} className="flex items-center gap-2 text-sm">
            <span className="w-32 truncate text-neutral-400">{k}</span>
            <input
              type="number"
              className="w-20 rounded bg-neutral-900 px-2 py-1"
              value={v}
              onChange={(e) => onChange({ ...value, [k]: Number(e.target.value) })}
            />
            <button
              type="button"
              className="text-neutral-500 hover:text-red-400"
              onClick={() => {
                const next = { ...value };
                delete next[k];
                onChange(next);
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          className="w-32 rounded bg-neutral-900 px-2 py-1 text-sm"
          placeholder={`Add ${label.toLowerCase()}…`}
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button
          type="button"
          className="rounded bg-neutral-800 px-2 text-sm"
          onClick={() => {
            const k = key.trim();
            if (k && !(k in value)) onChange({ ...value, [k]: 0 });
            setKey("");
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

export function CharacterSheet({
  name,
  sheet,
  onSave,
}: {
  name: string;
  sheet: Sheet;
  onSave: (data: { name: string; sheet: Sheet }) => Promise<void> | void;
}) {
  const [cname, setCName] = useState(name);
  const [s, setS] = useState<Sheet>(sheet);
  const [item, setItem] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave({ name: cname, sheet: s });
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded bg-neutral-900 px-3 py-2 font-medium outline-none"
          value={cname}
          onChange={(e) => setCName(e.target.value)}
        />
        <input
          className="w-40 rounded bg-neutral-900 px-3 py-2 text-sm outline-none"
          value={s.system}
          onChange={(e) => setS({ ...s, system: e.target.value })}
          placeholder="system"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <KeyNumberEditor label="Stats" value={s.stats} onChange={(stats) => setS({ ...s, stats })} />
        <KeyNumberEditor label="Skills" value={s.skills} onChange={(skills) => setS({ ...s, skills })} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-300">Inventory</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {s.inventory.map((it, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="flex-1">{it}</span>
              <button
                type="button"
                className="text-neutral-500 hover:text-red-400"
                onClick={() => setS({ ...s, inventory: s.inventory.filter((_, j) => j !== i) })}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 rounded bg-neutral-900 px-2 py-1 text-sm"
            placeholder="Add item…"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
          <button
            type="button"
            className="rounded bg-neutral-800 px-2 text-sm"
            onClick={() => {
              const v = item.trim();
              if (v) setS({ ...s, inventory: [...s.inventory, v] });
              setItem("");
            }}
          >
            +
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-neutral-300">Notes</h3>
        <textarea
          className="mt-2 h-32 w-full rounded bg-neutral-900 px-3 py-2 text-sm outline-none"
          value={s.notes}
          onChange={(e) => setS({ ...s, notes: e.target.value })}
        />
      </div>

      <button
        className="rounded bg-sky-600 px-4 py-2 text-sm font-medium disabled:opacity-50"
        onClick={save}
        disabled={saving}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
