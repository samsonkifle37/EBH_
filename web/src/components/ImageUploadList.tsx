"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/uploadClient";

/** Gallery uploader. Maintains an ordered list of public URLs in a hidden
 * textarea named `name` (newline-joined) so the existing form reads it unchanged. */
export default function ImageUploadList({
  name,
  businessId,
  initialUrls = [],
  max = 8,
}: {
  name: string;
  businessId?: string;
  initialUrls?: string[];
  max?: number;
}) {
  const [urls, setUrls] = useState<string[]>(initialUrls.filter(Boolean));
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      for (const file of files) {
        if (urls.length >= max) break;
        setProgress(0);
        const u = await uploadImage(file, { kind: "gallery", businessId }, { onProgress: setProgress });
        setUrls((cur) => (cur.length >= max ? cur : [...cur, u]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">Photo gallery (up to {max})</label>
      <textarea name={name} value={urls.join("\n")} readOnly hidden />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {urls.map((u, i) => (
          <div key={u + i} className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button type="button" onClick={() => setUrls((cur) => cur.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[11px] font-semibold text-red-600 hover:bg-white">✕</button>
          </div>
        ))}
        {urls.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-neutral-300 bg-white text-xs text-neutral-500 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-60"
          >
            {busy ? `…${progress}%` : <><span className="text-lg" aria-hidden>＋</span><span>Add photo</span></>}
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={pick} />
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}

      <div className="mt-2 flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Advanced: paste an image URL"
          className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <button
          type="button"
          onClick={() => { const u = urlInput.trim(); if (u && urls.length < max) { setUrls((c) => [...c, u]); setUrlInput(""); } }}
          className="shrink-0 rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-600 hover:border-emerald-600 hover:text-emerald-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}
