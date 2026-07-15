export type PlanoId = 'mensal' | 'anual';

// Ponto único de contato com a "loja" de assinaturas. Hoje é mock (sem
// cobrança real — ver CHECKLIST.md, seção Monetização); a integração real
// (RevenueCat ou StoreKit/Play Billing nativos) troca só o corpo de
// `comprarPlano`/`restaurarCompras`, sem tocar em src/app/pro.tsx.
export const PLANOS: Record<PlanoId, { precoLabel: string; produtoId: string }> = {
  mensal: { precoLabel: 'R$19,90/mês', produtoId: 'forja_pro_mensal' },
  anual: { precoLabel: 'R$149,90/ano', produtoId: 'forja_pro_anual' },
};

export async function comprarPlano(plano: PlanoId): Promise<{ sucesso: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { sucesso: true };
}

export async function restaurarCompras(): Promise<{ sucesso: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { sucesso: false };
}
