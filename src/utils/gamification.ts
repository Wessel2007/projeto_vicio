import { AppData } from '@/types';
import { FREE_MAX_RANK_INDEX, NIVEIS, NivelPatente, XP_POR_DIA } from '@/constants/gamification';

export function calcStreakDias(streakStartDate: string | null): number {
  if (!streakStartDate) return 0;
  const inicio = new Date(streakStartDate).getTime();
  const agora = Date.now();
  return Math.max(0, Math.floor((agora - inicio) / (1000 * 60 * 60 * 24)));
}

export function calcTotalXP(data: Pick<AppData, 'savedXP' | 'streakStartDate'>): number {
  return data.savedXP + calcStreakDias(data.streakStartDate) * XP_POR_DIA;
}

export interface InfoPatente {
  nivel: NivelPatente;
  proxNivel: NivelPatente | null;
  diasEfetivos: number;
  progressoPercent: number; // 0–100 toward next level
  // true quando o usuário Free já acumulou dias/XP suficientes para passar de
  // Guerreiro, mas a progressão fica travada em Guerreiro III até assinar PRO.
  bloqueadoPorPlano: boolean;
}

export function calcPatente(totalXP: number, isPro: boolean = true): InfoPatente {
  const diasEfetivos = Math.floor(totalXP / XP_POR_DIA);

  // Find the highest level the user has actually reached (independente do plano)
  let idxReal = 0;
  for (let i = 0; i < NIVEIS.length; i++) {
    if (diasEfetivos >= NIVEIS[i].minDias) {
      idxReal = i;
    } else {
      break;
    }
  }

  const bloqueadoPorPlano = !isPro && idxReal > FREE_MAX_RANK_INDEX;
  const idxAtual = bloqueadoPorPlano ? FREE_MAX_RANK_INDEX : idxReal;
  const nivelAtual = NIVEIS[idxAtual];
  const proxNivel = bloqueadoPorPlano ? null : (NIVEIS[idxAtual + 1] ?? null);

  let progressoPercent = 100;
  if (proxNivel) {
    const diasNoNivel = diasEfetivos - nivelAtual.minDias;
    const diasParaProx = proxNivel.minDias - nivelAtual.minDias;
    progressoPercent = Math.max(0, Math.min(100, Math.floor((diasNoNivel / diasParaProx) * 100)));
  }

  return { nivel: nivelAtual, proxNivel, diasEfetivos, progressoPercent, bloqueadoPorPlano };
}

export function formatarStreak(dias: number): string {
  if (dias === 0) return 'Hoje é o dia 1';
  if (dias === 1) return '1 dia';
  return `${dias} dias`;
}

export function calcMaiorStreak(
  data: Pick<AppData, 'trackingStartDate' | 'streakStartDate' | 'relapseDates'>,
): number {
  const inicio = data.trackingStartDate ?? data.streakStartDate;
  if (!inicio) return 0;

  const marcos = [
    new Date(inicio).getTime(),
    ...data.relapseDates.map((d) => new Date(d).getTime()),
    Date.now(),
  ].sort((a, b) => a - b);

  let maior = 0;
  for (let i = 1; i < marcos.length; i++) {
    const diasSegmento = Math.floor((marcos[i] - marcos[i - 1]) / (1000 * 60 * 60 * 24));
    maior = Math.max(maior, diasSegmento);
  }
  // A streak em andamento (calculada a partir de streakStartDate, que pode ser
  // retroativa por causa do onboarding) nunca pode deixar o recorde para trás.
  return Math.max(maior, calcStreakDias(data.streakStartDate));
}
