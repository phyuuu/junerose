"use client";

import { useState } from "react";
import AdminProductFormPlaceholder from "./AdminProductFormPlaceholder";

export default function AdminProductCreatePanel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="rounded-full bg-[#9c7a4f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#7f623f]"
        >
          {isOpen ? "Close form" : "Add product"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6">
          <AdminProductFormPlaceholder />
        </div>
      )}
    </div>
  );
}