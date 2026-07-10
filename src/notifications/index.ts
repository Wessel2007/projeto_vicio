import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
    name: 'Lembretes diários',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function solicitarPermissao(): Promise<boolean> {
  const { status: statusAtual } = await Notifications.getPermissionsAsync();
  if (statusAtual === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function agendarLembreteDiario(hour: number, minute: number): Promise<void> {
  await configurarCanalAndroid();
  await Notifications.cancelScheduledNotificationAsync(DAILY_QUOTE_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_QUOTE_ID,
    content: {
      title: '🔥 Sua disciplina de hoje',
      body: 'Sua frase do dia e sua patente estão te esperando. Abra o FORJA.',
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
export async function ativarNotificacoes(hour: number, minute: number): Promise<boolean> {
  const permitido = await solicitarPermissao();
  if (!permitido) return false;
  await agendarLembreteDiario(hour, minute);
  return true;
}

export async function desativarNotificacoes(): Promise<void> {
  await cancelarLembreteDiario();
}
