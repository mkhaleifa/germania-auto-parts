"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { GripVertical, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_IMAGES_PER_PRODUCT, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from "@/lib/constant";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = MAX_IMAGES_PER_PRODUCT,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxImages - images.length;

      if (remaining <= 0) {
        setError(`Maximum ${maxImages} images allowed.`);
        return;
      }

      const toUpload = fileArray.slice(0, remaining);
      setError("");
      setUploading(true);

      const newUrls: string[] = [];

      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          setError(`${file.name}: unsupported format`);
          continue;
        }

        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          setError(`${file.name}: exceeds ${MAX_IMAGE_SIZE_MB}MB limit`);
          continue;
        }

        setProgress(`Uploading ${i + 1}/${toUpload.length}...`);

        // Client-side compression if browser-image-compression is available
        let fileToUpload: File | Blob = file;
        try {
          const imageCompression = (await import("browser-image-compression")).default;
          setProgress(`Optimizing ${i + 1}/${toUpload.length}...`);
          fileToUpload = await imageCompression(file, {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 2000,
            useWebWorker: true,
          });
        } catch {
          // compression not available, upload original
        }

        try {
          const formData = new FormData();
          formData.append("file", fileToUpload, file.name);

          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error?.message || "Upload failed");
          }

          const result = await res.json();
          newUrls.push(result.data.url);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed");
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }

      setUploading(false);
      setProgress("");
    },
    [images, maxImages, onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }

  function removeImage(index: number) {
    const next = [...images];
    next.splice(index, 1);
    onChange(next);
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((url, i) => (
            <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <Image src={url} alt={`Product image ${i + 1}`} fill className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                  Main
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {i > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => moveImage(i, i - 1)}
                  >
                    <GripVertical className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeImage(i)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < maxImages && (
        <div
          className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">{progress}</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Drop images here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, HEIC — Max {MAX_IMAGE_SIZE_MB}MB each
              </p>
              <input
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                multiple
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleInputChange}
              />
            </>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length}/{maxImages} images. First image is the main photo. Drag to reorder.
      </p>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}