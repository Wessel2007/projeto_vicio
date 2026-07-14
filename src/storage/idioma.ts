import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppLanguage } from '@/i18n';

// Chave própria, separada de 'dados_app_v1' — a preferência de idioma não é
// dado de gamificação e não deve passar pela migração de AppData.
const CHAVE = 'idioma_app_v1';

export async function carregarIdiomaSalvo(): Promise<AppLanguage | null> {
  try {
    const raw = await AsyncStorage.getItem(CHAVE);
    return raw as AppLanguage | null;
  } catch {
    return null;
  }
}

export async function salvarIdioma(idioma: AppLanguage): Promise<void> {
  await AsyncStorage.setItem(CHAVE, idioma);
}
