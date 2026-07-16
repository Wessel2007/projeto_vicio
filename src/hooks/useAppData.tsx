import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { AppData, DEFAULT_DATA, RelapseReflection, TriggerEntry } from '@/types';
import { DEFAULT_USER_PROFILE, UserProfile } from '@/types/perfil';
import { carregarDados, salvarDados } from '@/storage';
import { apagarPerfil, carregarPerfil } from '@/storage/perfil';
import { RECAIDA_PENALIDADE_PERCENT, REFLEXAO_XP_BONUS, XP_POR_DIA } from '@/constants/gamification';
import { calcMaiorStreak, calcPatente, calcStreakDias, calcTotalXP } from '@/utils/gamification';
import { agendarLembreteDiario, desativarNotificacoes } from '@/notifications';
import { limparRankVisto } from '@/hooks/useRankUpCelebration';

function logFalhaStorage(origem: string) {
  return (erro: unknown) => console.error(`[FORJA] Falha ao salvar dados (${origem})`, erro);
}

interface AppDataContextValue {
  dados: AppData | null;
  // Perfil sigiloso coletado no onboarding (comportamento-alvo, estilo
  // motivacional, marco esperado etc.) — usado para adaptar copy, nunca
  // exposto na UI. Ver src/types/perfil.ts.
  perfil: UserProfile | null;
  carregando: boolean;
  atualizar: (patch: Partial<AppData>) => void;
  registrarReflexaoRecaida: (input: {
    triggerTags: string[];
    emotionBefore: string | null;
    whatWouldChange: string;
    commitment: string;
  }) => void;
  adicionarEntrada: (entry: Omit<TriggerEntry, 'id' | 'date'>) => void;
  resetarApp: () => Promise<void>;
  derivado: {
    streakDias: number;
    totalXP: number;
    patente: ReturnType<typeof calcPatente>;
    maiorStreak: number;
  } | null;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

// Estado montado uma única vez em AppDataProvider (ver src/app/_layout.tsx) e
// compartilhado por todas as telas via useAppData(). Antes cada tela chamava
// este hook de forma independente, então registrar uma recaída/"resisti" no
// botão de pânico não atualizava a Home por baixo (ela fica só coberta pelo
// modal, não desmontada) até o app ser fechado e reaberto.
function useAppDataState(): AppDataContextValue {
  const [dados, setDados] = useState<AppData | null>(null);
  const [perfil, setPerfil] = useState<UserProfile | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([carregarDados(), carregarPerfil()]).then(([d, p]) => {
      setDados(d);
      setPerfil(p);
      setCarregando(false);
      // Re-agenda o lembrete a cada abertura do app: o Android pode limpar
      // notificações agendadas após reinício do aparelho.
      if (d.notificationsEnabled) {
        agendarLembreteDiario(d.dailyQuoteHour, d.dailyQuoteMinute, p.estiloMotivacional);
      }
    });
  }, []);

  const atualizar = useCallback((patch: Partial<AppData>) => {
    setDados((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      salvarDados(next).catch(logFalhaStorage('atualizar'));
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
        salvarDados(next).catch(logFalhaStorage('registrarReflexaoRecaida'));
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
      salvarDados(next).catch(logFalhaStorage('adicionarEntrada'));
      return next;
    });
  }, []);

  const resetarApp = useCallback(async () => {
    const inicial = { ...DEFAULT_DATA };
    await desativarNotificacoes();
    await salvarDados(inicial);
    await apagarPerfil();
    await limparRankVisto();
    setDados(inicial);
    setPerfil({ ...DEFAULT_USER_PROFILE });
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
    perfil,
    carregando,
    atualizar,
    registrarReflexaoRecaida,
    adicionarEntrada,
    resetarApp,
    derivado,
  };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const value = useAppDataState();
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData deve ser usado dentro de um AppDataProvider');
  }
  return ctx;
}
