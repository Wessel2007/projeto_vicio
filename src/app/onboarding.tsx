import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
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
import { ForgeProgressBar } from '@/components/forge-progress-bar';
import { ForgeReveal } from '@/components/forge-reveal';
import { GlassCard } from '@/components/glass-card';
import { GradientButton } from '@/components/gradient-button';
import { GradientSwitch } from '@/components/gradient-switch';
import { IgniteChip } from '@/components/ignite-chip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GATILHOS_COMUNS } from '@/constants/gatilhos';
import { Accent, Colors, Spacing } from '@/constants/theme';
import { DEFAULT_DATA } from '@/types';
import {
  ComportamentoAlvo,
  EstiloMotivacional,
  ImportanciaSobriedade,
  MarcoEsperado,
  MotivoMudanca,
  OPCOES_COMPORTAMENTO,
  OPCOES_ESTILO,
  OPCOES_IMPORTANCIA,
  OPCOES_MARCO,
  OPCOES_MOTIVO,
  OPCOES_TEMPO,
  TempoIncomoda,
} from '@/types/perfil';
import { ativarNotificacoes } from '@/notifications';
import { carregarDados, salvarDados } from '@/storage';
import { salvarPerfil } from '@/storage/perfil';

const TOTAL_STEPS = 11;
const MAX_AREAS_MELHORIA = 3;
const FINAL_STEP_DELAY_MS = 2600;
const ONBOARDING_GLOW = [
  { color: '#FF6B2B', top: '30%' as const, left: '50%' as const, size: 520, opacity: 0.12 },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [salvando, setSalvando] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Step 2 — ponto de partida
  const [diasInput, setDiasInput] = useState('0');

  // Steps 3, 4, 5, 7, 8, 9 — perfil de personalização (sigiloso, ver types/perfil.ts)
  const [comportamento, setComportamento] = useState<ComportamentoAlvo | null>(null);
  const [tempoIncomoda, setTempoIncomoda] = useState<TempoIncomoda | null>(null);
  const [importancia, setImportancia] = useState<ImportanciaSobriedade | null>(null);
  const [areasMelhoria, setAreasMelhoria] = useState<MotivoMudanca[]>([]);
  const [estilo, setEstilo] = useState<EstiloMotivacional | null>(null);
  const [marco, setMarco] = useState<MarcoEsperado | null>(null);

  // Step 6 — gatilhos
  const [gatilhosSelecionados, setGatilhosSelecionados] = useState<string[]>([]);
  const [gatilhosTexto, setGatilhosTexto] = useState('');

  // Step 10 — notificações
  const [notificacoesAtivadas, setNotificacoesAtivadas] = useState(true);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  useEffect(() => {
    if (step !== TOTAL_STEPS) return;
    const timer = setTimeout(() => router.replace('/(tabs)' as Href), FINAL_STEP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [step]);

  function avancar() {
    setDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function voltar() {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  function toggleGatilho(g: string) {
    setGatilhosSelecionados((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  }

  function toggleComCap<T>(lista: T[], item: T, max: number): T[] {
    if (lista.includes(item)) return lista.filter((x) => x !== item);
    if (lista.length >= max) return lista;
    return [...lista, item];
  }

  function toggleAreaMelhoria(area: MotivoMudanca) {
    setAreasMelhoria((prev) => toggleComCap(prev, area, MAX_AREAS_MELHORIA));
  }

  async function handleFinalizar() {
    setSalvando(true);

    const dias = Math.max(0, parseInt(diasInput) || 0);
    const streakStartDate = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
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

    await salvarPerfil({
      comportamentoAlvo: comportamento,
      tempoIncomoda,
      importanciaSobriedade: importancia,
      gatilhosDetalhes: gatilhosTexto.trim(),
      areasMelhoria,
      estiloMotivacional: estilo,
      marcoEsperado: marco,
    });

    setSalvando(false);
    avancar();
  }

  function handleContinuar() {
    if (step === TOTAL_STEPS - 1) {
      handleFinalizar();
    } else {
      avancar();
    }
  }

  const canContinue =
    (step === 3 && comportamento === null) ||
    (step === 4 && tempoIncomoda === null) ||
    (step === 5 && importancia === null) ||
    (step === 7 && areasMelhoria.length === 0) ||
    (step === 8 && estilo === null) ||
    (step === 9 && marco === null)
      ? false
      : true;

  const buttonLabel =
    step === 1 ? 'Começar minha jornada' : step === TOTAL_STEPS - 1 ? 'Forjar' : 'Continuar';
  const progress = Math.min((step - 1) / (TOTAL_STEPS - 1), 1);

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={ONBOARDING_GLOW} />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          {step < TOTAL_STEPS && (
            <View style={styles.progressWrap}>
              <View style={styles.progressTopo}>
                <ThemedText type="eyebrow" style={styles.progressEyebrow}>A forja esquenta</ThemedText>
                <ThemedText type="smallBold" themeColor="textTertiary">{step}/{TOTAL_STEPS - 1}</ThemedText>
              </View>
              <ForgeProgressBar progress={progress} />
            </View>
          )}

          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            <AnimatePresence exitBeforeEnter>
              <MotiView
                key={step}
                from={{ opacity: 0, translateX: dir * 24 }}
                animate={{ opacity: 1, translateX: 0 }}
                exit={{ opacity: 0, translateX: -dir * 24 }}
                transition={{ type: 'timing', duration: 260 }}>
                {step === 1 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="eyebrow" style={styles.wordmark}>FORJA</ThemedText>
                    <ThemedText type="titleBig" style={styles.titulo}>
                      Você está prestes a forjar uma nova versão de si
                    </ThemedText>
                    <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                      Antes de começar, algumas perguntas rápidas para moldar sua jornada.
                    </ThemedText>
                    <GlassCard style={styles.privacyCard}>
                      <Ionicons name="lock-closed" size={20} color={Accent.verde} />
                      <View style={styles.privacyTextos}>
                        <ThemedText type="smallBold" style={styles.privacyTitulo}>
                          Seus dados são privados
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.privacyDescricao}>
                          Suas respostas ficam salvas só neste aparelho — nunca são enviadas,
                          sincronizadas ou compartilhadas com ninguém. Sua segurança é sempre
                          a prioridade número um do Forja.
                        </ThemedText>
                      </View>
                    </GlassCard>
                  </View>
                )}

                {step === 2 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>Seu ponto de partida</ThemedText>
                    <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                      Há quantos dias você está sem recair?
                    </ThemedText>
                    <GlassCard style={styles.card}>
                      <TextInput
                        value={diasInput}
                        onChangeText={setDiasInput}
                        keyboardType="number-pad"
                        style={styles.input}
                        maxLength={4}
                        selectTextOnFocus
                      />
                      <ThemedText type="small" themeColor="textSecondary" style={styles.centerText}>
                        Se acabou de começar, deixe 0.
                      </ThemedText>
                    </GlassCard>
                  </View>
                )}

                {step === 3 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      Qual comportamento você quer trabalhar?
                    </ThemedText>
                    <View style={styles.optionsColumn}>
                      {OPCOES_COMPORTAMENTO.map((op) => (
                        <IgniteChip
                          key={op.id}
                          label={op.label}
                          wide
                          selected={comportamento === op.id}
                          onPress={() => setComportamento(op.id)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 4 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      Há quanto tempo isso te incomoda?
                    </ThemedText>
                    <View style={styles.optionsColumn}>
                      {OPCOES_TEMPO.map((op) => (
                        <IgniteChip
                          key={op.id}
                          label={op.label}
                          wide
                          selected={tempoIncomoda === op.id}
                          onPress={() => setTempoIncomoda(op.id)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 5 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      Qual o tamanho da sua urgência agora?
                    </ThemedText>
                    <View style={styles.optionsColumn}>
                      {OPCOES_IMPORTANCIA.map((op) => (
                        <IgniteChip
                          key={op.id}
                          label={op.label}
                          description={op.description}
                          wide
                          selected={importancia === op.id}
                          onPress={() => setImportancia(op.id)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 6 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      Quais situações costumam ser seus gatilhos?
                    </ThemedText>
                    <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                      Selecione quantas fizerem sentido. Isso ajuda o app a sugerir ações mais
                      certeiras no momento difícil.
                    </ThemedText>
                    <View style={styles.gatilhosGrid}>
                      {GATILHOS_COMUNS.map((g) => (
                        <IgniteChip
                          key={g}
                          label={g}
                          selected={gatilhosSelecionados.includes(g)}
                          onPress={() => toggleGatilho(g)}
                        />
                      ))}
                    </View>
                    <GlassCard style={styles.card}>
                      <ThemedText type="small" themeColor="textSecondary">
                        Outra situação (opcional)
                      </ThemedText>
                      <TextInput
                        value={gatilhosTexto}
                        onChangeText={setGatilhosTexto}
                        placeholder="Descreva com suas palavras..."
                        placeholderTextColor={Colors.textTertiary}
                        style={styles.textArea}
                        multiline
                      />
                    </GlassCard>
                  </View>
                )}

                {step === 7 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      O que você quer transformar na sua vida?
                    </ThemedText>
                    <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                      Escolha até 3 — isso ajuda a personalizar sua jornada.
                    </ThemedText>
                    <View style={styles.gatilhosGrid}>
                      {OPCOES_MOTIVO.map((op) => (
                        <IgniteChip
                          key={op.id}
                          label={op.label}
                          selected={areasMelhoria.includes(op.id)}
                          onPress={() => toggleAreaMelhoria(op.id)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 8 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      Como você prefere ser motivado?
                    </ThemedText>
                    <View style={styles.optionsColumn}>
                      {OPCOES_ESTILO.map((op) => (
                        <IgniteChip
                          key={op.id}
                          label={op.label}
                          description={op.description}
                          wide
                          selected={estilo === op.id}
                          onPress={() => setEstilo(op.id)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 9 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      Qual conquista você mais quer sentir primeiro?
                    </ThemedText>
                    <View style={styles.gatilhosGrid}>
                      {OPCOES_MARCO.map((op) => (
                        <IgniteChip
                          key={op.id}
                          label={op.label}
                          selected={marco === op.id}
                          onPress={() => setMarco(op.id)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 10 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>Quase lá</ThemedText>
                    <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                      Um lembrete diário ajuda a manter o hábito. Você pode mudar isso depois em
                      Perfil.
                    </ThemedText>
                    <GlassCard style={styles.card}>
                      <View style={styles.notifRow}>
                        <View style={styles.notifTextos}>
                          <ThemedText type="default">Lembrete diário</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            Receba sua frase do dia às 8h
                          </ThemedText>
                        </View>
                        <GradientSwitch
                          value={notificacoesAtivadas}
                          onValueChange={setNotificacoesAtivadas}
                        />
                      </View>
                    </GlassCard>
                  </View>
                )}

                {step === 11 && (
                  <View style={styles.finalStep}>
                    <ThemedText type="eyebrow" style={styles.primeiraPatente}>Sua primeira patente</ThemedText>
                    <ForgeReveal />
                    <ThemedText type="titleBig" style={[styles.titulo, styles.centerText]}>
                      Forja concluída
                    </ThemedText>
                    <ThemedText
                      type="default"
                      themeColor="textSecondary"
                      style={[styles.descricao, styles.centerText]}>
                      Sua jornada foi moldada. Você começa como{' '}
                      <ThemedText type="smallBold" style={styles.recrutaDestaque}>Recruta I</ThemedText>
                      {' '}— a partir de agora, cada dia conta.
                    </ThemedText>
                  </View>
                )}
              </MotiView>
            </AnimatePresence>
          </ScrollView>

          {step < TOTAL_STEPS && (
            <View style={styles.botoes}>
              {step > 1 && (
                <Pressable style={styles.btnVoltar} onPress={voltar} disabled={salvando}>
                  <ThemedText type="default" themeColor="textSecondary">Voltar</ThemedText>
                </Pressable>
              )}
              <GradientButton
                label={salvando ? 'Forjando...' : buttonLabel}
                onPress={handleContinuar}
                disabled={!canContinue || salvando}
                style={step === 1 ? styles.btnAvancarFull : styles.btnAvancar}
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  progressWrap: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, gap: Spacing.two },
  progressTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressEyebrow: { color: Accent.bronzeMuted },
  wordmark: { letterSpacing: 6, color: Accent.bronze, textAlign: 'center', marginBottom: Spacing.two },
  content: { padding: Spacing.three, paddingBottom: Spacing.six },
  stepInner: { gap: Spacing.three },
  titulo: { fontSize: 32, lineHeight: 40 },
  descricao: { lineHeight: 26 },
  centerText: { textAlign: 'center' },
  card: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    padding: Spacing.three,
    borderColor: Accent.verdeFundo,
    backgroundColor: Accent.verdeFundo,
  },
  privacyTextos: { flex: 1, gap: 4 },
  privacyTitulo: { color: Accent.verde },
  privacyDescricao: { lineHeight: 20 },
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
  textArea: {
    minHeight: 64,
    color: Colors.text,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  optionsColumn: { gap: Spacing.two },
  gatilhosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  notifTextos: { flex: 1, gap: 2 },
  finalStep: { alignItems: 'center', gap: Spacing.three, paddingTop: Spacing.five },
  primeiraPatente: { color: Accent.bronzeMuted, letterSpacing: 4 },
  recrutaDestaque: { color: Accent.bronze },
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
