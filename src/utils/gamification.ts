import { AppData } from '@/types';
import { NIVEIS, NivelPatente, XP_POR_DIA } from '@/constants/gamification';

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
}

export function calcPatente(totalXP: number): InfoPatente {
  const diasEfetivos = Math.floor(totalXP / XP_POR_DIA);

  // Find the highest level the user has reached
  let nivelAtual = NIVEIS[0];
  for (const nivel of NIVEIS) {
    if (diasEfetivos >= nivel.minDias) {
      nivelAtual = nivel;
    } else {
      break;
    }
  }

  const idxAtual = NIVEIS.indexOf(nivelAtual);
  const proxNivel = NIVEIS[idxAtual + 1] ?? null;

  let progressoPercent = 100;
  if (proxNivel) {
    const diasNoNivel = diasEfetivos - nivelAtual.minDias;
    const diasParaProx = proxNivel.minDias - nivelAtual.minDias;
    progressoPercent = Math.min(100, Math.floor((diasNoNivel / diasParaProx) * 100));
  }

  return { nivel: nivelAtual, proxNivel, diasEfetivos, progressoPercent };
}

export function formatarStreak(dias: number): string {
  if (dias === 0) return 'Hoje é o dia 1';
  if (dias === 1) return '1 dia';
  return `${dias} dias`;
}
