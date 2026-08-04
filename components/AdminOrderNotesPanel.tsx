"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addOrderNoteAction,
  deleteOrderNoteAction,
  updateOrderNoteAction,
} from "@/app/admin/orders/actions";
import type { AdminOrderNote } from "@/types/order";

type AdminOrderNotesPanelProps = {
  orderNumber: string;
  notes: AdminOrderNote[];
};

function formatNoteCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

export default function AdminOrderNotesPanel({
  orderNumber,
  notes,
}: AdminOrderNotesPanelProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNote = note.trim();

    if (!trimmedNote) {
      setMessage("Write a note before saving.");
      return;
    }

    setMessage("");
    setIsPending(true);

    const result = await addOrderNoteAction(orderNumber, trimmedNote);

    setIsPending(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setNote("");
    setMessage("Note added.");
    router.refresh();
  }

  async function handleUpdateNote(noteId: number) {
    const trimmedNote = editingNote.trim();

    if (!trimmedNote) {
      setMessage("Write a note before saving.");
      return;
    }

    setMessage("");
    setIsPending(true);

    const result = await updateOrderNoteAction(
      orderNumber,
      noteId,
      trimmedNote,
    );

    setIsPending(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setEditingNoteId(null);
    setEditingNote("");
    setMessage("Note updated.");
    router.refresh();
  }

  async function handleDeleteNote(noteId: number) {
    if (!confirm("Delete this internal note?")) {
      return;
    }

    setMessage("");
    setIsPending(true);

    const result = await deleteOrderNoteAction(orderNumber, noteId);

    setIsPending(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Note deleted.");
    router.refresh();
  }

  function startEditingNote(savedNote: AdminOrderNote) {
    setEditingNoteId(savedNote.id);
    setEditingNote(savedNote.note);
    setMessage("");
  }

  function cancelEditingNote() {
    setEditingNoteId(null);
    setEditingNote("");
    setMessage("");
  }

  return (
    <section className="mt-6 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
      <h3 className="text-lg font-medium">Internal notes</h3>
      <p className="mt-1 text-sm text-[#8a7a6d]">
        Notes are only visible to staff in the admin area.
      </p>

      <form onSubmit={handleSubmit} className="mt-5">
        <label htmlFor="order-note" className="text-sm font-medium">
          Add note
        </label>
        <textarea
          id="order-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Example: Customer confirmed via Viber."
          className="mt-2 w-full resize-y rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] px-4 py-3 text-sm outline-none placeholder:text-[#b8aa98] focus:border-[#9c7a4f]"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#8a7a6d]">{note.length}/1000</p>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[#2f241d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a382c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Add note"}
          </button>
        </div>

        {message && <p className="mt-3 text-sm text-[#6f6258]">{message}</p>}
      </form>

      <div className="mt-6 space-y-3">
        {notes.length > 0 ? (
          notes.map((savedNote) => (
            <article
              key={savedNote.id}
              className="rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] p-4"
            >
              {editingNoteId === savedNote.id ? (
                <div>
                  <textarea
                    value={editingNote}
                    onChange={(event) => setEditingNote(event.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="w-full resize-y rounded-xl border border-[#d6c4aa] bg-white px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
                  />

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-[#8a7a6d]">
                      {editingNote.length}/1000
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancelEditingNote}
                        disabled={isPending}
                        className="rounded-xl border border-[#d6c4aa] px-4 py-2 text-sm font-medium text-[#8b5e3c] hover:bg-[#eadfce] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateNote(savedNote.id)}
                        disabled={isPending}
                        className="rounded-xl bg-[#2f241d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a382c] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Save note
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-6 text-[#3f342b]">
                  {savedNote.note}
                </p>
              )}

              <p className="mt-3 text-xs text-[#8a7a6d]">
                {formatNoteCreatedAt(savedNote.createdAt)}
              </p>

              {editingNoteId !== savedNote.id && (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEditingNote(savedNote)}
                    disabled={isPending}
                    className="rounded-xl border border-[#d6c4aa] px-4 py-2 text-sm font-medium text-[#8b5e3c] hover:bg-[#eadfce] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteNote(savedNote.id)}
                    disabled={isPending}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))
        ) : (
          <p className="rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] p-4 text-sm text-[#8a7a6d]">
            No internal notes yet.
          </p>
        )}
      </div>
    </section>
  );
}
