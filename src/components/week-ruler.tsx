import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Accent, Colors, Radius, Fonts } from '@/constants/theme';

/**
 * Régua da semana — card chapa com 7 brasas. Dias cumpridos acesos em brasa,
 * "hoje" (último) com gradiente radial + glow + emberPulse.
 * `cumpridos`: array de 7 booleans (posição 0..6). O índice `hoje` pulsa.
 */
export function WeekRuler({
  cumpridos,
  hoje = 6,
}: {
  cumpridos: boolean[];
  hoje?: number;
}) {
  const { t } = useTranslation('common');
  const labels = t('dates.weekRulerInitials', { returnObjects: true }) as string[];
  const pulse = useSharedValue(0.5);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + pulse.value * 0.5,
    transform: [{ scale: 0.96 + pulse.value * 0.08 }],
  }));

  return (
    <View style={styles.card}>
      {labels.map((label, i) => {
        const feito = cumpridos[i];
        const ehHoje = i === hoje;
        return (
          <View key={i} style={styles.col}>
            {ehHoje ? (
              <Animated.View style={[styles.dot, styles.dotHoje, pulseStyle]} />
            ) : (
              <View style={[styles.dot, feito ? styles.dotFeito : styles.dotVazio]} />
            )}
            <Text style={[styles.label, ehHoje && styles.labelHoje]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: Radius.card,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
  },
  col: { alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  dotFeito: { backgroundColor: Accent.brasa },
  dotVazio: { backgroundColor: 'rgba(255,255,255,0.10)' },
  dotHoje: {
    backgroundColor: Accent.brasaClara,
    shadowColor: Accent.brasa,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  label: {
    fontFamily: Fonts.body.semibold,
    fontSize: 10,
    color: 'rgba(244,239,233,0.40)',
  },
  labelHoje: {
    fontFamily: Fonts.body.bold,
    color: Accent.brasaClara,
  },
});
