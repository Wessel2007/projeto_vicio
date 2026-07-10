import { useEffect, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type ParticleMode = 'rise' | 'fall';

interface ParticleConfig {
  left: `${number}%`;
  size: number;
  duration: number;
  delay: number;
  color: string;
  shape: 'circle' | 'rect';
  rectHeight: number;
}

function makeConfigs(count: number, colors: string[], mode: ParticleMode): ParticleConfig[] {
  return Array.from({ length: count }, (_, i) => {
    const color = colors[i % colors.length];
    const isCircle = mode === 'rise' || Math.random() > 0.35;
    return {
      left: `${8 + Math.random() * 84}%`,
      size: mode === 'rise' ? 4 + Math.random() * 5 : 6 + Math.random() * 3,
      duration: mode === 'rise' ? 2200 + Math.random() * 1400 : 2400 + Math.random() * 1200,
      delay: Math.random() * 2600,
      color,
      shape: isCircle ? 'circle' : 'rect',
      rectHeight: 7 + Math.random() * 6,
    };
  });
}

function Particle({ config, mode }: { config: ParticleConfig; mode: ParticleMode }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withRepeat(withTiming(1, { duration: config.duration, easing: Easing.linear }), -1, false),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    if (mode === 'rise') {
      return {
        opacity: interpolate(progress.value, [0, 0.12, 0.8, 1], [0, 0.9, 0.5, 0]),
        transform: [
          { translateY: interpolate(progress.value, [0, 1], [0, -96]) },
          { scale: interpolate(progress.value, [0, 1], [1, 0.25]) },
        ],
      };
    }
    return {
      opacity: interpolate(progress.value, [0, 0.85, 1], [1, 1, 0]),
      transform: [
        { translateY: interpolate(progress.value, [0, 1], [-14, 200]) },
        { rotate: `${interpolate(progress.value, [0, 1], [0, 560])}deg` },
      ],
    };
  });

  const isCircle = config.shape === 'circle';

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        mode === 'rise' ? styles.riseBase : styles.fallBase,
        {
          left: config.left,
          width: config.size,
          height: isCircle ? config.size : config.rectHeight,
          borderRadius: isCircle ? config.size / 2 : 1.5,
          backgroundColor: config.color,
        },
        mode === 'rise' && { shadowColor: config.color },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Campo de partículas decorativo. `rise` replica as brasas subindo do card
 * de streak (emberRise); `fall` replica o confete caindo (confFall).
 */
export function ParticleField({
  mode,
  count = 8,
  colors,
  style,
}: {
  mode: ParticleMode;
  count?: number;
  colors: string[];
  style?: ViewStyle;
}) {
  const configs = useMemo(() => makeConfigs(count, colors, mode), [count, colors, mode]);

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      {configs.map((config, i) => (
        <Particle key={i} config={config} mode={mode} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  riseBase: {
    position: 'absolute',
    bottom: 0,
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  fallBase: {
    position: 'absolute',
    top: 0,
  },
});
