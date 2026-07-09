import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GATILHOS_COMUNS, getAcaoPorGatilho } from '@/constants/gatilhos';
import { Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { useTheme } from '@/hooks/use-theme';

type Step = 'respiracao' | 'gatilho' | 'acao' | 'vitoria';

// 4-4-4 box breathing: inhale 4s, hold 4s, exhale 4s = 12s per cycle
const FASE_DURACAO = 4000;
const FASES = ['Inspire', 'Segure', 'Expire'];
const CICLOS_TOTAL = 3;

function Respiracao({ onConcluir }: { onConcluir: () => void }) {
  const [fase, setFase] = useState(0);
  const [ciclo, setCiclo] = useState(0);
  const [contagem, setContagem] = useState(4);
  const escala = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const animacoes: Record<number, Animated.CompositeAnimation> = {
      0: Animated.timing(escala, { toValue: 1.2, duration: FASE_DURACAO, useNativeDriver: true, easing: Easing.linear }),
      1: Animated.timing(escala, { toValue: 1.2, duration: FASE_DURACAO, useNativeDriver: true }),
      2: Animated.timing(escala, { toValue: 0.7, duration: FASE_DURACAO, useNativeDriver: true, easing: Easing.linear }),
    };
    animacoes[fase].start();

    // countdown
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const restante = Math.ceil((FASE_DURACAO - elapsed) / 1000);
      setContagem(Math.max(1, restante));
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      const proxFase = (fase + 1) % FASES.length;
      setFase(proxFase);
      const proxCiclo = proxFase === 0 ? ciclo + 1 : ciclo;
      setCiclo(proxCiclo);
      if (proxCiclo >= CICLOS_TOTAL) {
        onConcluir();
      }
    }, FASE_DURACAO);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [fase]);

  return (
    <View style={styles.respiracaoContainer}>
      <ThemedText type="small" themeColor="textSecondary">
        Ciclo {ciclo + 1} de {CICLOS_TOTAL}
      </ThemedText>

      <View style={styles.circuloWrapper}>
        <Animated.View style={[styles.circulo, { transform: [{ scale: escala }] }]} />
        <View style={styles.circuloTextoWrapper}>
          <ThemedText type="subtitle" style={styles.contagemTexto}>{contagem}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{FASES[fase]}</ThemedText>
        </View>
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
  const { dados, adicionarEntrada } = useAppData();
  const theme = useTheme();
  const [step, setStep] = useState<Step>('respiracao');
  const [gatilhoSelecionado, setGatilhoSelecionado] = useState('');

  const gatilhos = dados?.selectedTriggers?.length
    ? dados.selectedTriggers
    : GATILHOS_COMUNS.slice(0, 6);

  function confirmarResistencia() {
    if (gatilhoSelecionado) {
      adicionarEntrada({ trigger: gatilhoSelecionado, notes: '', resisted: true });
    }
    setStep('vitoria');
  }

  if (step === 'respiracao') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <Respiracao onConcluir={() => setStep('gatilho')} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (step === 'gatilho') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <ScrollView contentContainerStyle={styles.content}>
            <ThemedText type="subtitle">O que você está sentindo?</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Identificar o gatilho é o primeiro passo para vencê-lo.
            </ThemedText>

            <View style={styles.gatilhosGrid}>
              {gatilhos.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setGatilhoSelecionado(g)}
                  style={[
                    styles.gatilhoChip,
                    { borderColor: theme.backgroundElement },
                    gatilhoSelecionado === g && styles.gatilhoChipSelecionado,
                  ]}>
                  <ThemedText
                    type="small"
                    style={gatilhoSelecionado === g ? styles.chipTextSelecionado : undefined}>
                    {g}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.btnPrimario, !gatilhoSelecionado && styles.btnDisabled]}
              onPress={() => gatilhoSelecionado && setStep('acao')}
              disabled={!gatilhoSelecionado}>
              <ThemedText style={styles.btnPrimarioText}>Continuar</ThemedText>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (step === 'acao') {
    const acao = getAcaoPorGatilho(gatilhoSelecionado);
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <View style={styles.content}>
            <ThemedText type="subtitle">Faça isso agora</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Gatilho identificado: <ThemedText type="smallBold">{gatilhoSelecionado}</ThemedText>
            </ThemedText>

            <ThemedView type="backgroundElement" style={styles.acaoCard}>
              <ThemedText type="default" style={styles.acaoTexto}>{acao}</ThemedText>
            </ThemedView>

            <ThemedText type="small" themeColor="textSecondary" style={styles.acaoInstrucao}>
              Faça a ação acima primeiro. Quando terminar, volte aqui.
            </ThemedText>

            <Pressable style={styles.btnPrimario} onPress={confirmarResistencia}>
              <ThemedText style={styles.btnPrimarioText}>Resisti! Registrar vitória</ThemedText>
            </Pressable>

            <Pressable onPress={() => router.back()} style={styles.btnSecundario}>
              <ThemedText type="small" themeColor="textSecondary">Sair sem registrar</ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  // Vitoria
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={[styles.content, styles.vitoriaContent]}>
          <ThemedText type="title" style={styles.vitoriaEmoji}>+1</ThemedText>
          <ThemedText type="subtitle" style={styles.vitoriaTitulo}>Vitória registrada</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.vitoriaTexto}>
            Cada vez que você resiste, você constrói quem você quer ser.
            Isso ficou salvo no seu diário.
          </ThemedText>

          <Pressable style={styles.btnPrimario} onPress={() => router.back()}>
            <ThemedText style={styles.btnPrimarioText}>Voltar</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
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
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circulo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#3C87F7',
    opacity: 0.3,
  },
  circuloTextoWrapper: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  contagemTexto: { fontSize: 52, lineHeight: 60, fontWeight: '700' },
  instrucaoTexto: { textAlign: 'center', lineHeight: 24 },
  pularBtn: { paddingVertical: Spacing.two },
  content: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  gatilhosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  gatilhoChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  gatilhoChipSelecionado: { backgroundColor: '#3C87F7', borderColor: '#3C87F7' },
  chipTextSelecionado: { color: '#FFFFFF' },
  acaoCard: {
    borderRadius: Spacing.two,
    padding: Spacing.four,
  },
  acaoTexto: { lineHeight: 28, fontSize: 18 },
  acaoInstrucao: { textAlign: 'center' },
  btnPrimario: {
    backgroundColor: '#3C87F7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  btnDisabled: { opacity: 0.4 },
  btnPrimarioText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnSecundario: { alignItems: 'center', paddingVertical: Spacing.two },
  vitoriaContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  vitoriaEmoji: { fontSize: 72, lineHeight: 80, color: '#3C87F7' },
  vitoriaTitulo: { textAlign: 'center' },
  vitoriaTexto: { textAlign: 'center', lineHeight: 26 },
});
