"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ListChecks } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", label: "Hoje", icon: ListChecks },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center border-t border-pink-200/70 bg-white/90 px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="flex w-full max-w-sm items-stretch justify-around py-2">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors",
                  active ? "text-pink-600" : "text-ink-soft hover:text-pink-500",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    active && "bg-pink-100",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.25} />
                </span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: left rail */}
      <nav className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col gap-1 border-r border-pink-200/70 bg-white/80 p-4 pt-8 backdrop-blur md:flex">
        <Image
          src="/IsaMed_SomenteTexto.png"
          alt="IsaMed"
          width={2053}
          height={766}
          priority
          className="mb-6 h-8 w-auto px-2"
        />
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-colors",
                active ? "bg-pink-200 text-pink-700" : "text-ink-soft hover:bg-pink-100 hover:text-pink-600",
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
