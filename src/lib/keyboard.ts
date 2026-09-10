import type { KeyboardEvent } from "react";

// Enter sozinho envia o formulario; Ctrl+Enter (Windows/Linux) ou Cmd+Enter
// (Mac) quebra a linha, deixando o comportamento padrao da textarea agir.
export function isSubmitEnter(e: KeyboardEvent): boolean {
  return (
    e.key === "Enter" &&
    !e.shiftKey &&
    !e.ctrlKey &&
    !e.metaKey &&
    !e.nativeEvent.isComposing
  );
}
