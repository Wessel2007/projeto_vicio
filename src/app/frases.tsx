import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/glass-card';
import { GradientButton } from '@/components/gradient-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FRASES, Frase, TEMAS_FRASES, TemaFrase } from '@/constants/frases';
import { Accent, Colors, Fonts, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { falarFrase } from '@/utils/audio-frases';

function TemaChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.temaChip, selected && styles.temaChipSelecionado]}>
      <ThemedText type="small" style={selected ? styles.temaChipTextoSelecionado : styles.temaChipTexto}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function FraseItem({ frase }: { frase: Frase }) {
  return (
    <GlassCard style={styles.fraseCard}>
      <View style={styles.fraseCardTopo}>
        <View style={styles.temaBadge}>
          <ThemedText type="small" style={styles.temaBadgeTexto}>{frase.tema}</ThemedText>
        </View>
        <Pressable onPress={() => falarFrase(frase.texto, frase.autor)} hitSlop={8}>
          <Ionicons name="volume-medium-outline" size={18} color={Colors.textSecondary} />
        </Pressable>
      </View>
      <ThemedText type="quote">&ldquo;{frase.texto}&rdquo;</ThemedText>
      <ThemedText type="smallBold" themeColor="textSecondary">{frase.autor}</ThemedText>
    </GlassCard>
  );
}

export default function FrasesScreen() {
  const { dados, carregando } = useAppData();
  const [busca, setBusca] = useState('');
  const [temaFiltro, setTemaFiltro] = useState<TemaFrase | null>(null);

  const frasesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return FRASES.filter((f) => {
      const bateTema = !temaFiltro || f.tema === temaFiltro;
      const bateBusca = !termo || f.texto.toLowerCase().includes(termo) || f.autor.toLowerCase().includes(termo);
      return bateTema && bateBusca;
    });
  }, [busca, temaFiltro]);

  if (carregando || !dados) {
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
            <ThemedText type="subtitle" style={styles.bloqueadoTitulo}>Biblioteca PRO</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.bloqueadoTexto}>
              O histórico completo de frases, busca por tema e narração em áudio são exclusivos do plano PRO.
            </ThemedText>
            <GradientButton label="Voltar" onPress={() => router.back()} style={styles.bloqueadoBtn} />
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar por frase ou autor..."
            placeholderTextColor={Colors.textTertiary}
            style={styles.busca}
          />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={TEMAS_FRASES}
            keyExtractor={(t) => t}
            contentContainerStyle={styles.temasLista}
            renderItem={({ item }) => (
              <TemaChip label={item} selected={temaFiltro === item} onPress={() => setTemaFiltro(temaFiltro === item ? null : item)} />
            )}
          />
        </View>

        <FlatList
          data={frasesFiltradas}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => <FraseItem frase={item} />}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.vazio}>
              Nenhuma frase encontrada.
            </ThemedText>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: Spacing.two },
  busca: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElement,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 15,
    color: Colors.text,
  },
  temasLista: { gap: Spacing.two, paddingVertical: 2 },
  temaChip: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 3,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElement,
  },
  temaChipSelecionado: { borderColor: Accent.orange, backgroundColor: 'rgba(255,122,61,0.14)' },
  temaChipTexto: { color: Colors.textSecondary },
  temaChipTextoSelecionado: { color: Accent.orangeLight, fontFamily: Fonts.body.bold },
  lista: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 40 },
  fraseCard: { padding: Spacing.three, gap: Spacing.one },
  fraseCardTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  temaBadge: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
    backgroundColor: Accent.bronzeFundo,
  },
  temaBadgeTexto: { color: Accent.bronze, fontFamily: Fonts.body.extrabold, fontSize: 11, letterSpacing: 0.4 },
  vazio: { textAlign: 'center', marginTop: Spacing.four },
  bloqueado: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.four },
  bloqueadoTitulo: { marginTop: Spacing.one },
  bloqueadoTexto: { textAlign: 'center', lineHeight: 22 },
  bloqueadoBtn: { marginTop: Spacing.three, alignSelf: 'stretch' },
});
