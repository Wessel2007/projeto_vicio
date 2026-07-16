import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Accent, Colors, Fonts, Radius } from '@/constants/theme';
import type { MarcoEsperado } from '@/types/perfil';

export function MarcoProximoCard({ marco, diasRestantes }: { marco: MarcoEsperado; diasRestantes: number }) {
  const { t } = useTranslation('home');
  const marcoLabel = t(`onboarding:marco.${marco}`);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{t('milestoneCard.label')}</Text>
      <Text style={styles.texto}>
        {diasRestantes === 1
          ? t('milestoneCard.daysLeftSingular')
          : t('milestoneCard.daysLeftPlural', { dias: diasRestantes })}{' '}
        <Text style={styles.textoDestaque}>{marcoLabel}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: Radius.card,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    gap: 8,
  },
  cardLabel: {
    fontFamily: Fonts.data.semibold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(232,180,88,0.7)',
  },
  texto: {
    fontFamily: Fonts.body.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(244,239,233,0.75)',
  },
  textoDestaque: {
    color: Accent.brasaClara,
    fontFamily: Fonts.body.bold,
  },
});
