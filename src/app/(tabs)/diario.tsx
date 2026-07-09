import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GATILHOS_COMUNS } from '@/constants/gatilhos';
import { Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { useTheme } from '@/hooks/use-theme';
import { TriggerEntry } from '@/types';

function formatarData(isoDate: string) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function EntradaItem({ entry }: { entry: TriggerEntry }) {
  const theme = useTheme();
  return (
    <ThemedView type="backgroundElement" style={styles.entradaCard}>
      <View style={styles.entradaHeader}>
        <ThemedText type="small" themeColor="textSecondary">{formatarData(entry.date)}</ThemedText>
        {entry.resisted && (
          <View style={[styles.resistiuBadge, { backgroundColor: '#1B8A4E' }]}>
            <ThemedText style={styles.resistiuText}>Resisti</ThemedText>
          </View>
        )}
      </View>
      <ThemedText type="smallBold">{entry.trigger}</ThemedText>
      {entry.notes ? <ThemedText type="small" themeColor="textSecondary">{entry.notes}</ThemedText> : null}
    </ThemedView>
  );
}

export default function DiarioScreen() {
  const { dados, adicionarEntrada, carregando } = useAppData();
  const theme = useTheme();
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
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Diário de Gatilhos</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {dados.entries.length} {dados.entries.length === 1 ? 'entrada' : 'entradas'}
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

        <Pressable style={styles.addBtn} onPress={() => setModalAberto(true)}>
          <ThemedText style={styles.addBtnText}>+ Registrar gatilho</ThemedText>
        </Pressable>
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

            {GATILHOS_COMUNS.map((g) => (
              <Pressable
                key={g}
                onPress={() => setGatilhoSelecionado(g)}
                style={[
                  styles.opcaoGatilho,
                  { borderColor: theme.backgroundElement },
                  gatilhoSelecionado === g && styles.opcaoSelecionada,
                ]}>
                <ThemedText type="small">{g}</ThemedText>
              </Pressable>
            ))}

            <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.three }}>
              Observações (opcional)
            </ThemedText>
            <TextInput
              value={notas}
              onChangeText={setNotas}
              placeholder="O que você estava fazendo? Como se sentiu?"
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.textInput, { color: theme.text, borderColor: theme.backgroundElement }]}
            />

            <Pressable
              style={[styles.salvarBtn, !gatilhoSelecionado && styles.salvarBtnDisabled]}
              onPress={salvarEntrada}
              disabled={!gatilhoSelecionado}>
              <ThemedText style={styles.salvarBtnText}>Salvar</ThemedText>
            </Pressable>
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
    gap: Spacing.one,
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  vazioTexto: { textAlign: 'center', lineHeight: 24 },
  lista: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 100 },
  entradaCard: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  entradaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resistiuBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resistiuText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  addBtn: {
    position: 'absolute',
    bottom: Spacing.four,
    left: Spacing.three,
    right: Spacing.three,
    backgroundColor: '#3C87F7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  addBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    paddingTop: Spacing.four,
  },
  modalContent: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 40 },
  opcaoGatilho: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
  },
  opcaoSelecionada: { borderColor: '#3C87F7', backgroundColor: '#EBF3FF' },
  textInput: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
    marginTop: Spacing.one,
  },
  salvarBtn: {
    backgroundColor: '#3C87F7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  salvarBtnDisabled: { opacity: 0.4 },
  salvarBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
