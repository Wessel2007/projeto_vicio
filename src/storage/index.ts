import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, DEFAULT_DATA } from '@/types';
import { criptografar, descriptografarOuLegado } from './crypto';

const CHAVE = 'dados_app_v1';

export async function carregarDados(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(CHAVE);
    if (!raw) return { ...DEFAULT_DATA };
    const json = await descriptografarOuLegado(raw);
    // Merge with defaults to handle new fields added in future versions
    return migrar({ ...DEFAULT_DATA, ...JSON.parse(json) });
  } catch {
    return { ...DEFAULT_DATA };
  }
}

// Migrações de dados salvos por versões anteriores do app.
function migrar(data: AppData): AppData {
  // "carmesim" foi removido como aura de patente (agora reservado ao SOS) e
  // substituído por "brasa". Dados antigos ainda podem trazer o valor legado.
  if ((data.patenteTheme as string) === 'carmesim') {
    data.patenteTheme = 'brasa';
  }
  return data;
}

export async function salvarDados(data: AppData): Promise<void> {
  const payload = await criptografar(JSON.stringify(data));
  await AsyncStorage.setItem(CHAVE, payload);
}

export async function apagarDados(): Promise<void> {
  await AsyncStorage.removeItem(CHAVE);
}
