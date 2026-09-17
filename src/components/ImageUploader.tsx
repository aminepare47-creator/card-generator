"use client";

import { useEffect, useRef, useState } from "react";

export interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  shape?: "circle" | "square" | "rounded";
  maxBytes?: number;
}

type UploadState =
  | { kind: "idle" }
  | { kind: "uploading"; progress: number }
  | { kind: "error"; message: string };

export function ImageUploader({
  value,
  onChange,
  label,
  hint,
  shape = "rounded",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<UploadState>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [showManual, setShowManual] = useState(false);

  async function uploadFile(file: File) {
    setState({ kind: "uploading", progress: 0 });
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({
          kind: "error",
          message: json?.error ?? "Envoi impossible.",
        });
        return;
      }
      onChange(json.url);
      setState({ kind: "idle" });
    } catch (err: any) {
      setState({
        kind: "error",
        message: err?.message ?? "Envoi impossible.",
      });
    }
  }

  function handleFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setState({
        kind: "error",
        message: "Le fichier sélectionné n'est pas une image.",
      });
      return;
    }
    uploadFile(file);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    // Reset value so the same file can be re-picked.
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  // Paste from clipboard support.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items);
      const imageItem = items.find((it) => it.type.startsWith("image/"));
      if (!imageItem) return;
      const file = imageItem.getAsFile();
      if (file) {
        e.preventDefault();
        uploadFile(file);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function removeImage() {
    onChange("");
    setState({ kind: "idle" });
  }

  const previewClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "square"
        ? "rounded-none"
        : "rounded-2xl";

  return (
    <div className="space-y-2">
      {label ? (
        <p className="text-sm font-medium text-slate-700">
          {label}
          {hint ? (
            <span className="ml-2 text-xs font-normal text-slate-400">
              {hint}
            </span>
          ) : null}
        </p>
      ) : null}

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-4 transition ${
          dragOver
            ? "border-indigo-500 bg-indigo-50/60"
            : "border-slate-200 bg-slate-50/60"
        }`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div
            className={`grid place-items-center overflow-hidden bg-white shadow-sm ring-1 ring-black/5 ${previewClass}`}
            style={{ width: 96, height: 96 }}
          >
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt="Aperçu"
                className="h-full w-full object-cover"
                onError={() => {
                  // If image fails to load, keep the slot but show a placeholder.
                }}
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-slate-400"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-800">
              {value ? "Image prête" : "Choisis une image"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Depuis ta galerie, par glisser-déposer, ou <kbd className="rounded border border-slate-300 bg-white px-1 font-mono text-[10px]">Ctrl/⌘ + V</kbd> pour coller.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={state.kind === "uploading"}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {value ? "Changer" : "Depuis la galerie"}
              </button>
              {value ? (
                <button
                  type="button"
                  onClick={removeImage}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  Retirer
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setShowManual((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Coller une URL
              </button>
            </div>

            {showManual ? (
              <div className="mt-3 flex gap-2">
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://exemple.com/photo.jpg"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (manualUrl.trim()) {
                      onChange(manualUrl.trim());
                      setManualUrl("");
                      setShowManual(false);
                    }
                  }}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
                >
                  OK
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {state.kind === "uploading" ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
            <svg
              className="h-3.5 w-3.5 animate-spin"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M22 12a10 10 0 0 1-10 10"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            Envoi de l'image…
          </div>
        ) : null}

        {state.kind === "error" ? (
          <p className="mt-3 text-xs font-medium text-rose-600">
            {state.message}
          </p>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={onPick}
          className="hidden"
        />
      </div>
    </div>
  );
}
