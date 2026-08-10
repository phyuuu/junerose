"use client";

import { useState, type FormEvent } from "react";
import { uploadStorefrontHeroAction } from "@/app/admin/storefront/actions";

const maxImageSizeBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function AdminStorefrontImageUploadForm() {
  const [error, setError] = useState("");

  function validateUpload(event: FormEvent<HTMLFormElement>) {
    const fileInput = event.currentTarget.elements.namedItem("heroImage");
    const file = fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined;

    if (!file) {
      event.preventDefault();
      setError("Choose a hero image to upload.");
      return;
    }

    if (!allowedImageTypes.has(file.type)) {
      event.preventDefault();
      setError("Hero image must be a JPG, PNG, or WebP file.");
      return;
    }

    if (file.size > maxImageSizeBytes) {
      event.preventDefault();
      setError("Hero image must be 5 MB or smaller.");
      return;
    }

    setError("");
  }

  return (
    <form action={uploadStorefrontHeroAction} onSubmit={validateUpload} className="mt-5 grid gap-4">
      <label className="grid gap-2 text-sm font-medium">
        Upload hero image
        <input
          name="heroImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={() => setError("")}
          className="rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm"
        />
      </label>
      <p className="text-xs leading-5 text-[#8a7a6d]">
        Use a landscape JPG, PNG, or WebP image up to 5 MB. A wide image at least
        1600 pixels across works best.
      </p>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        className="w-fit rounded-xl bg-[#2f241d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a382c]"
      >
        Upload and use image
      </button>
    </form>
  );
}
