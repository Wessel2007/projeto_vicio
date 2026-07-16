import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { GradientButton } from '@/components/gradient-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { calcComparativoResistencia, calcTaxaResistencia } from '@/utils/insights';
import { TriggerEntry } from '@/types';

function entradasNosUltimosDias(entries: TriggerEntry[], dias: number): TriggerEntry[] {
  const limite = Date.now() - dias * 24 * 60 * 60 * 1000;
  return entries.filter((e) => new Date(e.date).getTime() >= limite);
}

function Metrica({ label, valor, cor }: { label: string; valor: string; cor?: string }) {
  return (
    <View style={styles.metrica}>
      <ThemedText type="cardTitle" style={cor ? { color: cor } : undefined}>{valor}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
    </View>
  );
}

export default function RelatorioScreen() {
  const { t } = useTranslation('relatorio');
  const { dados, derivado, carregando } = useAppData();

  if (carregando || !dados || !derivado) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>{t('common:loading')}</ThemedText>
      </ThemedView>
    );
  }

  if (!dados.isPro) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.bloqueado}>
            <Ionicons name="lock-closed" size={32} color={Accent.gold} />
            <ThemedText type="subtitle" style={{ marginTop: Spacing.one }}>{t('locked.title')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.bloqueadoTexto}>
              {t('locked.text')}
            </ThemedText>
            <GradientButton label={t('common:buttons.back')} onPress={() => router.back()} style={styles.bloqueadoBtn} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const entradasSemana = entradasNosUltimosDias(dados.entries, 7);
  const entradasMes = entradasNosUltimosDias(dados.entries, 30);
  const taxaSemana = calcTaxaResistencia(entradasSemana);
  const taxaMes = calcTaxaResistencia(entradasMes);
  const comparativo = calcComparativoResistencia(dados.entries, 30);
  const anteriorTotal = comparativo.anterior.resistidas + comparativo.anterior.recaidas;
  const variacao = comparativo.atual.percentResistencia - comparativo.anterior.percentResistencia;
  const patenteNome = t(`common:ranks.${derivado.patente.nivel.nome}`);
  const patenteSublevel = derivado.patente.nivel.sublevel
    ? ` ${['I', 'II', 'III'][derivado.patente.nivel.sublevel - 1]}`
    : '';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">{t('title')}</ThemedText>

          <GlassCard style={styles.card}>
            <ThemedText type="eyebrow" themeColor="textSecondary">{t('last7Days')}</ThemedText>
            <View style={styles.metricasRow}>
              <Metrica label={t('metrics.entries')} valor={String(entradasSemana.length)} />
              <Metrica label={t('metrics.resisted')} valor={String(taxaSemana.resistidas)} cor={Accent.success} />
              <Metrica label={t('metrics.relapsed')} valor={String(taxaSemana.recaidas)} cor={Accent.dangerText} />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {t('resistanceRate', { percent: taxaSemana.percentResistencia })}
            </ThemedText>
          </GlassCard>

          <GlassCard style={styles.card}>
            <ThemedText type="eyebrow" themeColor="textSecondary">{t('last30Days')}</ThemedText>
            <View style={styles.metricasRow}>
              <Metrica label={t('metrics.entries')} valor={String(entradasMes.length)} />
              <Metrica label={t('metrics.resisted')} valor={String(taxaMes.resistidas)} cor={Accent.success} />
              <Metrica label={t('metrics.relapsed')} valor={String(taxaMes.recaidas)} cor={Accent.dangerText} />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              {t('resistanceRate', { percent: taxaMes.percentResistencia })}
            </ThemedText>
          </GlassCard>

          <GlassCard style={styles.card}>
            <ThemedText type="eyebrow" themeColor="textSecondary">{t('comparison')}</ThemedText>
            {anteriorTotal > 0 ? (
              <View style={styles.metricasRow}>
                <Metrica label={t('metrics.thisWindow')} valor={`${comparativo.atual.percentResistencia}%`} />
                <Metrica label={t('metrics.previousWindow')} valor={`${comparativo.anterior.percentResistencia}%`} />
                <Metrica
                  label={t('metrics.variation')}
                  valor={`${variacao >= 0 ? '+' : ''}${variacao}%`}
                  cor={variacao >= 0 ? Accent.success : Accent.dangerText}
                />
              </View>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                {t('comparisonEmpty')}
              </ThemedText>
            )}
          </GlassCard>

          <GlassCard style={styles.card}>
            <ThemedText type="eyebrow" themeColor="textSecondary">{t('overallProgress')}</ThemedText>
            <View style={styles.metricasRow}>
              <Metrica label={t('metrics.streakDays')} valor={String(derivado.streakDias)} cor={Accent.orange} />
              <Metrica label={t('metrics.totalXp')} valor={String(derivado.totalXP)} />
            </View>
            <ThemedText type="default">
              {t('currentRank', { patente: `${patenteNome}${patenteSublevel}` })}
            </ThemedText>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: 40 },
  card: { padding: Spacing.three, gap: Spacing.two },
  metricasRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metrica: { alignItems: 'center', gap: 2 },
  bloqueado: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  bloqueadoTexto: { textAlign: 'center', lineHeight: 22 },
  bloqueadoBtn: { marginTop: Spacing.three, alignSelf: 'stretch' },
});
