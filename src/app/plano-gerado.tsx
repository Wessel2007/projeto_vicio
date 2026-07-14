import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
import { useEffect, useMemo, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { AmbientGlow } from '@/components/ambient-glow';
import { GlowRing } from '@/components/glow-ring';
import { ParticleField } from '@/components/particle-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';

const FINAL_DELAY_MS = 1500;
const SPARK_COLORS = [Accent.brasaClara, Accent.brasa, '#FFE0B0', Accent.brasaEscura2];
const CORE_SIZE = 140;

const PLANO_GLOW = [
  { color: Accent.brasa, top: '34%' as const, left: '50%' as const, size: 640, opacity: 0.22 },
  { color: Accent.brasaClara, top: '58%' as const, left: '50%' as const, size: 420, opacity: 0.12 },
];

const STAGES = [
  { at: 0, phrase: 'Acendendo a forja...', sparkCount: 6 },
  { at: 0.12, phrase: 'Aquecendo o metal...', sparkCount: 8 },
  { at: 0.35, phrase: 'Moldando seu plano...', sparkCount: 10 },
  { at: 0.58, phrase: 'Temperando sua jornada...', sparkCount: 13 },
  { at: 0.83, phrase: 'Forjando sua armadura...', sparkCount: 16 },
] as const;

function stageIndexFor(value: number): number {
  let idx = 0;
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (value >= STAGES[i].at) {
      idx = i;
      break;
    }
  }
  return idx;
}

/**
 * Tela de transição obrigatória entre o fim das perguntas do onboarding e a
 * revelação de patente: simula a IA "forjando" o plano personalizado do
 * usuário. Sem botão de voltar/skip — só avança sozinha.
 */
export default function PlanoGeradoScreen() {
  const barProgress = useSharedValue(0);
  const flash = useSharedValue(0);
  const [percent, setPercent] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    barProgress.value = withSequence(
      withTiming(0.12, { duration: 480, easing: Easing.out(Easing.quad) }),
      withTiming(0.3, { duration: 680, easing: Easing.inOut(Easing.quad) }),
      withTiming(0.35, { duration: 220, easing: Easing.linear }),
      withTiming(0.58, { duration: 860, easing: Easing.inOut(Easing.quad) }),
      withTiming(0.64, { duration: 260, easing: Easing.linear }),
      withTiming(0.83, { duration: 820, easing: Easing.inOut(Easing.quad) }),
      withTiming(0.88, { duration: 220, easing: Easing.linear }),
      withTiming(1, { duration: 760, easing: Easing.out(Easing.cubic) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAnimatedReaction(
    () => barProgress.value,
    (value, prevValue) => {
      const pct = Math.round(value * 100);
      if (prevValue === null || pct !== Math.round(prevValue * 100)) {
        runOnJS(setPercent)(pct);
      }
      const idx = stageIndexFor(value);
      if (prevValue === null || idx !== stageIndexFor(prevValue)) {
        runOnJS(setStageIndex)(idx);
      }
      if (value >= 1 && (prevValue === null || prevValue < 1)) {
        flash.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0, { duration: 700 }));
        runOnJS(setCompleted)(true);
      }
    },
  );

  useEffect(() => {
    if (!completed) return;
    const timer = setTimeout(() => router.replace('/patente-revelada' as Href), FINAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [completed]);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={PLANO_GLOW} />
      <ParticleField mode="rise" count={STAGES[stageIndex].sparkCount} colors={SPARK_COLORS} />
      <Animated.View pointerEvents="none" style={[styles.flash, flashStyle]} />

      <SafeAreaView style={styles.safe}>
        <View style={styles.centro}>
          <ForgeCore stageIndex={stageIndex} completed={completed} />

          <ThemedText type="eyebrow" style={styles.eyebrow}>FORJA</ThemedText>
          <ThemedText type="titleBig" style={styles.headline}>
            {completed ? 'Plano forjado' : 'Forjando seu plano'}
          </ThemedText>

          <AnimatePresence exitBeforeEnter>
            <MotiView
              key={completed ? 'done' : stageIndex}
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -8 }}
              transition={{ type: 'timing', duration: 240 }}>
              <ThemedText type="default" themeColor="textSecondary" style={styles.frase}>
                {completed
                  ? 'Sua jornada foi moldada. Vamos revelar sua primeira patente.'
                  : STAGES[stageIndex].phrase}
              </ThemedText>
            </MotiView>
          </AnimatePresence>
        </View>

        <View style={styles.progressWrap}>
          <PlanBar progress={barProgress} />
          <ThemedText type="dataLabel" themeColor="textTertiary" style={styles.percent}>
            {percent}%
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function ForgeCore({ stageIndex, completed }: { stageIndex: number; completed: boolean }) {
  const flicker = useSharedValue(0);
  const corePulse = useSharedValue(0);
  const uid = useMemo(() => Math.random().toString(36).slice(2), []);

  useEffect(() => {
    flicker.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 260, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.6, { duration: 180, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.9, { duration: 220, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.7, { duration: 200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    corePulse.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flickerStyle = useAnimatedStyle(() => ({
    opacity: 0.75 + flicker.value * 0.25,
    transform: [
      { scale: 0.94 + flicker.value * 0.1 },
      { rotate: `${(flicker.value - 0.5) * 4}deg` },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + corePulse.value * 0.12 + stageIndex * 0.02 }],
    opacity: 0.55 + corePulse.value * 0.25 + stageIndex * 0.05,
  }));

  const ringSize = 190 + stageIndex * 12;
  const ringColor = completed ? Accent.brasaClara : Accent.brasa;
  const glowId = `plano-core-glow-${uid}`;

  return (
    <View style={styles.core}>
      <GlowRing size={ringSize} color={ringColor} />
      <Animated.View style={[styles.coreGlow, pulseStyle]}>
        <Svg width={CORE_SIZE} height={CORE_SIZE}>
          <Defs>
            <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={Accent.temperaStart} stopOpacity={0.9} />
              <Stop offset="60%" stopColor={Accent.brasa} stopOpacity={0.5} />
              <Stop offset="100%" stopColor={Accent.brasaEscura} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={CORE_SIZE} height={CORE_SIZE} fill={`url(#${glowId})`} />
        </Svg>
      </Animated.View>
      <Animated.View style={flickerStyle}>
        <Ionicons name="flame" size={56} color={Accent.brasaClara} />
      </Animated.View>
    </View>
  );
}

function PlanBar({ progress }: { progress: SharedValue<number> }) {
  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const tipStyle = useAnimatedStyle(() => ({
    left: `${progress.value * 100}%`,
    opacity: 0.6 + progress.value * 0.4,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fillWrap, fillStyle]}>
        <LinearGradient
          colors={[Accent.temperaStart, Accent.temperaMid, Accent.temperaEnd]}
          locations={Accent.temperaLocations}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      <Animated.View style={[styles.tip, tipStyle]} />
    </View>
  );
}

const TRACK_HEIGHT = 10;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Accent.brasaClara,
  },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  core: {
    width: CORE_SIZE + 60,
    height: CORE_SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  coreGlow: { position: 'absolute', width: CORE_SIZE, height: CORE_SIZE },
  eyebrow: { color: Accent.bronzeMuted, letterSpacing: 4, marginBottom: Spacing.one },
  headline: { textAlign: 'center' },
  frase: { textAlign: 'center', marginTop: Spacing.two, minHeight: 24 },
  progressWrap: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.two,
    alignItems: 'center',
  },
  track: {
    width: '100%',
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'visible',
  },
  fillWrap: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  tip: {
    position: 'absolute',
    top: -3,
    marginLeft: -8,
    width: TRACK_HEIGHT + 6,
    height: TRACK_HEIGHT + 6,
    borderRadius: (TRACK_HEIGHT + 6) / 2,
    backgroundColor: Accent.brasaClara,
    shadowColor: Accent.brasaClara,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  percent: { color: Accent.bronzeMuted },
});
