import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

/**
 * Anel girando + glow radial pulsante atrás de um badge circular,
 * replicando `spinSlow` + `glowPulse` do mockup.
 */
export function GlowRing({ size, color, thickness = 3 }: { size: number; color: string; thickness?: number }) {
  const rotate = useSharedValue(0);
  const pulse = useSharedValue(0);
  const uid = useMemo(() => Math.random().toString(36).slice(2), []);

  useEffect(() => {
    rotate.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [rotate, pulse]);

  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotate.value * 360}deg` }] }));
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.45,
    transform: [{ scale: 0.94 + pulse.value * 0.14 }],
  }));

  const glowSize = size * 0.9;
  const radius = size / 2 - thickness;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.34;
  const glowId = `glow-ring-${uid}`;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{ position: 'absolute', width: glowSize, height: glowSize }, pulseStyle]}>
        <Svg width={glowSize} height={glowSize}>
          <Defs>
            <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={color} stopOpacity={0.55} />
              <Stop offset="100%" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={glowSize} height={glowSize} fill={`url(#${glowId})`} />
        </Svg>
      </Animated.View>

      <Animated.View style={[{ width: size, height: size }, spinStyle]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeLinecap="round"
            fill="none"
            opacity={0.7}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
