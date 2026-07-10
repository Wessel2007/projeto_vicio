import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientGlow } from '@/components/ambient-glow';
import { Chip } from '@/components/chip';
import { GlassCard } from '@/components/glass-card';
import { GradientButton } from '@/components/gradient-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GATILHOS_COMUNS } from '@/constants/gatilhos';
import { Accent, Colors, Fonts, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { TriggerEntry } from '@/types';

const DIARIO_GLOW = [
  { color: Accent.fireMid, top: '4%' as const, left: '10%' as const, size: 480, opacity: 0.16 },
  { color: '#7846DC', top: '35%' as const, left: '96%' as const, size: 520, opacity: 0.14 },
];

function formatarData(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function EntradaItem({ entry }: { entry: TriggerEntry }) {
  return (
    <GlassCard style={styles.entradaCard}>
      <View style={styles.entradaHeader}>
        <ThemedText type="small" themeColor="textSecondary">{formatarData(entry.date)}</ThemedText>
        <View style={[styles.badge, entry.resisted ? styles.badgeSuccess : styles.badgeDanger]}>
          <Text style={[styles.badgeText, entry.resisted ? styles.badgeTextSuccess : styles.badgeTextDanger]}>
            {entry.resisted ? 'RESISTI' : 'RECAÍDA'}
          </Text>
        </View>
      </View>
      <Text style={styles.entradaTrigger}>{entry.trigger}</Text>
      {entry.notes ? <ThemedText type="small" themeColor="textSecondary">{entry.notes}</ThemedText> : null}
    </GlassCard>
  );
}

export default function DiarioScreen() {
  const { dados, adicionarEntrada, carregando } = useAppData();
  const [modalAberto, setModalAberto] = useState(false);
  const [gatilhoSelecionado, setGatilhoSelecionado] = useState('');
  const [notas, setNotas] = useState('');

  function salvarEntrada() {
    if (!gatilhoSelecionado) return;
    adicionarEntrada({ trigger: gatilhoSelecionado, notes: notas, resisted: false });
    setGatilhoSelecionado('');
    setNotas('');
    setModalAberto(false);
  }

  if (carregando || !dados) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={DIARIO_GLOW} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ThemedText type="title">Diário</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {dados.entries.length} {dados.entries.length === 1 ? 'entrada registrada' : 'entradas registradas'}
          </ThemedText>
        </View>

        {dados.entries.length === 0 ? (
          <ThemedView style={styles.vazio}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.vazioTexto}>
              Nenhuma entrada ainda.{'\n'}Registre seus gatilhos para identificar padrões.
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={dados.entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EntradaItem entry={item} />}
            contentContainerStyle={styles.lista}
          />
        )}

        <GradientButton label="+ Registrar gatilho" onPress={() => setModalAberto(true)} style={styles.addBtn} />
      </SafeAreaView>

      {/* Modal para nova entrada */}
      <Modal visible={modalAberto} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={styles.modal}>
          <View style={styles.modalHeader}>
            <ThemedText type="subtitle">Novo registro</ThemedText>
            <Pressable onPress={() => setModalAberto(false)}>
              <ThemedText type="small" themeColor="textSecondary">Cancelar</ThemedText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <ThemedText type="small" themeColor="textSecondary">O que aconteceu?</ThemedText>

            <View style={styles.gatilhosGrid}>
              {GATILHOS_COMUNS.map((g) => (
                <Chip key={g} label={g} selected={gatilhoSelecionado === g} onPress={() => setGatilhoSelecionado(g)} />
              ))}
            </View>

            <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.three }}>
              Observações (opcional)
            </ThemedText>
            <TextInput
              value={notas}
              onChangeText={setNotas}
              placeholder="O que você estava fazendo? Como se sentiu?"
              placeholderTextColor={Colors.textTertiary}
              multiline
              style={styles.textInput}
            />

            <GradientButton
              label="Salvar"
              disabled={!gatilhoSelecionado}
              onPress={salvarEntrada}
              style={styles.salvarBtn}
            />
          </ScrollView>
        </ThemedView>
      </Modal>
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
    gap: Spacing.half,
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  vazioTexto: { textAlign: 'center', lineHeight: 24 },
  lista: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 110 },
  entradaCard: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  entradaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeSuccess: { backgroundColor: Accent.successBg },
  badgeDanger: { backgroundColor: Accent.dangerBg },
  badgeText: {
    fontFamily: Fonts.body.extrabold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  badgeTextSuccess: { color: Accent.success },
  badgeTextDanger: { color: Accent.dangerText },
  entradaTrigger: {
    fontFamily: Fonts.display.semibold,
    fontSize: 16,
    color: Colors.text,
  },
  addBtn: {
    position: 'absolute',
    bottom: Spacing.four,
    left: Spacing.three,
    right: Spacing.three,
  },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    paddingTop: Spacing.four,
  },
  modalContent: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 40 },
  gatilhosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElement,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    color: Colors.text,
    marginTop: Spacing.one,
  },
  salvarBtn: {
    marginTop: Spacing.three,
  },
});
