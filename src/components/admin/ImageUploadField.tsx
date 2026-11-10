"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { adminProductThumbnailSources } from "@/lib/media";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  label?: string;
  value?: string | null;
  slug?: string;
  onChange: (path: string) => void;
  helperText?: string;
}

export function ImageUploadField({
  label = "Product Image",
  value,
  slug = "",
  onChange,
  helperText = "Upload PNG, JPG, or WebP. Recommended: square or 4:5 product shot on clean background.",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [previewFailed, setPreviewFailed] = useState(false);

  const remoteSources = useMemo(
    () =>
      adminProductThumbnailSources({
        slug,
        thumbnail_path: value ?? null,
        thumbnail_url: value ? null : null,
      }),
    [slug, value],
  );

  useEffect(() => {
    setSourceIndex(0);
    setPreviewFailed(false);
  }, [value, slug, localPreview]);

  const previewUrl = localPreview ?? remoteSources[sourceIndex] ?? "";
  const hasSavedPath = Boolean(value);
  const showMissingState = hasSavedPath && previewFailed && !localPreview;

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setUploading(true);
    setError("");
    setPreviewFailed(false);

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    try {
      const uploaded = await apiClient.uploadAdminImage(file);
      onChange(uploaded.path);
      setLocalPreview(null);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setLocalPreview(null);
      URL.revokeObjectURL(objectUrl);
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setLocalPreview(null);
    onChange("");
    setError("");
    setPreviewFailed(false);
    setSourceIndex(0);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handlePreviewError() {
    if (localPreview) {
      setPreviewFailed(true);
      return;
    }

    if (sourceIndex < remoteSources.length - 1) {
      setSourceIndex((current) => current + 1);
      return;
    }

    setPreviewFailed(true);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-700">{label}</span>
        {value ? (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs uppercase tracking-[0.18em] text-stone-500 transition hover:text-red-600"
          >
            Remove
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-[1.5rem] border bg-[linear-gradient(160deg,#ffffff_0%,#faf7f1_100%)] shadow-[0_18px_50px_rgba(28,25,23,0.06)] transition",
          dragging ? "border-accent ring-2 ring-accent/20" : "border-border",
        )}
      >
        <div className="relative aspect-square max-h-[320px] w-full sm:max-h-none sm:aspect-[4/5]">
          {previewUrl && !showMissingState ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Product thumbnail preview"
                className="h-full w-full object-contain p-6"
                onError={handlePreviewError}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/55 to-transparent p-4">
                <p className="truncate text-[10px] uppercase tracking-[0.18em] text-white/85">
                  {value || "Preview"}
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-2xl text-accent">
                ↑
              </div>
              <div>
                <p className="font-display text-xl text-stone-900">
                  {showMissingState ? "Image file missing" : "Upload product photo"}
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {showMissingState
                    ? "The saved image path no longer exists. Upload a new product photo."
                    : helperText}
                </p>
              </div>
            </div>
          )}

          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-sm">
              <div className="rounded-full border border-accent/20 bg-white px-5 py-3 text-xs uppercase tracking-[0.22em] text-accent shadow-sm">
                Uploading...
              </div>
            </div>
          ) : null}
        </div>

        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFiles(event.dataTransfer.files);
          }}
          className="border-t border-border/80 p-4"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(event) => void handleFiles(event.target.files)}
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-full bg-accent px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-white transition hover:bg-[#b8943f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {previewUrl && !showMissingState ? "Replace Image" : "Choose Image"}
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-full border border-border px-5 py-3 text-xs uppercase tracking-[0.2em] text-stone-700 transition hover:border-accent/35 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Drag & Drop Here
            </button>
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {value ? (
        <p className="break-all text-xs text-stone-500">
          Saved as: <span className="font-mono text-stone-700">{value}</span>
        </p>
      ) : null}
    </div>
  );
}
