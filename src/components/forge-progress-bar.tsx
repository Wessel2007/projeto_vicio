import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Accent, Colors } from '@/constants/theme';

const HEIGHT = 8;

/**
 * Barra de progresso do onboarding estilizada como "temperatura da forja":
 * enche com o gradiente de fogo conforme o usuário avança, com uma brasa
 * brilhante na ponta.
 */
export function ForgeProgressBar({ progress }: { progress: number }) {
  const fill = useSharedValue(progress);

  useEffect(() => {
    fill.value = withTiming(progress, { duration: 450, easing: Easing.out(Easing.cubic) });
  }, [progress, fill]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  const tipStyle = useAnimatedStyle(() => ({ left: `${fill.value * 100}%` }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fillWrap, fillStyle]}>
        <LinearGradient
          colors={[Accent.fireStart, Accent.fireMid, Accent.fireEnd]}
          locations={Accent.fireLocations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      <Animated.View style={[styles.tip, tipStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    backgroundColor: Colors.backgroundSelected,
    overflow: 'visible',
  },
  fillWrap: {
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    overflow: 'hidden',
  },
  tip: {
    position: 'absolute',
    top: -2,
    marginLeft: -6,
    width: HEIGHT + 4,
    height: HEIGHT + 4,
    borderRadius: (HEIGHT + 4) / 2,
    backgroundColor: Accent.gold,
    shadowColor: Accent.gold,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
