import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CONQUISTAS_SECRETAS } from '@/constants/conquistas-secretas';
import { FREE_MAX_RANK_INDEX, NIVEIS, NivelPatente } from '@/constants/gamification';
import { getPatenteBadge } from '@/constants/patente-badges';
import { PATENTE_THEMES } from '@/constants/patente-themes';
import { Accent, Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';

const SUBLEVEL_LABEL = ['I', 'II', 'III'];

// Agrupa NIVEIS por patente para a trilha vertical.
const GRUPOS = NIVEIS.reduce<{ nome: string; niveis: NivelPatente[]; minIdx: number }[]>((acc, n, i) => {
  const ultimo = acc[acc.length - 1];
  if (ultimo && ultimo.nome === n.nome) {
    ultimo.niveis.push(n);
  } else {
    acc.push({ nome: n.nome, niveis: [n], minIdx: i });
  }
  return acc;
}, []);

function faixaDias(niveis: NivelPatente[]): string {
  const primeiro = niveis[0];
  const ultimo = niveis[niveis.length - 1];
  if (primeiro.sublevel === null) return `${primeiro.minDias}+ dias`;
  return `${primeiro.minDias}–${ultimo.minDias} dias`;
}

export default function PatentesScreen() {
  const { dados, derivado, carregando } = useAppData();

  const ember = useSharedValue(0.5);
  useEffect(() => {
    ember.value = withRepeat(withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [ember]);
  const emberStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + ember.value * 0.5,
    transform: [{ scale: 0.96 + ember.value * 0.08 }],
  }));

  const secretasDesbloqueadas = useMemo(() => {
    if (!dados || !derivado) return new Set<string>();
    const ctx = { dados, streakDias: derivado.streakDias, totalXP: derivado.totalXP };
    return new Set(CONQUISTAS_SECRETAS.filter((c) => c.condicao(ctx)).map((c) => c.id));
  }, [dados, derivado]);

  if (carregando || !dados || !derivado) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  const { patente, totalXP, streakDias } = derivado;
  const isPro = dados.isPro;
  const dias = patente.diasEfetivos;
  const nomeAtual = patente.nivel.nome;
  const sublevelAtual = patente.nivel.sublevel;
  const sublevelLabelAtual = sublevelAtual ? ` ${SUBLEVEL_LABEL[sublevelAtual - 1]}` : '';
  const auraCor = (PATENTE_THEMES[dados.patenteTheme] ?? PATENTE_THEMES.ouro).cor;

  const proxLabel = patente.proxNivel
    ? `${patente.proxNivel.nome}${patente.proxNivel.sublevel ? ` ${SUBLEVEL_LABEL[patente.proxNivel.sublevel - 1]}` : ''}`
    : null;
  const faltamDias = patente.proxNivel ? Math.max(0, patente.proxNivel.minDias - dias) : 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.eyebrow}>JORNADA DO GUERREIRO</Text>
          <ThemedText type="title" style={styles.titulo}>Patentes</ThemedText>

          {/* Hero: patente atual */}
          <View style={styles.hero}>
            <View style={[styles.heroGlow, { backgroundColor: auraCor }]} />
            <View style={styles.heroBadgeWrap}>
              <View style={[styles.heroRing, { borderColor: auraCor + '5A' }]} />
              <Image source={getPatenteBadge(nomeAtual, sublevelAtual)} style={styles.heroBadge} resizeMode="contain" />
            </View>
            <ThemedText type="subtitle" style={styles.heroNome}>{nomeAtual}{sublevelLabelAtual}</ThemedText>
            <Text style={styles.heroStats}>{totalXP} XP · {streakDias} dias de streak</Text>
            <View style={styles.heroTrack}>
              <LinearGradient
                colors={[Accent.brasa, Accent.brasaClara]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.heroFill, { width: `${patente.progressoPercent}%` }]}
              />
            </View>
            <Text style={styles.heroProx}>
              {proxLabel
                ? `${faltamDias} dias para ${proxLabel}`
                : patente.bloqueadoPorPlano
                  ? 'Teto do Free — assine o PRO para continuar'
                  : 'Nível máximo atingido'}
            </Text>
          </View>

          {/* Trilha vertical */}
          <View style={styles.trilha}>
            {GRUPOS.map((grupo, gi) => {
              const primeiro = grupo.niveis[0];
              const ultimo = grupo.niveis[grupo.niveis.length - 1];
              const bloqueado = !isPro && grupo.minIdx > FREE_MAX_RANK_INDEX;
              const alcancado = !bloqueado && primeiro.minDias <= dias;
              const totalmente = !bloqueado && ultimo.minDias <= dias && grupo.nome !== nomeAtual;
              const isAtual = grupo.nome === nomeAtual;
              const aboveAcesa = alcancado || isAtual;
              const belowAcesa = totalmente;
              const primeiraLinha = gi === 0;

              const linha = (
                <>
                  {/* Conector vertical + nó */}
                  <View style={styles.conector}>
                    <View
                      style={[
                        styles.segmento,
                        primeiraLinha
                          ? styles.segmentoFade
                          : aboveAcesa
                            ? styles.segmentoAceso
                            : styles.segmentoFrio,
                      ]}
                    />
                    {isAtual ? (
                      <Animated.View style={[styles.noAtual, emberStyle]} />
                    ) : (
                      <View style={[styles.no, alcancado ? styles.noAceso : styles.noFrio]} />
                    )}
                    <View style={[styles.segmento, belowAcesa ? styles.segmentoAceso : styles.segmentoFrio]} />
                  </View>

                  {/* Badge */}
                  <Image
                    source={getPatenteBadge(grupo.nome, isAtual ? sublevelAtual : primeiro.sublevel)}
                    style={[styles.tierBadge, !alcancado && styles.tierBadgeLocked]}
                    resizeMode="contain"
                  />

                  {/* Textos */}
                  <View style={styles.tierTextos}>
                    <View style={styles.tierNomeRow}>
                      <Text style={[styles.tierNome, isAtual && styles.tierNomeAtual, !alcancado && styles.tierNomeLocked]}>
                        {grupo.nome}
                      </Text>
                      {isAtual && <Text style={styles.voceAqui}> · VOCÊ ESTÁ AQUI</Text>}
                    </View>
                    <Text style={[styles.tierFaixa, isAtual && styles.tierFaixaAtual]}>
                      {faixaDias(grupo.niveis)}
                      {totalmente ? ' · concluída' : isAtual ? ' · em forja' : ''}
                    </Text>
                  </View>

                  {/* Pips de sublevel (só em tiers alcançados com sublevels) */}
                  {alcancado && primeiro.sublevel !== null && (
                    <View style={styles.pips}>
                      {grupo.niveis.map((nivel) => {
                        const feito = dias >= nivel.minDias;
                        const atualPip = isAtual && sublevelAtual === nivel.sublevel;
                        return (
                          <View
                            key={nivel.sublevel}
                            style={[
                              styles.pip,
                              atualPip ? styles.pipAtual : feito ? styles.pipFeito : styles.pipFuturo,
                            ]}
                          />
                        );
                      })}
                    </View>
                  )}
                </>
              );

              return (
                <View key={grupo.nome}>
                  {isAtual ? (
                    <View style={styles.rowAtual}>{linha}</View>
                  ) : (
                    <View style={[styles.row, bloqueado ? styles.rowBloqueado : totalmente ? null : styles.rowFuturo]}>
                      {linha}
                    </View>
                  )}

                  {/* Marco PRO logo após o teto do Free */}
                  {grupo.minIdx === FREE_MAX_RANK_INDEX && (
                    <LinearGradient
                      colors={['rgba(232,180,88,0.08)', 'rgba(232,180,88,0.02)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.gatePro}>
                      <Ionicons name="star" size={18} color={Accent.bronze} />
                      <View style={styles.gateTextos}>
                        <Text style={styles.gateTitulo}>Forja avançada · PRO</Text>
                        <Text style={styles.gateTexto}>
                          Do Guardião ao Imortal — 6 patentes e 351 dias de jornada.
                        </Text>
                      </View>
                    </LinearGradient>
                  )}
                </View>
              );
            })}
          </View>

          {/* Conquistas secretas */}
          <View style={styles.secretasHeader}>
            <Text style={styles.eyebrow}>CONQUISTAS SECRETAS</Text>
            <Text style={styles.secretasContagem}>
              {secretasDesbloqueadas.size}/{CONQUISTAS_SECRETAS.length}
            </Text>
          </View>
          <View style={styles.secretasGrid}>
            {CONQUISTAS_SECRETAS.map((c) => {
              const desbloqueada = secretasDesbloqueadas.has(c.id);
              return (
                <View key={c.id} style={[styles.secretaCard, !desbloqueada && styles.secretaCardBloqueada]}>
                  <View style={[styles.secretaIconeWrap, desbloqueada && styles.secretaIconeWrapAceso]}>
                    <Ionicons
                      name={(desbloqueada ? c.icone : 'lock-closed') as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={desbloqueada ? Accent.bronze : Accent.tabInativa}
                    />
                  </View>
                  <Text style={[styles.secretaNome, !desbloqueada && styles.secretaNomeBloqueada]}>
                    {desbloqueada ? c.nome : '???'}
                  </Text>
                  <Text style={styles.secretaDescricao} numberOfLines={3}>
                    {desbloqueada ? c.descricao : 'Conquista secreta — continue para descobrir.'}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.six },

  eyebrow: { fontFamily: Fonts.display.bold, fontSize: 10, letterSpacing: 3, color: 'rgba(232,180,88,0.7)' },
  titulo: { marginTop: 6 },

  hero: { alignItems: 'center', paddingVertical: 22 },
  heroGlow: {
    position: 'absolute',
    top: 16,
    width: 300,
    height: 240,
    borderRadius: 150,
    opacity: 0.1,
  },
  heroBadgeWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  heroRing: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 79, borderWidth: 1 },
  heroBadge: {
    width: 140,
    height: 140,
    shadowColor: Accent.brasa,
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
  },
  heroNome: { marginTop: 14 },
  heroStats: { fontFamily: Fonts.body.medium, fontSize: 12.5, color: 'rgba(244,239,233,0.5)', marginTop: 4 },
  heroTrack: {
    width: 240,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 14,
  },
  heroFill: { height: '100%', borderRadius: 3 },
  heroProx: { fontFamily: Fonts.body.semibold, fontSize: 11.5, color: 'rgba(232,180,88,0.75)', marginTop: 8 },

  trilha: { marginTop: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: 13 },
  rowFuturo: { opacity: 0.5 },
  rowBloqueado: { opacity: 0.4 },
  rowAtual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 15,
    paddingHorizontal: Radius.card,
    marginHorizontal: -Radius.card,
    marginVertical: 2,
    backgroundColor: 'rgba(255,107,43,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,61,0.4)',
    borderRadius: Radius.card,
  },

  conector: { alignItems: 'center', alignSelf: 'stretch' },
  segmento: { width: 2, flex: 1 },
  segmentoAceso: { backgroundColor: Accent.brasa },
  segmentoFrio: { backgroundColor: 'rgba(255,255,255,0.1)' },
  segmentoFade: { backgroundColor: 'transparent' },
  no: { width: 10, height: 10, borderRadius: 5, marginVertical: 3 },
  noAceso: { backgroundColor: Accent.brasa },
  noFrio: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  noAtual: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginVertical: 3,
    backgroundColor: Accent.brasaClara,
    shadowColor: Accent.brasa,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },

  tierBadge: { width: 48, height: 48 },
  tierBadgeLocked: { opacity: 0.85 },

  tierTextos: { flex: 1 },
  tierNomeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  tierNome: { fontFamily: Fonts.body.bold, fontSize: 14.5, color: Colors.text },
  tierNomeAtual: { color: '#FFC49A', fontFamily: Fonts.body.extrabold, fontSize: 15 },
  tierNomeLocked: { color: 'rgba(244,239,233,0.75)' },
  voceAqui: { fontFamily: Fonts.display.bold, fontSize: 10, letterSpacing: 1, color: '#FF8A3D' },
  tierFaixa: { fontFamily: Fonts.body.medium, fontSize: 11, color: 'rgba(244,239,233,0.45)', marginTop: 2 },
  tierFaixaAtual: { color: 'rgba(244,239,233,0.55)' },

  pips: { flexDirection: 'row', gap: 5 },
  pip: { width: 8, height: 8, borderRadius: 4 },
  pipFeito: { backgroundColor: Accent.bronze },
  pipAtual: {
    backgroundColor: Accent.brasaClara,
    shadowColor: Accent.brasa,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  pipFuturo: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },

  gatePro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    paddingHorizontal: Radius.card,
    marginVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,180,88,0.3)',
  },
  gateTextos: { flex: 1 },
  gateTitulo: { fontFamily: Fonts.body.bold, fontSize: 12.5, color: Accent.bronze },
  gateTexto: { fontFamily: Fonts.body.medium, fontSize: 11, lineHeight: 16, color: 'rgba(244,239,233,0.5)', marginTop: 2 },

  secretasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.five,
    marginBottom: Spacing.two,
  },
  secretasContagem: {
    fontFamily: Fonts.data.bold,
    fontSize: 12,
    color: 'rgba(244,239,233,0.5)',
  },
  secretasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  secretaCard: {
    width: '47.5%',
    padding: Spacing.two + 4,
    gap: 6,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: 'rgba(232,180,88,0.28)',
    borderRadius: Radius.card,
  },
  secretaCardBloqueada: {
    borderColor: Colors.border,
    opacity: 0.6,
  },
  secretaIconeWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  secretaIconeWrapAceso: { backgroundColor: Accent.bronzeFundo },
  secretaNome: { fontFamily: Fonts.body.bold, fontSize: 13, color: Colors.text },
  secretaNomeBloqueada: { color: 'rgba(244,239,233,0.5)' },
  secretaDescricao: {
    fontFamily: Fonts.body.medium,
    fontSize: 11,
    lineHeight: 15.5,
    color: 'rgba(244,239,233,0.45)',
  },
});
