import { Alert } from 'react-native';

/** Alerta padrão exibido quando um usuário Free tenta usar um recurso PRO. */
export function mostrarPaywall(recurso: string): void {
  Alert.alert(
    'Recurso PRO',
    `${recurso} é exclusivo do plano PRO. Assine para desbloquear.`,
  );
}
