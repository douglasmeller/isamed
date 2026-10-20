"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readStartPage } from "@/lib/navigation";

// A tela inicial e escolhida por aparelho (salva no navegador), entao o
// redirecionamento tem que acontecer aqui no cliente.
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(readStartPage());
  }, [router]);

  return null;
}
