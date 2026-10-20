import {
  FileQuestion,
  Inbox,
  ListChecks,
  NotebookPen,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavTab = { href: string; label: string; icon: LucideIcon };

export const PESSOAL_TABS: NavTab[] = [
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/metas", label: "Metas", icon: Target },
];

export const ESTUDOS_TABS: NavTab[] = [
  { href: "/tarefas-estudos", label: "Tarefas/Estudos", icon: ListChecks },
  { href: "/provas", label: "Provas", icon: FileQuestion },
  { href: "/anotacoes", label: "Anotações", icon: NotebookPen },
  { href: "/em-aberto", label: "Em aberto", icon: Inbox },
];

export const SECTION_TABS = { pessoal: PESSOAL_TABS, estudos: ESTUDOS_TABS };
export type Section = keyof typeof SECTION_TABS;

// Telas que podem ser escolhidas como inicial em Configuracoes.
export const START_PAGES: { href: string; label: string }[] = [
  { href: "/calendario", label: "Home (Calendário)" },
  ...PESSOAL_TABS.map((t) => ({ href: t.href, label: `Pessoal · ${t.label}` })),
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
