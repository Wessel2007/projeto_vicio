import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientButton } from '@/components/gradient-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GATILHOS_COMUNS } from '@/constants/gatilhos';
import { Accent, Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { TriggerEntry } from '@/types';
import { chaveDia, horaCurta, rotuloDiaTimeline } from '@/utils/datas';
import {
  calcPadroesGatilhoHorario,
  calcTaxaResistencia,
  calcTaxaResistenciaPorGatilho,
  calcTaxaPorDiaSemana,
  calcTendenciaPeriodo,
  contarGatilhos,
  contarPorHorario,
  gerarRecomendacao,
} from '@/utils/insights';
import { mostrarPaywall } from '@/utils/paywall';

function EntradaItem({ entry }: { entry: TriggerEntry }) {
  const { t } = useTranslation(['triggerJournal', 'common']);
  return (
    <View style={styles.entrada}>
      <Text style={styles.entradaHora}>{horaCurta(entry.date)}</Text>
      <View style={styles.entradaCorpo}>
        <Text style={styles.entradaGatilho}>{t(`common:gatilhos.${entry.trigger}`, { defaultValue: entry.trigger })}</Text>
        {entry.notes ? <Text style={styles.entradaNota}>{entry.notes}</Text> : null}
      </View>
      <View style={[styles.badge, entry.resisted ? styles.badgeResisti : styles.badgeRecaida]}>
        <Text style={[styles.badgeTxt, entry.resisted ? styles.badgeTxtResisti : styles.badgeTxtRecaida]}>
          {entry.resisted ? t('badge.resisted') : t('badge.relapsed')}
        </Text>
      </View>
    </View>
  );
}

function BarraInsight({
  label,
  total,
  percent,
  sufixo = '',
}: {
  label: string;
  total: number;
  percent: number;
  sufixo?: string;
}) {
  return (
    <View style={styles.insightLinha}>
      <View style={styles.insightLinhaTopo}>
        <ThemedText type="small">{label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{total}{sufixo}</ThemedText>
      </View>
      <View style={styles.insightTrack}>
        <View style={[styles.insightFill, { width: `${Math.max(4, percent)}%` }]} />
      </View>
    </View>
  );
}

export default function DiarioScreen() {
  const { t } = useTranslation(['triggerJournal', 'common']);
  const { dados, adicionarEntrada, carregando } = useAppData();
  const [modalAberto, setModalAberto] = useState(false);
  const [insightsAberto, setInsightsAberto] = useState(false);
  const [gatilhoSelecionado, setGatilhoSelecionado] = useState('');
  const [notas, setNotas] = useState('');
  const [resistedSelecionado, setResistedSelecionado] = useState<boolean | null>(null);

  // Gatilhos escolhidos no onboarding aparecem primeiro — mais relevantes
  // pra esse usuário que a ordem fixa da lista completa.
  const gatilhosOrdenados = useMemo(() => {
    const selecionados = dados?.selectedTriggers ?? [];
    if (selecionados.length === 0) return GATILHOS_COMUNS;
    const resto = GATILHOS_COMUNS.filter((g) => !selecionados.includes(g));
    return [...selecionados, ...resto];
  }, [dados?.selectedTriggers]);

  // Agrupa as entradas por dia, preservando a ordem (mais recente primeiro).
  const grupos = useMemo(() => {
    const out: { rotulo: string; entradas: TriggerEntry[] }[] = [];
    const idxPorChave = new Map<string, number>();
    (dados?.entries ?? []).forEach((e) => {
      const chave = chaveDia(e.date);
      let idx = idxPorChave.get(chave);
      if (idx === undefined) {
        idx = out.length;
        idxPorChave.set(chave, idx);
        out.push({ rotulo: rotuloDiaTimeline(e.date), entradas: [] });
      }
      out[idx].entradas.push(e);
    });
    return out;
  }, [dados?.entries]);

  function abrirInsights() {
    if (!dados?.isPro) {
      mostrarPaywall(t('insightsPaywallReason'));
      return;
    }
    setInsightsAberto(true);
  }

  function fecharModal() {
    setGatilhoSelecionado('');
    setNotas('');
    setResistedSelecionado(null);
    setModalAberto(false);
  }

  function salvarEntrada() {
    if (!gatilhoSelecionado || resistedSelecionado === null) return;
    if (resistedSelecionado === false) {
      // Recaída marcada fora do fluxo de pânico: mesmo fluxo de reflexão,
      // não uma entrada de diário isolada — evita registrar duas vezes e
      // pula direto pra tela de contexto do gatilho, já pré-selecionado.
      fecharModal();
      router.push({ pathname: '/reflexao-recaida', params: { gatilho: gatilhoSelecionado } } as unknown as Href);
      return;
    }
    adicionarEntrada({ trigger: gatilhoSelecionado, notes: notas, resisted: resistedSelecionado });
    fecharModal();
  }

  if (carregando || !dados) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>{t('common:loading')}</ThemedText>
      </ThemedView>
    );
  }

  const taxa = calcTaxaResistencia(dados.entries);
  const horarios = contarPorHorario(dados.entries);
  const horarioTop = [...horarios].sort((a, b) => b.total - a.total)[0];
  const temPadrao = dados.entries.length >= 3 && horarioTop && horarioTop.total > 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextos}>
            <ThemedText type="title">{t('header.title')}</ThemedText>
            <Text style={styles.subtitulo}>
              {dados.entries.length} {dados.entries.length === 1 ? t('header.subtitleOne') : t('header.subtitleMany')}
              {dados.entries.length > 0 ? t('header.subtitleWon', { percent: taxa.percentResistencia }) : ''}
            </Text>
          </View>
          <Pressable onPress={abrirInsights} style={styles.insightsPill}>
            <Ionicons name="stats-chart" size={13} color={Accent.bronze} />
            <Text style={styles.insightsPillTxt}>{t('insights.pillLabel')} <Text style={styles.proTag}>{t('insights.proTag')}</Text></Text>
          </Pressable>
        </View>

        {dados.entries.length === 0 ? (
          <View style={styles.vazio}>
            <View style={styles.vazioIcone}>
              <Ionicons name="book-outline" size={26} color={Accent.bronze} />
            </View>
            <ThemedText type="subtitle" style={styles.vazioTitulo}>{t('empty.title')}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.vazioTexto}>
              {t('empty.text')}
            </ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
            {grupos.map((grupo, gi) => (
              <View key={gi} style={styles.grupo}>
                <Text style={styles.grupoRotulo}>{grupo.rotulo}</Text>
                {grupo.entradas.map((e) => (
                  <EntradaItem key={e.id} entry={e} />
                ))}
              </View>
            ))}

            {temPadrao && (
              <Pressable onPress={abrirInsights} style={styles.teaser}>
                <Ionicons name="stats-chart" size={20} color={Accent.bronze} />
                <View style={styles.teaserTextos}>
                  <Text style={styles.teaserTitulo}>{t('teaser.title')}</Text>
                  <Text style={styles.teaserTexto}>
                    {t('teaser.text', { horario: t(`horarios.${horarioTop.key}`) })}
                  </Text>
                </View>
              </Pressable>
            )}
          </ScrollView>
        )}

        {/* CTA ancorado sobre fade do fundo */}
        <LinearGradient
          colors={['rgba(13,11,9,0)', Colors.background]}
          locations={[0, 0.55]}
          style={styles.ctaWrap}
          pointerEvents="box-none">
          <GradientButton
            label={t('cta')}
            onPress={() => setModalAberto(true)}
            style={styles.ctaBtn}
          />
        </LinearGradient>
      </SafeAreaView>

      {/* Modal: nova entrada */}
      <Modal visible={modalAberto} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={styles.modal}>
          <View style={styles.modalHeader}>
            <ThemedText type="subtitle">{t('modal.title')}</ThemedText>
            <Pressable onPress={fecharModal}>
              <ThemedText type="small" themeColor="textSecondary">{t('modal.cancel')}</ThemedText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.campoLabel}>{t('modal.triggerLabel')}</Text>
            <View style={styles.gatilhosGrid}>
              {gatilhosOrdenados.map((g) => {
                const sel = gatilhoSelecionado === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGatilhoSelecionado(g)}
                    style={[styles.chip, sel && styles.chipSel]}>
                    <Text style={[styles.chipTxt, sel && styles.chipTxtSel]}>{t(`common:gatilhos.${g}`)}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.campoLabel, styles.campoLabelSpaced]}>{t('modal.outcomeLabel')}</Text>
            <View style={styles.resultadoRow}>
              <Pressable
                onPress={() => setResistedSelecionado(true)}
                style={[styles.resultadoBtn, resistedSelecionado === true && styles.resultadoResisti]}>
                <Text style={[styles.resultadoTxt, resistedSelecionado === true && styles.badgeTxtResisti]}>{t('modal.resisted')}</Text>
              </Pressable>
              <Pressable
                onPress={() => setResistedSelecionado(false)}
                style={[styles.resultadoBtn, resistedSelecionado === false && styles.resultadoRecaida]}>
                <Text style={[styles.resultadoTxt, resistedSelecionado === false && styles.badgeTxtRecaida]}>{t('modal.relapsed')}</Text>
              </Pressable>
            </View>

            <Text style={[styles.campoLabel, styles.campoLabelSpaced]}>{t('modal.notesLabel')}</Text>
            <TextInput
              value={notas}
              onChangeText={setNotas}
              placeholder={t('modal.notesPlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              multiline
              style={styles.textInput}
            />

            <GradientButton
              label={t('modal.save')}
              disabled={!gatilhoSelecionado || resistedSelecionado === null}
              onPress={salvarEntrada}
              style={styles.salvarBtn}
            />
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* Modal: insights (PRO) */}
      <Modal visible={insightsAberto} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={styles.modal}>
          <View style={styles.modalHeader}>
            <ThemedText type="subtitle">{t('insights.modalTitle')}</ThemedText>
            <Pressable onPress={() => setInsightsAberto(false)}>
              <ThemedText type="small" themeColor="textSecondary">{t('common:buttons.close')}</ThemedText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {dados.entries.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                {t('insights.empty')}
              </ThemedText>
            ) : (
              (() => {
                const tendencia = calcTendenciaPeriodo(dados.entries, 7);
                const gatilhos = contarGatilhos(dados.entries);
                const taxaPorGatilho = calcTaxaResistenciaPorGatilho(dados.entries);
                const padroes = calcPadroesGatilhoHorario(dados.entries);
                const porDiaSemana = calcTaxaPorDiaSemana(dados.entries);
                const melhorDia = [...porDiaSemana].sort((a, b) => b.percentResistencia - a.percentResistencia)[0];
                const piorDia = [...porDiaSemana].sort((a, b) => a.percentResistencia - b.percentResistencia)[0];
                const recomendacao = gerarRecomendacao(gatilhos, padroes);

                return (
                  <>
                    <View style={styles.insightCard}>
                      <Text style={[styles.cardLabel, styles.cardLabelMb]}>{t('insights.byTriggerRate')}</Text>
                      {taxaPorGatilho.length > 0 ? (
                        taxaPorGatilho.map((g) => (
                          <BarraInsight
                            key={g.gatilho}
                            label={t(`common:gatilhos.${g.gatilho}`, { defaultValue: g.gatilho })}
                            total={g.percentResistencia}
                            percent={g.percentResistencia}
                            sufixo="%"
                          />
                        ))
                      ) : (
                        <ThemedText type="small" themeColor="textSecondary">{t('insights.byTriggerRateEmpty')}</ThemedText>
                      )}
                    </View>

                    <View style={styles.insightCard}>
                      <Text style={styles.cardLabel}>{t('insights.weeklyTrend')}</Text>
                      <ThemedText type="default">
                        {t('insights.weeklyTrendText', { atual: tendencia.atual })}
                        {tendencia.anterior > 0 || tendencia.atual > 0
                          ? t('insights.weeklyTrendPrev', { anterior: tendencia.anterior })
                          : ''}
                      </ThemedText>
                    </View>

                    <View style={styles.insightCard}>
                      <Text style={[styles.cardLabel, styles.cardLabelMb]}>{t('insights.commonTriggers')}</Text>
                      {gatilhos.map((g) => (
                        <BarraInsight key={g.gatilho} label={t(`common:gatilhos.${g.gatilho}`, { defaultValue: g.gatilho })} total={g.total} percent={g.percent} />
                      ))}
                    </View>

                    <View style={styles.insightCard}>
                      <Text style={[styles.cardLabel, styles.cardLabelMb]}>{t('insights.timePattern')}</Text>
                      {padroes.length > 0 ? (
                        padroes.map((p) => (
                          <ThemedText key={`${p.gatilho}-${p.inicioHora}`} type="small" style={styles.padraoLinha}>
                            {t('insights.timePatternItem', {
                              gatilho: t(`common:gatilhos.${p.gatilho}`, { defaultValue: p.gatilho }),
                              inicio: p.inicioHora,
                              fim: p.fimHora,
                              total: p.total,
                            })}
                          </ThemedText>
                        ))
                      ) : (
                        <ThemedText type="small" themeColor="textSecondary">{t('insights.timePatternEmpty')}</ThemedText>
                      )}
                    </View>

                    <View style={styles.insightCard}>
                      <Text style={[styles.cardLabel, styles.cardLabelMb]}>{t('insights.weekdayPattern')}</Text>
                      {porDiaSemana.length === 0 ? (
                        <ThemedText type="small" themeColor="textSecondary">{t('insights.weekdayEmpty')}</ThemedText>
                      ) : porDiaSemana.length === 1 || melhorDia.diaSemana === piorDia.diaSemana ? (
                        <ThemedText type="small" themeColor="textSecondary">
                          {t('insights.weekdaySingle', { dia: t(`diasSemana.${melhorDia.diaSemana}`), percent: melhorDia.percentResistencia })}
                        </ThemedText>
                      ) : (
                        <>
                          <ThemedText type="small">
                            {t('insights.weekdayBest', { dia: t(`diasSemana.${melhorDia.diaSemana}`), percent: melhorDia.percentResistencia })}
                          </ThemedText>
                          <ThemedText type="small" style={styles.padraoLinha}>
                            {t('insights.weekdayWorst', { dia: t(`diasSemana.${piorDia.diaSemana}`), percent: piorDia.percentResistencia })}
                          </ThemedText>
                        </>
                      )}
                    </View>

                    {recomendacao && (
                      <View style={styles.insightCard}>
                        <Text style={styles.cardLabel}>{t('insights.recommendation')}</Text>
                        <ThemedText type="default">
                          {recomendacao.janela
                            ? t('insights.recommendationWithTime', {
                                gatilho: t(`common:gatilhos.${recomendacao.gatilho}`, { defaultValue: recomendacao.gatilho }),
                                inicio: recomendacao.janela.inicioHora,
                                fim: recomendacao.janela.fimHora,
                              })
                            : t('insights.recommendationTriggerOnly', {
                                gatilho: t(`common:gatilhos.${recomendacao.gatilho}`, { defaultValue: recomendacao.gatilho }),
                              })}
                        </ThemedText>
                      </View>
                    )}
                  </>
                );
              })()
            )}
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTextos: { gap: 4 },
  subtitulo: { fontFamily: Fonts.body.medium, fontSize: 12.5, color: 'rgba(244,239,233,0.5)' },
  insightsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(232,180,88,0.35)',
    backgroundColor: 'rgba(232,180,88,0.07)',
  },
  insightsPillTxt: { fontFamily: Fonts.body.bold, fontSize: 11.5, color: Accent.bronze },
  proTag: { color: Accent.bronze },

  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.two },
  vazioIcone: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Accent.bronzeFundo,
    borderWidth: 1,
    borderColor: Accent.bronzeBorda,
    marginBottom: Spacing.two,
  },
  vazioTitulo: { textAlign: 'center' },
  vazioTexto: { textAlign: 'center', lineHeight: 20, maxWidth: 300 },

  lista: { paddingHorizontal: Spacing.four, paddingTop: 4, paddingBottom: 120, gap: Spacing.two },
  grupo: { gap: Spacing.two, marginBottom: Spacing.one },
  grupoRotulo: {
    fontFamily: Fonts.display.bold,
    fontSize: 10,
    letterSpacing: 3,
    color: 'rgba(244,239,233,0.35)',
    marginTop: Spacing.two,
    marginBottom: 2,
  },
  entrada: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    paddingHorizontal: Radius.card,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    alignItems: 'flex-start',
  },
  entradaHora: { fontFamily: Fonts.mono, fontSize: 11, color: 'rgba(244,239,233,0.4)', paddingTop: 2 },
  entradaCorpo: { flex: 1, gap: 3 },
  entradaGatilho: { fontFamily: Fonts.body.bold, fontSize: 14.5, color: Colors.text },
  entradaNota: { fontFamily: Fonts.body.medium, fontSize: 12, lineHeight: 18, color: 'rgba(244,239,233,0.5)' },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: Radius.badge },
  badgeResisti: { backgroundColor: Accent.verdeFundo },
  badgeRecaida: { backgroundColor: Accent.vermelhoSuaveFundo },
  badgeTxt: { fontFamily: Fonts.body.extrabold, fontSize: 9.5, letterSpacing: 0.8 },
  badgeTxtResisti: { color: Accent.verde },
  badgeTxtRecaida: { color: Accent.vermelhoSuave },

  teaser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,180,88,0.35)',
    borderStyle: 'dashed',
    marginTop: Spacing.two,
  },
  teaserTextos: { flex: 1, gap: 2 },
  teaserTitulo: { fontFamily: Fonts.body.bold, fontSize: 12.5, color: Accent.bronze },
  teaserTexto: { fontFamily: Fonts.body.medium, fontSize: 11.5, lineHeight: 17, color: 'rgba(244,239,233,0.5)' },

  ctaWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 30, paddingHorizontal: 20, paddingBottom: Spacing.two },
  ctaBtn: {},

  // Modais
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    paddingTop: Spacing.four,
  },
  modalContent: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 40 },
  campoLabel: { fontFamily: Fonts.data.semibold, fontSize: 10, letterSpacing: 2, color: 'rgba(232,180,88,0.7)' },
  campoLabelSpaced: { marginTop: Spacing.three },
  gatilhosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElement,
  },
  chipSel: { borderColor: 'rgba(255,138,61,0.75)', backgroundColor: 'rgba(255,107,43,0.14)' },
  chipTxt: { fontFamily: Fonts.body.semibold, fontSize: 14, color: 'rgba(244,239,233,0.85)' },
  chipTxtSel: { color: '#FFC49A', fontFamily: Fonts.body.bold },
  resultadoRow: { flexDirection: 'row', gap: Spacing.two },
  resultadoBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  resultadoResisti: { backgroundColor: Accent.verdeFundo, borderColor: Accent.verde },
  resultadoRecaida: { backgroundColor: Accent.vermelhoSuaveFundo, borderColor: Accent.vermelhoSuave },
  resultadoTxt: { fontFamily: Fonts.body.extrabold, fontSize: 14, color: Colors.textSecondary },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElement,
    borderRadius: 14,
    padding: Spacing.three,
    minHeight: 80,
    textAlignVertical: 'top',
    fontFamily: Fonts.body.medium,
    fontSize: 15,
    color: Colors.text,
  },
  salvarBtn: { marginTop: Spacing.three },

  insightCard: {
    padding: Spacing.three,
    gap: 4,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
  },
  cardLabel: { fontFamily: Fonts.data.semibold, fontSize: 10, letterSpacing: 2, color: 'rgba(232,180,88,0.7)' },
  cardLabelMb: { marginBottom: Spacing.one },
  padraoLinha: { marginTop: Spacing.one },
  insightLinha: { marginTop: Spacing.one, gap: 4 },
  insightLinhaTopo: { flexDirection: 'row', justifyContent: 'space-between' },
  insightTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  insightFill: { height: '100%', borderRadius: 4, backgroundColor: Accent.brasa },
});
