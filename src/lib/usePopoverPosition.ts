"use client";

import { useLayoutEffect, type RefObject } from "react";

const GAP = 8;
const MARGIN = 8;

// Posiciona um popup "fixed" junto do botao que o abriu, sem deixar ele sair
// da tela: se nao couber embaixo, abre pra cima; nas laterais, encosta na
// borda em vez de vazar. Mexe direto no style (antes da pintura) e
// reposiciona quando o conteudo muda de tamanho (ex: trocar de mes).
export function usePopoverPosition(
  popoverRef: RefObject<HTMLElement | null>,
  anchor: DOMRect | null,
  align: "left" | "right",
) {
  useLayoutEffect(() => {
    const el = popoverRef.current;
    if (!el || !anchor) return;

    const place = () => {
      const { width, height } = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let top = anchor.bottom + GAP;
      if (top + height > vh - MARGIN) {
        const above = anchor.top - GAP - height;
        top = above >= MARGIN ? above : Math.max(MARGIN, vh - height - MARGIN);
      }

      const preferredLeft = align === "right" ? anchor.right - width : anchor.left;
      const left = Math.min(Math.max(MARGIN, preferredLeft), vw - width - MARGIN);

      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(el);
    return () => observer.disconnect();
  }, [popoverRef, anchor, align]);
}
