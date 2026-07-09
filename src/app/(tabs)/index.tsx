import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getFraseDoDia } from '@/constants/frases';
import { getPatenteBadge } from '@/constants/patente-badges';
import { Accent, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { useTheme } from '@/hooks/use-theme';

const SUBLEVEL_LABEL = ['I', 'II', 'III'];

export default function HomeScreen() {
  const { dados, derivado, registrarRecaida, carregando } = useAppData();
  const theme = useTheme();

  const flamePulse = useSharedValue(1);
  useEffect(() => {
    flamePulse.value = withRepeat(
      withTiming(1.14, { duration: 950, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [flamePulse]);
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scale: flamePulse.value }] }));

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
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.headerEyebrow}>
              JORNADA DO GUERREIRO
            </ThemedText>
            <ThemedText type="subtitle" style={styles.headerTitle}>Sua disciplina, hoje</ThemedText>
          </View>

          {/* Streak */}
          <LinearGradient
            colors={[Accent.fireStart, Accent.fireEnd]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={[styles.card, styles.streakCard]}>
            <ThemedText type="small" style={styles.eyebrowOnColor}>SEQUÊNCIA ATUAL</ThemedText>
            <Animated.View style={[styles.flameBadge, flameStyle]}>
              <Ionicons name="flame" size={36} color="#FFFFFF" />
            </Animated.View>
            <ThemedText style={styles.streakNumber}>{streakDias}</ThemedText>
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
            <ThemedText type="small" style={styles.eyebrowGold}>SUA PATENTE</ThemedText>

            <View style={styles.patenteBadgeWrap}>
              <View style={styles.patenteBadgeGlow} />
              <Image source={patenteBadge} style={styles.patenteBadgeImage} resizeMode="contain" />
            </View>

            <ThemedText style={styles.patenteNome}>{patente.nivel.nome}{sublevelLabel}</ThemedText>
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
          <ThemedView type="backgroundElement" style={[styles.card, styles.fraseCard, { borderColor: theme.backgroundSelected }]}>
            <Ionicons name="chatbox-ellipses-outline" size={22} color={theme.textSecondary} style={styles.fraseIcon} />
            <ThemedText type="small" themeColor="textSecondary" style={styles.eyebrow}>FRASE DO DIA</ThemedText>
            <ThemedText type="default" style={styles.fraseTexto}>"{frase.texto}"</ThemedText>
            <View style={[styles.fraseDivider, { backgroundColor: theme.backgroundSelected }]} />
            <ThemedText type="smallBold" themeColor="textSecondary">{frase.autor}</ThemedText>
          </ThemedView>

          {/* Registrar recaída */}
          <Pressable onPress={confirmarRecaida} style={styles.recaidaBtn}>
            <Ionicons name="refresh-outline" size={16} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">Registrar recaída</ThemedText>
          </Pressable>

        </ScrollView>

        {/* Botão de pânico fixo */}
        <Pressable
          style={({ pressed }) => [styles.panicoBtn, pressed && styles.panicoBtnPressed]}
          onPress={() => router.push('/panico' as Href)}>
          <Ionicons name="hand-left" size={20} color="#FFFFFF" />
          <ThemedText style={styles.panicoBtnText}>Preciso de Ajuda</ThemedText>
        </Pressable>
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
  headerEyebrow: {
    letterSpacing: 1.5,
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
  eyebrow: {
    letterSpacing: 1.2,
  },
  eyebrowOnColor: {
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
  },
  eyebrowGold: {
    color: Accent.goldMuted,
    letterSpacing: 1.2,
  },
  onColorText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  streakCard: {
    gap: Spacing.one,
    shadowColor: Accent.fireEnd,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
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
    fontSize: 64,
    lineHeight: 68,
    fontWeight: '800',
    color: '#FFFFFF',
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
    width: 108,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
    marginBottom: Spacing.half,
  },
  patenteBadgeGlow: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Accent.gold,
    opacity: 0.22,
  },
  patenteBadgeImage: {
    width: 108,
    height: 108,
  },
  patenteNome: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
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
    borderWidth: 1,
  },
  fraseIcon: {
    marginBottom: -Spacing.one,
  },
  fraseTexto: {
    fontStyle: 'italic',
    lineHeight: 26,
    textAlign: 'center',
  },
  fraseDivider: {
    width: 32,
    height: 2,
    borderRadius: 1,
    marginTop: Spacing.half,
  },
  recaidaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  panicoBtn: {
    position: 'absolute',
    bottom: Spacing.four,
    left: Spacing.three,
    right: Spacing.three,
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
