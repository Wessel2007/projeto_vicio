import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_USER_PROFILE, UserProfile } from '@/types/perfil';
import { criptografar, descriptografarOuLegado } from './crypto';

// Chave própria e separada de 'dados_app_v1' (streak/XP) — mantém as
// respostas sigilosas do onboarding fora da lógica de gamificação.
const CHAVE = 'perfil_usuario_v1';

export async function carregarPerfil(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(CHAVE);
    if (!raw) return { ...DEFAULT_USER_PROFILE };
    const json = await descriptografarOuLegado(raw);
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(json) };
  } catch {
    return { ...DEFAULT_USER_PROFILE };
  }
}

export async function salvarPerfil(perfil: UserProfile): Promise<void> {
  const payload = await criptografar(JSON.stringify(perfil));
  await AsyncStorage.setItem(CHAVE, payload);
}

export async function apagarPerfil(): Promise<void> {
  await AsyncStorage.removeItem(CHAVE);
}
