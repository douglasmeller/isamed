"use client";

import { useEffect } from "react";

// Rola ate o item indicado por ?focus= e da um destaque rapido -- usado
// quando se chega numa tela pelo link de um item vinculado.
export function FocusHighlight({ focus }: { focus?: string }) {
  useEffect(() => {
    if (!focus) return;
    const el = document.getElementById(`item-${focus}`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-pink-400");
    const timeout = setTimeout(() => el.classList.remove("ring-2", "ring-pink-400"), 1800);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
