import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientGlow } from '@/components/ambient-glow';
import { BadgeHalo } from '@/components/badge-halo';
import { GlassCard } from '@/components/glass-card';
import { GradientButton } from '@/components/gradient-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accent, Fonts, Radius, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/useAppData';
import { comprarPlano, PLANOS, restaurarCompras, type PlanoId } from '@/services/assinatura';

const ICONE_PRO = require('@/assets/images/icone_plano_pro.png');

const BENEFICIOS: { key: string; icone: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'ranks', icone: 'ribbon-outline' },
  { key: 'quotes', icone: 'library-outline' },
  { key: 'insights', icone: 'analytics-outline' },
  { key: 'panicTools', icone: 'medkit-outline' },
  { key: 'themes', icone: 'color-palette-outline' },
  { key: 'report', icone: 'stats-chart-outline' },
  { key: 'reminder', icone: 'alarm-outline' },
];

export default function ProScreen() {
  const { t } = useTranslation('paywall');
  const { atualizar } = useAppData();
  const params = useLocalSearchParams<{ motivo?: string }>();
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoId>('anual');
  const [comprando, setComprando] = useState(false);

  async function handleAssinar() {
    setComprando(true);
    const resultado = await comprarPlano(planoSelecionado);
    setComprando(false);
    if (resultado.sucesso) {
      atualizar({ isPro: true, proPlano: planoSelecionado });
      router.back();
    }
  }

  async function handleRestaurar() {
    const resultado = await restaurarCompras();
    Alert.alert(t('restore.title'), resultado.sucesso ? t('restore.success') : t('restore.notFound'));
  }

  return (
    <ThemedView style={styles.container}>
      <AmbientGlow blobs={[{ color: Accent.bronze, top: '12%', left: '50%', size: 560, opacity: 0.16 }]} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Pressable onPress={() => router.back()} style={styles.fecharBtn} hitSlop={12}>
          <Ionicons name="close" size={20} color="rgba(244,239,233,0.6)" />
        </Pressable>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {params.motivo ? (
            <View style={styles.motivoChip}>
              <Ionicons name="lock-closed" size={12} color={Accent.bronze} />
              <Text style={styles.motivoTexto}>{t('contextualReason', { motivo: params.motivo })}</Text>
            </View>
          ) : null}

          <BadgeHalo size={96} rings={2} style={styles.hero}>
            <View style={styles.heroIconWrap}>
              <Image source={ICONE_PRO} style={styles.heroIcon} resizeMode="contain" />
            </View>
          </BadgeHalo>

          <Text style={styles.marca}>{t('brand')}</Text>
          <ThemedText type="titleBig" style={styles.headline}>
            {t('headline')}
          </ThemedText>
          <Text style={styles.subheadline}>{t('subheadline')}</Text>

          <View style={styles.beneficios}>
            {BENEFICIOS.map((b) => (
              <GlassCard key={b.key} style={styles.beneficioCard}>
                <View style={styles.beneficioIconWrap}>
                  <Ionicons name={b.icone} size={17} color={Accent.bronze} />
                </View>
                <Text style={styles.beneficioTexto}>{t(`benefits.${b.key}`)}</Text>
              </GlassCard>
            ))}
          </View>

          <View style={styles.planos}>
            <PlanoCard
              ativo={planoSelecionado === 'mensal'}
              titulo={t('plans.monthly')}
              preco={PLANOS.mensal.precoLabel}
              onPress={() => setPlanoSelecionado('mensal')}
            />
            <PlanoCard
              ativo={planoSelecionado === 'anual'}
              titulo={t('plans.annual')}
              preco={PLANOS.anual.precoLabel}
              selo={t('plans.annualSavings')}
              onPress={() => setPlanoSelecionado('anual')}
            />
          </View>

          <GradientButton
            label={comprando ? t('cta.processing') : t('cta.subscribe')}
            onPress={handleAssinar}
            disabled={comprando}
            style={styles.cta}
          />

          <Pressable onPress={handleRestaurar} style={styles.restaurarBtn}>
            <Text style={styles.restaurarTexto}>{t('cta.restorePurchases')}</Text>
          </Pressable>

          <Text style={styles.legal}>{t('legal.autoRenew')}</Text>

          <Pressable onPress={() => router.push('/termos-de-servico' as Href)}>
            <Text style={styles.termosLink}>{t('legal.terms')}</Text>
          </Pressable>

          <Text style={styles.footer}>{t('footer')}</Text>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function PlanoCard({
  ativo,
  titulo,
  preco,
  selo,
  onPress,
}: {
  ativo: boolean;
  titulo: string;
  preco: string;
  selo?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.planoCard, ativo ? styles.planoCardAtivo : null]}>
      {selo ? (
        <View style={styles.planoSelo}>
          <Text style={styles.planoSeloTexto}>{selo}</Text>
        </View>
      ) : null}
      <View style={styles.planoRadio}>
        {ativo ? <View style={styles.planoRadioPreenchido} /> : null}
      </View>
      <Text style={styles.planoTitulo}>{titulo}</Text>
      <Text style={styles.planoPreco}>{preco}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  fecharBtn: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.five,
    alignItems: 'center',
  },
  motivoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Accent.bronzeFundo,
    borderWidth: 1,
    borderColor: Accent.bronzeBorda,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: Spacing.four,
  },
  motivoTexto: {
    fontFamily: Fonts.body.semibold,
    fontSize: 12,
    color: Accent.bronzeMuted,
  },
  hero: { marginBottom: Spacing.three },
  heroIconWrap: { alignItems: 'center', justifyContent: 'center' },
  heroIcon: { width: 68, height: 68 },
  marca: {
    fontFamily: Fonts.display.bold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: Accent.bronze,
    marginBottom: Spacing.two,
  },
  headline: {
    textAlign: 'center',
    marginBottom: Spacing.two,
  },
  subheadline: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: 'rgba(244,239,233,0.6)',
    marginBottom: Spacing.five,
    maxWidth: 320,
  },
  beneficios: {
    width: '100%',
    gap: Spacing.two,
    marginBottom: Spacing.five,
  },
  beneficioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
  },
  beneficioIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Accent.bronzeFundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beneficioTexto: {
    flex: 1,
    fontFamily: Fonts.body.medium,
    fontSize: 14,
    lineHeight: 20,
    color: '#F4EFE9',
  },
  planos: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
    marginBottom: Spacing.four,
  },
  planoCard: {
    flex: 1,
    borderRadius: Radius.cardHighlight,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: '#171310',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
  },
  planoCardAtivo: {
    borderColor: Accent.bronze,
    backgroundColor: Accent.bronzeFundo,
  },
  planoSelo: {
    position: 'absolute',
    top: -10,
    backgroundColor: Accent.bronze,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  planoSeloTexto: {
    fontFamily: Fonts.display.bold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: '#171310',
  },
  planoRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  planoRadioPreenchido: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Accent.bronze,
  },
  planoTitulo: {
    fontFamily: Fonts.body.semibold,
    fontSize: 13,
    color: '#F4EFE9',
    marginBottom: 2,
  },
  planoPreco: {
    fontFamily: Fonts.display.bold,
    fontSize: 15,
    color: '#F4EFE9',
  },
  cta: { width: '100%', marginBottom: Spacing.three },
  restaurarBtn: { marginBottom: Spacing.four },
  restaurarTexto: {
    fontFamily: Fonts.body.semibold,
    fontSize: 13,
    color: 'rgba(244,239,233,0.55)',
  },
  legal: {
    fontFamily: Fonts.body.regular,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: 'rgba(244,239,233,0.4)',
    maxWidth: 320,
    marginBottom: Spacing.two,
  },
  termosLink: {
    fontFamily: Fonts.body.bold,
    fontSize: 11,
    color: 'rgba(244,239,233,0.55)',
    textDecorationLine: 'underline',
    marginBottom: Spacing.four,
  },
  footer: {
    fontFamily: Fonts.body.regular,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: 'rgba(244,239,233,0.35)',
    maxWidth: 320,
  },
});
