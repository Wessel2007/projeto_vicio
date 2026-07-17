import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PURCHASE_TYPE, type CustomerInfo } from 'react-native-purchases';

import { ENTITLEMENT_PRO, REVENUECAT_API_KEY_ANDROID, REVENUECAT_API_KEY_IOS } from '@/config/revenuecat';

export type PlanoId = 'mensal' | 'anual';

// Ponto único de contato com a loja de assinaturas via RevenueCat — quem
// chama comprarPlano/restaurarCompras/sincronizarStatusPro não sabe (nem
// precisa saber) se é App Store ou Play Store por baixo. Os produtoId abaixo
// precisam existir com o mesmo identificador no App Store Connect, no Play
// Console e como "Product" anexado ao entitlement `pro` no dashboard da
// RevenueCat (ver src/config/revenuecat.ts).
export const PLANOS: Record<PlanoId, { precoLabel: string; produtoId: string }> = {
  mensal: { precoLabel: 'R$19,90/mês', produtoId: 'forja_pro_mensal' },
  anual: { precoLabel: 'R$149,90/ano', produtoId: 'forja_pro_anual' },
};

let configurado = false;

function chaveDaPlataforma(): string | null {
  const chave = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  return chave.startsWith('SUBSTITUA_') ? null : chave;
}

// Chamado uma vez no boot do app (ver useAppData). Sem API key preenchida em
// src/config/revenuecat.ts, fica um no-op silencioso — permite continuar
// desenvolvendo/testando (inclusive o toggle de simulação em Perfil) antes
// de ter conta na RevenueCat configurada.
export function configurarCompras() {
  if (configurado) return;
  const apiKey = chaveDaPlataforma();
  if (!apiKey) {
    console.warn('[FORJA] RevenueCat não configurado — defina a API key em src/config/revenuecat.ts');
    return;
  }
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  Purchases.configure({ apiKey });
  configurado = true;
}

function statusProDoCliente(info: CustomerInfo): boolean {
  return typeof info.entitlements.active[ENTITLEMENT_PRO] !== 'undefined';
}

// Consulta o status real da assinatura na loja. Usado no boot do app pra
// refletir cancelamento/expiração que aconteceram fora do app (ex.: usuário
// cancelou pela loja, ou o período grátis acabou) — sem isso, isPro só
// mudaria na próxima compra bem-sucedida. Retorna null quando o RevenueCat
// não está configurado, sinalizando pra quem chamou "não mexa no isPro
// atual".
export async function sincronizarStatusPro(): Promise<{ isPro: boolean } | null> {
  if (!configurado) return null;
  try {
    const info = await Purchases.getCustomerInfo();
    return { isPro: statusProDoCliente(info) };
  } catch (erro) {
    console.error('[FORJA] Falha ao consultar status da assinatura', erro);
    return null;
  }
}

export async function comprarPlano(plano: PlanoId): Promise<{ sucesso: boolean }> {
  if (!configurado) {
    console.warn('[FORJA] Tentativa de compra com RevenueCat não configurado');
    return { sucesso: false };
  }
  try {
    const produtoId = PLANOS[plano].produtoId;
    const [produto] = await Purchases.getProducts([produtoId], PURCHASE_TYPE.SUBS);
    if (!produto) {
      console.error(`[FORJA] Produto ${produtoId} não encontrado (confira se existe na loja e no RevenueCat)`);
      return { sucesso: false };
    }
    const { customerInfo } = await Purchases.purchaseStoreProduct(produto);
    return { sucesso: statusProDoCliente(customerInfo) };
  } catch (erro: any) {
    if (!erro?.userCancelled) {
      console.error('[FORJA] Falha na compra', erro);
    }
    return { sucesso: false };
  }
}

export async function restaurarCompras(): Promise<{ sucesso: boolean }> {
  if (!configurado) return { sucesso: false };
  try {
    const info = await Purchases.restorePurchases();
    return { sucesso: statusProDoCliente(info) };
  } catch (erro) {
    console.error('[FORJA] Falha ao restaurar compras', erro);
    return { sucesso: false };
  }
}
