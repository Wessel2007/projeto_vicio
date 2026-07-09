import type { ImageSourcePropType } from 'react-native';

// Sublevel badge art, generated from the composite reference sheets in /patentes.
// Imortal has no sublevel (see NIVEIS in gamification.ts) — it always uses the
// "III" artwork, the most ornate version, as the single representation of the tier.
export const PATENTE_BADGES: Record<string, ImageSourcePropType> = {
  'Recruta-1': require('@/assets/images/patentes/recruta-1.png'),
  'Recruta-2': require('@/assets/images/patentes/recruta-2.png'),
  'Recruta-3': require('@/assets/images/patentes/recruta-3.png'),
  'Aprendiz-1': require('@/assets/images/patentes/aprendiz-1.png'),
  'Aprendiz-2': require('@/assets/images/patentes/aprendiz-2.png'),
  'Aprendiz-3': require('@/assets/images/patentes/aprendiz-3.png'),
  'Guerreiro-1': require('@/assets/images/patentes/guerreiro-1.png'),
  'Guerreiro-2': require('@/assets/images/patentes/guerreiro-2.png'),
  'Guerreiro-3': require('@/assets/images/patentes/guerreiro-3.png'),
  'Guardião-1': require('@/assets/images/patentes/guardiao-1.png'),
  'Guardião-2': require('@/assets/images/patentes/guardiao-2.png'),
  'Guardião-3': require('@/assets/images/patentes/guardiao-3.png'),
  'Espartano-1': require('@/assets/images/patentes/espartano-1.png'),
  'Espartano-2': require('@/assets/images/patentes/espartano-2.png'),
  'Espartano-3': require('@/assets/images/patentes/espartano-3.png'),
  'Monge-1': require('@/assets/images/patentes/monge-1.png'),
  'Monge-2': require('@/assets/images/patentes/monge-2.png'),
  'Monge-3': require('@/assets/images/patentes/monge-3.png'),
  'Mestre-1': require('@/assets/images/patentes/mestre-1.png'),
  'Mestre-2': require('@/assets/images/patentes/mestre-2.png'),
  'Mestre-3': require('@/assets/images/patentes/mestre-3.png'),
  'Lenda-1': require('@/assets/images/patentes/lenda-1.png'),
  'Lenda-2': require('@/assets/images/patentes/lenda-2.png'),
  'Lenda-3': require('@/assets/images/patentes/lenda-3.png'),
  'Imortal-null': require('@/assets/images/patentes/imortal-3.png'),
};

export function getPatenteBadge(nome: string, sublevel: 1 | 2 | 3 | null): ImageSourcePropType {
  return PATENTE_BADGES[`${nome}-${sublevel}`];
}
