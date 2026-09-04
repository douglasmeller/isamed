"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createTask } from "@/app/actions/tasks";

export function AddTaskForm({ date }: { date: string }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    startTransition(() => {
      createTask({ title: trimmed, date, time: time || null });
    });

    setTitle("");
    setTime("");
    titleRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nova tarefa..."
        className="min-w-0 flex-1 rounded-2xl border-2 border-pink-200 bg-white px-4 py-3 text-ink outline-none transition-colors placeholder:text-ink-soft focus:border-pink-400"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        aria-label="Horário (opcional)"
        className="w-[6.5rem] shrink-0 rounded-2xl border-2 border-pink-200 bg-white px-2 py-3 text-center text-sm text-ink outline-none transition-colors focus:border-pink-400"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        aria-label="Adicionar tarefa"
        className="flex h-[3.1rem] w-[3.1rem] shrink-0 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-md shadow-pink-300/50 transition-all hover:bg-pink-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </form>
  );
}
