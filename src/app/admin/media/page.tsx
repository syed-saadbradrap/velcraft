"use client";

import { useState } from "react";
import { AdminAlert } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";

type Folder = "hero" | "pages" | "brand" | "general" | "shoes";

export default function AdminMediaPage() {
  const [folder, setFolder] = useState<Folder>("hero");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState<Array<{ path: string; url: string; folder: string }>>([]);

  async function handleUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const result = await apiClient.uploadAdminImage(file, folder);
      setUploads((current) => [
        { path: result.path, url: result.url, folder: result.folder ?? folder },
        ...current,
      ]);
    } catch (err) {
      setError(getErrorMessage(err, "Upload failed."));
    } finally {
      setUploading(false);
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Media library"
        description="Upload images for hero banners, page sections, brand logo, and products."
      />
      <AdminPanel className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="space-y-1 text-sm">
            <span className="text-stone-600">Folder</span>
            <select
              className="block rounded-xl border border-border bg-white px-3 py-2"
              value={folder}
              onChange={(event) => setFolder(event.target.value as Folder)}
            >
              <option value="hero">Hero</option>
              <option value="pages">Pages</option>
              <option value="brand">Brand</option>
              <option value="general">General</option>
              <option value="shoes">Shoes</option>
            </select>
          </label>
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => void handleUpload(event.target.files)}
            />
            <span className="inline-flex">
              <Button type="button" disabled={uploading}>
                {uploading ? "Uploading..." : "Choose image"}
              </Button>
            </span>
          </label>
        </div>
        {error ? <AdminAlert message={error} /> : null}
      </AdminPanel>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {uploads.map((item) => (
          <AdminPanel key={item.path} className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" className="aspect-video w-full rounded-xl object-cover" />
            <p className="truncate text-xs text-stone-500">{item.path}</p>
            <p className="break-all text-xs text-stone-700">{item.url}</p>
          </AdminPanel>
        ))}
      </div>
    </AdminPage>
  );
}
