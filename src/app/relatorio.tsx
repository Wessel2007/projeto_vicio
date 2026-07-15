import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
  const { dados, derivado, carregando } = useAppData();

  if (carregando || !dados || !derivado) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  if (!dados.isPro) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.bloqueado}>
            <Ionicons name="lock-closed" size={32} color={Accent.gold} />
            <ThemedText type="subtitle" style={{ marginTop: Spacing.one }}>Relatório PRO</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.bloqueadoTexto}>
              O relatório semanal e mensal de progresso é exclusivo do plano PRO.
            </ThemedText>
            <GradientButton label="Voltar" onPress={() => router.back()} style={styles.bloqueadoBtn} />
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

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">Relatório</ThemedText>

          <GlassCard style={styles.card}>
            <ThemedText type="eyebrow" themeColor="textSecondary">Últimos 7 dias</ThemedText>
            <View style={styles.metricasRow}>
              <Metrica label="registros" valor={String(entradasSemana.length)} />
              <Metrica label="resistidas" valor={String(taxaSemana.resistidas)} cor={Accent.success} />
              <Metrica label="recaídas" valor={String(taxaSemana.recaidas)} cor={Accent.dangerText} />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              Taxa de resistência: {taxaSemana.percentResistencia}%
            </ThemedText>
          </GlassCard>

          <GlassCard style={styles.card}>
            <ThemedText type="eyebrow" themeColor="textSecondary">Últimos 30 dias</ThemedText>
            <View style={styles.metricasRow}>
              <Metrica label="registros" valor={String(entradasMes.length)} />
              <Metrica label="resistidas" valor={String(taxaMes.resistidas)} cor={Accent.success} />
              <Metrica label="recaídas" valor={String(taxaMes.recaidas)} cor={Accent.dangerText} />
            </View>
            <ThemedText type="small" themeColor="textSecondary">
              Taxa de resistência: {taxaMes.percentResistencia}%
            </ThemedText>
          </GlassCard>

          <GlassCard style={styles.card}>
            <ThemedText type="eyebrow" themeColor="textSecondary">Comparativo com os 30 dias anteriores</ThemedText>
            {anteriorTotal > 0 ? (
              <View style={styles.metricasRow}>
                <Metrica label="essa janela" valor={`${comparativo.atual.percentResistencia}%`} />
                <Metrica label="janela anterior" valor={`${comparativo.anterior.percentResistencia}%`} />
                <Metrica
                  label="variação"
                  valor={`${variacao >= 0 ? '+' : ''}${variacao}%`}
                  cor={variacao >= 0 ? Accent.success : Accent.dangerText}
                />
              </View>
            ) : (
              <ThemedText type="small" themeColor="textSecondary">
                Ainda não há registros de antes dos últimos 30 dias para comparar.
              </ThemedText>
            )}
          </GlassCard>

          <GlassCard style={styles.card}>
            <ThemedText type="eyebrow" themeColor="textSecondary">Progresso geral</ThemedText>
            <View style={styles.metricasRow}>
              <Metrica label="dias de streak" valor={String(derivado.streakDias)} cor={Accent.orange} />
              <Metrica label="XP total" valor={String(derivado.totalXP)} />
            </View>
            <ThemedText type="default">
              Patente atual: {derivado.patente.nivel.nome}
              {derivado.patente.nivel.sublevel ? ` ${['I', 'II', 'III'][derivado.patente.nivel.sublevel - 1]}` : ''}
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
