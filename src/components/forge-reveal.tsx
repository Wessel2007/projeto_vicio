import { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BadgeHalo } from '@/components/badge-halo';
import { getPatenteBadge } from '@/constants/patente-badges';
import { Accent } from '@/constants/theme';

const HALO_SIZE = 190;
const BADGE_SIZE = 150;

/**
 * Revelação da primeira patente (Recruta I) ao fim do onboarding: o badge 3D
 * real nasce pequeno, dá um "pop" de martelada e acende os anéis de bronze com
 * fagulhas subindo — entrega a recompensa imediata do sistema de progressão.
 */
export function ForgeReveal() {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 260 });
    scale.value = withSequence(
      withTiming(1.12, { duration: 480, easing: Easing.out(Easing.back(1.8)) }),
      withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) }),
    );
  }, [scale, opacity]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <BadgeHalo size={HALO_SIZE} rings={2}>
      <Animated.View style={badgeStyle}>
        <Image source={getPatenteBadge('Recruta', 1)} style={styles.badge} resizeMode="contain" />
      </Animated.View>
    </BadgeHalo>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    shadowColor: Accent.brasa,
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
  },
});
