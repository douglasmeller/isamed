"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";

// Popup generico de confirmacao antes de uma exclusao -- pensado pra
// tarefas/provas/anotacoes, mas nao amarrado a nenhum tipo especifico.
export function ConfirmDialog({
  open,
  itemLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  itemLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-pink-100 bg-white p-5 shadow-float"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-100 text-pink-600">
          <Trash2 className="h-5 w-5" />
        </div>

        <p className="mt-3 text-base font-semibold text-ink">Excluir item?</p>
        <p className="mt-1 text-sm text-ink-soft">
          Tem certeza de que quer excluir &quot;{itemLabel}&quot;?
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-pink-100 hover:text-ink"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition-all hover:-translate-y-px hover:bg-pink-700 hover:shadow-lift active:translate-y-0"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
