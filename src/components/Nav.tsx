"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, GraduationCap, ListChecks, NotebookPen } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", label: "Tarefas/Estudos", icon: ListChecks },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/provas", label: "Provas", icon: GraduationCap },
  { href: "/anotacoes", label: "Anotações", icon: NotebookPen },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center border-t border-pink-200/50 bg-white/90 px-2 pb-[env(safe-area-inset-bottom)] shadow-bar backdrop-blur md:hidden">
        <div className="flex w-full max-w-md items-stretch justify-around py-2">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex flex-1 flex-col items-center gap-1 rounded-2xl px-0.5 py-1.5 transition-colors",
                  active ? "text-pink-600" : "text-ink-soft hover:text-pink-500",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                    active ? "bg-pink-100 shadow-lift" : "group-hover:shadow-soft",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={2.25} />
                </span>
                <span className="text-center text-[10px] font-medium leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: left rail */}
      <nav className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col gap-1 border-r border-pink-200/50 bg-white/80 p-4 pt-8 shadow-panel backdrop-blur md:flex">
        {/* self-start impede que o flex-col da sidebar estique a largura da imagem */}
        <Image
          src="/IsaMed_SomenteTexto.png"
          alt="IsaMed"
          width={240}
          height={90}
          priority
          className="mb-6 ml-2 h-8 w-auto self-start"
        />
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all duration-200",
                active
                  ? "bg-pink-200 text-pink-700 shadow-lift"
                  : "text-ink-soft hover:-translate-y-px hover:bg-pink-100 hover:text-pink-600 hover:shadow-soft",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2.25} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
