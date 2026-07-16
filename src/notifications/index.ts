import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import i18n from '@/i18n';
import type { EstiloMotivacional } from '@/types/perfil';

const DAILY_QUOTE_ID = 'lembrete-diario';
const CANAL_ANDROID = 'lembretes-diarios';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function configurarCanalAndroid() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
    name: i18n.t('common:notifications.channelName'),
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function solicitarPermissao(): Promise<boolean> {
  const { status: statusAtual } = await Notifications.getPermissionsAsync();
  if (statusAtual === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// `estiloMotivacional` (perfil sigiloso do onboarding) escolhe o tom da copy
// via o recurso de `context` do i18next: com 'acolhedor' ele busca a chave
// "dailyReminderTitle_acolhedor" antes de cair na chave padrão (tom direto).
export async function agendarLembreteDiario(
  hour: number,
  minute: number,
  estiloMotivacional?: EstiloMotivacional | null,
): Promise<void> {
  await configurarCanalAndroid();
  await Notifications.cancelScheduledNotificationAsync(DAILY_QUOTE_ID).catch(() => {});
  const context = estiloMotivacional ?? undefined;
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_QUOTE_ID,
    content: {
      title: i18n.t('common:notifications.dailyReminderTitle', { context }),
      body: i18n.t('common:notifications.dailyReminderBody', { context }),
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelarLembreteDiario(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_QUOTE_ID).catch(() => {});
}

/** Pede permissão e agenda o lembrete. Retorna false se a permissão foi negada. */
export async function ativarNotificacoes(
  hour: number,
  minute: number,
  estiloMotivacional?: EstiloMotivacional | null,
): Promise<boolean> {
  const permitido = await solicitarPermissao();
  if (!permitido) return false;
  await agendarLembreteDiario(hour, minute, estiloMotivacional);
  return true;
}

export async function desativarNotificacoes(): Promise<void> {
  await cancelarLembreteDiario();
}
