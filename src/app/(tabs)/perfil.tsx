import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientSwitch } from '@/components/gradient-switch';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPatenteBadge } from '@/constants/patente-badges';
import { PATENTE_THEMES } from '@/constants/patente-themes';
import { Accent, Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { AppLanguage, mudarIdioma, SUPPORTED_LANGUAGES } from '@/i18n';
import { agendarLembreteDiario, ativarNotificacoes, desativarNotificacoes } from '@/notifications';
import { PatenteTheme } from '@/types';
import { mostrarPaywall } from '@/utils/paywall';

const SUBLEVEL_LABEL = ['I', 'II', 'III'];
const AURA_GRADIENTES: Record<PatenteTheme, [string, string, string]> = {
  ouro: ['#F7D89A', '#E8B458', '#8A6420'],
  prata: ['#E7EDF4', '#B9C4D0', '#5E6873'],
  brasa: ['#FF9A6B', '#E5450F', '#7E1F02'],
};

function SecaoHeader({ titulo, pro }: { titulo: string; pro?: boolean }) {
  const { t } = useTranslation('profile');
  return (
    <Text style={styles.secaoHeader}>
      {titulo}
      {pro ? <Text style={styles.proTag}> {t('settings.proTag')}</Text> : null}
    </Text>
  );
}

export default function PerfilScreen() {
  const { t, i18n } = useTranslation('profile');
  const { dados, perfil, atualizar, resetarApp, derivado, carregando } = useAppData();
  const [mostrarSeletorHora, setMostrarSeletorHora] = useState(false);
  const [seletorIdiomaAberto, setSeletorIdiomaAberto] = useState(false);
  const [custoTexto, setCustoTexto] = useState('');
  const [tempoTexto, setTempoTexto] = useState('');
  const bufferEconomiaSincronizado = useRef(false);

  useEffect(() => {
    if (dados && !bufferEconomiaSincronizado.current) {
      setCustoTexto(dados.habitoCustoValor != null ? String(dados.habitoCustoValor) : '');
      setTempoTexto(dados.habitoTempoMinutos != null ? String(dados.habitoTempoMinutos) : '');
      bufferEconomiaSincronizado.current = true;
    }
  }, [dados]);

  if (carregando || !dados || !derivado) {
    return (
      <ThemedView style={styles.loading}>
        <ThemedText>{t('common:loading')}</ThemedText>
      </ThemedView>
    );
  }

  const patente = derivado.patente.nivel;
  const sublevelLabel = patente.sublevel ? ` ${SUBLEVEL_LABEL[patente.sublevel - 1]}` : '';
  const horaFormatada = `${String(dados.dailyQuoteHour).padStart(2, '0')}:${String(dados.dailyQuoteMinute).padStart(2, '0')}`;

  function abrirSeletorHora() {
    if (!dados?.isPro) {
      mostrarPaywall(t('settings.reminderPaywallReason'));
      return;
    }
    setMostrarSeletorHora(true);
  }

  function abrirRelatorio() {
    if (!dados?.isPro) {
      mostrarPaywall(t('reportContent.reportPaywallReason'));
      return;
    }
    router.push('/relatorio' as Href);
  }

  function abrirFrases() {
    if (!dados?.isPro) {
      mostrarPaywall(t('reportContent.libraryPaywallReason'));
      return;
    }
    router.push('/frases' as Href);
  }

  function selecionarAura(tema: PatenteTheme) {
    if (!dados?.isPro) {
      mostrarPaywall(t('aura.paywallReason'));
      return;
    }
    atualizar({ patenteTheme: tema });
  }

  async function alternarNotificacoes(ativar: boolean) {
    if (!dados) return;
    if (ativar) {
      const permitido = await ativarNotificacoes(dados.dailyQuoteHour, dados.dailyQuoteMinute, perfil?.estiloMotivacional);
      if (!permitido) {
        Alert.alert(
          t('settings.permissionDeniedTitle'),
          t('settings.permissionDeniedMessage'),
        );
        return;
      }
      atualizar({ notificationsEnabled: true });
    } else {
      await desativarNotificacoes();
      atualizar({ notificationsEnabled: false });
    }
  }

  async function selecionarIdioma(idioma: AppLanguage) {
    await mudarIdioma(idioma);
    // O texto da notificação é montado com i18n.t() no momento do
    // agendamento — sem reagendar aqui, fica preso no idioma antigo até a
    // próxima troca de horário ou reabertura do app.
    if (dados?.notificationsEnabled) {
      agendarLembreteDiario(dados.dailyQuoteHour, dados.dailyQuoteMinute, perfil?.estiloMotivacional);
    }
  }

  function onMudarHora(event: DateTimePickerEvent, date?: Date) {
    setMostrarSeletorHora(Platform.OS === 'ios');
    if (event.type !== 'set' || !date || !dados) return;
    const hour = date.getHours();
    const minute = date.getMinutes();
    atualizar({ dailyQuoteHour: hour, dailyQuoteMinute: minute });
    if (dados.notificationsEnabled) {
      agendarLembreteDiario(hour, minute, perfil?.estiloMotivacional);
    }
  }

  function onMudarCusto(texto: string) {
    setCustoTexto(texto);
    const normalizado = texto.trim().replace(',', '.');
    const valor = normalizado === '' ? null : Number(normalizado);
    atualizar({ habitoCustoValor: valor != null && !Number.isNaN(valor) ? valor : null });
  }

  function onMudarTempo(texto: string) {
    setTempoTexto(texto);
    const valor = texto.trim() === '' ? null : Number(texto);
    atualizar({ habitoTempoMinutos: valor != null && !Number.isNaN(valor) ? valor : null });
  }

  function confirmarReset() {
    Alert.alert(
      t('data.deleteAllConfirmTitle'),
      t('data.deleteAllConfirmMessage'),
      [
        { text: t('data.cancel'), style: 'cancel' },
        {
          text: t('data.deleteAllConfirm'),
          style: 'destructive',
          onPress: () => {
            resetarApp();
            // Sem isso, os campos de texto continuam mostrando os valores
            // antigos (o buffer só sincroniza uma vez com o storage).
            setCustoTexto('');
            setTempoTexto('');
            bufferEconomiaSincronizado.current = false;
          },
        },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="title">{t('title')}</ThemedText>

          {/* Cartão de guerreiro */}
          <Pressable style={styles.guerreiroCard} onPress={() => router.push('/streak-detalhe' as Href)}>
            <Image source={getPatenteBadge(patente.nome, patente.sublevel)} style={styles.guerreiroBadge} resizeMode="contain" />
            <View style={styles.guerreiroTextos}>
              <Text style={styles.guerreiroNome}>{t(`common:ranks.${patente.nome}`)}{sublevelLabel}</Text>
              <Text style={styles.guerreiroStats}>{t('warrior.streakAndXp', { dias: derivado.streakDias, xp: derivado.totalXP })}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Accent.tabInativa} />
          </Pressable>

          {/* FORJA PRO */}
          {dados.isPro ? (
            <View style={styles.proAtivoCard}>
              <Ionicons name="star" size={15} color={Accent.bronze} />
              <View style={styles.proAtivoTextos}>
                <Text style={styles.proAtivoTitulo}>
                  {t('pro.activeTitle')}
                  {dados.proPlano ? ` · ${t(`pro.activePlan${dados.proPlano === 'anual' ? 'Anual' : 'Mensal'}`)}` : ''}
                </Text>
                <Text style={styles.proBenef}>{t('pro.activeBenef')}</Text>
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={['rgba(232,180,88,0.10)', 'rgba(255,107,43,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.proCard}>
              <View style={styles.proTopo}>
                <Ionicons name="star" size={15} color={Accent.bronze} />
                <Text style={styles.proMarca}>{t('pro.brand')}</Text>
              </View>
              <Text style={styles.proTitulo}>{t('pro.title')}</Text>
              <Text style={styles.proBenef}>{t('pro.benef')}</Text>
              <View style={styles.proRodape}>
                <Text style={styles.proPreco}>{t('pro.price')}</Text>
                <Pressable onPress={() => mostrarPaywall(t('pro.paywallReason'))}>
                  <LinearGradient
                    colors={[Accent.ctaStart, Accent.ctaMid, Accent.ctaEnd]}
                    locations={Accent.ctaLocations}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.assinarBtn}>
                    <Text style={styles.assinarTxt}>{t('pro.subscribe')}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          )}

          {/* Configurações */}
          <SecaoHeader titulo={t('sections.settings')} />
          <View style={styles.card}>
            <View style={styles.linha}>
              <Text style={styles.linhaLabel}>{t('settings.dailyNotifications')}</Text>
              <GradientSwitch value={dados.notificationsEnabled} onValueChange={alternarNotificacoes} />
            </View>
            {dados.notificationsEnabled && (
              <>
                <View style={styles.divisor} />
                <Pressable onPress={abrirSeletorHora} style={styles.linha}>
                  <Text style={styles.linhaLabel}>
                    {t('settings.reminderTime')} <Text style={styles.proTag}>{t('settings.proTag')}</Text>
                  </Text>
                  <View style={styles.valorRow}>
                    <Text style={styles.valorMono}>{horaFormatada}</Text>
                    <Ionicons name="chevron-forward" size={13} color={Accent.tabInativa} />
                  </View>
                </Pressable>
              </>
            )}
          </View>

          {mostrarSeletorHora && (
            <DateTimePicker
              value={new Date(2000, 0, 1, dados.dailyQuoteHour, dados.dailyQuoteMinute)}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onMudarHora}
            />
          )}

          {/* Aura da patente */}
          <SecaoHeader titulo={t('sections.aura')} pro />
          <View style={styles.card}>
            <View style={styles.aurasRow}>
              {(Object.keys(PATENTE_THEMES) as PatenteTheme[]).map((tema) => {
                const sel = dados.patenteTheme === tema;
                return (
                  <Pressable
                    key={tema}
                    onPress={() => selecionarAura(tema)}
                    style={[styles.aura, sel && styles.auraSel]}>
                    <LinearGradient
                      colors={AURA_GRADIENTES[tema]}
                      start={{ x: 0.35, y: 0.3 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.auraSwatch}
                    />
                    <Text style={[styles.auraLabel, sel && styles.auraLabelSel]}>{t(`auraNames.${tema}`)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Contato de confiança */}
          <SecaoHeader titulo={t('sections.contact')} pro />
          <View style={[styles.card, styles.cardPad]}>
            <Text style={styles.ajuda}>{t('contact.help')}</Text>
            <TextInput
              value={dados.accountabilityName}
              onChangeText={(v) => atualizar({ accountabilityName: v })}
              placeholder={t('contact.namePlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              editable={dados.isPro}
              style={styles.input}
            />
            <TextInput
              value={dados.accountabilityPhone}
              onChangeText={(v) => atualizar({ accountabilityPhone: v })}
              placeholder={t('contact.phonePlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
              editable={dados.isPro}
              style={styles.input}
            />
          </View>

          {/* Economia estimada */}
          <SecaoHeader titulo={t('sections.savings')} />
          <View style={[styles.card, styles.cardPad]}>
            <Text style={styles.ajuda}>
              {t('savings.help')}
            </Text>
            <TextInput
              value={custoTexto}
              onChangeText={onMudarCusto}
              placeholder={t('savings.costPlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <View style={styles.periodoRow}>
              <Pressable
                onPress={() => atualizar({ habitoCustoPeriodo: 'dia' })}
                style={[styles.periodoChip, dados.habitoCustoPeriodo === 'dia' && styles.periodoChipSel]}>
                <Text style={[styles.periodoTexto, dados.habitoCustoPeriodo === 'dia' && styles.periodoTextoSel]}>
                  {t('savings.perDay')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => atualizar({ habitoCustoPeriodo: 'semana' })}
                style={[styles.periodoChip, dados.habitoCustoPeriodo === 'semana' && styles.periodoChipSel]}>
                <Text style={[styles.periodoTexto, dados.habitoCustoPeriodo === 'semana' && styles.periodoTextoSel]}>
                  {t('savings.perWeek')}
                </Text>
              </Pressable>
            </View>
            <TextInput
              value={tempoTexto}
              onChangeText={onMudarTempo}
              placeholder={t('savings.timePlaceholder')}
              placeholderTextColor={Colors.textTertiary}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>

          {/* Relatório e conteúdo PRO */}
          <SecaoHeader titulo={t('sections.reportContent')} pro />
          <View style={styles.card}>
            <Pressable onPress={abrirRelatorio} style={styles.linha}>
              <Text style={styles.linhaLabel}>{t('reportContent.report')}</Text>
              <Ionicons name="chevron-forward" size={16} color={Accent.tabInativa} />
            </Pressable>
            <View style={styles.divisor} />
            <Pressable onPress={abrirFrases} style={styles.linha}>
              <Text style={styles.linhaLabel}>{t('reportContent.library')}</Text>
              <Ionicons name="chevron-forward" size={16} color={Accent.tabInativa} />
            </Pressable>
          </View>

          {/* Idioma */}
          <SecaoHeader titulo={t('sections.language')} />
          <View style={styles.card}>
            <Pressable onPress={() => setSeletorIdiomaAberto((v) => !v)} style={styles.linha}>
              <Text style={styles.linhaLabel}>{t(`language.${i18n.language}`)}</Text>
              <Ionicons name={seletorIdiomaAberto ? 'chevron-up' : 'chevron-down'} size={16} color={Accent.tabInativa} />
            </Pressable>
            {seletorIdiomaAberto && (
              <>
                <View style={styles.divisor} />
                <View style={styles.aurasRow}>
                  {SUPPORTED_LANGUAGES.map((idioma) => {
                    const sel = i18n.language === idioma;
                    return (
                      <Pressable
                        key={idioma}
                        onPress={() => {
                          selecionarIdioma(idioma);
                          setSeletorIdiomaAberto(false);
                        }}
                        style={[styles.aura, sel && styles.auraSel]}>
                        <Text style={[styles.auraLabel, sel && styles.auraLabelSel]}>{t(`language.${idioma}`)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>

          {/* Dados */}
          <SecaoHeader titulo={t('sections.data')} />
          <View style={styles.card}>
            <Pressable style={styles.linha} onPress={() => Alert.alert(t('data.exportAlertTitle'), t('data.exportAlertMessage'))}>
              <Text style={styles.linhaLabel}>{t('data.export')}</Text>
              <Ionicons name="download-outline" size={16} color={Accent.tabInativa} />
            </Pressable>
            <View style={styles.divisor} />
            <Pressable style={styles.linha} onPress={confirmarReset}>
              <Text style={[styles.linhaLabel, styles.destrutivo]}>{t('data.deleteAll')}</Text>
            </Pressable>
          </View>

          {/* Sobre */}
          <SecaoHeader titulo={t('sections.about')} />
          <View style={styles.card}>
            <Pressable onPress={() => router.push('/termos-de-servico' as Href)} style={styles.linha}>
              <Text style={styles.linhaLabel}>{t('about.terms')}</Text>
              <Ionicons name="chevron-forward" size={16} color={Accent.tabInativa} />
            </Pressable>
          </View>

          {/* Modo de teste */}
          <SecaoHeader titulo={t('sections.testMode')} />
          <View style={[styles.card, styles.cardPad]}>
            <View style={styles.linhaCompacta}>
              <View style={styles.testeTextos}>
                <Text style={styles.linhaLabel}>{t('testMode.simulatePro')}</Text>
                <Text style={styles.ajuda}>
                  {t('testMode.help')}
                </Text>
              </View>
              <GradientSwitch value={dados.isPro} onValueChange={(v) => atualizar({ isPro: v })} />
            </View>
          </View>

          <Text style={styles.rodape}>
            {t('footer')}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safe: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.two },
  proTag: { color: Accent.bronze, fontFamily: Fonts.display.bold, fontSize: 10 },

  guerreiroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: 18,
    marginTop: Spacing.two,
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.cardHighlight,
  },
  guerreiroBadge: { width: 60, height: 60 },
  guerreiroTextos: { flex: 1 },
  guerreiroNome: { fontFamily: Fonts.display.extrabold, fontSize: 17, color: Colors.text },
  guerreiroStats: { fontFamily: Fonts.body.medium, fontSize: 12, color: 'rgba(244,239,233,0.5)', marginTop: 2 },

  proCard: {
    padding: 18,
    borderRadius: Radius.cardHighlight,
    borderWidth: 1,
    borderColor: 'rgba(232,180,88,0.35)',
    gap: 8,
    marginTop: Spacing.one,
  },
  proTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  proMarca: { fontFamily: Fonts.display.extrabold, fontSize: 12, letterSpacing: 2.5, color: Accent.bronze },
  proTitulo: { fontFamily: Fonts.body.bold, fontSize: 15.5, color: Colors.text },
  proBenef: { fontFamily: Fonts.body.medium, fontSize: 12, lineHeight: 19, color: 'rgba(244,239,233,0.55)' },
  proRodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  proPreco: { fontFamily: Fonts.body.semibold, fontSize: 12, color: 'rgba(244,239,233,0.45)' },
  assinarBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 11 },
  assinarTxt: { fontFamily: Fonts.display.extrabold, fontSize: 12, letterSpacing: 0.5, color: '#FFFFFF' },
  proAtivoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: Radius.cardHighlight,
    borderWidth: 1,
    borderColor: 'rgba(232,180,88,0.35)',
    backgroundColor: 'rgba(232,180,88,0.06)',
    marginTop: Spacing.one,
  },
  proAtivoTextos: { flex: 1 },
  proAtivoTitulo: { fontFamily: Fonts.display.extrabold, fontSize: 13, letterSpacing: 1.5, color: Accent.bronze },

  secaoHeader: {
    fontFamily: Fonts.display.bold,
    fontSize: 10,
    letterSpacing: 3,
    color: 'rgba(244,239,233,0.4)',
    marginTop: Spacing.three,
    marginLeft: 4,
    marginBottom: -2,
  },
  card: {
    backgroundColor: Colors.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  cardPad: { padding: 16, gap: Spacing.two },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17, paddingVertical: 15 },
  linhaCompacta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  linhaLabel: { fontFamily: Fonts.body.semibold, fontSize: 14, color: Colors.text },
  valorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  valorMono: { fontFamily: Fonts.mono, fontSize: 13.5, color: 'rgba(244,239,233,0.55)' },
  divisor: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 17 },
  destrutivo: { color: Accent.vermelhoSuave },

  aurasRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16 },
  aura: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  auraSel: { borderColor: Accent.bronze, backgroundColor: 'rgba(232,180,88,0.07)' },
  auraSwatch: { width: 26, height: 26, borderRadius: 13 },
  auraLabel: { fontFamily: Fonts.body.semibold, fontSize: 11, color: 'rgba(244,239,233,0.6)' },
  auraLabelSel: { color: Accent.bronze, fontFamily: Fonts.body.bold },

  ajuda: { fontFamily: Fonts.body.medium, fontSize: 11.5, lineHeight: 17, color: 'rgba(244,239,233,0.4)' },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
    fontFamily: Fonts.body.medium,
    fontSize: 15,
    color: Colors.text,
  },
  testeTextos: { flex: 1, gap: 2 },

  periodoRow: { flexDirection: 'row', gap: 8 },
  periodoChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  periodoChipSel: { borderColor: Accent.bronze, backgroundColor: 'rgba(232,180,88,0.07)' },
  periodoTexto: { fontFamily: Fonts.body.semibold, fontSize: 12.5, color: 'rgba(244,239,233,0.6)' },
  periodoTextoSel: { color: Accent.bronze, fontFamily: Fonts.body.bold },

  rodape: {
    fontFamily: Fonts.body.medium,
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(244,239,233,0.3)',
    textAlign: 'center',
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});
