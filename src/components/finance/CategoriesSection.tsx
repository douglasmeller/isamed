"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  actionButtonClass,
  EmptyNote,
  FieldLabel,
  hoverRevealClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  SectionCard,
} from "@/components/finance/ui";
import { createCategory, deleteCategory, updateCategory } from "@/app/actions/finance";
import { cn } from "@/lib/cn";
import type { FinanceCategory } from "@/lib/finance";
import { centsToInput, formatCents, parseMoneyToCents } from "@/lib/money";

function CategoryForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: FinanceCategory;
  submitLabel: string;
  onSubmit: (input: { name: string; limitCents: number | null }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [limit, setLimit] = useState(
    initial?.monthly_limit_cents ? centsToInput(initial.monthly_limit_cents) : "",
  );

  const limitCents = limit.trim() ? parseMoneyToCents(limit) : null;
  const limitOk = !limit.trim() || limitCents !== null;
  const canSubmit = name.trim().length > 0 && limitOk;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({ name: name.trim(), limitCents });
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-1 basis-48 flex-col gap-1.5">
          <FieldLabel>Nome</FieldLabel>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Lazer, Delivery..."
            aria-label="Nome da categoria"
            autoFocus
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <FieldLabel>Limite no mês (opcional)</FieldLabel>
          <input
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            inputMode="decimal"
            placeholder="0,00"
            aria-label="Limite no mês"
            className={`${inputClass} w-40`}
          />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Cancelar
        </button>
        <button type="submit" disabled={!canSubmit} className={primaryButtonClass}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function CategoriesSection({
  categories,
  spentByCategory,
}: {
  categories: FinanceCategory[];
  spentByCategory: Record<string, number>;
}) {
  const [adding, setAdding] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <SectionCard title="Categorias e limites">
      {categories.length === 0 && !adding && (
        <EmptyNote>Crie categorias pra organizar os gastos e definir limites.</EmptyNote>
      )}

      {categories.length > 0 && (
        <div className="flex flex-col gap-2">
          {categories.map((c) => (
            <CategoryRow key={c.id} category={c} spentCents={spentByCategory[c.id] ?? 0} />
          ))}
        </div>
      )}

      {adding ? (
        <div className="rounded-2xl border border-pink-100 p-3 sm:p-4">
          <CategoryForm
            submitLabel="Criar categoria"
            onSubmit={(input) => {
              setAdding(false);
              startTransition(() => {
                createCategory(input);
              });
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={cn(secondaryButtonClass, "flex items-center gap-1.5 self-start border border-pink-200/80")}
        >
          <Plus className="h-4 w-4" />
          Nova categoria
        </button>
      )}
    </SectionCard>
  );
}

function CategoryRow({ category, spentCents }: { category: FinanceCategory; spentCents: number }) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [, startTransition] = useTransition();

  if (removed) return null;

  if (editing) {
    return (
      <div className="rounded-2xl border border-pink-200 p-3 sm:p-4">
        <CategoryForm
          initial={category}
          submitLabel="Salvar"
          onSubmit={(input) => {
            setEditing(false);
            startTransition(() => {
              updateCategory(category.id, input);
            });
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  const limit = category.monthly_limit_cents;
  const over = limit !== null && spentCents > limit;
  const ratio = limit ? Math.min(spentCents / limit, 1) : 0;

  return (
    <div className="group flex flex-col gap-2 rounded-2xl border border-pink-100/80 bg-white px-3 py-3 shadow-soft transition-all duration-200 hover:-translate-y-px hover:border-pink-200 hover:shadow-lift sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="Editar categoria"
          className="min-w-0 flex-1 break-words text-left font-medium text-ink"
        >
          {category.name}
        </button>
        <span className={cn("shrink-0 text-sm font-semibold", over ? "text-red-500" : "text-ink-soft")}>
          {formatCents(spentCents)}
          {limit !== null && <span className="font-medium"> / {formatCents(limit)}</span>}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Editar categoria"
          title="Editar categoria"
          className={cn(actionButtonClass, hoverRevealClass)}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          aria-label="Excluir categoria"
          title="Excluir categoria"
          className={cn(actionButtonClass, hoverRevealClass)}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {limit !== null && (
        <>
          <div className="h-2 overflow-hidden rounded-full bg-pink-50">
            <div
              className={cn("h-full rounded-full transition-all", over ? "bg-red-400" : "bg-pink-400")}
              style={{ width: `${ratio * 100}%` }}
            />
          </div>
          <span className={cn("text-xs font-medium", over ? "text-red-500" : "text-ink-soft")}>
            {over
              ? `Passou ${formatCents(spentCents - limit)} do limite`
              : `Restam ${formatCents(limit - spentCents)}`}
          </span>
        </>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        itemLabel={category.name}
        detail="Os gastos dessa categoria continuam, só passam a ficar como “Sem categoria”."
        onConfirm={() => {
          setConfirmingDelete(false);
          setRemoved(true);
          startTransition(() => {
            deleteCategory(category.id);
          });
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
