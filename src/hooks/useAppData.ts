import { useCallback, useEffect, useState } from 'react';
import { AppData, DEFAULT_DATA, TriggerEntry } from '@/types';
import { carregarDados, salvarDados } from '@/storage';
import { calcPatente, calcStreakDias, calcTotalXP } from '@/utils/gamification';
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
      const next: AppData = {
        ...prev,
        savedXP: prev.savedXP + streakAtual * 10,
        streakStartDate: new Date().toISOString(),
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
    setDados(inicial);
  }, []);

  const derivado = dados
    ? {
        streakDias: calcStreakDias(dados.streakStartDate),
        totalXP: calcTotalXP(dados),
        patente: calcPatente(calcTotalXP(dados)),
      }
    : null;

  return { dados, carregando, atualizar, registrarRecaida, adicionarEntrada, resetarApp, derivado };
}
