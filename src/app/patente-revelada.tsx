import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientGlow } from '@/components/ambient-glow';
import { ForgeReveal } from '@/components/forge-reveal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Spacing } from '@/constants/theme';

const REVEAL_DELAY_MS = 2600;
const REVEAL_GLOW = [
  { color: Accent.brasa, top: '30%' as const, left: '50%' as const, size: 520, opacity: 0.12 },
];

/**
 * Revelação da primeira patente ao fim do onboarding — chega aqui vinda de
 * /plano-gerado e segue automaticamente para as abas após um respiro.
 */
export default function PatenteReveladaScreen() {
  const { t } = useTranslation('onboarding');

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/(tabs)' as Href), REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={REVEAL_GLOW} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.finalStep}>
          <ThemedText type="eyebrow" style={styles.primeiraPatente}>{t('revelada.eyebrow')}</ThemedText>
          <ForgeReveal />
          <ThemedText type="titleBig" style={[styles.titulo, styles.centerText]}>
            {t('revelada.title')}
          </ThemedText>
          <ThemedText
            type="default"
            themeColor="textSecondary"
            style={[styles.descricao, styles.centerText]}>
            {t('revelada.descriptionPrefix')}{' '}
            <ThemedText type="smallBold" style={styles.recrutaDestaque}>{t('common:ranks.Recruta')} I</ThemedText>
            {' '}{t('revelada.descriptionSuffix')}
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, justifyContent: 'center' },
  finalStep: { alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four },
  primeiraPatente: { color: Accent.bronzeMuted, letterSpacing: 4 },
  titulo: { fontSize: 32, lineHeight: 40 },
  descricao: { lineHeight: 26 },
  centerText: { textAlign: 'center' },
  recrutaDestaque: { color: Accent.bronze },
});
