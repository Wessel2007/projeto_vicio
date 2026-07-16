import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CountdownBloco } from '@/components/countdown-bloco';
import { GlassCard } from '@/components/glass-card';
import { StreakCalendar } from '@/components/streak-calendar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { useElapsedTime } from '@/hooks/useElapsedTime';

function Metrica({ label, valor, cor }: { label: string; valor: string; cor?: string }) {
  return (
    <View style={styles.metrica}>
      <ThemedText type="cardTitle" style={cor ? { color: cor } : undefined}>{valor}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
    </View>
  );
}

export default function StreakDetalheScreen() {
  const { t } = useTranslation('streakDetalhe');
  const { dados, derivado, carregando } = useAppData();
  const elapsed = useElapsedTime(dados?.streakStartDate ?? null);

  if (carregando || !dados || !derivado) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>{t('common:loading')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <GlassCard style={styles.countdownCard}>
            <ThemedText type="eyebrow" themeColor="textSecondary">{t('countdown.eyebrow')}</ThemedText>
            <View style={styles.blocosRow}>
              <CountdownBloco valor={elapsed.dias} label={t('countdown.days')} size="large" />
              <CountdownBloco valor={elapsed.horas} label={t('countdown.hours')} size="large" />
              <CountdownBloco valor={elapsed.minutos} label={t('countdown.minutes')} size="large" />
              <CountdownBloco valor={elapsed.segundos} label={t('countdown.seconds')} size="large" />
            </View>
          </GlassCard>

          <GlassCard style={styles.card}>
            <View style={styles.metricasRow}>
              <Metrica label={t('metrics.currentStreak')} valor={String(derivado.streakDias)} cor={Accent.success} />
              <Metrica label={t('metrics.longestStreak')} valor={String(derivado.maiorStreak)} cor={Accent.orange} />
              <Metrica label={t('metrics.relapses')} valor={String(dados.relapseDates.length)} cor={Accent.dangerText} />
            </View>
          </GlassCard>

          <StreakCalendar
            trackingStartDate={dados.trackingStartDate ?? dados.streakStartDate}
            relapseDates={dados.relapseDates}
          />
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
  countdownCard: { padding: Spacing.three, gap: Spacing.three, alignItems: 'center' },
  blocosRow: { flexDirection: 'row', gap: Spacing.three },
  card: { padding: Spacing.three, gap: Spacing.two },
  metricasRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metrica: { alignItems: 'center', gap: 2 },
});
