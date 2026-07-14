import { Alert } from 'react-native';

import i18n from '@/i18n';

/** Alerta padrão exibido quando um usuário Free tenta usar um recurso PRO. */
export function mostrarPaywall(recurso: string): void {
  Alert.alert(i18n.t('common:paywall.title'), i18n.t('common:paywall.message', { recurso }));
}
