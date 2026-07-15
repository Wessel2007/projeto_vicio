import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { gcm } from '@noble/ciphers/aes.js';

// Camada de criptografia at-rest para os dados sensíveis do app (diário de
// gatilhos, reflexões de recaída, contato de confiança, perfil do
// onboarding). Protege contra extração de backup ou acesso físico ao
// aparelho — não é proteção contra o próprio dispositivo comprometido/rooted.
//
// Lib escolhida: @noble/ciphers (AES-256-GCM puro em JS, audit­ado, sem
// dependências nativas). Alternativas como `react-native-aes-crypto` foram
// descartadas porque são módulos nativos antigos (bridge clássico) sem
// suporte garantido à New Architecture, que é o padrão no Expo SDK 54/RN
// 0.81 deste projeto — usar uma lib pura em JS evita esse risco de
// compatibilidade e dispensa qualquer config plugin/prebuild adicional.
// GCM já entrega autenticação (AEAD), então não é necessário compor
// AES-CBC + HMAC manualmente.

const CHAVE_MESTRA_STORAGE_KEY = 'forja_master_key_v1';
const TAMANHO_CHAVE_BYTES = 32; // AES-256
const TAMANHO_NONCE_BYTES = 12; // padrão recomendado para GCM

let chaveCache: Uint8Array | null = null;

async function obterOuCriarChaveMestra(): Promise<Uint8Array> {
  if (chaveCache) return chaveCache;

  const existente = await SecureStore.getItemAsync(CHAVE_MESTRA_STORAGE_KEY);
  if (existente) {
    chaveCache = base64ParaBytes(existente);
    return chaveCache;
  }

  const novaChave = await Crypto.getRandomBytesAsync(TAMANHO_CHAVE_BYTES);
  await SecureStore.setItemAsync(CHAVE_MESTRA_STORAGE_KEY, bytesParaBase64(novaChave), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  chaveCache = novaChave;
  return novaChave;
}

/** Cifra um JSON (string) e retorna o payload `{ iv, data }` em base64, serializado como string. */
export async function criptografar(json: string): Promise<string> {
  const chave = await obterOuCriarChaveMestra();
  const nonce = await Crypto.getRandomBytesAsync(TAMANHO_NONCE_BYTES);
  const textoPlano = new TextEncoder().encode(json);
  const cifrado = gcm(chave, nonce).encrypt(textoPlano);

  return JSON.stringify({
    iv: bytesParaBase64(nonce),
    data: bytesParaBase64(cifrado),
  });
}

/** Decifra um payload gerado por `criptografar` e retorna o JSON (string) original. */
export async function descriptografar(payload: string): Promise<string> {
  const { iv, data } = JSON.parse(payload) as { iv: string; data: string };
  const chave = await obterOuCriarChaveMestra();
  const nonce = base64ParaBytes(iv);
  const cifrado = base64ParaBytes(data);
  const textoPlano = gcm(chave, nonce).decrypt(cifrado);
  return new TextDecoder().decode(textoPlano);
}

/**
 * Tenta decifrar `raw`; se falhar (payload em texto puro salvo por uma
 * versão anterior do app, ou formato inesperado), devolve `raw` como está
 * para o chamador tentar `JSON.parse` diretamente (dado legado). Se `raw`
 * também não for JSON válido, o erro sobe para o catch do chamador, que
 * cai nos valores padrão — mesmo comportamento de hoje para dado corrompido.
 */
export async function descriptografarOuLegado(raw: string): Promise<string> {
  try {
    return await descriptografar(raw);
  } catch {
    return raw;
  }
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesParaBase64(bytes: Uint8Array): string {
  let resultado = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : undefined;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : undefined;

    resultado += BASE64_CHARS[b0 >> 2];
    resultado += BASE64_CHARS[((b0 & 0x03) << 4) | ((b1 ?? 0) >> 4)];
    resultado += b1 === undefined ? '=' : BASE64_CHARS[((b1 & 0x0f) << 2) | ((b2 ?? 0) >> 6)];
    resultado += b2 === undefined ? '=' : BASE64_CHARS[b2 & 0x3f];
  }
  return resultado;
}

function base64ParaBytes(base64: string): Uint8Array {
  const limpo = base64.replace(/=+$/, '');
  const bytes: number[] = [];
  let bits = 0;
  let valor = 0;

  for (const char of limpo) {
    const indice = BASE64_CHARS.indexOf(char);
    if (indice === -1) continue;
    valor = (valor << 6) | indice;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((valor >> bits) & 0xff);
    }
  }

  return new Uint8Array(bytes);
}
