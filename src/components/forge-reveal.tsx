import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GlowRing } from '@/components/glow-ring';
import { ParticleField } from '@/components/particle-field';
import { ShineSweep } from '@/components/shine-sweep';
import { Accent } from '@/constants/theme';

const BADGE_SIZE = 140;

/**
 * Animação de "forjar" da tela final do onboarding: o badge de chama nasce
 * pequeno, estoura levemente ao aparecer (efeito de martelada) e acende um
 * anel dourado ao redor, com brasas subindo — sem depender de Lottie.
 */
export function ForgeReveal() {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 260 });
    scale.value = withSequence(
      withTiming(1.12, { duration: 480, easing: Easing.out(Easing.back(1.8)) }),
      withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }),
    );
    ringOpacity.value = withDelay(280, withTiming(1, { duration: 420 }));
  }, [scale, opacity, ringOpacity]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: ringOpacity.value }));

  return (
    <View style={styles.wrap}>
      <ParticleField
        mode="rise"
        count={16}
        colors={[Accent.fireStart, Accent.fireMid, Accent.gold]}
        style={styles.particles}
      />
      <Animated.View style={[styles.ringWrap, ringStyle]}>
        <GlowRing size={BADGE_SIZE + 80} color={Accent.gold} thickness={2} />
      </Animated.View>
      <Animated.View style={[styles.badge, badgeStyle]}>
        <LinearGradient
          colors={[Accent.fireStart, Accent.fireMid, Accent.fireEnd]}
          locations={Accent.fireLocations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badgeGradient}>
          <ShineSweep size={BADGE_SIZE} delay={650} />
          <Ionicons name="flame" size={64} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: BADGE_SIZE + 80,
    height: BADGE_SIZE + 80,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  particles: { bottom: -40 },
  ringWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    shadowColor: Accent.fireEnd,
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  badgeGradient: {
    flex: 1,
    borderRadius: BADGE_SIZE / 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
