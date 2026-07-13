/**
 * Paleta dark-only do app — direção visual "Aço & Brasa" (Steel & Ember).
 * Fundo carvão único em todas as telas; fogo/brasa APENAS como acento de
 * progresso e ação; bronze para patente/PRO; carmesim RESERVADO ao SOS.
 * Referência: design_handoff_forja/README.md + Redesign Forja.dc.html (2a/1a–1i).
 */

import '@/global.css';

export const Colors = {
  // Fundo carvão quente de TODAS as telas. Fluxos de crise/celebração usam
  // um passo mais escuro (ver Accent.bgCrise / Accent.bgCelebracao).
  background: '#0D0B09',
  // Única superfície de card do app ("chapa").
  backgroundElement: '#171310',
  backgroundSelected: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.07)',
  // Texto primário: branco quente, nunca #FFF puro em texto corrido.
  text: '#F4EFE9',
  // Hierarquia de texto secundário (rgba do texto primário).
  textSecondary: 'rgba(244,239,233,0.55)',
  textTertiary: 'rgba(244,239,233,0.40)',
} as const;

export type ThemeColor = keyof typeof Colors;

// Fontes estáticas (uma família por peso) carregadas via @expo-google-fonts
// no _layout raiz. Como não são fontes variáveis, a seleção de peso é feita
// trocando `fontFamily`, não `fontWeight`.
export const Fonts = {
  // Archivo — manchetes cerimoniais, marca FORJA, eyebrows, títulos atléticos.
  display: {
    medium: 'Archivo_500Medium',
    semibold: 'Archivo_600SemiBold',
    bold: 'Archivo_700Bold',
    extrabold: 'Archivo_800ExtraBold',
    black: 'Archivo_900Black',
  },
  // Space Grotesk — números grandes, labels de card (UPPERCASE), dados.
  data: {
    medium: 'SpaceGrotesk_500Medium',
    semibold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
  },
  // Manrope — corpo, botões de texto, listas.
  body: {
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
    extrabold: 'Manrope_800ExtraBold',
  },
  mono: 'ui-monospace',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// Raios de canto padronizados (README > Raios e espaçamento).
export const Radius = {
  card: 16,
  cardHighlight: 18,
  button: 16,
  pill: 99,
  badge: 7,
} as const;

export const BottomTabInset = 24;
export const MaxContentWidth = 800;

// Cores semânticas de "Aço & Brasa". O fogo vive sobre o carvão; o texto
// sobre gradiente de brasa é sempre claro.
export const Accent = {
  // Brasa (primária) — progresso, tab ativa, acentos.
  brasa: '#FF6B2B',
  brasaTab: '#FF7A36',
  brasaClara: '#FFC46B', // ponta de progresso, highlights
  brasaEscura: '#C9330B', // fim de gradientes
  brasaEscura2: '#D8380E',

  // Gradiente de têmpera do metal (barra/anel de progresso).
  temperaStart: '#FFC46B',
  temperaMid: '#FF6B2B',
  temperaEnd: '#C9330B',
  temperaLocations: [0, 0.55, 1] as [number, number, number],

  // CTA primário: linear-gradient(135deg,#FFB05C,#FF6B2B 55%,#D8380E)
  ctaStart: '#FFB05C',
  ctaMid: '#FF6B2B',
  ctaEnd: '#D8380E',
  ctaLocations: [0, 0.55, 1] as [number, number, number],

  // Orbe de respiração (radial-gradient no protótipo, aproximado com linear).
  orbStart: '#FF9D4D',
  orbMid: '#FF5A1E',
  orbEnd: '#A82708',

  // Bronze/dourado — patente, marca FORJA, tudo PRO.
  bronze: '#E8B458',
  bronzeMuted: 'rgba(232,180,88,0.7)',
  bronzeBorda: 'rgba(232,180,88,0.28)',
  bronzeFundo: 'rgba(232,180,88,0.06)',

  // Carmesim — RESERVADO ao SOS/pânico. Nunca usar em outro contexto.
  carmesim: '#E5484D',
  carmesimTexto: '#F2A9AC',
  carmesimBorda: 'rgba(229,72,77,0.45)',
  carmesimFundo: 'rgba(229,72,77,0.10)',

  // Verde — "Resisti" / taxa de resistência.
  verde: '#58C286',
  verdeFundo: 'rgba(88,194,134,0.14)',

  // Vermelho suave — "Recaída" / ações destrutivas.
  vermelhoSuave: '#F07B72',
  vermelhoSuaveFundo: 'rgba(240,123,114,0.13)',

  // Tab inativa.
  tabInativa: '#6F6558',

  // Fundos um passo mais escuros para fluxos especiais.
  bgCrise: '#0A0807',
  bgCelebracao: '#0B0908',

  // --- Aliases de compatibilidade com código legado ainda não migrado ---
  gold: '#E8B458',
  goldMuted: 'rgba(232,180,88,0.7)',
  orange: '#FF7A36',
  orangeLight: '#FFB37D',
  danger: '#E5484D',
  dangerDark: '#A82708',
  success: '#58C286',
  successBg: 'rgba(88,194,134,0.14)',
  dangerText: '#F07B72',
  dangerBg: 'rgba(240,123,114,0.13)',
  fireStart: '#FF9D4D',
  fireMid: '#FF5A1E',
  fireEnd: '#A82708',
  fireLocations: [0, 0.55, 1] as [number, number, number],
} as const;
