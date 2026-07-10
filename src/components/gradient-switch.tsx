import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Accent } from '@/constants/theme';

const WIDTH = 50;
const HEIGHT = 30;
const THUMB = 24;
const PAD = 3;

/** Toggle customizado com trilho em gradiente de fogo quando ativo (Switch nativo não suporta gradiente). */
export function GradientSwitch({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [value, progress]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * (WIDTH - THUMB - PAD * 2) }],
  }));
  const trackOpacity = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Pressable onPress={() => onValueChange(!value)} style={styles.track}>
      <Animated.View style={[StyleSheet.absoluteFillObject, trackOpacity]}>
        <LinearGradient
          colors={[Accent.fireStart, Accent.fireMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        />
      </Animated.View>
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientFill: { flex: 1 },
  thumb: {
    position: 'absolute',
    left: PAD,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
