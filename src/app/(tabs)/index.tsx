import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientGlow } from '@/components/ambient-glow';
import { EconomiaCard } from '@/components/economia-card';
import { HorarioRiscoCard } from '@/components/horario-risco-card';
import { MarcoProximoCard } from '@/components/marco-proximo-card';
import { ProgressRing } from '@/components/progress-ring';
import { SosButton } from '@/components/sos-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WeekRuler } from '@/components/week-ruler';
import { getFraseDoDia, getFraseDoDiaIndex } from '@/constants/frases';
import { getPatenteBadge } from '@/constants/patente-badges';
import { Accent, Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { useRankUpCelebration } from '@/hooks/useRankUpCelebration';
import { calcEconomia } from '@/utils/economia';
import { calcTaxaResistencia } from '@/utils/insights';
import { calcMarcoProximo } from '@/utils/marco';
import { calcularSemana, formatarCabecalhoData } from '@/utils/datas';

const SUBLEVEL_LABEL = ['I', 'II', 'III'];
const HOME_GLOW = [
  { color: '#FF6B2B', top: '-6%' as const, left: '92%' as const, size: 420, opacity: 0.1 },
];

export default function HomeScreen() {
  const { t } = useTranslation(['home', 'common']);
  const { dados, derivado, perfil, carregando } = useAppData();
  const elapsed = useElapsedTime(dados?.streakStartDate ?? null);
  useRankUpCelebration(derivado?.patente, derivado?.streakDias ?? 0);

  if (carregando || !dados || !derivado) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>{t('common:loading')}</ThemedText>
      </ThemedView>
    );
  }

  const fraseIdx = getFraseDoDiaIndex();
  const fraseFallback = getFraseDoDia();
  const fraseTexto = t(`quotes.${fraseIdx}.texto`, { defaultValue: fraseFallback.texto });
  const fraseAutor = t(`quotes.${fraseIdx}.autor`, { defaultValue: fraseFallback.autor });
  const { totalXP, patente } = derivado;
  const sublevelLabel = patente.nivel.sublevel ? ` ${SUBLEVEL_LABEL[patente.nivel.sublevel - 1]}` : '';
  const patenteBadge = getPatenteBadge(patente.nivel.nome, patente.nivel.sublevel);
  const patenteNomeTraduzido = t(`common:ranks.${patente.nivel.nome}`);
  const patenteLabelCaps = `${patenteNomeTraduzido}${sublevelLabel}`.toUpperCase();

  const proxLabel = patente.proxNivel
    ? `${t(`common:ranks.${patente.proxNivel.nome}`)}${patente.proxNivel.sublevel ? ` ${SUBLEVEL_LABEL[patente.proxNivel.sublevel - 1]}` : ''}`
    : null;
  const faltamDias = patente.proxNivel ? Math.max(0, patente.proxNivel.minDias - patente.diasEfetivos) : 0;

  const semana = calcularSemana(dados.streakStartDate, dados.relapseDates);
  const hojeIdx = [2, 3, 4, 5, 6, 0, 1].indexOf(new Date().getDay());

  const taxa = calcTaxaResistencia(dados.entries);
  const economia = calcEconomia(dados);
  const marcoProximo = calcMarcoProximo(perfil?.marcoEsperado ?? null, derivado.streakDias, derivado.maiorStreak);

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={HOME_GLOW} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerData}>{t('header.eyebrow', { data: formatarCabecalhoData() })}</Text>
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
                <Text style={styles.heroLabel}>{t('hero.daysLabel')}</Text>
                <Text style={styles.heroHoras}>
                  + {elapsed.horas}h {String(elapsed.minutos).padStart(2, '0')}m {t('hero.hoursSuffix')}
                </Text>
              </View>
            </ProgressRing>
            <Text style={styles.heroProx}>
              {proxLabel ? (
                <>
                  <Text style={styles.heroProxDias}>{t('hero.daysToNextBold', { dias: faltamDias })}</Text>{' '}
                  {t('hero.daysToNextRest', { proximo: proxLabel, xp: totalXP })}
                </>
              ) : patente.bloqueadoPorPlano ? (
                <>{t('hero.freeCap', { xp: totalXP })}</>
              ) : (
                <>{t('hero.maxLevel', { xp: totalXP })}</>
              )}
            </Text>
          </View>

          {/* Economia na streak atual */}
          <EconomiaCard dinheiro={economia.dinheiro} minutos={economia.minutos} moedaCodigo={dados.moedaCodigo} />

          {/* Horário de risco: bloco de 2h com mais gatilhos/recaídas registrados */}
          <HorarioRiscoCard entries={dados.entries} />

          {/* Marco esperado (onboarding) prestes a ser alcançado */}
          {marcoProximo && (
            <MarcoProximoCard marco={marcoProximo.marco} diasRestantes={marcoProximo.diasRestantes} />
          )}

          {/* Régua da semana */}
          <WeekRuler cumpridos={semana} hoje={hojeIdx} />

          {/* Grid: Batalhas + Frase do dia */}
          <View style={styles.grid}>
            <Pressable style={styles.gridCard} onPress={() => router.push('/(tabs)/diario' as Href)}>
              <Text style={styles.cardLabel}>{t('grid.battlesLabel')}</Text>
              <Text style={styles.batalhasNum}>
                {taxa.resistidas}
                <Text style={styles.batalhasTotal}> /{dados.entries.length}</Text>
              </Text>
              <Text style={styles.batalhasTaxa}>{t('grid.resistancePercent', { percent: taxa.percentResistencia })}</Text>
            </Pressable>

            <View style={[styles.gridCard, styles.fraseCard]}>
              <Text style={styles.cardLabel}>{t('grid.quoteLabel')}</Text>
              <ThemedText type="quote" style={styles.fraseTexto} numberOfLines={3}>
                &ldquo;{fraseTexto}&rdquo;
              </ThemedText>
              <Text style={styles.fraseAutor}>{fraseAutor}</Text>
            </View>
          </View>
        </ScrollView>

        {/* SOS fixo acima da tab bar, sobreposto ao scroll com fade */}
        <LinearGradient
          colors={['rgba(13,11,9,0)', Colors.background]}
          locations={[0, 0.55]}
          style={styles.sosWrap}
          pointerEvents="box-none">
          <SosButton onPress={() => router.push('/panico' as Href)} />
        </LinearGradient>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 22,
    paddingTop: Spacing.three,
    paddingBottom: 130,
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

  sosWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: Spacing.two,
    paddingTop: Spacing.four,
  },
});
