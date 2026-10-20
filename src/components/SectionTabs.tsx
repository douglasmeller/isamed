"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { SECTION_TABS, type Section } from "@/lib/navigation";

// Recebe so o nome da secao (e nao as abas) porque os icones sao
// componentes e nao podem vir de um Server Component como prop.
export function SectionTabs({ section }: { section: Section }) {
  const tabs = SECTION_TABS[section];
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Se no celular as abas nao couberem, rolam de lado; mantem a atual visivel.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <nav className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
      <div className="flex min-w-full gap-1.5 rounded-2xl border border-pink-100/80 bg-white p-1.5 shadow-soft">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              ref={active ? activeRef : undefined}
              href={tab.href}
              aria-label={tab.label}
              title={tab.label}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 font-semibold transition-all duration-200 md:py-3 md:text-base",
                active
                  ? "bg-pink-200 text-pink-700 shadow-soft"
                  : "text-ink-soft hover:bg-pink-100 hover:text-pink-600",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2.25} />
              {/* No celular so o icone; o nome aparece a partir do iPad/PC. */}
              <span className="hidden whitespace-nowrap md:inline">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
