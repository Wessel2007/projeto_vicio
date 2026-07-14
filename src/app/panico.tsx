import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BadgeHalo } from '@/components/badge-halo';
import { EmberOrb } from '@/components/ember-orb';
import { GradientButton } from '@/components/gradient-button';
import { RippleRings } from '@/components/ripple-rings';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GATILHOS_COMUNS, getAcaoPorGatilho } from '@/constants/gatilhos';
import { Accent, Colors, Fonts, Radius, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { falarFrase, pararFala } from '@/utils/audio-frases';
import { mostrarPaywall } from '@/utils/paywall';

type Step = 'respiracao' | 'gatilho' | 'acao' | 'vitoria';
type Ferramenta = 'meditacao' | 'playlist' | 'contato' | null;

const MEDITACAO_TEXTO =
  'Feche os olhos, se puder. Sinta o peso do seu corpo apoiado onde você está. ' +
  'Perceba o ar entrando e saindo, sem forçar nada. O desejo que você sente agora é uma onda: ' +
  'ela sobe, atinge um pico e sempre desce — mesmo que você não faça nada. Você não precisa agir agora. ' +
  'Você só precisa esperar a onda passar. Repita mentalmente: isso vai passar, e eu escolho quem eu sou.';

const PLAYLISTS_FOCO = [
  { label: 'Foco profundo', url: 'https://open.spotify.com/search/foco%20profundo' },
  { label: 'Lo-fi para estudo', url: 'https://open.spotify.com/search/lo-fi%20estudo' },
  { label: 'Música calma', url: 'https://open.spotify.com/search/musica%20calma' },
  { label: 'Instrumental sem letra (YouTube)', url: 'https://www.youtube.com/results?search_query=musica+para+foco+sem+letra' },
];

// 4-4-4 box breathing: inspire 4s, segure 4s, expire 4s = 12s por ciclo.
const FASE_DURACAO = 4000;
const FASES = ['Inspire', 'Segure', 'Expire'];
const CICLOS_TOTAL = 3;
const ORB_SIZE = 236;

function Respiracao({ onConcluir, onFechar }: { onConcluir: () => void; onFechar: () => void }) {
  const [fase, setFase] = useState(0);
  const [ciclo, setCiclo] = useState(0);
  const escala = useSharedValue(0.8);

  useEffect(() => {
    const alvo = fase === 2 ? 0.8 : 1.08;
    escala.value = withTiming(alvo, {
      duration: FASE_DURACAO,
      easing: fase === 1 ? Easing.linear : Easing.inOut(Easing.ease),
    });

    const timeout = setTimeout(() => {
      const proxFase = (fase + 1) % FASES.length;
      setFase(proxFase);
      const proxCiclo = proxFase === 0 ? ciclo + 1 : ciclo;
      setCiclo(proxCiclo);
      if (proxCiclo >= CICLOS_TOTAL) {
        onConcluir();
      }
    }, FASE_DURACAO);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  return (
    <View style={styles.respFlex}>
      <View style={styles.respHeader}>
        <Text style={styles.ciclo}>CICLO {Math.min(ciclo + 1, CICLOS_TOTAL)} DE {CICLOS_TOTAL}</Text>
        <Pressable onPress={onFechar} style={styles.fecharBtn}>
          <Ionicons name="close" size={18} color="rgba(244,239,233,0.5)" />
        </Pressable>
      </View>

      <View style={styles.respCentro}>
        <View style={styles.orbWrap}>
          <RippleRings size={280} color="rgba(255,122,54,0.25)" />
          <Animated.View style={orbStyle}>
            <EmberOrb size={ORB_SIZE}>
              <Text style={styles.orbPalavra}>{FASES[fase]}</Text>
            </EmberOrb>
          </Animated.View>
        </View>
        <Text style={styles.respInstrucao}>
          Respire com a brasa.{'\n'}Inspire quando expande, expire quando contrai.
        </Text>
      </View>

      <Pressable onPress={onConcluir} style={styles.pularBtn}>
        <Text style={styles.pularTexto}>Pular respiração</Text>
      </Pressable>
    </View>
  );
}

export default function PanicoScreen() {
  const { dados, adicionarEntrada } = useAppData();
  const [step, setStep] = useState<Step>('respiracao');
  const [gatilhoSelecionado, setGatilhoSelecionado] = useState('');
  const [ferramentaAberta, setFerramentaAberta] = useState<Ferramenta>(null);

  useEffect(() => () => pararFala(), []);

  function abrirFerramenta(f: Exclude<Ferramenta, null>) {
    if (!dados?.isPro) {
      mostrarPaywall('As ferramentas expandidas do botão de pânico');
      return;
    }
    setFerramentaAberta(f);
  }

  function fecharFerramenta() {
    pararFala();
    setFerramentaAberta(null);
  }

  function ligarContato() {
    if (!dados?.accountabilityPhone) {
      Alert.alert('Nenhum contato salvo', 'Cadastre um contato de confiança em Perfil > Contato de confiança.');
      return;
    }
    Linking.openURL(`tel:${dados.accountabilityPhone}`);
  }

  function mandarMensagem() {
    if (!dados?.accountabilityPhone) {
      Alert.alert('Nenhum contato salvo', 'Cadastre um contato de confiança em Perfil > Contato de confiança.');
      return;
    }
    Linking.openURL(`sms:${dados.accountabilityPhone}`);
  }

  const gatilhos = dados?.selectedTriggers?.length ? dados.selectedTriggers : GATILHOS_COMUNS.slice(0, 6);

  function confirmarResistencia() {
    if (gatilhoSelecionado) {
      adicionarEntrada({ trigger: gatilhoSelecionado, notes: '', resisted: true });
    }
    setStep('vitoria');
  }

  function irParaReflexaoRecaida() {
    router.push({
      pathname: '/reflexao-recaida',
      params: gatilhoSelecionado ? { gatilho: gatilhoSelecionado } : {},
    } as unknown as Href);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {step === 'respiracao' && (
          <Respiracao onConcluir={() => setStep('gatilho')} onFechar={() => router.back()} />
        )}

        {step === 'gatilho' && (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.eyebrow}>ANTES DE AGIR</Text>
            <ThemedText type="titleBig">O que você está sentindo?</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Identificar o gatilho é o primeiro passo para vencê-lo.
            </ThemedText>

            <View style={styles.gatilhosGrid}>
              {gatilhos.map((g) => {
                const sel = gatilhoSelecionado === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGatilhoSelecionado(g)}
                    style={[styles.gatilhoChip, sel && styles.gatilhoChipSel]}>
                    <Text style={[styles.gatilhoChipTxt, sel && styles.gatilhoChipTxtSel]}>{g}</Text>
                  </Pressable>
                );
              })}
            </View>

            <GradientButton
              label="Continuar"
              disabled={!gatilhoSelecionado}
              onPress={() => gatilhoSelecionado && setStep('acao')}
              style={styles.btnMargin}
            />
          </ScrollView>
        )}

        {step === 'acao' && (
          <View style={styles.content}>
            <View style={styles.gatilhoIdRow}>
              <Text style={styles.eyebrow}>GATILHO IDENTIFICADO</Text>
              <View style={styles.gatilhoIdChip}>
                <Text style={styles.gatilhoIdChipTxt}>{gatilhoSelecionado}</Text>
              </View>
            </View>

            <ThemedText type="titleBig">Faça isso agora</ThemedText>

            <View style={styles.acaoCard}>
              <View style={styles.acaoLuz} />
              <Text style={styles.acaoTexto}>{getAcaoPorGatilho(gatilhoSelecionado)}</Text>
              <Text style={styles.acaoInstrucao}>
                Faça a ação primeiro. Quando terminar, volte aqui — a onda passa.
              </Text>
            </View>

            <View style={styles.ferramentasRow}>
              <FerramentaBtn icone="leaf-outline" label="Meditação" onPress={() => abrirFerramenta('meditacao')} />
              <FerramentaBtn icone="musical-notes-outline" label="Playlist" onPress={() => abrirFerramenta('playlist')} />
              <FerramentaBtn icone="call-outline" label="Contato" onPress={() => abrirFerramenta('contato')} />
            </View>

            <View style={styles.acaoRodape}>
              <GradientButton label="Resisti — registrar vitória" onPress={confirmarResistencia} />
              <View style={styles.silenciosasRow}>
                <Pressable onPress={irParaReflexaoRecaida}>
                  <Text style={styles.silenciosa}>Recaí dessa vez</Text>
                </Pressable>
                <Pressable onPress={() => router.back()}>
                  <Text style={styles.silenciosa}>Sair sem registrar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {step === 'vitoria' && (
          <View style={styles.cerimonial}>
            <BadgeHalo size={150} rings={1} style={styles.vitoriaHalo}>
              <EmberOrb size={126}>
                <Text style={styles.maisUm}>+1</Text>
              </EmberOrb>
            </BadgeHalo>

            <Text style={styles.eyebrowBronze}>MAIS UMA MARTELADA</Text>
            <ThemedText type="titleBig" style={styles.centro}>Vitória forjada</ThemedText>
            <ThemedText type="body" themeColor="textSecondary" style={styles.cerimonialTexto}>
              Cada vez que você resiste, você constrói quem você quer ser. Isso ficou salvo no seu diário.
            </ThemedText>

            <Pressable onPress={() => router.back()} style={styles.outlineBtn}>
              <Text style={styles.outlineBtnTxt}>Voltar à forja</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      <Modal visible={ferramentaAberta !== null} animationType="slide" presentationStyle="pageSheet" onRequestClose={fecharFerramenta}>
        <ThemedView style={styles.modal}>
          <View style={styles.modalHeader}>
            <ThemedText type="subtitle">
              {ferramentaAberta === 'meditacao' && 'Meditação guiada'}
              {ferramentaAberta === 'playlist' && 'Playlist de foco'}
              {ferramentaAberta === 'contato' && 'Contato rápido'}
            </ThemedText>
            <Pressable onPress={fecharFerramenta}>
              <ThemedText type="small" themeColor="textSecondary">Fechar</ThemedText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {ferramentaAberta === 'meditacao' && (
              <>
                <ThemedText type="body" style={styles.meditacaoTexto}>{MEDITACAO_TEXTO}</ThemedText>
                <GradientButton
                  label="Ouvir narração"
                  icon={<Ionicons name="volume-medium-outline" size={18} color="#FFFFFF" />}
                  onPress={() => falarFrase(MEDITACAO_TEXTO)}
                  style={styles.btnMargin}
                />
              </>
            )}

            {ferramentaAberta === 'playlist' && (
              <View style={{ gap: Spacing.two }}>
                <ThemedText type="small" themeColor="textSecondary">
                  Abre em um app externo (Spotify ou YouTube).
                </ThemedText>
                {PLAYLISTS_FOCO.map((p) => (
                  <Pressable key={p.url} onPress={() => Linking.openURL(p.url)} style={styles.playlistItem}>
                    <Ionicons name="play-circle-outline" size={20} color={Accent.brasa} />
                    <ThemedText type="default">{p.label}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )}

            {ferramentaAberta === 'contato' && (
              <View style={{ gap: Spacing.two }}>
                {dados?.accountabilityPhone ? (
                  <>
                    <ThemedText type="default">{dados.accountabilityName || 'Seu contato de confiança'}</ThemedText>
                    <GradientButton label="Ligar agora" onPress={ligarContato} />
                    <Pressable onPress={mandarMensagem} style={styles.playlistItem}>
                      <Ionicons name="chatbubble-outline" size={20} color={Accent.brasa} />
                      <ThemedText type="default">Enviar mensagem</ThemedText>
                    </Pressable>
                  </>
                ) : (
                  <ThemedText type="small" themeColor="textSecondary">
                    Nenhum contato salvo. Cadastre em Perfil {'>'} Contato de confiança.
                  </ThemedText>
                )}
              </View>
            )}
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

function FerramentaBtn({
  icone,
  label,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.ferramenta}>
      <View style={styles.ferramentaCirc}>
        <Ionicons name={icone} size={19} color="#A79C8F" />
      </View>
      <Text style={styles.ferramentaLabel}>
        {label} <Text style={styles.proTag}>·PRO</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Accent.bgCrise },
  safe: { flex: 1 },

  // Respiração
  respFlex: { flex: 1 },
  respHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  ciclo: { fontFamily: Fonts.display.bold, fontSize: 10, letterSpacing: 3, color: 'rgba(244,239,233,0.4)' },
  fecharBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  respCentro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 38, paddingHorizontal: Spacing.four },
  orbWrap: { width: 280, height: 280, alignItems: 'center', justifyContent: 'center' },
  orbPalavra: {
    fontFamily: Fonts.data.semibold,
    fontSize: 22,
    letterSpacing: 3,
    color: '#FFFFFF',
    textShadowColor: 'rgba(120,20,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  respInstrucao: {
    fontFamily: Fonts.body.medium,
    fontSize: 13.5,
    lineHeight: 23,
    color: 'rgba(244,239,233,0.55)',
    textAlign: 'center',
  },
  pularBtn: { alignItems: 'center', paddingVertical: Spacing.four },
  pularTexto: {
    fontFamily: Fonts.body.semibold,
    fontSize: 13,
    color: 'rgba(244,239,233,0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(244,239,233,0.2)',
    paddingBottom: 2,
  },

  // Steps genéricos
  content: { flexGrow: 1, padding: Spacing.four, paddingTop: Spacing.five, gap: Spacing.three },
  eyebrow: { fontFamily: Fonts.display.bold, fontSize: 10, letterSpacing: 3, color: 'rgba(244,239,233,0.4)' },
  btnMargin: { marginTop: Spacing.two },

  gatilhosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
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

  // Ação
  gatilhoIdRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gatilhoIdChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,138,61,0.5)',
    backgroundColor: 'rgba(255,107,43,0.12)',
  },
  gatilhoIdChipTxt: { fontFamily: Fonts.body.bold, fontSize: 11.5, color: Accent.orangeLight },
  acaoCard: {
    padding: Spacing.four,
    backgroundColor: '#161210',
    borderWidth: 1,
    borderColor: 'rgba(232,180,88,0.22)',
    borderRadius: Radius.cardHighlight,
    overflow: 'hidden',
    gap: 12,
  },
  acaoLuz: {
    position: 'absolute',
    left: '20%',
    right: '20%',
    top: 0,
    height: 1,
    backgroundColor: 'rgba(232,180,88,0.5)',
  },
  acaoTexto: { fontFamily: Fonts.body.semibold, fontSize: 19, lineHeight: 28, color: Colors.text },
  acaoInstrucao: { fontFamily: Fonts.body.medium, fontSize: 12.5, lineHeight: 20, color: 'rgba(244,239,233,0.45)' },
  ferramentasRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.one },
  ferramenta: { alignItems: 'center', gap: 6 },
  ferramentaCirc: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#161210',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ferramentaLabel: { fontFamily: Fonts.body.semibold, fontSize: 10.5, color: 'rgba(244,239,233,0.5)' },
  proTag: { color: Accent.bronze },
  acaoRodape: { marginTop: 'auto', gap: Spacing.three },
  silenciosasRow: { flexDirection: 'row', justifyContent: 'center', gap: 32 },
  silenciosa: { fontFamily: Fonts.body.semibold, fontSize: 12.5, color: 'rgba(244,239,233,0.38)' },

  // Cerimonial (recaída / vitória)
  cerimonial: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.three },
  centro: { textAlign: 'center' },
  cerimonialTexto: { textAlign: 'center', maxWidth: 300 },
  cerimonialBtn: { alignSelf: 'stretch', marginTop: Spacing.two },
  vitoriaHalo: { marginBottom: Spacing.two },
  maisUm: {
    fontFamily: Fonts.display.black,
    fontSize: 44,
    color: '#FFFFFF',
    textShadowColor: 'rgba(110,18,0,0.6)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 14,
  },
  eyebrowBronze: { fontFamily: Fonts.display.bold, fontSize: 10, letterSpacing: 4, color: 'rgba(232,180,88,0.8)' },
  outlineBtn: {
    alignSelf: 'stretch',
    height: 56,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: 'rgba(232,180,88,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  outlineBtnTxt: { fontFamily: Fonts.display.extrabold, fontSize: 14.5, letterSpacing: 0.5, color: Accent.bronze },

  // Modal ferramentas
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    paddingTop: Spacing.four,
  },
  modalContent: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 40 },
  meditacaoTexto: { lineHeight: 26, fontSize: 17 },
  playlistItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
});
