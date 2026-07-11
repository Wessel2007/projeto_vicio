import { TriggerEntry } from '@/types';

export interface ContagemGatilho {
  gatilho: string;
  total: number;
  percent: number;
}

/** Gatilhos mais frequentes, do mais para o menos comum. */
export function contarGatilhos(entries: TriggerEntry[]): ContagemGatilho[] {
  const contagem = new Map<string, number>();
  entries.forEach((e) => contagem.set(e.trigger, (contagem.get(e.trigger) ?? 0) + 1));
  const max = Math.max(1, ...contagem.values());
  return [...contagem.entries()]
    .map(([gatilho, total]) => ({ gatilho, total, percent: Math.round((total / max) * 100) }))
    .sort((a, b) => b.total - a.total);
}

const FAIXAS_HORARIO = [
  { label: 'Madrugada (0h–6h)', inicio: 0, fim: 6 },
  { label: 'Manhã (6h–12h)', inicio: 6, fim: 12 },
  { label: 'Tarde (12h–18h)', inicio: 12, fim: 18 },
  { label: 'Noite (18h–24h)', inicio: 18, fim: 24 },
];

export interface ContagemHorario {
  label: string;
  total: number;
  percent: number;
}

/** Distribuição das entradas por faixa de horário do dia. */
export function contarPorHorario(entries: TriggerEntry[]): ContagemHorario[] {
  const contagem = FAIXAS_HORARIO.map((faixa) => ({
    label: faixa.label,
    total: entries.filter((e) => {
      const hora = new Date(e.date).getHours();
      return hora >= faixa.inicio && hora < faixa.fim;
    }).length,
  }));
  const max = Math.max(1, ...contagem.map((c) => c.total));
  return contagem.map((c) => ({ ...c, percent: Math.round((c.total / max) * 100) }));
}

export interface TaxaResistencia {
  resistidas: number;
  recaidas: number;
  percentResistencia: number;
}

export function calcTaxaResistencia(entries: TriggerEntry[]): TaxaResistencia {
  const resistidas = entries.filter((e) => e.resisted).length;
  const recaidas = entries.length - resistidas;
  const percentResistencia = entries.length === 0 ? 0 : Math.round((resistidas / entries.length) * 100);
  return { resistidas, recaidas, percentResistencia };
}

/** Nº de entradas nos últimos 7 dias vs. nos 7 dias anteriores a esses. */
export function calcTendenciaSemanal(entries: TriggerEntry[]): { semanaAtual: number; semanaAnterior: number } {
  const agora = Date.now();
  const DIA = 24 * 60 * 60 * 1000;
  const semanaAtual = entries.filter((e) => agora - new Date(e.date).getTime() <= 7 * DIA).length;
  const semanaAnterior = entries.filter((e) => {
    const diff = agora - new Date(e.date).getTime();
    return diff > 7 * DIA && diff <= 14 * DIA;
  }).length;
  return { semanaAtual, semanaAnterior };
}
