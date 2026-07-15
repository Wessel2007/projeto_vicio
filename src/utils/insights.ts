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

// `key` é o identificador estável usado para traduzir o rótulo (ver
// triggerJournal.json > horarios.<key>) — não muda por idioma.
const FAIXAS_HORARIO = [
  { key: 'madrugada', inicio: 0, fim: 6 },
  { key: 'manha', inicio: 6, fim: 12 },
  { key: 'tarde', inicio: 12, fim: 18 },
  { key: 'noite', inicio: 18, fim: 24 },
] as const;

export interface ContagemHorario {
  key: string;
  total: number;
  percent: number;
}

/** Distribuição das entradas por faixa de horário do dia. */
export function contarPorHorario(entries: TriggerEntry[]): ContagemHorario[] {
  const contagem = FAIXAS_HORARIO.map((faixa) => ({
    key: faixa.key,
    total: entries.filter((e) => {
      const hora = new Date(e.date).getHours();
      return hora >= faixa.inicio && hora < faixa.fim;
    }).length,
  }));
  const max = Math.max(1, ...contagem.map((c) => c.total));
  return contagem.map((c) => ({ ...c, percent: Math.round((c.total / max) * 100) }));
}

const MIN_ENTRADAS_PADRAO_HORARIO = 5;

export interface RiscoHorario {
  inicioHora: number;
  fimHora: number;
  total: number;
}

/**
 * Bloco de 2h (0-2, 2-4, ..., 22-24) com maior concentração de registros do
 * Diário. Retorna null com menos de MIN_ENTRADAS_PADRAO_HORARIO entradas —
 * ainda não há dado suficiente pra um padrão confiável (ver card "Horário de
 * Risco" na Home).
 */
export function calcRiscoHorario(entries: TriggerEntry[]): RiscoHorario | null {
  if (entries.length < MIN_ENTRADAS_PADRAO_HORARIO) return null;

  const blocos = new Array(12).fill(0);
  entries.forEach((e) => {
    const hora = new Date(e.date).getHours();
    blocos[Math.floor(hora / 2)] += 1;
  });

  let maxIdx = 0;
  for (let i = 1; i < blocos.length; i++) {
    if (blocos[i] > blocos[maxIdx]) maxIdx = i;
  }
  if (blocos[maxIdx] === 0) return null;

  return { inicioHora: maxIdx * 2, fimHora: maxIdx * 2 + 2, total: blocos[maxIdx] };
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
