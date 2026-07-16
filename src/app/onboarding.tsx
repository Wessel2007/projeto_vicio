import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const TOTAL_STEPS = 10;
const MAX_AREAS_MELHORIA = 3;
const ONBOARDING_GLOW = [
  { color: '#FF6B2B', top: '30%' as const, left: '50%' as const, size: 520, opacity: 0.12 },
];

export default function OnboardingScreen() {
  const { t } = useTranslation('onboarding');
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
      ? await ativarNotificacoes(DEFAULT_DATA.dailyQuoteHour, DEFAULT_DATA.dailyQuoteMinute, estilo)
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
    router.replace('/plano-gerado' as Href);
  }

  function handleContinuar() {
    if (step === TOTAL_STEPS) {
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
    step === 1 ? t('buttons.start') : step === TOTAL_STEPS ? t('buttons.forge') : t('buttons.continue');
  const progress = Math.min((step - 1) / (TOTAL_STEPS - 1), 1);

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={ONBOARDING_GLOW} />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          <View style={styles.progressWrap}>
            <View style={styles.progressTopo}>
              <ThemedText type="eyebrow" style={styles.progressEyebrow}>{t('progress.eyebrow')}</ThemedText>
              <ThemedText type="smallBold" themeColor="textTertiary">{step}/{TOTAL_STEPS}</ThemedText>
            </View>
            <ForgeProgressBar progress={progress} />
          </View>

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
                    <ThemedText type="eyebrow" style={styles.wordmark}>{t('step1.wordmark')}</ThemedText>
                    <ThemedText type="titleBig" style={styles.titulo}>
                      {t('step1.title')}
                    </ThemedText>
                    <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                      {t('step1.subtitle')}
                    </ThemedText>
                    <GlassCard style={styles.privacyCard}>
                      <Ionicons name="lock-closed" size={20} color={Accent.verde} />
                      <View style={styles.privacyTextos}>
                        <ThemedText type="smallBold" style={styles.privacyTitulo}>
                          {t('step1.privacyTitle')}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.privacyDescricao}>
                          {t('step1.privacyText')}
                        </ThemedText>
                      </View>
                    </GlassCard>
                  </View>
                )}

                {step === 2 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>{t('step2.title')}</ThemedText>
                    <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                      {t('step2.subtitle')}
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
                        {t('step2.hint')}
                      </ThemedText>
                    </GlassCard>
                  </View>
                )}

                {step === 3 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      {t('step3.title')}
                    </ThemedText>
                    <View style={styles.optionsColumn}>
                      {OPCOES_COMPORTAMENTO.map((op) => (
                        <IgniteChip
                          key={op}
                          label={t(`comportamento.${op}`)}
                          wide
                          selected={comportamento === op}
                          onPress={() => setComportamento(op)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 4 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      {t('step4.title')}
                    </ThemedText>
                    <View style={styles.optionsColumn}>
                      {OPCOES_TEMPO.map((op) => (
                        <IgniteChip
                          key={op}
                          label={t(`tempoIncomoda.${op}`)}
                          wide
                          selected={tempoIncomoda === op}
                          onPress={() => setTempoIncomoda(op)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 5 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      {t('step5.title')}
                    </ThemedText>
                    <View style={styles.optionsColumn}>
                      {OPCOES_IMPORTANCIA.map((op) => (
                        <IgniteChip
                          key={op}
                          label={t(`importancia.${op}.label`)}
                          description={t(`importancia.${op}.description`)}
                          wide
                          selected={importancia === op}
                          onPress={() => setImportancia(op)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 6 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      {t('step6.title')}
                    </ThemedText>
                    <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                      {t('step6.subtitle')}
                    </ThemedText>
                    <View style={styles.gatilhosGrid}>
                      {GATILHOS_COMUNS.map((g) => (
                        <IgniteChip
                          key={g}
                          label={t(`common:gatilhos.${g}`)}
                          selected={gatilhosSelecionados.includes(g)}
                          onPress={() => toggleGatilho(g)}
                        />
                      ))}
                    </View>
                    <GlassCard style={styles.card}>
                      <ThemedText type="small" themeColor="textSecondary">
                        {t('step6.otherLabel')}
                      </ThemedText>
                      <TextInput
                        value={gatilhosTexto}
                        onChangeText={setGatilhosTexto}
                        placeholder={t('step6.otherPlaceholder')}
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
                      {t('step7.title')}
                    </ThemedText>
                    <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                      {t('step7.subtitle')}
                    </ThemedText>
                    <View style={styles.gatilhosGrid}>
                      {OPCOES_MOTIVO.map((op) => (
                        <IgniteChip
                          key={op}
                          label={t(`motivo.${op}`)}
                          selected={areasMelhoria.includes(op)}
                          onPress={() => toggleAreaMelhoria(op)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 8 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      {t('step8.title')}
                    </ThemedText>
                    <View style={styles.optionsColumn}>
                      {OPCOES_ESTILO.map((op) => (
                        <IgniteChip
                          key={op}
                          label={t(`estilo.${op}.label`)}
                          description={t(`estilo.${op}.description`)}
                          wide
                          selected={estilo === op}
                          onPress={() => setEstilo(op)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 9 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>
                      {t('step9.title')}
                    </ThemedText>
                    <View style={styles.gatilhosGrid}>
                      {OPCOES_MARCO.map((op) => (
                        <IgniteChip
                          key={op}
                          label={t(`marco.${op}`)}
                          selected={marco === op}
                          onPress={() => setMarco(op)}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {step === 10 && (
                  <View style={styles.stepInner}>
                    <ThemedText type="title" style={styles.titulo}>{t('step10.title')}</ThemedText>
                    <ThemedText type="default" themeColor="textSecondary" style={styles.descricao}>
                      {t('step10.subtitle')}
                    </ThemedText>
                    <GlassCard style={styles.card}>
                      <View style={styles.notifRow}>
                        <View style={styles.notifTextos}>
                          <ThemedText type="default">{t('step10.reminderLabel')}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {t('step10.reminderTime')}
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

              </MotiView>
            </AnimatePresence>
          </ScrollView>

          <View style={styles.botoes}>
            {step > 1 && (
              <Pressable style={styles.btnVoltar} onPress={voltar} disabled={salvando}>
                <ThemedText type="default" themeColor="textSecondary">{t('buttons.back')}</ThemedText>
              </Pressable>
            )}
            <GradientButton
              label={salvando ? t('buttons.forging') : buttonLabel}
              onPress={handleContinuar}
              disabled={!canContinue || salvando}
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
