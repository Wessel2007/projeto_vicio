import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientGlow } from '@/components/ambient-glow';
import { GlassCard } from '@/components/glass-card';
import { GlowRing } from '@/components/glow-ring';
import { ParticleField } from '@/components/particle-field';
import { ShineSweep } from '@/components/shine-sweep';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getFraseDoDia } from '@/constants/frases';
import { getPatenteBadge } from '@/constants/patente-badges';
import { Accent, Colors, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';

const SUBLEVEL_LABEL = ['I', 'II', 'III'];
const EMBER_COLORS = ['#FFE7B0', '#FFD27A', '#FFF0C8', '#FFB347', '#FFCF8A'];
const HOME_GLOW = [
  { color: '#FF5A22', top: '8%' as const, left: '20%' as const, size: 560, opacity: 0.28 },
  { color: '#7846DC', top: '45%' as const, left: '92%' as const, size: 600, opacity: 0.24 },
];

const BADGE_SIZE = 124;

export default function HomeScreen() {
  const { dados, derivado, registrarRecaida, carregando } = useAppData();

  const flamePulse = useSharedValue(1);
  const panicoGlow = useSharedValue(0);
  useEffect(() => {
    flamePulse.value = withRepeat(
      withTiming(1.14, { duration: 950, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    panicoGlow.value = withRepeat(
      withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [flamePulse, panicoGlow]);
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scale: flamePulse.value }] }));
  const panicoGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + panicoGlow.value * 0.4,
    transform: [{ scale: 0.96 + panicoGlow.value * 0.08 }],
  }));

  if (carregando || !dados || !derivado) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  const frase = getFraseDoDia();
  const { streakDias, totalXP, patente } = derivado;
  const sublevelLabel = patente.nivel.sublevel ? ` ${SUBLEVEL_LABEL[patente.nivel.sublevel - 1]}` : '';
  const patenteBadge = getPatenteBadge(patente.nivel.nome, patente.nivel.sublevel);

  function confirmarRecaida() {
    Alert.alert(
      'Registrar recaída',
      'Isso vai zerar seu streak atual, mas seu XP e patente são mantidos. Isso realmente aconteceu?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, aconteceu',
          style: 'destructive',
          onPress: () => {
            registrarRecaida();
            Alert.alert(
              'Recomeçando',
              'Sua jornada continua. Cada dia é uma nova escolha. Seu XP está preservado.',
            );
          },
        },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={HOME_GLOW} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <ThemedText type="eyebrow" style={{ color: Accent.violet }}>Jornada do Guerreiro</ThemedText>
            <ThemedText type="subtitle" style={styles.headerTitle}>Sua disciplina, hoje</ThemedText>
          </View>

          {/* Streak */}
          <LinearGradient
            colors={[Accent.fireStart, Accent.fireMid, Accent.fireEnd]}
            locations={Accent.fireLocations}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={[styles.card, styles.streakCard]}>
            <ParticleField mode="rise" count={6} colors={EMBER_COLORS} style={styles.emberArea} />
            <ThemedText type="eyebrow" style={styles.eyebrowOnColor}>Sequência atual</ThemedText>
            <Animated.View style={[styles.flameBadge, flameStyle]}>
              <Ionicons name="flame" size={36} color="#FFFFFF" />
            </Animated.View>
            <ThemedText type="heroNumber" style={styles.streakNumber}>{streakDias}</ThemedText>
            <ThemedText style={styles.onColorText}>
              {streakDias === 1 ? 'dia sem recair' : 'dias sem recair'}
            </ThemedText>
          </LinearGradient>

          {/* Patente */}
          <LinearGradient
            colors={[Accent.rankStart, Accent.rankEnd]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={[styles.card, styles.patenteCard]}>
            <ThemedText type="eyebrow" style={styles.eyebrowGold}>Sua patente</ThemedText>

            <View style={styles.patenteBadgeWrap}>
              <GlowRing size={BADGE_SIZE} color={Accent.gold} />
              <View style={styles.patenteBadgeClip}>
                <Image source={patenteBadge} style={styles.patenteBadgeImage} resizeMode="contain" />
                <ShineSweep size={BADGE_SIZE} />
              </View>
            </View>

            <ThemedText type="cardTitle" style={styles.patenteNome}>{patente.nivel.nome}{sublevelLabel}</ThemedText>
            <ThemedText style={styles.patenteXP}>{totalXP} XP total acumulado</ThemedText>

            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[Accent.goldMuted, Accent.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${patente.progressoPercent}%` }]}
                />
              </View>
              {patente.proxNivel ? (
                <ThemedText type="small" style={styles.progressLabel}>
                  {patente.proxNivel.nome}
                  {patente.proxNivel.sublevel ? ` ${SUBLEVEL_LABEL[patente.proxNivel.sublevel - 1]}` : ''} em{' '}
                  {patente.proxNivel.minDias - patente.diasEfetivos} dias
                </ThemedText>
              ) : (
                <ThemedText type="small" style={styles.progressLabel}>Nível máximo atingido</ThemedText>
              )}
            </View>
          </LinearGradient>

          {/* Frase do dia */}
          <GlassCard style={[styles.card, styles.fraseCard]}>
            <Ionicons name="chatbox-ellipses-outline" size={22} color={Colors.textSecondary} style={styles.fraseIcon} />
            <ThemedText type="eyebrow" themeColor="textSecondary">Frase do dia</ThemedText>
            <ThemedText type="quote" style={styles.fraseTexto}>"{frase.texto}"</ThemedText>
            <View style={styles.fraseDivider} />
            <ThemedText type="smallBold" themeColor="textSecondary">{frase.autor}</ThemedText>
          </GlassCard>

          {/* Registrar recaída */}
          <Pressable onPress={confirmarRecaida} style={styles.recaidaBtn}>
            <Ionicons name="refresh-outline" size={16} color={Colors.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">Registrar recaída</ThemedText>
          </Pressable>

        </ScrollView>

        {/* Botão de pânico fixo */}
        <View style={styles.panicoWrap}>
          <Animated.View style={[styles.panicoGlow, panicoGlowStyle]} />
          <Pressable
            style={({ pressed }) => [styles.panicoBtn, pressed && styles.panicoBtnPressed]}
            onPress={() => router.push('/panico' as Href)}>
            <Ionicons name="hand-left" size={20} color="#FFFFFF" />
            <ThemedText style={styles.panicoBtnText}>Preciso de Ajuda</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: 120,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.half,
    marginBottom: Spacing.half,
  },
  headerTitle: {
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    alignItems: 'center',
  },
  eyebrowOnColor: {
    color: 'rgba(255,255,255,0.9)',
  },
  eyebrowGold: {
    color: Accent.goldMuted,
  },
  onColorText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  streakCard: {
    gap: Spacing.one,
    overflow: 'hidden',
    shadowColor: Accent.fireEnd,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  emberArea: {
    height: 120,
    top: undefined,
    bottom: 14,
  },
  flameBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  streakNumber: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  patenteCard: {
    gap: Spacing.one,
    shadowColor: Accent.rankEnd,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  patenteBadgeWrap: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.half,
  },
  patenteBadgeClip: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    overflow: 'hidden',
  },
  patenteBadgeImage: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
  },
  patenteNome: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  patenteXP: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  progressContainer: {
    width: '100%',
    gap: Spacing.two,
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.75)',
  },
  fraseCard: {
    gap: Spacing.two,
  },
  fraseIcon: {
    marginBottom: -Spacing.one,
  },
  fraseTexto: {
    textAlign: 'center',
  },
  fraseDivider: {
    width: 32,
    height: 2,
    borderRadius: 1,
    marginTop: Spacing.half,
    backgroundColor: Colors.border,
  },
  recaidaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  panicoWrap: {
    position: 'absolute',
    bottom: Spacing.four,
    left: Spacing.three,
    right: Spacing.three,
  },
  panicoGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: Spacing.three + 6,
    backgroundColor: Accent.danger,
  },
  panicoBtn: {
    flexDirection: 'row',
    gap: Spacing.two,
    backgroundColor: Accent.danger,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Accent.dangerDark,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  panicoBtnPressed: {
    backgroundColor: Accent.dangerDark,
  },
  panicoBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
