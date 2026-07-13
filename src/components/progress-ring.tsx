import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { Accent } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Geometria fixa do protótipo (viewBox 260, r 115).
const VIEWBOX = 260;
const CENTER = 130;
const R = 115;
const CIRCUMFERENCE = 2 * Math.PI * R; // ~722.57

/**
 * Anel de progresso circular ("têmpera do metal") — hero da Home.
 * Trilha rgba branca, progresso em gradiente brasa com linecap round começando
 * às 12h, ponta com dot + halo, e halo radial pulsando atrás. Anima o
 * preenchimento no mount (sensação de "acender").
 */
export function ProgressRing({
  size = 236,
  strokeWidth = 10,
  progress,
  children,
  style,
}: {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const target = Math.min(1, Math.max(0.02, progress));
  const anim = useSharedValue(0);
  const glow = useSharedValue(0.35);

  useEffect(() => {
    anim.value = withTiming(target, { duration: 850, easing: Easing.out(Easing.cubic) });
  }, [target, anim]);

  useEffect(() => {
    glow.value = withRepeat(withTiming(0.8, { duration: 1600, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [glow]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - anim.value),
  }));

  // Posição da ponta (dot + halo), acompanhando o preenchimento.
  const tip = useDerivedValue(() => {
    const angle = -Math.PI / 2 + anim.value * 2 * Math.PI;
    return {
      cx: CENTER + R * Math.cos(angle),
      cy: CENTER + R * Math.sin(angle),
    };
  });
  const tipHaloProps = useAnimatedProps(() => ({ cx: tip.value.cx, cy: tip.value.cy }));
  const tipDotProps = useAnimatedProps(() => ({ cx: tip.value.cx, cy: tip.value.cy }));

  const haloStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Animated.View style={[styles.halo, { borderRadius: size / 2 }, haloStyle]} />
      <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="ringTempera" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={Accent.temperaStart} />
            <Stop offset="0.55" stopColor={Accent.temperaMid} />
            <Stop offset="1" stopColor={Accent.temperaEnd} />
          </LinearGradient>
        </Defs>
        <Circle cx={CENTER} cy={CENTER} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
        <AnimatedCircle
          cx={CENTER}
          cy={CENTER}
          r={R}
          fill="none"
          stroke="url(#ringTempera)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
        <AnimatedCircle animatedProps={tipHaloProps} r={12} fill="rgba(255,196,107,0.25)" />
        <AnimatedCircle animatedProps={tipDotProps} r={5.5} fill={Accent.brasaClara} />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    position: 'absolute',
    width: '72%',
    height: '72%',
    backgroundColor: 'rgba(255,107,43,0.10)',
  },
});
