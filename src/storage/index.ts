import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, DEFAULT_DATA } from '@/types';

const CHAVE = 'dados_app_v1';

export async function carregarDados(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(CHAVE);
    if (!raw) return { ...DEFAULT_DATA };
    // Merge with defaults to handle new fields added in future versions
    return { ...DEFAULT_DATA, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_DATA };
  }
}

export async function salvarDados(data: AppData): Promise<void> {
  await AsyncStorage.setItem(CHAVE, JSON.stringify(data));
}

export async function apagarDados(): Promise<void> {
  await AsyncStorage.removeItem(CHAVE);
}
