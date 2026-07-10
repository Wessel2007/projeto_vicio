import { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

export interface GlowBlob {
  color: string;
  /** Posição do centro do glow, ex.: '20%' */
  top: `${number}%`;
  left: `${number}%`;
  size?: number;
  opacity?: number;
}

/**
 * Camada de fundo com 1-2 glows radiais suaves que derivam lentamente,
 * replicando o `bgDrift` do mockup.
 */
export function AmbientGlow({ blobs }: { blobs: GlowBlob[] }) {
  const drift = useSharedValue(0);
  const uid = useMemo(() => Math.random().toString(36).slice(2), []);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 7000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [drift]);

  const driftStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 24 }, { translateY: drift.value * -34 }],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <Animated.View style={[StyleSheet.absoluteFillObject, driftStyle]}>
        {blobs.map((blob, i) => {
          const size = blob.size ?? 480;
          const id = `ambient-glow-${uid}-${i}`;
          return (
            <Svg
              key={i}
              width={size}
              height={size}
              style={{
                position: 'absolute',
                top: blob.top,
                left: blob.left,
                marginTop: -size / 2,
                marginLeft: -size / 2,
              }}>
              <Defs>
                <RadialGradient id={id} cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={blob.color} stopOpacity={blob.opacity ?? 0.24} />
                  <Stop offset="100%" stopColor={blob.color} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect width={size} height={size} fill={`url(#${id})`} />
            </Svg>
          );
        })}
      </Animated.View>
    </View>
  );
}
