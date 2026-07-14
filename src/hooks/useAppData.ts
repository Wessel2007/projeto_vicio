import { useCallback, useEffect, useState } from 'react';
import { AppData, DEFAULT_DATA, RelapseReflection, TriggerEntry } from '@/types';
import { carregarDados, salvarDados } from '@/storage';
import { apagarPerfil } from '@/storage/perfil';
import { RECAIDA_PENALIDADE_PERCENT, REFLEXAO_XP_BONUS, XP_POR_DIA } from '@/constants/gamification';
import { calcMaiorStreak, calcPatente, calcStreakDias, calcTotalXP } from '@/utils/gamification';
import { agendarLembreteDiario } from '@/notifications';
import { limparRankVisto } from '@/hooks/useRankUpCelebration';

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

  // Único caminho de registro de recaída do app: streak reseta, uma fração
  // do XP da streak é retida em savedXP (RECAIDA_PENALIDADE_PERCENT), e um
  // pequeno bônus é somado por completar a reflexão — nunca pela recaída em
  // si. Também gera uma TriggerEntry (resisted: false) pra manter o Diário e
  // os insights existentes coerentes com o histórico.
  const registrarReflexaoRecaida = useCallback(
    (input: {
      triggerTags: string[];
      emotionBefore: string | null;
      whatWouldChange: string;
      commitment: string;
    }) => {
      setDados((prev) => {
        if (!prev) return prev;
        const streakAtRelapse = calcStreakDias(prev.streakStartDate);
        const xpStreak = streakAtRelapse * XP_POR_DIA;
        const xpRetido = Math.round(xpStreak * (1 - RECAIDA_PENALIDADE_PERCENT));
        const agora = new Date().toISOString();

        const reflexao: RelapseReflection = {
          id: Date.now().toString(),
          date: agora,
          triggerTags: input.triggerTags,
          emotionBefore: input.emotionBefore,
          whatWouldChange: input.whatWouldChange,
          commitment: input.commitment,
          streakAtRelapse,
          xpAwarded: REFLEXAO_XP_BONUS,
        };
        const novaEntrada: TriggerEntry = {
          id: (Date.now() + 1).toString(),
          date: agora,
          trigger: input.triggerTags[0] ?? 'Recaída',
          notes: input.emotionBefore ?? '',
          resisted: false,
        };

        const next: AppData = {
          ...prev,
          savedXP: prev.savedXP + xpRetido + REFLEXAO_XP_BONUS,
          streakStartDate: agora,
          relapseDates: [...prev.relapseDates, agora],
          entries: [novaEntrada, ...prev.entries],
          relapseReflections: [reflexao, ...prev.relapseReflections],
        };
        salvarDados(next);
        return next;
      });
    },
    [],
  );

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
    await limparRankVisto();
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

  return {
    dados,
    carregando,
    atualizar,
    registrarReflexaoRecaida,
    adicionarEntrada,
    resetarApp,
    derivado,
  };
}
