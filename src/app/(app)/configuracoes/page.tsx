"use client";

import { useSyncExternalStore, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { DEFAULT_START_PAGE, readStartPage, saveStartPage, START_PAGES } from "@/lib/navigation";

const noopSubscribe = () => () => {};

export default function ConfiguracoesPage() {
  // Le o valor salvo so no navegador (no servidor nao existe localStorage).
  const savedStartPage = useSyncExternalStore(noopSubscribe, readStartPage, () => DEFAULT_START_PAGE);
  const [picked, setPicked] = useState<string | null>(null);
  const startPage = picked ?? savedStartPage;

  const choose = (href: string) => {
    saveStartPage(href);
    setPicked(href);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 pt-2">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Configurações</h1>
        <p className="text-sm text-ink-soft">Ajustes do IsaMed.</p>
      </header>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Tela inicial neste aparelho</h2>
          <p className="text-sm text-ink-soft">
            Qual tela abre quando você entra no IsaMed por aqui. Cada aparelho guarda a sua.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {START_PAGES.map((page) => {
            const active = page.href === startPage;
            return (
              <button
                key={page.href}
                type="button"
                onClick={() => choose(page.href)}
                aria-pressed={active}
                className={cn(
                  "flex items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left font-medium shadow-soft transition-all duration-200 hover:-translate-y-px hover:shadow-lift active:translate-y-0",
                  active ? "border-pink-300 text-pink-700" : "border-pink-100/80 text-ink",
                )}
              >
                {page.label}
                {active && <Check className="h-5 w-5 text-pink-500" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
