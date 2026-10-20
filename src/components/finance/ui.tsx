"use client";

import { cn } from "@/lib/cn";

// Pecas visuais compartilhadas do Financeiro, no mesmo estilo do resto do app.

export const inputClass =
  "min-w-0 rounded-2xl border border-pink-200/80 bg-white px-4 py-3 text-ink shadow-soft outline-none transition-all placeholder:text-ink-soft focus:border-pink-300 focus:shadow-lift";

export const primaryButtonClass =
  "rounded-2xl bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-all hover:-translate-y-px hover:bg-pink-600 hover:shadow-float active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-soft";

export const secondaryButtonClass =
  "rounded-2xl px-4 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-pink-100 hover:text-ink";

export const actionButtonClass =
  "shrink-0 rounded-xl p-1.5 text-ink-soft shadow-soft transition-all hover:-translate-y-px hover:bg-pink-100 hover:text-pink-600 hover:shadow-lift active:translate-y-0";

// So esconde os botoes ate o hover em aparelho com mouse (iPad/celular sempre veem).
export const hoverRevealClass =
  "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-visible:opacity-100";

export function SectionCard({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-pink-100/80 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function PillOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
        selected
          ? "border-pink-300 bg-pink-200 text-pink-700 shadow-soft"
          : "border-pink-100 bg-white text-ink-soft hover:border-pink-200 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{children}</span>;
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border-2 border-dashed border-pink-200 px-4 py-5 text-center text-sm text-ink-soft">
      {children}
    </p>
  );
}

export function Tag({ children, tone = "pink" }: { children: React.ReactNode; tone?: "pink" | "neutral" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium",
        tone === "pink" ? "bg-pink-50 text-pink-600" : "border border-pink-100 text-ink-soft",
      )}
    >
      {children}
    </span>
  );
}
