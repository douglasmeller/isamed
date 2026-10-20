"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import type { NavTab } from "@/lib/navigation";

export function SectionTabs({ tabs }: { tabs: NavTab[] }) {
  const pathname = usePathname();
  const activeRef = useRef<HTMLAnchorElement>(null);

  // No celular as abas rolam de lado; garante que a aba atual fique visivel.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <nav className="no-scrollbar -mx-5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
      <div className="flex w-max gap-1.5 rounded-2xl border border-pink-100/80 bg-white p-1.5 shadow-soft">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              ref={active ? activeRef : undefined}
              href={tab.href}
              className={cn(
                "whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-pink-200 text-pink-700 shadow-soft"
                  : "text-ink-soft hover:bg-pink-100 hover:text-pink-600",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
