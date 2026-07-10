import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * Barra diagonal translúcida que varre um contêiner clipado (o pai precisa
 * de `overflow: 'hidden'` e o `borderRadius` desejado), replicando `shine`.
 */
export function ShineSweep({ size, delay = 800 }: { size: number; delay?: number }) {
  const x = useSharedValue(-1);

  useEffect(() => {
    x.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 3400, easing: Easing.out(Easing.quad) }), -1, false),
    );
  }, [x, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * size * 1.6 }, { rotate: '20deg' }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', top: -size * 0.3, left: -size * 0.3, width: size * 0.5, height: size * 1.6 },
        style,
      ]}>
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.45)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}
