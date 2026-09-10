"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { createTask } from "@/app/actions/tasks";
import { isSubmitEnter } from "@/lib/keyboard";
import { useAutoGrowTextarea } from "@/lib/useAutoGrow";

export function AddTaskForm({ date }: { date: string }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [, startTransition] = useTransition();
  const titleRef = useAutoGrowTextarea(title);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
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
      <textarea
        ref={titleRef}
        rows={1}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (isSubmitEnter(e)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Nova tarefa..."
        className="min-w-0 flex-1 resize-none overflow-hidden rounded-2xl border border-pink-200/80 bg-white px-4 py-3 text-ink shadow-soft outline-none transition-all placeholder:text-ink-soft focus:border-pink-300 focus:shadow-lift"
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        aria-label="Horário (opcional)"
        className="w-[6.5rem] shrink-0 rounded-2xl border border-pink-200/80 bg-white px-2 py-3 text-center text-sm text-ink shadow-soft outline-none transition-all focus:border-pink-300 focus:shadow-lift"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        aria-label="Adicionar tarefa"
        className="flex h-[3.1rem] w-[3.1rem] shrink-0 items-center justify-center rounded-2xl bg-pink-500 text-white shadow-lift transition-all hover:-translate-y-px hover:bg-pink-600 hover:shadow-float active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-soft"
      >
        <Plus className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </form>
  );
}
