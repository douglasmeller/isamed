import Image from "next/image";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions/auth";

export function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-5 sm:px-8 md:justify-end">
      <div className="flex items-center gap-2.5 md:hidden">
        <Image
          src="/IsaMed_SomenteSimbolos.png"
          alt="IsaMed"
          width={1254}
          height={1254}
          priority
          className="h-9 w-9 rounded-xl"
        />
        <span className="text-lg font-semibold text-ink">IsaMed</span>
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-pink-100 hover:text-pink-600"
          aria-label="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </form>
    </header>
  );
}
