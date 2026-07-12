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

import { AmbientGlow } from '@/components/ambient-glow';
import { Chip } from '@/components/chip';
import { GlassCard } from '@/components/glass-card';
import { GradientButton } from '@/components/gradient-button';
import { GradientSwitch } from '@/components/gradient-switch';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GATILHOS_COMUNS } from '@/constants/gatilhos';
import { Accent, Colors, Spacing } from '@/constants/theme';
import { DEFAULT_DATA } from '@/types';
import { ativarNotificacoes } from '@/notifications';
import { carregarDados, salvarDados } from '@/storage';

const TOTAL_STEPS = 3;
const ONBOARDING_GLOW = [
  { color: Accent.fireMid, top: '10%' as const, left: '20%' as const, size: 560, opacity: 0.2 },
  { color: '#7846DC', top: '80%' as const, left: '90%' as const, size: 520, opacity: 0.16 },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [diasInput, setDiasInput] = useState('0');

  // Step 2 state
  const [gatilhosSelecionados, setGatilhosSelecionados] = useState<string[]>([]);

  // Step 3 state
  const [notificacoesAtivadas, setNotificacoesAtivadas] = useState(true);

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
    const trackingStartDate = new Date().toISOString();

    const notificationsEnabled = notificacoesAtivadas
      ? await ativarNotificacoes(DEFAULT_DATA.dailyQuoteHour, DEFAULT_DATA.dailyQuoteMinute)
      : false;

    const dados = await carregarDados();
    await salvarDados({
      ...dados,
      onboardingDone: true,
      streakStartDate,
      trackingStartDate,
      selectedTriggers: gatilhosSelecionados,
      notificationsEnabled,
    });

    router.replace('/(tabs)' as Href);
  }

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={ONBOARDING_GLOW} />
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
                  Uma recaída zera seu streak e custa parte do XP daquela
                  sequência — mas seu progresso total nunca some.
                </ThemedText>

                <GlassCard style={styles.card}>
                  <ThemedText type="small" themeColor="textSecondary">
                    Há quantos dias você está sem recair?
                  </ThemedText>
                  <TextInput
                    value={diasInput}
                    onChangeText={setDiasInput}
                    keyboardType="number-pad"
                    style={styles.input}
                    maxLength={4}
                    selectTextOnFocus
                  />
                  <ThemedText type="small" themeColor="textSecondary">
                    Se acabou de começar, deixe 0.
                  </ThemedText>
                </GlassCard>
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
                  {GATILHOS_COMUNS.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      selected={gatilhosSelecionados.includes(g)}
                      onPress={() => toggleGatilho(g)}
                    />
                  ))}
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

                <GlassCard style={styles.card}>
                  <View style={styles.notifRow}>
                    <View style={styles.notifTextos}>
                      <ThemedText type="default">Lembrete diário</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        Receba sua frase do dia às 8h
                      </ThemedText>
                    </View>
                    <GradientSwitch value={notificacoesAtivadas} onValueChange={setNotificacoesAtivadas} />
                  </View>
                </GlassCard>
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
            <GradientButton
              label={step < TOTAL_STEPS ? 'Continuar' : 'Começar'}
              onPress={step < TOTAL_STEPS ? () => setStep((s) => s + 1) : finalizar}
              style={step === 1 ? styles.btnAvancarFull : styles.btnAvancar}
            />
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
    backgroundColor: Colors.backgroundSelected,
  },
  dotAtivo: { backgroundColor: Accent.orange },
  content: { padding: Spacing.three, paddingBottom: Spacing.six },
  stepContainer: { gap: Spacing.three },
  titulo: { fontSize: 36, lineHeight: 44 },
  descricao: { lineHeight: 26 },
  card: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  gatilhosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  notifTextos: { flex: 1, gap: 2 },
  botoes: {
    flexDirection: 'row',
    alignItems: 'center',
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
  btnAvancar: { flex: 2 },
  btnAvancarFull: { flex: 1 },
});
