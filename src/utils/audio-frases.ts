import * as Speech from 'expo-speech';

/** Narração de texto via TTS do sistema (feature PRO). */
export function falarFrase(texto: string, autor?: string): void {
  Speech.stop();
  const conteudo = autor ? `${texto} — ${autor}` : texto;
  Speech.speak(conteudo, { language: 'pt-BR', pitch: 1, rate: 0.95 });
}

export function pararFala(): void {
  Speech.stop();
}
