"use client";

import { useState, type FormEvent } from "react";
import { uploadProductImageAction } from "@/app/admin/products/image-actions";
import type { ProductOption } from "@/lib/admin-product-options";

const maxImageSizeBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export default function AdminProductImageUploadForm({
  productId,
  colors,
}: {
  productId: number;
  colors: ProductOption[];
}) {
  const [error, setError] = useState("");

  function validateUpload(event: FormEvent<HTMLFormElement>) {
    const fileInput = event.currentTarget.elements.namedItem("image");
    const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined;

    if (!file) {
      event.preventDefault();
      setError("Choose an image to upload.");
      return;
    }

    if (!allowedImageTypes.has(file.type)) {
      event.preventDefault();
      setError("Product image must be a JPG, PNG, WebP, or GIF file.");
      return;
    }

    if (file.size > maxImageSizeBytes) {
      event.preventDefault();
      setError("Product image must be 5 MB or smaller.");
      return;
    }

    setError("");
  }

  return (
    <form
      action={uploadProductImageAction}
      onSubmit={validateUpload}
      className="mt-6 grid gap-4 rounded-xl border border-[#d6c4aa] bg-white p-4 md:grid-cols-[1fr_220px_auto] md:items-end"
    >
      <input type="hidden" name="productId" value={productId} />

      <label className="grid gap-1 text-sm">
        Upload image
        <input
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={() => setError("")}
          className="rounded-xl border border-[#d6c4aa] px-3 py-2 text-sm"
        />
      </label>

      <label className="grid gap-1 text-sm">
        Image color
        <select
          name="colorId"
          className="rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm"
        >
          <option value="">General</option>
          {colors.map((color) => (
            <option key={color.id} value={color.id}>
              {color.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-xl bg-[#2f241d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a382c]"
      >
        Upload image
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-700 md:col-span-3">
          {error}
        </p>
      )}
    </form>
  );
}
