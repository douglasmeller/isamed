const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

// Aceita "1.234,56", "1234,5", "12.50", "R$ 30" -- o jeito que a gente
// digita no Brasil, e tambem com ponto decimal. Retorna null se invalido.
export function parseMoneyToCents(input: string): number | null {
  const cleaned = input.replace(/[R$\s]/g, "");
  if (!cleaned) return null;

  let normalized: string;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    // "1.234" sem virgula = milhar, nao decimal.
    normalized = cleaned.replace(/\./g, "");
  } else {
    normalized = cleaned;
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return cents > 0 ? cents : null;
}

// Valor pra preencher o campo ao editar (ex: 123456 -> "1234,56").
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
