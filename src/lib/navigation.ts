export type NavTab = { href: string; label: string };

export const ESTUDOS_TABS: NavTab[] = [
  { href: "/tarefas-estudos", label: "Tarefas/Estudos" },
  { href: "/provas", label: "Provas" },
  { href: "/anotacoes", label: "Anotações" },
  { href: "/em-aberto", label: "Em aberto" },
];

// Telas que podem ser escolhidas como inicial em Configuracoes.
export const START_PAGES: NavTab[] = [
  { href: "/calendario", label: "Home (Calendário)" },
  ...ESTUDOS_TABS.map((t) => ({ href: t.href, label: `Estudos · ${t.label}` })),
];

export const DEFAULT_START_PAGE = "/calendario";

// Guardado no proprio aparelho (cada iPhone/iPad/PC tem a sua escolha).
const START_PAGE_KEY = "isamed:start-page";

export function readStartPage(): string {
  try {
    const saved = localStorage.getItem(START_PAGE_KEY);
    if (saved && START_PAGES.some((p) => p.href === saved)) return saved;
  } catch {
    // localStorage indisponivel (ex: navegacao privada) -- usa o padrao.
  }
  return DEFAULT_START_PAGE;
}

export function saveStartPage(href: string) {
  try {
    localStorage.setItem(START_PAGE_KEY, href);
  } catch {
    // Sem armazenamento, a escolha so nao persiste.
  }
}
