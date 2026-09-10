"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(_prevState: string | null, formData: FormData) {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return "Digite a senha.";
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.ISA_LOGIN_EMAIL!,
    password,
  });

  if (error) {
    return "Senha incorreta. Tenta de novo!";
  }

  redirect("/calendario");
}
