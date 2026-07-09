import { Alert, Pressable, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { useTheme } from '@/hooks/use-theme';

function SecaoHeader({ titulo }: { titulo: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary" style={styles.secaoHeader}>
      {titulo.toUpperCase()}
    </ThemedText>
  );
}

function ItemConfig({
  label,
  valor,
  onPress,
  destrutivo,
}: {
  label: string;
  valor?: string;
  onPress?: () => void;
  destrutivo?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.itemConfig}>
      <ThemedText type="default" style={destrutivo ? styles.textoDestrutivo : undefined}>
        {label}
      </ThemedText>
      {valor !== undefined && (
        <ThemedText type="small" themeColor="textSecondary">{valor}</ThemedText>
      )}
    </Pressable>
  );
}

export default function PerfilScreen() {
  const { dados, atualizar, resetarApp, derivado, carregando } = useAppData();
  const theme = useTheme();

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
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Perfil</ThemedText>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <ThemedView type="backgroundElement" style={styles.statsCard}>
            <View style={styles.statItem}>
              <ThemedText type="title">{derivado.streakDias}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">dias de streak</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText type="title">{derivado.totalXP}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">XP total</ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText type="subtitle" style={styles.patenteText}>
                {derivado.patente.nivel.nome}{sublevelLabel}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">patente</ThemedText>
            </View>
          </ThemedView>

          <SecaoHeader titulo="Configurações" />

          <ThemedView type="backgroundElement" style={styles.secaoCard}>
            <View style={styles.switchRow}>
              <ThemedText type="default">Notificações diárias</ThemedText>
              <Switch
                value={dados.notificationsEnabled}
                onValueChange={(v) => atualizar({ notificationsEnabled: v })}
                trackColor={{ true: '#3C87F7' }}
              />
            </View>
          </ThemedView>

          <SecaoHeader titulo="Dados" />

          <ThemedView type="backgroundElement" style={styles.secaoCard}>
            <ItemConfig
              label="Apagar todos os dados"
              destrutivo
              onPress={confirmarReset}
            />
          </ThemedView>

          <ThemedText type="small" themeColor="textSecondary" style={styles.rodape}>
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
    borderRadius: Spacing.two,
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: { alignItems: 'center', gap: 2, flex: 1 },
  statDivider: { width: 1, height: 40, backgroundColor: '#C0C0C8' },
  patenteText: { fontSize: 20, lineHeight: 28 },
  secaoHeader: { marginBottom: -Spacing.two },
  secaoCard: {
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
  },
  itemConfig: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
  },
  textoDestrutivo: { color: '#D93025' },
  rodape: {
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.two,
  },
});
