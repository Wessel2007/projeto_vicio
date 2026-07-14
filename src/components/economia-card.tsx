import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Accent, Colors, Fonts, Radius } from '@/constants/theme';
import { useCountUp } from '@/hooks/useCountUp';
import { formatarMoeda, formatarTempoEconomizado } from '@/utils/economia';

export function EconomiaCard({
  dinheiro,
  minutos,
  moedaCodigo,
}: {
  dinheiro: number | null;
  minutos: number | null;
  moedaCodigo: string;
}) {
  const { t } = useTranslation('home');
  const dinheiroAnimado = useCountUp(dinheiro);
  const minutosAnimado = useCountUp(minutos);

  if (dinheiro == null && minutos == null) {
    return (
      <Pressable style={styles.nudge} onPress={() => router.push('/(tabs)/perfil' as Href)}>
        <Text style={styles.nudgeTexto}>{t('economiaCard.nudge')}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{t('economiaCard.label')}</Text>
      <View style={styles.linha}>
        {dinheiro != null && (
          <View style={styles.stat}>
            <Text style={styles.statValor}>{formatarMoeda(dinheiroAnimado ?? 0, moedaCodigo)}</Text>
            <Text style={styles.statLabel}>{t('economiaCard.money')}</Text>
          </View>
        )}
        {dinheiro != null && minutos != null && <View style={styles.divisor} />}
        {minutos != null && (
          <View style={styles.stat}>
            <Text style={styles.statValor}>{formatarTempoEconomizado(minutosAnimado ?? 0)}</Text>
            <Text style={styles.statLabel}>{t('economiaCard.time')}</Text>
          </View>
        )}
      </View>
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
    gap: 10,
  },
  cardLabel: {
    fontFamily: Fonts.data.semibold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(232,180,88,0.7)',
  },
  linha: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValor: { fontFamily: Fonts.data.bold, fontSize: 22, color: Colors.text },
  statLabel: { fontFamily: Fonts.body.medium, fontSize: 11, color: Accent.verde },
  divisor: { width: 1, height: 32, backgroundColor: Colors.border },

  nudge: {
    paddingVertical: 14,
    paddingHorizontal: Radius.card,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
  },
  nudgeTexto: {
    fontFamily: Fonts.body.medium,
    fontSize: 12,
    lineHeight: 17,
    color: 'rgba(244,239,233,0.5)',
    textAlign: 'center',
  },
});
