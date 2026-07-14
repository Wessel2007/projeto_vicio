import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useRef } from 'react';

import { NIVEIS } from '@/constants/gamification';
import type { InfoPatente } from '@/utils/gamification';

const RANK_VISTO_KEY = 'forja:rankVisto';
const SUBLEVEL_LABEL = ['I', 'II', 'III'];

function rankIndex(nome: string, sublevel: 1 | 2 | 3 | null): number {
  return NIVEIS.findIndex((n) => n.nome === nome && n.sublevel === sublevel);
}

/** Limpa a patente "já vista" — chamar junto de um reset completo dos dados,
 * senão a próxima celebração de patente fica presa atrás do recorde antigo. */
export async function limparRankVisto(): Promise<void> {
  await AsyncStorage.removeItem(RANK_VISTO_KEY);
}

/**
 * Dispara a tela de Celebração ao subir de patente. Guarda o índice da patente
 * já "vista" no AsyncStorage: se o índice atual for maior, celebra e atualiza.
 * Na primeira execução (nada salvo) apenas registra, sem celebrar — evita
 * disparo falso na instalação/atualização do app.
 */
export function useRankUpCelebration(patente: InfoPatente | null | undefined, streakDias: number) {
  const checando = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!patente || checando.current) return;
      checando.current = true;

      const idxAtual = rankIndex(patente.nivel.nome, patente.nivel.sublevel);

      (async () => {
        try {
          const raw = await AsyncStorage.getItem(RANK_VISTO_KEY);
          const visto = raw == null ? null : Number(raw);

          if (visto != null && idxAtual > visto) {
            await AsyncStorage.setItem(RANK_VISTO_KEY, String(idxAtual));
            const prox = patente.proxNivel;
            router.push({
              pathname: '/celebracao',
              params: {
                nome: patente.nivel.nome,
                sublevel: patente.nivel.sublevel != null ? String(patente.nivel.sublevel) : '',
                dias: String(streakDias),
                prox: prox
                  ? `${prox.nome}${prox.sublevel ? ` ${SUBLEVEL_LABEL[prox.sublevel - 1]}` : ''}`
                  : '',
                proxDias: prox ? String(Math.max(0, prox.minDias - patente.diasEfetivos)) : '',
              },
            } as unknown as Href);
          } else if (visto == null || idxAtual > visto) {
            await AsyncStorage.setItem(RANK_VISTO_KEY, String(idxAtual));
          }
        } finally {
          checando.current = false;
        }
      })();
    }, [patente, streakDias]),
  );
}
