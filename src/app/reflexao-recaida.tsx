import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BadgeHalo } from '@/components/badge-halo';
import { GradientButton } from '@/components/gradient-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GATILHOS_COMUNS } from '@/constants/gatilhos';
import { getSugestoesPorGatilho } from '@/constants/reflexao';
import { Accent, Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';

type Step = 'acolhimento' | 'gatilho' | 'sentia' | 'virada' | 'compromisso' | 'fechamento';

const OUTRO = '__outro__';

function EscolhaComOutro({
  sugestoes,
  selecionado,
  onSelecionar,
  customTexto,
  onMudarCustom,
  placeholder,
  outroLabel,
}: {
  sugestoes: string[];
  selecionado: string | null;
  onSelecionar: (s: string) => void;
  customTexto: string;
  onMudarCustom: (t: string) => void;
  placeholder: string;
  outroLabel: string;
}) {
  return (
    <View style={styles.escolhaGrid}>
      {[...sugestoes, OUTRO].map((s) => {
        const sel = selecionado === s;
        return (
          <Pressable
            key={s}
            onPress={() => onSelecionar(s)}
            style={[styles.gatilhoChip, sel && styles.gatilhoChipSel]}>
            <Text style={[styles.gatilhoChipTxt, sel && styles.gatilhoChipTxtSel]}>
              {s === OUTRO ? outroLabel : s}
            </Text>
          </Pressable>
        );
      })}
      {selecionado === OUTRO && (
        <TextInput
          value={customTexto}
          onChangeText={onMudarCustom}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          multiline
          style={styles.textInput}
        />
      )}
    </View>
  );
}

export default function ReflexaoRecaidaScreen() {
  const { t } = useTranslation('reflexaoRecaida');
  const { derivado, registrarReflexaoRecaida } = useAppData();
  const params = useLocalSearchParams<{ gatilho?: string }>();

  const [step, setStep] = useState<Step>('acolhimento');
  const [triggerTags, setTriggerTags] = useState<string[]>(params.gatilho ? [params.gatilho] : []);
  const [emotionBefore, setEmotionBefore] = useState('');

  const [viradaSelecionada, setViradaSelecionada] = useState<string | null>(null);
  const [viradaCustom, setViradaCustom] = useState('');

  const [compromissoSelecionado, setCompromissoSelecionado] = useState<string | null>(null);
  const [compromissoCustom, setCompromissoCustom] = useState('');

  const [streakFinal, setStreakFinal] = useState(0);

  const sugestoes = getSugestoesPorGatilho(triggerTags[0] ?? null);

  function alternarGatilho(g: string) {
    setTriggerTags((prev) => (prev.includes(g) ? prev.filter((t) => t !== g) : [...prev, g]));
  }

  const whatWouldChange = viradaSelecionada === OUTRO ? viradaCustom.trim() : viradaSelecionada ?? '';
  const commitment = compromissoSelecionado === OUTRO ? compromissoCustom.trim() : compromissoSelecionado ?? '';

  function concluirReflexao() {
    const streakAtual = derivado?.streakDias ?? 0;
    setStreakFinal(streakAtual);
    registrarReflexaoRecaida({
      triggerTags,
      emotionBefore: emotionBefore.trim() || null,
      whatWouldChange,
      commitment,
    });
    setStep('fechamento');
  }

  function voltarParaForja() {
    router.dismissTo('/(tabs)' as Href);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {step === 'acolhimento' && (
          <View style={styles.cerimonial}>
            <Text style={styles.eyebrowBronze}>{t('eyebrowBack')}</Text>
            <ThemedText type="titleBig" style={styles.centro}>
              {t('acolhimento.title')}
            </ThemedText>
            <ThemedText type="body" themeColor="textSecondary" style={styles.cerimonialTexto}>
              {t('acolhimento.text')}
            </ThemedText>
            <GradientButton label={t('common:buttons.continue')} onPress={() => setStep('gatilho')} style={styles.cerimonialBtn} />
          </View>
        )}

        {step === 'gatilho' && (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.eyebrow}>{t('gatilho.eyebrow')}</Text>
            <ThemedText type="titleBig">{t('gatilho.title')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('gatilho.subtitle')}
            </ThemedText>

            <View style={styles.gatilhosGrid}>
              {GATILHOS_COMUNS.map((g) => {
                const sel = triggerTags.includes(g);
                return (
                  <Pressable
                    key={g}
                    onPress={() => alternarGatilho(g)}
                    style={[styles.gatilhoChip, sel && styles.gatilhoChipSel]}>
                    <Text style={[styles.gatilhoChipTxt, sel && styles.gatilhoChipTxtSel]}>
                      {t(`common:gatilhos.${g}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <GradientButton label={t('common:buttons.continue')} onPress={() => setStep('sentia')} style={styles.btnMargin} />
          </ScrollView>
        )}

        {step === 'sentia' && (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.eyebrow}>{t('sentia.eyebrow')}</Text>
            <ThemedText type="titleBig">{t('sentia.title')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('sentia.subtitle')}
            </ThemedText>

            <TextInput
              value={emotionBefore}
              onChangeText={setEmotionBefore}
              placeholder={t('sentia.placeholder')}
              placeholderTextColor={Colors.textTertiary}
              multiline
              style={styles.textInput}
            />

            <GradientButton label={t('common:buttons.continue')} onPress={() => setStep('virada')} style={styles.btnMargin} />
            <Pressable onPress={() => setStep('virada')} style={styles.pularBtn}>
              <Text style={styles.pularTexto}>{t('sentia.skip')}</Text>
            </Pressable>
          </ScrollView>
        )}

        {step === 'virada' && (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.eyebrow}>{t('virada.eyebrow')}</Text>
            <ThemedText type="titleBig">{t('virada.title')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('virada.subtitle')}
            </ThemedText>

            <EscolhaComOutro
              sugestoes={sugestoes}
              selecionado={viradaSelecionada}
              onSelecionar={setViradaSelecionada}
              customTexto={viradaCustom}
              onMudarCustom={setViradaCustom}
              placeholder={t('escolhaPlaceholder')}
              outroLabel={t('escolhaOutro')}
            />

            <GradientButton
              label={t('common:buttons.continue')}
              disabled={!whatWouldChange}
              onPress={() => whatWouldChange && setStep('compromisso')}
              style={styles.btnMargin}
            />
          </ScrollView>
        )}

        {step === 'compromisso' && (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.eyebrow}>{t('compromisso.eyebrow')}</Text>
            <ThemedText type="titleBig">{t('compromisso.title')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('compromisso.subtitle')}
            </ThemedText>

            <EscolhaComOutro
              sugestoes={sugestoes}
              selecionado={compromissoSelecionado}
              onSelecionar={setCompromissoSelecionado}
              customTexto={compromissoCustom}
              onMudarCustom={setCompromissoCustom}
              placeholder={t('escolhaPlaceholder')}
              outroLabel={t('escolhaOutro')}
            />

            <GradientButton
              label={t('compromisso.button')}
              disabled={!commitment}
              onPress={() => commitment && concluirReflexao()}
              style={styles.btnMargin}
            />
          </ScrollView>
        )}

        {step === 'fechamento' && (
          <Fechamento streakFinal={streakFinal} onVoltar={voltarParaForja} />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function Fechamento({ streakFinal, onVoltar }: { streakFinal: number; onVoltar: () => void }) {
  const { t } = useTranslation('reflexaoRecaida');
  const { derivado } = useAppData();
  const [entrou, setEntrou] = useState(false);
  useEffect(() => {
    setEntrou(true);
  }, []);

  const sublevelLabel = derivado?.patente.nivel.sublevel
    ? ` ${['I', 'II', 'III'][derivado.patente.nivel.sublevel - 1]}`
    : '';
  const patenteNome = derivado ? t(`common:ranks.${derivado.patente.nivel.nome}`) : '';

  return (
    <View style={styles.cerimonial}>
      <BadgeHalo size={140} rings={1} style={styles.vitoriaHalo}>
        <View style={styles.fechamentoIcone}>
          <Text style={styles.fechamentoIconeTxt}>✓</Text>
        </View>
      </BadgeHalo>

      <Text style={styles.eyebrowBronze}>{t('fechamento.eyebrow')}</Text>
      <ThemedText type="titleBig" style={styles.centro}>{t('fechamento.title')}</ThemedText>

      {entrou && (
        <Animated.View entering={FadeIn.duration(500)} style={styles.fechamentoCard}>
          <View style={styles.fechamentoLinha}>
            <Text style={styles.fechamentoLabel}>{t('fechamento.streakLabel')}</Text>
            <Text style={styles.fechamentoValor}>{t('fechamento.streakValue', { streak: streakFinal })}</Text>
          </View>
          <View style={styles.fechamentoDivisor} />
          <View style={styles.fechamentoLinha}>
            <Text style={styles.fechamentoLabel}>{t('fechamento.xpLabel')}</Text>
            <Text style={styles.fechamentoValorBronze}>{t('fechamento.xpValue', { xp: derivado?.totalXP ?? 0 })}</Text>
          </View>
          <View style={styles.fechamentoLinha}>
            <Text style={styles.fechamentoLabel}>{t('fechamento.rankLabel')}</Text>
            <Text style={styles.fechamentoValorBronze}>
              {patenteNome}
              {sublevelLabel}
            </Text>
          </View>
        </Animated.View>
      )}

      <ThemedText type="body" themeColor="textSecondary" style={styles.cerimonialTexto}>
        {t('fechamento.text')}
      </ThemedText>

      <GradientButton label={t('fechamento.backButton')} onPress={onVoltar} style={styles.cerimonialBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Accent.bgCrise },
  safe: { flex: 1 },

  content: { flexGrow: 1, padding: Spacing.four, paddingTop: Spacing.five, gap: Spacing.three },
  eyebrow: { fontFamily: Fonts.display.bold, fontSize: 10, letterSpacing: 3, color: 'rgba(244,239,233,0.4)' },
  eyebrowBronze: { fontFamily: Fonts.display.bold, fontSize: 10, letterSpacing: 4, color: 'rgba(232,180,88,0.8)' },
  btnMargin: { marginTop: Spacing.two },

  gatilhosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  escolhaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  gatilhoChip: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElement,
  },
  gatilhoChipSel: {
    borderColor: 'rgba(255,138,61,0.75)',
    backgroundColor: 'rgba(255,107,43,0.14)',
  },
  gatilhoChipTxt: { fontFamily: Fonts.body.semibold, fontSize: 14, color: 'rgba(244,239,233,0.85)' },
  gatilhoChipTxtSel: { color: '#FFC49A', fontFamily: Fonts.body.bold },

  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElement,
    borderRadius: 14,
    padding: Spacing.three,
    minHeight: 80,
    width: '100%',
    textAlignVertical: 'top',
    fontFamily: Fonts.body.medium,
    fontSize: 15,
    color: Colors.text,
    marginTop: Spacing.one,
  },

  pularBtn: { alignItems: 'center', paddingVertical: Spacing.three },
  pularTexto: {
    fontFamily: Fonts.body.semibold,
    fontSize: 13,
    color: 'rgba(244,239,233,0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244,239,233,0.2)',
    paddingBottom: 2,
  },

  cerimonial: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.three },
  centro: { textAlign: 'center' },
  cerimonialTexto: { textAlign: 'center', maxWidth: 300 },
  cerimonialBtn: { alignSelf: 'stretch', marginTop: Spacing.two },
  vitoriaHalo: { marginBottom: Spacing.two },

  fechamentoIcone: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Accent.bronzeFundo,
    borderWidth: 1,
    borderColor: Accent.bronzeBorda,
  },
  fechamentoIconeTxt: { fontFamily: Fonts.display.black, fontSize: 36, color: Accent.bronze },

  fechamentoCard: {
    alignSelf: 'stretch',
    padding: Spacing.three,
    gap: 10,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Accent.bronzeBorda,
    borderRadius: Radius.cardHighlight,
  },
  fechamentoLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fechamentoLabel: {
    fontFamily: Fonts.data.semibold,
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(244,239,233,0.45)',
  },
  fechamentoValor: { fontFamily: Fonts.data.bold, fontSize: 15, color: Colors.text },
  fechamentoValorBronze: { fontFamily: Fonts.data.bold, fontSize: 15, color: Accent.bronze },
  fechamentoDivisor: { height: 1, backgroundColor: Colors.border },
});
