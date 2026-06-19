"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/uploadClient";
import { isNative, nativePickPhoto } from "@/lib/native/platform";

/** Single-image uploader (cover / logo / founder photo). Writes the resulting
 * public URL into a hidden input named `name` so the existing form picks it up.
 * Camera roll + file picker via accept="image/*"; URL paste is the advanced option. */
export default function ImageUploadField({
  name,
  kind,
  businessId,
  initialUrl = "",
  label,
  aspect = "aspect-[3/1]",
}: {
  name: string;
  kind: string;
  businessId?: string;
  initialUrl?: string;
  label: string;
  aspect?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setError(null);
    setBusy(true);
    setProgress(0);
    try {
      const u = await uploadImage(file, { kind, businessId }, { onProgress: setProgress });
      setUrl(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className={`relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 ${aspect}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="h-full w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button type="button" onClick={() => inputRef.current?.click()} className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-white">Replace</button>
            <button type="button" onClick={() => setUrl("")} className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-white">Remove</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-neutral-300 bg-white text-sm text-neutral-500 hover:border-emerald-500 hover:text-emerald-700 disabled:opacity-60 ${aspect}`}
        >
          {busy ? (
            <>
              <span className="font-semibold">Uploading… {progress}%</span>
              <span className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200">
                <span className="block h-full rounded-full bg-emerald-600" style={{ width: `${progress}%` }} />
              </span>
            </>
          ) : (
            <>
              <span className="text-xl" aria-hidden>📷</span>
              <span className="font-semibold">Upload a photo</span>
              <span className="text-xs text-neutral-400">JPG, PNG or WebP · from camera or computer</span>
            </>
          )}
        </button>
      )}

      {isNative() && !url && (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setError(null);
            setBusy(true);
            setProgress(0);
            try {
              const file = await nativePickPhoto("camera");
              if (file) setUrl(await uploadImage(file, { kind, businessId }, { onProgress: setProgress }));
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload failed.");
            } finally {
              setBusy(false);
            }
          }}
          className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700 disabled:opacity-60"
        >
          📷 Take a photo
        </button>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pick} />

      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}

      <button type="button" onClick={() => setAdvanced((v) => !v)} className="mt-1 text-xs text-neutral-400 hover:text-emerald-700">
        {advanced ? "Hide" : "Advanced:"} paste an image URL
      </button>
      {advanced && (
        <input
          type="url"
          defaultValue={url}
          onChange={(e) => setUrl(e.target.value.trim())}
          placeholder="https://…/image.jpg"
          className="mt-1 w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
      )}
    </div>
  );
}
