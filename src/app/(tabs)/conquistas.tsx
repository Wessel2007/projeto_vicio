import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NIVEIS, NivelPatente } from '@/constants/gamification';
import { getPatenteBadge } from '@/constants/patente-badges';
import { Accent, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { useTheme } from '@/hooks/use-theme';

const SUBLEVEL_LABEL = ['I', 'II', 'III'];
const SCREEN_WIDTH = Dimensions.get('window').width;

// Color identity per patente, progressing from cool/muted (início da jornada)
// para tons cada vez mais quentes e nobres (fim da jornada).
const TIER_THEME: Record<string, { colors: [string, string]; glow: string }> = {
  Recruta: { colors: ['#6E7684', '#3E4450'], glow: '#9AA3B2' },
  Aprendiz: { colors: ['#4C93FB', '#2260C9'], glow: '#4C93FB' },
  Guerreiro: { colors: ['#2BB6A8', '#157A72'], glow: '#2BB6A8' },
  Guardião: { colors: ['#43BE5C', '#237B38'], glow: '#43BE5C' },
  Espartano: { colors: [Accent.fireStart, Accent.fireEnd], glow: Accent.fireEnd },
  Monge: { colors: ['#9D6BF0', '#5E38A8'], glow: '#9D6BF0' },
  Mestre: { colors: ['#E0447A', '#9C1F52'], glow: '#E0447A' },
  Lenda: { colors: [Accent.gold, '#B8862E'], glow: Accent.gold },
  Imortal: { colors: [Accent.gold, Accent.rankEnd], glow: '#FFFFFF' },
};

// Group NIVEIS by patente name for display
const GRUPOS = NIVEIS.reduce<{ nome: string; niveis: NivelPatente[] }[]>((acc, n) => {
  const ultimo = acc[acc.length - 1];
  if (ultimo && ultimo.nome === n.nome) {
    ultimo.niveis.push(n);
  } else {
    acc.push({ nome: n.nome, niveis: [n] });
  }
  return acc;
}, []);

export default function ConquistasScreen() {
  const { dados, derivado, carregando } = useAppData();
  const theme = useTheme();

  const badgePulse = useSharedValue(1);
  const shimmerX = useSharedValue(-1);

  useEffect(() => {
    badgePulse.value = withRepeat(
      withTiming(1.1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    shimmerX.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 0 }),
        withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [badgePulse, shimmerX]);

  const badgeGlowStyle = useAnimatedStyle(() => ({ transform: [{ scale: badgePulse.value }] }));
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value * SCREEN_WIDTH }, { rotate: '20deg' }],
  }));

  if (carregando || !dados || !derivado) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  const { patente, totalXP, streakDias } = derivado;
  const nomeAtual = patente.nivel.nome;
  const sublevelAtual = patente.nivel.sublevel;
  const heroTheme = TIER_THEME[nomeAtual];
  const sublevelLabelAtual = sublevelAtual ? ` ${SUBLEVEL_LABEL[sublevelAtual - 1]}` : '';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Jornada do Guerreiro</ThemedText>
          </View>

          {/* Hero: patente atual */}
          <LinearGradient
            colors={heroTheme.colors}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={[styles.heroCard, { shadowColor: heroTheme.glow }]}>
            <View style={styles.heroShimmerClip} pointerEvents="none">
              <Animated.View style={[styles.heroShimmer, shimmerStyle]} />
            </View>

            <ThemedText type="small" style={styles.heroEyebrow}>SUA PATENTE ATUAL</ThemedText>

            <Animated.View style={[styles.heroBadgeWrap, badgeGlowStyle]}>
              <View style={[styles.heroBadgeGlow, { backgroundColor: heroTheme.glow }]} />
              <Image
                source={getPatenteBadge(nomeAtual, sublevelAtual)}
                style={styles.heroBadgeImage}
                resizeMode="contain"
              />
            </Animated.View>

            <ThemedText style={styles.heroNome}>{nomeAtual}{sublevelLabelAtual}</ThemedText>
            <ThemedText style={styles.heroStats}>{totalXP} XP total • {streakDias} dias de streak</ThemedText>

            <View style={styles.heroProgressTrack}>
              <LinearGradient
                colors={['rgba(255,255,255,0.55)', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.heroProgressFill, { width: `${patente.progressoPercent}%` }]}
              />
            </View>
            {patente.proxNivel ? (
              <ThemedText type="small" style={styles.heroProgressLabel}>
                {patente.proxNivel.minDias - patente.diasEfetivos} dias para {patente.proxNivel.nome}
                {patente.proxNivel.sublevel ? ` ${SUBLEVEL_LABEL[patente.proxNivel.sublevel - 1]}` : ''}
              </ThemedText>
            ) : (
              <ThemedText type="small" style={styles.heroProgressLabel}>Nível máximo atingido 🏆</ThemedText>
            )}
          </LinearGradient>

          {GRUPOS.map((grupo, idx) => {
            const isGrupoAtual = grupo.nome === nomeAtual;
            const isGrupoPassado = NIVEIS.find((n) => n.nome === grupo.nome)!.minDias <= patente.diasEfetivos;
            const tier = TIER_THEME[grupo.nome];

            const conteudo = (
              <>
                <View style={styles.grupoHeaderRow}>
                  <ThemedText
                    type="smallBold"
                    style={isGrupoAtual ? styles.grupoNomeOnColor : undefined}
                    themeColor={isGrupoAtual ? undefined : isGrupoPassado ? 'text' : 'textSecondary'}>
                    {grupo.nome.toUpperCase()}
                  </ThemedText>
                  {isGrupoPassado && !isGrupoAtual && (
                    <Ionicons name="checkmark-circle" size={16} color={tier.colors[0]} />
                  )}
                </View>

                <View style={styles.badgeRow}>
                  {grupo.niveis.map((nivel, i) => {
                    const atingido = patente.diasEfetivos >= nivel.minDias;
                    const ehAtual = isGrupoAtual && sublevelAtual === nivel.sublevel;
                    const badge = getPatenteBadge(grupo.nome, nivel.sublevel);
                    return (
                      <View key={i} style={styles.badgeChipCol}>
                        <Animated.View
                          style={[
                            styles.badgeChip,
                            !atingido && styles.badgeChipLocked,
                            ehAtual && [styles.badgeChipAtual, { borderColor: tier.glow, shadowColor: tier.glow }],
                            ehAtual && badgeGlowStyle,
                          ]}>
                          <Image source={badge} style={styles.badgeChipImage} resizeMode="contain" />
                          {!atingido && (
                            <View style={styles.lockOverlay}>
                              <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.9)" />
                            </View>
                          )}
                        </Animated.View>
                        {nivel.sublevel !== null && (
                          <ThemedText
                            type="small"
                            style={isGrupoAtual ? styles.subLabelOnColor : undefined}
                            themeColor={isGrupoAtual ? undefined : atingido ? 'text' : 'textSecondary'}>
                            {SUBLEVEL_LABEL[i]}
                          </ThemedText>
                        )}
                      </View>
                    );
                  })}
                </View>

                <ThemedText
                  type="small"
                  style={isGrupoAtual ? styles.grupoDiasOnColor : undefined}
                  themeColor={isGrupoAtual ? undefined : 'textSecondary'}>
                  {grupo.niveis[0].sublevel !== null
                    ? `${grupo.niveis[0].minDias}+ dias consecutivos`
                    : `${grupo.niveis[0].minDias}+ dias — sem limite`}
                </ThemedText>
              </>
            );

            return (
              <Animated.View key={grupo.nome} entering={FadeInDown.delay(idx * 70).duration(420)}>
                {isGrupoAtual ? (
                  <LinearGradient
                    colors={tier.colors}
                    start={{ x: 0.1, y: 0 }}
                    end={{ x: 0.9, y: 1 }}
                    style={[styles.grupoCard, styles.grupoAtualCard, { shadowColor: tier.glow }]}>
                    {conteudo}
                  </LinearGradient>
                ) : (
                  <ThemedView
                    type="backgroundElement"
                    style={[styles.grupoCard, !isGrupoPassado && styles.grupoBloqueado]}>
                    <View
                      style={[
                        styles.grupoAccentBar,
                        { backgroundColor: isGrupoPassado ? tier.colors[0] : theme.backgroundSelected },
                      ]}
                    />
                    {conteudo}
                  </ThemedView>
                )}
              </Animated.View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  content: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 40 },

  heroCard: {
    borderRadius: Spacing.four,
    padding: Spacing.four,
    alignItems: 'center',
    marginBottom: Spacing.two,
    overflow: 'hidden',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroShimmerClip: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', borderRadius: Spacing.four },
  heroShimmer: {
    position: 'absolute',
    top: -100,
    left: -SCREEN_WIDTH,
    width: SCREEN_WIDTH * 0.5,
    height: '250%',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
  },
  heroBadgeWrap: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  heroBadgeGlow: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    opacity: 0.28,
  },
  heroBadgeImage: {
    width: 128,
    height: 128,
  },
  heroNome: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroStats: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginBottom: Spacing.two,
  },
  heroProgressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  heroProgressLabel: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: Spacing.two,
  },

  grupoCard: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  grupoAtualCard: {
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  grupoBloqueado: {
    opacity: 0.55,
  },
  grupoAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: Spacing.two,
    borderBottomLeftRadius: Spacing.two,
  },
  grupoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grupoNomeOnColor: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  grupoDiasOnColor: {
    color: 'rgba(255,255,255,0.8)',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  badgeChipCol: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  badgeChip: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  badgeChipLocked: {
    opacity: 0.4,
  },
  badgeChipAtual: {
    borderWidth: 2,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  badgeChipImage: {
    width: 44,
    height: 44,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 28,
  },
  subLabelOnColor: {
    color: 'rgba(255,255,255,0.85)',
  },
});
