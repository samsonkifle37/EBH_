"use client";

import { useState, useRef } from "react";

type State = "idle" | "uploading" | "success" | "error";

export default function EnkutatashPhotoForm() {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setPreview(null); return; }
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = fileRef.current?.files?.[0];
    if (!file) { setErrorMsg("Please choose a photo."); return; }

    setState("uploading");
    setErrorMsg("");

    const formData = new FormData(form);
    formData.set("file", file);

    try {
      const res = await fetch("/api/enkutatash/photos", { method: "POST", body: formData });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setState("error");
      } else {
        setState("success");
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        form.reset();
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
        <div className="text-4xl">🌸</div>
        <p className="mt-3 text-lg font-bold text-emerald-800">Thank you!</p>
        <p className="mt-1 text-sm text-emerald-700">Your photo will appear on the wall once we&apos;ve reviewed it.</p>
        <button
          onClick={() => setState("idle")}
          className="mt-4 rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          Submit another photo
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo picker */}
      <div>
        <label className="block text-sm font-semibold text-neutral-800">
          Your photo <span className="text-red-500">*</span>
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 transition hover:border-emerald-400 hover:bg-emerald-50/40"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="max-h-48 max-w-full rounded-xl object-cover" />
          ) : (
            <>
              <span className="text-3xl">📷</span>
              <p className="mt-2 text-sm font-medium text-neutral-600">Tap to choose a photo</p>
              <p className="text-xs text-neutral-400">JPG, PNG or WebP · max 8 MB</p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="ep-name" className="block text-sm font-semibold text-neutral-800">
          Your name <span className="text-red-500">*</span>
        </label>
        <input
          id="ep-name"
          name="submitterName"
          type="text"
          required
          maxLength={80}
          placeholder="e.g. Meron from Manchester"
          className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* City */}
      <div>
        <label htmlFor="ep-city" className="block text-sm font-semibold text-neutral-800">
          City <span className="text-neutral-400 font-normal">(optional)</span>
        </label>
        <input
          id="ep-city"
          name="city"
          type="text"
          maxLength={80}
          placeholder="e.g. London"
          className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Caption */}
      <div>
        <label htmlFor="ep-caption" className="block text-sm font-semibold text-neutral-800">
          Caption <span className="text-neutral-400 font-normal">(optional · max 200 chars)</span>
        </label>
        <textarea
          id="ep-caption"
          name="caption"
          maxLength={200}
          rows={2}
          placeholder="Share what Enkutatash means to you..."
          className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {state === "error" && errorMsg && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === "uploading"}
        className="w-full rounded-xl bg-[#15613e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f3d28] disabled:opacity-60"
      >
        {state === "uploading" ? "Uploading…" : "Share my Enkutatash moment 🌸"}
      </button>

      <p className="text-center text-xs text-neutral-400">
        Photos are reviewed before appearing on the wall. By submitting you agree to our{" "}
        <a href="/terms" className="underline hover:text-neutral-600">terms</a>.
      </p>
    </form>
  );
}
