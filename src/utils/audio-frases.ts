import * as Speech from 'expo-speech';

import i18n, { type AppLanguage } from '@/i18n';

const SPEECH_LOCALE: Record<AppLanguage, string> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
};

/** Narração de texto via TTS do sistema (feature PRO). Usa a voz do idioma ativo do app. */
export function falarFrase(texto: string, autor?: string): void {
  Speech.stop();
  const conteudo = autor ? `${texto} — ${autor}` : texto;
  const language = SPEECH_LOCALE[i18n.language as AppLanguage] ?? SPEECH_LOCALE['pt-BR'];
  Speech.speak(conteudo, { language, pitch: 1, rate: 0.95 });
}

export function pararFala(): void {
  Speech.stop();
}
