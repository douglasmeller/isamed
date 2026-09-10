"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(signIn, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex flex-1 items-center justify-center overflow-y-auto bg-gradient-to-b from-pink-100 via-cloud to-white px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-pink-100/60 bg-white p-8 shadow-float sm:p-10">
        <Image
          src="/IsaMed_SimboloTexto.webp"
          alt="IsaMed"
          width={256}
          height={256}
          priority
          className="mx-auto mb-6 h-32 w-32"
        />

        <h1 className="text-center text-2xl font-semibold text-ink">Bem-vinda Isa!</h1>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoFocus
              autoComplete="current-password"
              inputMode="numeric"
              placeholder="Senha"
              className="w-full rounded-2xl border border-pink-200/80 bg-cloud px-5 py-3.5 pr-12 text-center text-lg tracking-widest text-ink shadow-soft outline-none transition-all placeholder:tracking-normal placeholder:text-ink-soft focus:border-pink-300 focus:shadow-lift"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-ink-soft transition-colors hover:text-pink-600 active:scale-90"
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {error && (
            <p className="text-center text-sm font-medium text-pink-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-2xl bg-pink-500 py-3.5 text-lg font-semibold text-white shadow-lift transition-all hover:-translate-y-px hover:bg-pink-600 hover:shadow-float active:translate-y-0 active:scale-[0.98] disabled:opacity-60"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
