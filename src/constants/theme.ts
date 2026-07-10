/**
 * Paleta dark-only do app — "Jornada do Guerreiro", direção 1a (Fogo).
 * Extraída de design/redesign/Redesign.dc.html. O app não segue mais o tema
 * do sistema: é sempre escuro, como no mockup.
 */

import '@/global.css';

export const Colors = {
  background: '#0B0A0D',
  backgroundElement: 'rgba(255,255,255,0.045)',
  backgroundSelected: 'rgba(255,255,255,0.09)',
  border: 'rgba(255,255,255,0.08)',
  text: '#F2F2F5',
  textSecondary: '#9A9AA4',
  textTertiary: '#6A6A74',
} as const;

export type ThemeColor = keyof typeof Colors;

// Fontes estáticas (uma família por peso) carregadas via @expo-google-fonts
// no _layout raiz. Como não são fontes variáveis, a seleção de peso é feita
// trocando `fontFamily`, não `fontWeight`.
export const Fonts = {
  display: {
    semibold: 'SpaceGrotesk_600SemiBold',
    bold: 'SpaceGrotesk_700Bold',
  },
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

export const BottomTabInset = 24;
export const MaxContentWidth = 800;

// Cores semânticas de gamificação (streak, patente, ações). Vivem em cima de
// superfícies em gradiente onde o texto é sempre claro.
export const Accent = {
  // Streak — gradiente de fogo de 3 stops (linear-gradient(160deg,#FF9D4D 0%,#FF5722 52%,#C1300F 100%))
  fireStart: '#FF9D4D',
  fireMid: '#FF5722',
  fireEnd: '#C1300F',
  fireLocations: [0, 0.52, 1] as [number, number, number],

  // Patente — violeta nobre (linear-gradient(160deg,#241B4A 0%,#4B2E86 100%))
  rankStart: '#241B4A',
  rankEnd: '#4B2E86',

  gold: '#F2C572',
  goldMuted: 'rgba(242, 197, 114, 0.7)',

  // Botão de pânico
  danger: '#F0392B',
  dangerDark: '#B01810',

  // Eyebrows de seção
  violet: '#9A6BFF',
  teal: '#2BB6A8',

  // Laranja de destaque (links, chip selecionado, tab ativa)
  orange: '#FF7A3D',
  orangeLight: '#FFB37D',

  // Badges do diário (resisti / recaída)
  success: '#4ADE80',
  successBg: 'rgba(46,190,110,0.16)',
  dangerText: '#F87171',
  dangerBg: 'rgba(217,48,37,0.16)',
} as const;
