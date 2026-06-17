"use client";

import { useId, useState } from "react";
import { searchLocations, resolveLocation, type UkLocation } from "@/lib/location";

interface Props {
  name?: string; // when set, renders hidden inputs: name, nameCounty, nameRegion, nameCountry
  defaultValue?: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  onChange?: (loc: UkLocation) => void;
  className?: string;
}

/**
 * Searchable UK location input. Autocompletes from a curated dataset (with
 * county/region) but accepts any free-text place — EBH covers the whole UK.
 * Keyboard accessible (combobox + listbox), mobile friendly, normalizes on save.
 */
export default function LocationInput({ name, defaultValue = "", label, required, placeholder, onChange, className }: Props) {
  const [text, setText] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loc, setLoc] = useState<UkLocation>(() => resolveLocation(defaultValue));
  const listId = useId();
  const suggestions = searchLocations(text);

  function commit(value: string) {
    const r = resolveLocation(value);
    setLoc(r);
    onChange?.(r);
  }
  function pick(s: UkLocation) {
    setText(s.city);
    commit(s.city);
    setOpen(false);
    setActive(-1);
  }
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); pick(suggestions[active]); }
    else if (e.key === "Escape") setOpen(false);
  }

  const inputCls = "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-600";

  return (
    <div className={className}>
      {label && <label className="mb-1 block text-sm font-medium">{label}</label>}
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
          autoComplete="off"
          required={required}
          value={text}
          placeholder={placeholder ?? "Start typing a UK town or city…"}
          className={inputCls}
          onChange={(e) => { setText(e.target.value); setOpen(true); setActive(-1); commit(e.target.value); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
        />
        {open && suggestions.length > 0 && (
          <ul id={listId} role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
            {suggestions.map((s, i) => (
              <li
                key={s.city}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => { e.preventDefault(); pick(s); }}
                className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm ${i === active ? "bg-emerald-50 text-emerald-800" : "text-neutral-700 hover:bg-neutral-50"}`}
              >
                <span className="font-medium">{s.city}</span>
                <span className="text-xs text-neutral-400">{[s.county, s.region].filter(Boolean).join(" · ")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {name && (
        <>
          <input type="hidden" name={name} value={loc.city} />
          <input type="hidden" name={`${name}County`} value={loc.county} />
          <input type="hidden" name={`${name}Region`} value={loc.region} />
          <input type="hidden" name={`${name}Country`} value={loc.country} />
        </>
      )}

      {(loc.county || loc.region) && (
        <p className="mt-1 text-xs text-neutral-400">{[loc.county, loc.region, loc.country].filter(Boolean).join(" · ")}</p>
      )}
    </div>
  );
}
