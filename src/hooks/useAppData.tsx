import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppData, DEFAULT_DATA, RelapseReflection, TriggerEntry } from '@/types';
import { DEFAULT_USER_PROFILE, UserProfile } from '@/types/perfil';
import { carregarDados, salvarDados } from '@/storage';
import { apagarPerfil, carregarPerfil } from '@/storage/perfil';
import {
  RECAIDA_PENALIDADE_PERCENT,
  REFLEXAO_XP_BONUS,
  RESISTENCIA_XP_BONUS,
  XP_POR_DIA,
} from '@/constants/gamification';
import { calcMaiorStreak, calcPatente, calcStreakDias, calcTotalXP } from '@/utils/gamification';
import { agendarLembreteDiario, desativarNotificacoes } from '@/notifications';
import { limparRankVisto } from '@/hooks/useRankUpCelebration';
import { configurarCompras, sincronizarStatusPro } from '@/services/assinatura';

function logFalhaStorage(origem: string) {
  return (erro: unknown) => console.error(`[FORNALHA] Falha ao salvar dados (${origem})`, erro);
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

  // Fila que serializa as escritas no AsyncStorage: sem isso, chamadas
  // próximas (ex.: digitar rápido em Perfil, ou trocar de tela logo após uma
  // ação) disparam salvarDados() em paralelo, e a promise mais antiga pode
  // resolver DEPOIS da mais nova — sobrescrevendo o storage com um snapshot
  // desatualizado (o app mostra o estado certo em memória, mas o que fica
  // gravado em disco é o antigo, e reaparece ao reabrir o app).
  const filaEscrita = useRef<Promise<void>>(Promise.resolve());
  const persistir = useCallback((next: AppData, origem: string): Promise<void> => {
    const tarefa = filaEscrita.current
      .catch(() => {})
      .then(() => salvarDados(next))
      .catch(logFalhaStorage(origem));
    filaEscrita.current = tarefa;
    return tarefa;
  }, []);

  useEffect(() => {
    configurarCompras();
    Promise.all([carregarDados(), carregarPerfil()]).then(async ([d, p]) => {
      // Revalida o entitlement Pro na loja a cada boot: cobre cancelamento/
      // expiração que aconteceram fora do app. Retorna null se o RevenueCat
      // não estiver configurado ainda (ver src/config/revenuecat.ts) — nesse
      // caso não mexe no isPro salvo, preservando o toggle de simulação de
      // Perfil > Modo de teste durante o desenvolvimento.
      const statusPro = await sincronizarStatusPro();
      const dadosSincronizados =
        statusPro && statusPro.isPro !== d.isPro
          ? { ...d, isPro: statusPro.isPro, proPlano: statusPro.isPro ? d.proPlano : null }
          : d;
      if (dadosSincronizados !== d) {
        persistir(dadosSincronizados, 'sincronizarStatusPro');
      }
      setDados(dadosSincronizados);
      setPerfil(p);
      setCarregando(false);
      // Re-agenda o lembrete a cada abertura do app: o Android pode limpar
      // notificações agendadas após reinício do aparelho.
      if (d.notificationsEnabled) {
        agendarLembreteDiario(d.dailyQuoteHour, d.dailyQuoteMinute, p.estiloMotivacional);
      }
    });
  }, [persistir]);

  const atualizar = useCallback((patch: Partial<AppData>) => {
    setDados((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persistir(next, 'atualizar');
      return next;
    });
  }, [persistir]);

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
        persistir(next, 'registrarReflexaoRecaida');
        return next;
      });
    },
    [persistir],
  );

  // Toda resistência registrada (Botão de Pânico ou lançamento manual no
  // Diário com "resisti") rende um XP fixo somado em savedXP — recaídas
  // nunca passam por aqui, elas têm seu próprio caminho em
  // registrarReflexaoRecaida, então não há risco de premiar os dois lados.
  const adicionarEntrada = useCallback((entry: Omit<TriggerEntry, 'id' | 'date'>) => {
    setDados((prev) => {
      if (!prev) return prev;
      const nova: TriggerEntry = {
        ...entry,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      const next = {
        ...prev,
        entries: [nova, ...prev.entries],
        savedXP: prev.savedXP + (entry.resisted ? RESISTENCIA_XP_BONUS : 0),
      };
      persistir(next, 'adicionarEntrada');
      return next;
    });
  }, [persistir]);

  const resetarApp = useCallback(async () => {
    const inicial = { ...DEFAULT_DATA };
    await desativarNotificacoes();
    // Aguarda a fila (não só o próprio salvarDados): garante que nenhuma
    // escrita anterior ainda pendente sobrescreva o reset depois.
    await persistir(inicial, 'resetarApp');
    await apagarPerfil();
    await limparRankVisto();
    setDados(inicial);
    setPerfil({ ...DEFAULT_USER_PROFILE });
  }, [persistir]);

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
