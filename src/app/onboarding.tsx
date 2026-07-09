import { router, type Href } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { carregarDados, salvarDados } from '@/storage';
import { useTheme } from '@/hooks/use-theme';

const TOTAL_STEPS = 3;

export default function OnboardingScreen() {
  const theme = useTheme();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [diasInput, setDiasInput] = useState('0');

  // Step 2 state
  const [gatilhosSelecionados, setGatilhosSelecionados] = useState<string[]>([]);

  function toggleGatilho(g: string) {
    setGatilhosSelecionados((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  async function finalizar() {
    const dias = Math.max(0, parseInt(diasInput) || 0);
    const streakStartDate = new Date(
      Date.now() - dias * 24 * 60 * 60 * 1000
    ).toISOString();

    const dados = await carregarDados();
    await salvarDados({
      ...dados,
      onboardingDone: true,
      streakStartDate,
      selectedTriggers: gatilhosSelecionados,
    });

    router.replace('/(tabs)' as Href);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          {/* Progress dots */}
          <View style={styles.dots}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i + 1 <= step && styles.dotAtivo]}
              />
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {step === 1 && (
              <View style={styles.stepContainer}>
                <ThemedText type="title" style={styles.titulo}>Bem-vindo</ThemedText>
                <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                  Este app acompanha sua jornada de autodisciplina, dia a dia.
                  {'\n\n'}
                  Sua patente e XP nunca regridem — mesmo se houver uma recaída, seu
                  progresso está preservado.
                </ThemedText>

                <ThemedView type="backgroundElement" style={styles.card}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Há quantos dias você está sem recair?
                  </ThemedText>
                  <TextInput
                    value={diasInput}
                    onChangeText={setDiasInput}
                    keyboardType="number-pad"
                    style={[styles.input, { color: theme.text, borderColor: theme.backgroundElement }]}
                    maxLength={4}
                    selectTextOnFocus
                  />
                  <ThemedText type="small" themeColor="textSecondary">
                    Se acabou de começar, deixe 0.
                  </ThemedText>
                </ThemedView>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContainer}>
                <ThemedText type="title" style={styles.titulo}>Seus gatilhos</ThemedText>
                <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                  Selecione as situações que mais te expõem. Isso ajuda o app a
                  sugerir ações mais certeiras no momento difícil.
                </ThemedText>

                <View style={styles.gatilhosGrid}>
                  {GATILHOS_COMUNS.map((g) => {
                    const selecionado = gatilhosSelecionados.includes(g);
                    return (
                      <Pressable
                        key={g}
                        onPress={() => toggleGatilho(g)}
                        style={[
                          styles.gatilhoChip,
                          { borderColor: theme.backgroundElement },
                          selecionado && styles.gatilhoChipSelecionado,
                        ]}>
                        <ThemedText
                          type="small"
                          style={selecionado ? styles.gatilhoChipTextSelecionado : undefined}>
                          {g}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContainer}>
                <ThemedText type="title" style={styles.titulo}>Pronto</ThemedText>
                <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                  Você está pronto para começar.
                  {'\n\n'}
                  Quando sentir um gatilho, use o botão de emergência na tela principal.
                  Ele te guia através do momento difícil com respiração e uma ação concreta.
                  {'\n\n'}
                  A batalha começa na mente. Você já está ganhando por estar aqui.
                </ThemedText>
              </View>
            )}
          </ScrollView>

          {/* Navigation buttons */}
          <View style={styles.botoes}>
            {step > 1 && (
              <Pressable style={styles.btnVoltar} onPress={() => setStep((s) => s - 1)}>
                <ThemedText type="default" themeColor="textSecondary">Voltar</ThemedText>
              </Pressable>
            )}
            <Pressable
              style={[styles.btnAvancar, step === 1 && styles.btnAvancarFull]}
              onPress={step < TOTAL_STEPS ? () => setStep((s) => s + 1) : finalizar}>
              <ThemedText style={styles.btnAvancarText}>
                {step < TOTAL_STEPS ? 'Continuar' : 'Começar'}
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingTop: Spacing.three,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C0C0C8',
  },
  dotAtivo: { backgroundColor: '#3C87F7' },
  content: { padding: Spacing.three, paddingBottom: Spacing.six },
  stepContainer: { gap: Spacing.three },
  titulo: { fontSize: 36, lineHeight: 44 },
  descricao: { lineHeight: 26 },
  card: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  gatilhosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  gatilhoChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  gatilhoChipSelecionado: {
    backgroundColor: '#3C87F7',
    borderColor: '#3C87F7',
  },
  gatilhoChipTextSelecionado: { color: '#FFFFFF' },
  botoes: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.three,
    paddingBottom: Spacing.four,
  },
  btnVoltar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  btnAvancar: {
    flex: 2,
    backgroundColor: '#3C87F7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  btnAvancarFull: { flex: 1 },
  btnAvancarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
