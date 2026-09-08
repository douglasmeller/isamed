"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createEntry } from "@/app/actions/entries";
import { toISODate } from "@/lib/dates";
import type { EntryKind } from "@/lib/types";

export function AddEntryForm({ kind, placeholder }: { kind: EntryKind; placeholder: string }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !date) return;

    startTransition(() => {
      createEntry(kind, { title: trimmed, date });
    });

    setTitle("");
    titleRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 basis-full rounded-2xl border border-pink-200/80 bg-white px-4 py-3 text-ink shadow-soft outline-none transition-all placeholder:text-ink-soft focus:border-pink-300 focus:shadow-lift sm:basis-0"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        aria-label="Data"
        className="w-[9.5rem] shrink-0 rounded-2xl border border-pink-200/80 bg-white px-2 py-3 text-center text-sm text-ink shadow-soft outline-none transition-all focus:border-pink-300 focus:shadow-lift"
      />
      <button
        type="submit"
        disabled={!title.trim() || !date}
        aria-label="Adicionar"
        className="flex h-[3.1rem] w-[3.1rem] shrink-0 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-lift transition-all hover:-translate-y-px hover:bg-pink-600 hover:shadow-float active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-soft"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </form>
  );
}
