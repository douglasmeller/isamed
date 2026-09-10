import { useEffect, useRef } from "react";

// Deixa a textarea crescer junto com o texto, em vez de mostrar barra de
// rolagem interna -- importante agora que o titulo aceita quebra de linha.
export function useAutoGrowTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Adia pro proximo frame: quando varios campos desses montam juntos
    // (uma lista inteira de tarefas, por exemplo), medir scrollHeight antes
    // do navegador terminar o layout da pagina da um valor errado.
    const raf = requestAnimationFrame(() => {
      el.style.height = "auto";
      if (!value) return; // vazio fica na altura natural (rows=1)
      el.style.height = `${el.scrollHeight}px`;
    });

    return () => cancelAnimationFrame(raf);
  }, [value]);

  return ref;
}
