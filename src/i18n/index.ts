import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import achievementsEn from '@/locales/en/achievements.json';
import celebracaoEn from '@/locales/en/celebracao.json';
import commonEn from '@/locales/en/common.json';
import frasesEn from '@/locales/en/frases.json';
import homeEn from '@/locales/en/home.json';
import onboardingEn from '@/locales/en/onboarding.json';
import panicButtonEn from '@/locales/en/panicButton.json';
import paywallEn from '@/locales/en/paywall.json';
import profileEn from '@/locales/en/profile.json';
import reflexaoRecaidaEn from '@/locales/en/reflexaoRecaida.json';
import relatorioEn from '@/locales/en/relatorio.json';
import streakDetalheEn from '@/locales/en/streakDetalhe.json';
import termosEn from '@/locales/en/termos.json';
import triggerJournalEn from '@/locales/en/triggerJournal.json';

import achievementsEs from '@/locales/es/achievements.json';
import celebracaoEs from '@/locales/es/celebracao.json';
import commonEs from '@/locales/es/common.json';
import frasesEs from '@/locales/es/frases.json';
import homeEs from '@/locales/es/home.json';
import onboardingEs from '@/locales/es/onboarding.json';
import panicButtonEs from '@/locales/es/panicButton.json';
import paywallEs from '@/locales/es/paywall.json';
import profileEs from '@/locales/es/profile.json';
import reflexaoRecaidaEs from '@/locales/es/reflexaoRecaida.json';
import relatorioEs from '@/locales/es/relatorio.json';
import streakDetalheEs from '@/locales/es/streakDetalhe.json';
import termosEs from '@/locales/es/termos.json';
import triggerJournalEs from '@/locales/es/triggerJournal.json';

import achievementsPtBR from '@/locales/pt-BR/achievements.json';
import celebracaoPtBR from '@/locales/pt-BR/celebracao.json';
import commonPtBR from '@/locales/pt-BR/common.json';
import frasesPtBR from '@/locales/pt-BR/frases.json';
import homePtBR from '@/locales/pt-BR/home.json';
import onboardingPtBR from '@/locales/pt-BR/onboarding.json';
import panicButtonPtBR from '@/locales/pt-BR/panicButton.json';
import paywallPtBR from '@/locales/pt-BR/paywall.json';
import profilePtBR from '@/locales/pt-BR/profile.json';
import reflexaoRecaidaPtBR from '@/locales/pt-BR/reflexaoRecaida.json';
import relatorioPtBR from '@/locales/pt-BR/relatorio.json';
import streakDetalhePtBR from '@/locales/pt-BR/streakDetalhe.json';
import termosPtBR from '@/locales/pt-BR/termos.json';
import triggerJournalPtBR from '@/locales/pt-BR/triggerJournal.json';

import { carregarIdiomaSalvo, salvarIdioma } from '@/storage/idioma';

// Idiomas suportados pelo app. pt-BR é o padrão/fallback (ver CLAUDE.md,
// seção Internacionalização) — qualquer idioma de dispositivo não listado
// aqui cai em pt-BR.
export const SUPPORTED_LANGUAGES = ['pt-BR', 'en', 'es'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: AppLanguage = 'pt-BR';

export const NAMESPACES = [
  'common',
  'onboarding',
  'home',
  'panicButton',
  'triggerJournal',
  'achievements',
  'profile',
  'paywall',
  'frases',
  'relatorio',
  'streakDetalhe',
  'termos',
  'celebracao',
  'reflexaoRecaida',
] as const;

const resources = {
  'pt-BR': {
    common: commonPtBR,
    onboarding: onboardingPtBR,
    home: homePtBR,
    panicButton: panicButtonPtBR,
    triggerJournal: triggerJournalPtBR,
    achievements: achievementsPtBR,
    profile: profilePtBR,
    paywall: paywallPtBR,
    frases: frasesPtBR,
    relatorio: relatorioPtBR,
    streakDetalhe: streakDetalhePtBR,
    termos: termosPtBR,
    celebracao: celebracaoPtBR,
    reflexaoRecaida: reflexaoRecaidaPtBR,
  },
  en: {
    common: commonEn,
    onboarding: onboardingEn,
    home: homeEn,
    panicButton: panicButtonEn,
    triggerJournal: triggerJournalEn,
    achievements: achievementsEn,
    profile: profileEn,
    paywall: paywallEn,
    frases: frasesEn,
    relatorio: relatorioEn,
    streakDetalhe: streakDetalheEn,
    termos: termosEn,
    celebracao: celebracaoEn,
    reflexaoRecaida: reflexaoRecaidaEn,
  },
  es: {
    common: commonEs,
    onboarding: onboardingEs,
    home: homeEs,
    panicButton: panicButtonEs,
    triggerJournal: triggerJournalEs,
    achievements: achievementsEs,
    profile: profileEs,
    paywall: paywallEs,
    frases: frasesEs,
    relatorio: relatorioEs,
    streakDetalhe: streakDetalheEs,
    termos: termosEs,
    celebracao: celebracaoEs,
    reflexaoRecaida: reflexaoRecaidaEs,
  },
};

function isSupported(lang: string | null | undefined): lang is AppLanguage {
  return !!lang && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}

/** Mapeia o languageCode do dispositivo (ex.: "pt", "en", "es-MX") para um AppLanguage suportado. */
function detectarIdiomaDispositivo(): AppLanguage {
  const locales = Localization.getLocales();
  for (const locale of locales) {
    const codigo = locale.languageCode;
    if (codigo === 'pt') return 'pt-BR';
    if (codigo === 'en') return 'en';
    if (codigo === 'es') return 'es';
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Inicializa o i18next: usa o idioma salvo pelo usuário (seletor manual em
 * Perfil) se existir; senão detecta o idioma do dispositivo via
 * expo-localization; senão cai em pt-BR. Precisa ser aguardado antes do
 * primeiro render (ver src/app/_layout.tsx).
 */
export async function initI18n(): Promise<void> {
  const idiomaSalvo = await carregarIdiomaSalvo();
  const idiomaInicial = isSupported(idiomaSalvo) ? idiomaSalvo : detectarIdiomaDispositivo();

  await i18next.use(initReactI18next).init({
    resources,
    lng: idiomaInicial,
    fallbackLng: DEFAULT_LANGUAGE,
    ns: NAMESPACES,
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

/** Troca o idioma em tempo real e persiste a escolha (seletor manual em Perfil). */
export async function mudarIdioma(idioma: AppLanguage): Promise<void> {
  await i18next.changeLanguage(idioma);
  await salvarIdioma(idioma);
}

export default i18next;
