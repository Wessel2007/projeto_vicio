import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientGlow } from '@/components/ambient-glow';
import { GlassCard } from '@/components/glass-card';
import { GradientSwitch } from '@/components/gradient-switch';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Colors, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { agendarLembreteDiario, ativarNotificacoes, desativarNotificacoes } from '@/notifications';

const PERFIL_GLOW = [{ color: Accent.fireMid, top: '4%' as const, left: '90%' as const, size: 500, opacity: 0.16 }];

function SecaoHeader({ titulo }: { titulo: string }) {
  return (
    <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.secaoHeader}>
      {titulo}
    </ThemedText>
  );
}

function ItemConfig({
  label,
  onPress,
  destrutivo,
}: {
  label: string;
  onPress?: () => void;
  destrutivo?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.itemConfig}>
      <ThemedText type="default" style={destrutivo ? styles.textoDestrutivo : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function PerfilScreen() {
  const { dados, atualizar, resetarApp, derivado, carregando } = useAppData();
  const [mostrarSeletorHora, setMostrarSeletorHora] = useState(false);

  if (carregando || !dados || !derivado) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  const sublevelLabel = derivado.patente.nivel.sublevel
    ? ` ${['I', 'II', 'III'][derivado.patente.nivel.sublevel - 1]}`
    : '';

  const horaFormatada = `${String(dados.dailyQuoteHour).padStart(2, '0')}:${String(dados.dailyQuoteMinute).padStart(2, '0')}`;

  function abrirSeletorHora() {
    if (!dados?.isPro) {
      Alert.alert(
        'Recurso PRO',
        'Personalizar o horário do lembrete é exclusivo do plano PRO. No plano Free, o lembrete é enviado às 08:00.',
      );
      return;
    }
    setMostrarSeletorHora(true);
  }

  async function alternarNotificacoes(ativar: boolean) {
    if (!dados) return;
    if (ativar) {
      const permitido = await ativarNotificacoes(dados.dailyQuoteHour, dados.dailyQuoteMinute);
      if (!permitido) {
        Alert.alert(
          'Permissão negada',
          'Para receber lembretes diários, permita notificações para o FORJA nas configurações do aparelho.',
        );
        return;
      }
      atualizar({ notificationsEnabled: true });
    } else {
      await desativarNotificacoes();
      atualizar({ notificationsEnabled: false });
    }
  }

  function onMudarHora(event: DateTimePickerEvent, date?: Date) {
    setMostrarSeletorHora(Platform.OS === 'ios');
    if (event.type !== 'set' || !date || !dados) return;
    const hour = date.getHours();
    const minute = date.getMinutes();
    atualizar({ dailyQuoteHour: hour, dailyQuoteMinute: minute });
    if (dados.notificationsEnabled) {
      agendarLembreteDiario(hour, minute);
    }
  }

  function confirmarReset() {
    Alert.alert(
      'Apagar todos os dados',
      'Isso vai remover seu histórico, streak e XP permanentemente. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: () => resetarApp(),
        },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={PERFIL_GLOW} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ThemedText type="title">Perfil</ThemedText>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <LinearGradient
            colors={['rgba(255,122,61,0.14)', 'rgba(120,70,220,0.12)']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.statsCard}>
            <View style={styles.statItem}>
              <ThemedText type="cardTitle" style={styles.statStreak}>{derivado.streakDias}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">dias de streak</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText type="cardTitle">{derivado.totalXP}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">XP total</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText type="subtitle" style={styles.patenteText}>
                {derivado.patente.nivel.nome}{sublevelLabel}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">patente</ThemedText>
            </View>
          </LinearGradient>

          <SecaoHeader titulo="Configurações" />

          <GlassCard style={styles.secaoCard}>
            <View style={styles.switchRow}>
              <ThemedText type="default">Notificações diárias</ThemedText>
              <GradientSwitch
                value={dados.notificationsEnabled}
                onValueChange={alternarNotificacoes}
              />
            </View>

            {dados.notificationsEnabled && (
              <>
                <View style={styles.divisor} />
                <Pressable onPress={abrirSeletorHora} style={styles.switchRow}>
                  <View style={styles.horarioLabelRow}>
                    <ThemedText type="default">Horário do lembrete</ThemedText>
                    {!dados.isPro && <Ionicons name="lock-closed" size={13} color={Colors.textTertiary} />}
                  </View>
                  <ThemedText type="default" themeColor="textSecondary">{horaFormatada}</ThemedText>
                </Pressable>
              </>
            )}
          </GlassCard>

          {mostrarSeletorHora && (
            <DateTimePicker
              value={new Date(2000, 0, 1, dados.dailyQuoteHour, dados.dailyQuoteMinute)}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onMudarHora}
            />
          )}

          <SecaoHeader titulo="Dados" />

          <GlassCard style={styles.secaoCard}>
            <ItemConfig label="Apagar todos os dados" destrutivo onPress={confirmarReset} />
          </GlassCard>

          <ThemedText type="small" themeColor="textTertiary" style={styles.rodape}>
            Este app é um apoio de hábito, não substitui acompanhamento terapêutico profissional.
          </ThemedText>
        </View>
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
  content: { padding: Spacing.three, gap: Spacing.three },
  statsCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: { alignItems: 'center', gap: 2, flex: 1 },
  statStreak: { color: '#FF9D4D' },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)' },
  patenteText: { color: '#C9A6FF', fontSize: 19, lineHeight: 24 },
  secaoHeader: { marginLeft: Spacing.one },
  secaoCard: {
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
  },
  horarioLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  itemConfig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
  },
  divisor: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.three,
  },
  textoDestrutivo: { color: Accent.dangerText },
  rodape: {
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.two,
  },
});
