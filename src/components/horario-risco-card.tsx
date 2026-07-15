import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Accent, Colors, Fonts, Radius } from '@/constants/theme';
import { TriggerEntry } from '@/types';
import { calcRiscoHorario } from '@/utils/insights';

export function HorarioRiscoCard({
  entries,
  carregando,
}: {
  entries: TriggerEntry[];
  carregando?: boolean;
}) {
  const { t } = useTranslation('home');

  if (carregando) {
    return (
      <View style={styles.card}>
        <View style={styles.skeletonLabel} />
        <View style={styles.skeletonTexto} />
      </View>
    );
  }

  const risco = calcRiscoHorario(entries);

  if (!risco) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardLabel}>{t('riscoCard.label')}</Text>
        <Text style={styles.textoVazio}>{t('riscoCard.empty')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{t('riscoCard.label')}</Text>
      <Text style={styles.texto}>
        {t('riscoCard.prefix')}{' '}
        <Text style={styles.textoDestaque}>
          {t('riscoCard.range', { inicio: risco.inicioHora, fim: risco.fimHora })}
        </Text>
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
  textoVazio: {
    fontFamily: Fonts.body.medium,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(244,239,233,0.5)',
  },
  skeletonLabel: {
    width: 110,
    height: 10,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  skeletonTexto: {
    width: '75%',
    height: 14,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
});
