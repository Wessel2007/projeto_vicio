import { router, type Href } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientGlow } from '@/components/ambient-glow';
import { EconomiaCard } from '@/components/economia-card';
import { ProgressRing } from '@/components/progress-ring';
import { SosButton } from '@/components/sos-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WeekRuler } from '@/components/week-ruler';
import { getFraseDoDia } from '@/constants/frases';
import { getPatenteBadge } from '@/constants/patente-badges';
import { Accent, Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { useRankUpCelebration } from '@/hooks/useRankUpCelebration';
import { calcEconomia } from '@/utils/economia';
import { calcTaxaResistencia } from '@/utils/insights';
import { calcularSemana, formatarCabecalhoData } from '@/utils/datas';

const SUBLEVEL_LABEL = ['I', 'II', 'III'];
const HOME_GLOW = [
  { color: '#FF6B2B', top: '-6%' as const, left: '92%' as const, size: 420, opacity: 0.1 },
];

export default function HomeScreen() {
  const { dados, derivado, carregando } = useAppData();
  const elapsed = useElapsedTime(dados?.streakStartDate ?? null);
  useRankUpCelebration(derivado?.patente, derivado?.streakDias ?? 0);

  if (carregando || !dados || !derivado) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  const frase = getFraseDoDia();
  const { totalXP, patente } = derivado;
  const sublevelLabel = patente.nivel.sublevel ? ` ${SUBLEVEL_LABEL[patente.nivel.sublevel - 1]}` : '';
  const patenteBadge = getPatenteBadge(patente.nivel.nome, patente.nivel.sublevel);
  const patenteLabelCaps = `${patente.nivel.nome}${sublevelLabel}`.toUpperCase();

  const proxLabel = patente.proxNivel
    ? `${patente.proxNivel.nome}${patente.proxNivel.sublevel ? ` ${SUBLEVEL_LABEL[patente.proxNivel.sublevel - 1]}` : ''}`
    : null;
  const faltamDias = patente.proxNivel ? Math.max(0, patente.proxNivel.minDias - patente.diasEfetivos) : 0;

  const semana = calcularSemana(dados.streakStartDate, dados.relapseDates);
  const hojeIdx = [2, 3, 4, 5, 6, 0, 1].indexOf(new Date().getDay());

  const taxa = calcTaxaResistencia(dados.entries);
  const economia = calcEconomia(dados);

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={HOME_GLOW} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerData}>SUA FORJA · {formatarCabecalhoData()}</Text>
            <View style={styles.patenteChip}>
              <Image source={patenteBadge} style={styles.patenteChipBadge} resizeMode="contain" />
              <Text style={styles.patenteChipTexto}>{patenteLabelCaps}</Text>
            </View>
          </View>

          {/* Hero: anel de brasa */}
          <View style={styles.heroWrap}>
            <ProgressRing size={236} progress={patente.progressoPercent / 100}>
              <View style={styles.heroCenter}>
                <ThemedText type="heroNumber">{elapsed.dias}</ThemedText>
                <Text style={styles.heroLabel}>DIAS NA FORJA</Text>
                <Text style={styles.heroHoras}>
                  + {elapsed.horas}h {String(elapsed.minutos).padStart(2, '0')}m sem recair
                </Text>
              </View>
            </ProgressRing>
            <Text style={styles.heroProx}>
              {proxLabel ? (
                <>
                  <Text style={styles.heroProxDias}>{faltamDias} dias</Text> para {proxLabel} · {totalXP} XP
                </>
              ) : patente.bloqueadoPorPlano ? (
                <>Teto do Free · assine o PRO para continuar · {totalXP} XP</>
              ) : (
                <>Nível máximo · {totalXP} XP</>
              )}
            </Text>
          </View>

          {/* Economia na streak atual */}
          <EconomiaCard dinheiro={economia.dinheiro} minutos={economia.minutos} moedaCodigo={dados.moedaCodigo} />

          {/* Régua da semana */}
          <WeekRuler cumpridos={semana} hoje={hojeIdx} />

          {/* Grid: Batalhas + Frase do dia */}
          <View style={styles.grid}>
            <Pressable style={styles.gridCard} onPress={() => router.push('/(tabs)/diario' as Href)}>
              <Text style={styles.cardLabel}>BATALHAS</Text>
              <Text style={styles.batalhasNum}>
                {taxa.resistidas}
                <Text style={styles.batalhasTotal}> /{dados.entries.length}</Text>
              </Text>
              <Text style={styles.batalhasTaxa}>{taxa.percentResistencia}% de resistência</Text>
            </Pressable>

            <View style={[styles.gridCard, styles.fraseCard]}>
              <Text style={styles.cardLabel}>FRASE DO DIA</Text>
              <ThemedText type="quote" style={styles.fraseTexto} numberOfLines={3}>
                &ldquo;{frase.texto}&rdquo;
              </ThemedText>
              <Text style={styles.fraseAutor}>{frase.autor}</Text>
            </View>
          </View>
        </View>

        {/* SOS fixo acima da tab bar */}
        <View style={styles.sosWrap}>
          <SosButton onPress={() => router.push('/panico' as Href)} />
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
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerData: {
    fontFamily: Fonts.data.semibold,
    fontSize: 11,
    letterSpacing: 2.5,
    color: 'rgba(244,239,233,0.45)',
  },
  patenteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingRight: 11,
    paddingLeft: 5,
    borderWidth: 1,
    borderColor: Accent.bronzeBorda,
    borderRadius: Radius.pill,
    backgroundColor: Accent.bronzeFundo,
  },
  patenteChipBadge: { width: 20, height: 20 },
  patenteChipTexto: {
    fontFamily: Fonts.data.bold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: Accent.bronze,
  },

  heroWrap: { alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two },
  heroCenter: { alignItems: 'center', gap: 2 },
  heroLabel: {
    fontFamily: Fonts.data.semibold,
    fontSize: 10,
    letterSpacing: 3,
    color: 'rgba(244,239,233,0.5)',
  },
  heroHoras: {
    fontFamily: Fonts.mono,
    fontSize: 11.5,
    color: 'rgba(232,180,88,0.75)',
    marginTop: 5,
  },
  heroProx: {
    fontFamily: Fonts.body.semibold,
    fontSize: 12.5,
    color: 'rgba(244,239,233,0.6)',
    textAlign: 'center',
  },
  heroProxDias: { color: Accent.brasaClara, fontFamily: Fonts.body.bold },

  grid: { flexDirection: 'row', gap: 12 },
  gridCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: Radius.card,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    gap: 8,
  },
  fraseCard: { gap: 6, justifyContent: 'center' },
  cardLabel: {
    fontFamily: Fonts.data.semibold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(232,180,88,0.7)',
  },
  batalhasNum: { fontFamily: Fonts.data.bold, fontSize: 30, color: Colors.text },
  batalhasTotal: { fontSize: 14, color: 'rgba(244,239,233,0.4)' },
  batalhasTaxa: { fontFamily: Fonts.body.bold, fontSize: 11, color: Accent.verde },
  fraseTexto: { color: 'rgba(244,239,233,0.75)', fontSize: 11.5, lineHeight: 17 },
  fraseAutor: {
    fontFamily: Fonts.data.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(232,180,88,0.8)',
    textTransform: 'uppercase',
  },

  sosWrap: { paddingHorizontal: 20, paddingBottom: Spacing.two, paddingTop: Spacing.two },
});
