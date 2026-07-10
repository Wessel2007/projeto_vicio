import { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AmbientGlow } from '@/components/ambient-glow';
import { ThemedText } from '@/components/themed-text';
import { Accent, Colors } from '@/constants/theme';

const APP_ICON = require('@/assets/images/icon.png');

/**
 * Tela de abertura da marca, exibida por um tempo fixo antes de liberar o
 * app (ver INTRO_DURATION_MS em app/_layout.tsx).
 */
export function IntroScreen() {
  const badgeScale = useSharedValue(0.7);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    badgeScale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    contentOpacity.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.ease) });
  }, [badgeScale, contentOpacity]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <Animated.View style={styles.container} exiting={FadeOut.duration(350)}>
      <AmbientGlow
        blobs={[{ color: Accent.fireMid, top: '50%', left: '50%', size: 560, opacity: 0.32 }]}
      />
      <Animated.View style={[styles.badge, badgeStyle]}>
        <Image source={APP_ICON} style={styles.badgeImage} resizeMode="contain" />
      </Animated.View>
      <Animated.View style={contentStyle}>
        <ThemedText type="title" style={styles.wordmark}>FORJA</ThemedText>
        <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.tagline}>
          Forje. Discipline. Ascenda.
        </ThemedText>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  badge: {
    width: 132,
    height: 132,
    shadowColor: Accent.gold,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  badgeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  wordmark: {
    textAlign: 'center',
    letterSpacing: 4,
    color: Accent.gold,
  },
  tagline: {
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: 4,
  },
});
