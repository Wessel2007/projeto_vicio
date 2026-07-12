import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientGlow } from '@/components/ambient-glow';
import { Chip } from '@/components/chip';
import { GlassCard } from '@/components/glass-card';
import { GradientButton } from '@/components/gradient-button';
import { ParticleField } from '@/components/particle-field';
import { RippleRings } from '@/components/ripple-rings';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GATILHOS_COMUNS, getAcaoPorGatilho } from '@/constants/gatilhos';
import { Accent, Colors, Fonts, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { falarFrase, pararFala } from '@/utils/audio-frases';
import { mostrarPaywall } from '@/utils/paywall';

type Step = 'respiracao' | 'gatilho' | 'acao' | 'vitoria' | 'recaida';
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

// 4-4-4 box breathing: inhale 4s, hold 4s, exhale 4s = 12s per cycle
const FASE_DURACAO = 4000;
const FASES = ['Inspire', 'Segure', 'Expire'];
const CICLOS_TOTAL = 3;
const ORB_SIZE = 200;

const PANICO_GLOW = [{ color: Accent.fireMid, top: '40%' as const, left: '50%' as const, size: 700, opacity: 0.2 }];
const CONFETTI_COLORS = [Accent.orange, '#F2C572', '#9D6BF0', Accent.fireMid, '#FFFFFF'];

function PhaseLabel({ fase }: { fase: number }) {
  return (
    <View style={styles.phaseLabelWrap}>
      {FASES.map((label, i) => (
        <PhaseText key={label} label={label} active={fase === i} />
      ))}
    </View>
  );
}

function PhaseText({ label, active }: { label: string; active: boolean }) {
  const opacity = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(active ? 1 : 0, { duration: 280 });
  }, [active, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Text style={[styles.phaseText, style]}>{label}</Animated.Text>
  );
}

function Respiracao({ onConcluir }: { onConcluir: () => void }) {
  const [fase, setFase] = useState(0);
  const [ciclo, setCiclo] = useState(0);
  const escala = useSharedValue(0.72);

  useEffect(() => {
    const alvo = fase === 2 ? 0.72 : 1.16;
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
    <View style={styles.respiracaoContainer}>
      <ThemedText type="eyebrow" themeColor="textSecondary">
        Ciclo {ciclo + 1} de {CICLOS_TOTAL}
      </ThemedText>

      <View style={styles.circuloWrapper}>
        <RippleRings size={ORB_SIZE} color="rgba(255,122,61,0.4)" />
        <Animated.View style={[styles.orbShadowWrap, orbStyle]}>
          <LinearGradient
            colors={[Accent.fireStart, Accent.fireMid, Accent.fireEnd]}
            locations={Accent.fireLocations}
            start={{ x: 0.3, y: 0.15 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.orb}
          />
        </Animated.View>
        <PhaseLabel fase={fase} />
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.instrucaoTexto}>
        Respire com o círculo.{'\n'}Inspire quando expande, expire quando contrai.
      </ThemedText>

      <Pressable onPress={onConcluir} style={styles.pularBtn}>
        <ThemedText type="small" themeColor="textSecondary">Pular respiração</ThemedText>
      </Pressable>
    </View>
  );
}

export default function PanicoScreen() {
  const { dados, adicionarEntrada, registrarRecaida } = useAppData();
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

  const badgeFloat = useSharedValue(0);
  useEffect(() => {
    if (step !== 'vitoria') return;
    badgeFloat.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [step, badgeFloat]);
  const badgeFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -badgeFloat.value * 8 }],
  }));

  const gatilhos = dados?.selectedTriggers?.length
    ? dados.selectedTriggers
    : GATILHOS_COMUNS.slice(0, 6);

  function confirmarResistencia() {
    if (gatilhoSelecionado) {
      adicionarEntrada({ trigger: gatilhoSelecionado, notes: '', resisted: true });
    }
    setStep('vitoria');
  }

  function confirmarRecaidaPanico() {
    Alert.alert(
      'Registrar recaída',
      'Isso vai zerar seu streak atual e você perde parte do XP dessa sequência. Seu progresso total não zera. Isso realmente aconteceu?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, aconteceu',
          style: 'destructive',
          onPress: () => {
            if (gatilhoSelecionado) {
              adicionarEntrada({ trigger: gatilhoSelecionado, notes: '', resisted: false });
            }
            registrarRecaida();
            setStep('recaida');
          },
        },
      ],
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={PANICO_GLOW} />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        {step === 'respiracao' && <Respiracao onConcluir={() => setStep('gatilho')} />}

        {step === 'gatilho' && (
          <ScrollView contentContainerStyle={styles.content}>
            <ThemedText type="subtitle">O que você está sentindo?</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Identificar o gatilho é o primeiro passo para vencê-lo.
            </ThemedText>

            <View style={styles.gatilhosGrid}>
              {gatilhos.map((g) => (
                <Chip key={g} label={g} selected={gatilhoSelecionado === g} onPress={() => setGatilhoSelecionado(g)} />
              ))}
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
            <ThemedText type="subtitle">Faça isso agora</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Gatilho identificado: <ThemedText type="smallBold">{gatilhoSelecionado}</ThemedText>
            </ThemedText>

            <GlassCard style={styles.acaoCard}>
              <ThemedText type="default" style={styles.acaoTexto}>{getAcaoPorGatilho(gatilhoSelecionado)}</ThemedText>
            </GlassCard>

            <ThemedText type="small" themeColor="textSecondary" style={styles.acaoInstrucao}>
              Faça a ação acima primeiro. Quando terminar, volte aqui.
            </ThemedText>

            <GradientButton label="Resisti! Registrar vitória" onPress={confirmarResistencia} style={styles.btnMargin} />

            <View style={styles.ferramentasRow}>
              <Pressable onPress={() => abrirFerramenta('meditacao')} style={styles.ferramentaBtn}>
                <Ionicons name="leaf-outline" size={18} color={Colors.textSecondary} />
                <ThemedText type="small" themeColor="textSecondary">Meditação</ThemedText>
                {!dados?.isPro && <Ionicons name="lock-closed" size={10} color={Colors.textTertiary} />}
              </Pressable>
              <Pressable onPress={() => abrirFerramenta('playlist')} style={styles.ferramentaBtn}>
                <Ionicons name="musical-notes-outline" size={18} color={Colors.textSecondary} />
                <ThemedText type="small" themeColor="textSecondary">Playlist</ThemedText>
                {!dados?.isPro && <Ionicons name="lock-closed" size={10} color={Colors.textTertiary} />}
              </Pressable>
              <Pressable onPress={() => abrirFerramenta('contato')} style={styles.ferramentaBtn}>
                <Ionicons name="call-outline" size={18} color={Colors.textSecondary} />
                <ThemedText type="small" themeColor="textSecondary">Contato</ThemedText>
                {!dados?.isPro && <Ionicons name="lock-closed" size={10} color={Colors.textTertiary} />}
              </Pressable>
            </View>

            <Pressable onPress={confirmarRecaidaPanico} style={styles.btnSecundario}>
              <ThemedText type="small" themeColor="textTertiary">Recaí dessa vez</ThemedText>
            </Pressable>

            <Pressable onPress={() => router.back()} style={styles.btnSecundario}>
              <ThemedText type="small" themeColor="textSecondary">Sair sem registrar</ThemedText>
            </Pressable>
          </View>
        )}

        {step === 'recaida' && (
          <View style={[styles.content, styles.vitoriaContent]}>
            <ThemedText type="cardTitle" style={styles.vitoriaTitulo}>Tudo bem. Continue.</ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.vitoriaTexto}>
              Seu streak foi zerado e parte do XP dessa sequência foi perdido.
              Mas seu progresso não some — cada dia é uma nova escolha.
            </ThemedText>
            <GradientButton label="Voltar" onPress={() => router.back()} style={styles.btnMargin} />
          </View>
        )}

        {step === 'vitoria' && (
          <View style={[styles.content, styles.vitoriaContent]}>
            <ParticleField mode="fall" count={12} colors={CONFETTI_COLORS} style={styles.confettiArea} />

            <View style={styles.vitoriaBadgeWrap}>
              <View style={styles.vitoriaBadgeGlow} />
              <Animated.View style={[styles.vitoriaBadge, badgeFloatStyle]}>
                <LinearGradient
                  colors={[Accent.fireStart, Accent.fireMid]}
                  start={{ x: 0.15, y: 0 }}
                  end={{ x: 0.85, y: 1 }}
                  style={styles.vitoriaBadgeGradient}>
                  <Text style={styles.vitoriaBadgeText}>+1</Text>
                </LinearGradient>
              </Animated.View>
            </View>

            <ThemedText type="cardTitle" style={styles.vitoriaTitulo}>Vitória registrada</ThemedText>
            <ThemedText type="default" themeColor="textSecondary" style={styles.vitoriaTexto}>
              Cada vez que você resiste, você constrói quem você quer ser.
              Isso ficou salvo no seu diário.
            </ThemedText>

            <GradientButton label="Voltar" onPress={() => router.back()} style={styles.btnMargin} />
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
                <ThemedText type="default" style={styles.meditacaoTexto}>{MEDITACAO_TEXTO}</ThemedText>
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
                    <Ionicons name="play-circle-outline" size={20} color={Accent.orange} />
                    <ThemedText type="default">{p.label}</ThemedText>
                  </Pressable>
                ))}
              </View>
            )}

            {ferramentaAberta === 'contato' && (
              <View style={{ gap: Spacing.two }}>
                {dados?.accountabilityPhone ? (
                  <>
                    <ThemedText type="default">
                      {dados.accountabilityName || 'Seu contato de confiança'}
                    </ThemedText>
                    <GradientButton label="Ligar agora" onPress={ligarContato} />
                    <Pressable onPress={mandarMensagem} style={styles.playlistItem}>
                      <Ionicons name="chatbubble-outline" size={20} color={Accent.orange} />
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  respiracaoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
    padding: Spacing.four,
  },
  circuloWrapper: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbShadowWrap: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    shadowColor: Accent.fireMid,
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
  },
  phaseLabelWrap: {
    position: 'absolute',
    width: 140,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    position: 'absolute',
    fontFamily: Fonts.display.semibold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  instrucaoTexto: { textAlign: 'center', lineHeight: 22 },
  pularBtn: { paddingVertical: Spacing.two },
  content: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  gatilhosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  btnMargin: { marginTop: Spacing.two },
  acaoCard: {
    padding: Spacing.four,
  },
  acaoTexto: { lineHeight: 28, fontSize: 18 },
  acaoInstrucao: { textAlign: 'center' },
  btnSecundario: { alignItems: 'center', paddingVertical: Spacing.two },
  ferramentasRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.three,
  },
  ferramentaBtn: {
    alignItems: 'center',
    gap: 4,
  },
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
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  vitoriaContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  confettiArea: { height: 420 },
  vitoriaBadgeWrap: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  vitoriaBadgeGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Accent.fireMid,
    opacity: 0.35,
  },
  vitoriaBadge: {
    width: 118,
    height: 118,
    borderRadius: 59,
    shadowColor: Accent.fireEnd,
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  vitoriaBadgeGradient: {
    flex: 1,
    borderRadius: 59,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitoriaBadgeText: {
    fontFamily: Fonts.display.bold,
    fontSize: 44,
    color: '#FFFFFF',
  },
  vitoriaTitulo: { textAlign: 'center' },
  vitoriaTexto: { textAlign: 'center', lineHeight: 24 },
});
