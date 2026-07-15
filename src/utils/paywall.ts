import { router, type Href } from 'expo-router';

/** Abre a tela de upgrade PRO quando um usuário Free tenta usar um recurso PRO. */
export function mostrarPaywall(recurso: string): void {
  router.push({ pathname: '/pro', params: { motivo: recurso } } as unknown as Href);
}
