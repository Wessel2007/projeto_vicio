import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientGlow } from '@/components/ambient-glow';
import { BadgeHalo } from '@/components/badge-halo';
import { GradientButton } from '@/components/gradient-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPatenteBadge } from '@/constants/patente-badges';
import { Accent, Fonts, Spacing } from '@/constants/theme';

const CELEBRACAO_GLOW = [
  { color: '#FF963C', top: '40%' as const, left: '50%' as const, size: 640, opacity: 0.2 },
];

// Metáfora de forja por patente — conecta o marco à narrativa "o metal vira lâmina".
const METAFORAS: Record<string, string> = {
  Recruta: 'O ferro bruto entrou no fogo. Toda lâmina começa como matéria disforme.',
  Aprendiz: 'O metal já aceita a forma. As primeiras marteladas fixaram o rumo.',
  Guerreiro: 'O metal só vira lâmina depois de semanas no fogo. Você resistiu à parte mais quente.',
  Guardião: 'A lâmina ganhou fio. Agora ela protege quem a forjou.',
  Espartano: 'Temperada em disciplina, a lâmina não lasca mais sob pressão.',
  Monge: 'O aço aprendeu silêncio. Força que não precisa mais se provar.',
  Mestre: 'Você deixou de ser forjado para começar a forjar.',
  Lenda: 'Poucos metais chegam a este ponto de têmpera. O seu chegou.',
  Imortal: 'Aço que o tempo não enferruja. A forja agora é parte de quem você é.',
};

export default function CelebracaoScreen() {
  const params = useLocalSearchParams<{
    nome?: string;
    sublevel?: string;
    dias?: string;
    prox?: string;
    proxDias?: string;
  }>();

  const nome = params.nome ?? 'Recruta';
  const sublevelNum = params.sublevel ? Number(params.sublevel) : null;
  const sublevel = (sublevelNum === 1 || sublevelNum === 2 || sublevelNum === 3 ? sublevelNum : null) as
    | 1
    | 2
    | 3
    | null;
  const sublevelLabel = sublevel ? ` ${['I', 'II', 'III'][sublevel - 1]}` : '';
  const dias = params.dias ?? '0';

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [pulse]);
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: 0.85 + pulse.value * 0.15,
    transform: [{ scale: 0.98 + pulse.value * 0.04 }],
  }));

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={CELEBRACAO_GLOW} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centro}>
          <Text style={styles.eyebrow}>PATENTE FORJADA</Text>

          <BadgeHalo size={230} rings={3} style={styles.halo}>
            <Animated.View style={badgeStyle}>
              <Image source={getPatenteBadge(nome, sublevel)} style={styles.badge} resizeMode="contain" />
            </Animated.View>
          </BadgeHalo>

          <ThemedText type="titleHuge" style={styles.nome}>{nome}{sublevelLabel}</ThemedText>
          <Text style={styles.dias}>{dias} dias de disciplina contínua</Text>
          <Text style={styles.copy}>
            {METAFORAS[nome] ?? METAFORAS.Recruta}
            {params.prox ? (
              <Text>
                {' '}Próxima têmpera: <Text style={styles.copyDestaque}>{params.prox}</Text>
                {params.proxDias ? `, em ${params.proxDias} ${Number(params.proxDias) === 1 ? 'dia' : 'dias'}.` : '.'}
              </Text>
            ) : null}
          </Text>
        </View>

        <View style={styles.rodape}>
          <GradientButton label="Continuar forjando" onPress={() => router.back()} />
          <Pressable onPress={() => router.back()} style={styles.compartilhar}>
            <Text style={styles.compartilharTxt}>Compartilhar conquista</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Accent.bgCelebracao },
  safe: { flex: 1 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.four },
  eyebrow: { fontFamily: Fonts.display.bold, fontSize: 11, letterSpacing: 5, color: 'rgba(232,180,88,0.85)' },
  halo: { marginVertical: 22 },
  badge: {
    width: 185,
    height: 185,
    shadowColor: '#FF7828',
    shadowOpacity: 0.45,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 16 },
  },
  nome: { textAlign: 'center' },
  dias: { fontFamily: Fonts.body.semibold, fontSize: 13.5, color: Accent.bronze, marginTop: 10 },
  copy: {
    fontFamily: Fonts.body.medium,
    fontSize: 13,
    lineHeight: 21,
    color: 'rgba(244,239,233,0.5)',
    textAlign: 'center',
    maxWidth: 300,
    marginTop: 12,
  },
  copyDestaque: { color: 'rgba(244,239,233,0.75)', fontFamily: Fonts.body.bold },
  rodape: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.two },
  compartilhar: { alignItems: 'center', paddingVertical: Spacing.two },
  compartilharTxt: { fontFamily: Fonts.body.semibold, fontSize: 12.5, color: 'rgba(244,239,233,0.4)' },
});
