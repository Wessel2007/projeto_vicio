import { useEffect } from 'react';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

function Ring({ size, color, delay }: { size: number; color: string; delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 4000, easing: Easing.out(Easing.ease) }), -1, false),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.5, 0]),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.72, 1.5]) }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

/** Dois círculos que expandem e desaparecem em loop defasado, replicando `ripple`. */
export function RippleRings({ size, color }: { size: number; color: string }) {
  return (
    <>
      <Ring size={size} color={color} delay={0} />
      <Ring size={size} color={color} delay={2000} />
    </>
  );
}
