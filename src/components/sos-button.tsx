import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Accent, Fonts } from '@/constants/theme';

/**
 * Botão de pânico "PRECISO DE AJUDA": pill carmesim contido com respiração
 * sutil de glow (sosBreathe) + dot pulsando (emberPulse). Carmesim é reservado
 * exclusivamente a este componente.
 */
export function SosButton({ onPress, style }: { onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation('panicButton');
  const breathe = useSharedValue(0);
  const dot = useSharedValue(0.5);

  useEffect(() => {
    breathe.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true);
    dot.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [breathe, dot]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: breathe.value * 0.9,
    shadowRadius: 6 + breathe.value * 8,
  }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + dot.value * 0.5,
    transform: [{ scale: 0.96 + dot.value * 0.08 }],
  }));

  return (
    <Pressable onPress={onPress} style={style}>
      <Animated.View style={[styles.pill, glowStyle]}>
        <Animated.View style={[styles.dot, dotStyle]} />
        <Text style={styles.label}>{t('sosLabel')}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Accent.carmesimBorda,
    backgroundColor: Accent.carmesimFundo,
    shadowColor: Accent.carmesim,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Accent.carmesim,
  },
  label: {
    fontFamily: Fonts.body.bold,
    fontSize: 13,
    letterSpacing: 2,
    color: Accent.carmesimTexto,
  },
});
