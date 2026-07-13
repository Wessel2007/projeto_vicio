import { useCallback, useEffect, useState } from 'react';
import { AppData, DEFAULT_DATA, TriggerEntry } from '@/types';
import { carregarDados, salvarDados } from '@/storage';
import { apagarPerfil } from '@/storage/perfil';
import { RECAIDA_PENALIDADE_PERCENT, XP_POR_DIA } from '@/constants/gamification';
import { calcMaiorStreak, calcPatente, calcStreakDias, calcTotalXP } from '@/utils/gamification';
import { agendarLembreteDiario } from '@/notifications';

export function useAppData() {
  const [dados, setDados] = useState<AppData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados().then((d) => {
      setDados(d);
      setCarregando(false);
      // Re-agenda o lembrete a cada abertura do app: o Android pode limpar
      // notificações agendadas após reinício do aparelho.
      if (d.notificationsEnabled) {
        agendarLembreteDiario(d.dailyQuoteHour, d.dailyQuoteMinute);
      }
    });
  }, []);

  const atualizar = useCallback((patch: Partial<AppData>) => {
    setDados((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      salvarDados(next);
      return next;
    });
  }, []);

  const registrarRecaida = useCallback(() => {
    setDados((prev) => {
      if (!prev) return prev;
      const streakAtual = calcStreakDias(prev.streakStartDate);
      const xpStreak = streakAtual * XP_POR_DIA;
      const xpRetido = Math.round(xpStreak * (1 - RECAIDA_PENALIDADE_PERCENT));
      const agora = new Date().toISOString();
      const next: AppData = {
        ...prev,
        savedXP: prev.savedXP + xpRetido,
        streakStartDate: agora,
        relapseDates: [...prev.relapseDates, agora],
      };
      salvarDados(next);
      return next;
    });
  }, []);

  const adicionarEntrada = useCallback((entry: Omit<TriggerEntry, 'id' | 'date'>) => {
    setDados((prev) => {
      if (!prev) return prev;
      const nova: TriggerEntry = {
        ...entry,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      const next = { ...prev, entries: [nova, ...prev.entries] };
      salvarDados(next);
      return next;
    });
  }, []);

  const resetarApp = useCallback(async () => {
    const inicial = { ...DEFAULT_DATA };
    await salvarDados(inicial);
    await apagarPerfil();
    setDados(inicial);
  }, []);

  const derivado = dados
    ? {
        streakDias: calcStreakDias(dados.streakStartDate),
        totalXP: calcTotalXP(dados),
        patente: calcPatente(calcTotalXP(dados), dados.isPro),
        maiorStreak: calcMaiorStreak(dados),
      }
    : null;

  return { dados, carregando, atualizar, registrarRecaida, adicionarEntrada, resetarApp, derivado };
}
