import type { PatenteTheme } from '@/types';

// Personalização visual do badge de patente (feature PRO). Troca apenas a
// cor do glow/aura ao redor do badge atual — não substitui as cores de
// identidade de cada tier em TIER_THEME (conquistas.tsx), que continuam
// marcando a progressão Recruta → Imortal.
export const PATENTE_THEMES: Record<PatenteTheme, { nome: string; cor: string }> = {
  ouro: { nome: 'Ouro', cor: '#F2C572' },
  prata: { nome: 'Prata', cor: '#B9C4D0' },
  carmesim: { nome: 'Carmesim', cor: '#E0447A' },
};
