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

/** Nº de entradas nos últimos `dias` dias vs. nos `dias` dias anteriores a esses. */
export function calcTendenciaPeriodo(entries: TriggerEntry[], dias: number): { atual: number; anterior: number } {
  const agora = Date.now();
  const DIA = 24 * 60 * 60 * 1000;
  const atual = entries.filter((e) => agora - new Date(e.date).getTime() <= dias * DIA).length;
  const anterior = entries.filter((e) => {
    const diff = agora - new Date(e.date).getTime();
    return diff > dias * DIA && diff <= dias * 2 * DIA;
  }).length;
  return { atual, anterior };
}

export interface ComparativoResistencia {
  atual: TaxaResistencia;
  anterior: TaxaResistencia;
}

/** Taxa de resistência na janela atual de `dias` dias vs. na janela de `dias` dias imediatamente anterior. */
export function calcComparativoResistencia(entries: TriggerEntry[], dias: number): ComparativoResistencia {
  const agora = Date.now();
  const DIA = 24 * 60 * 60 * 1000;
  const atual = entries.filter((e) => agora - new Date(e.date).getTime() <= dias * DIA);
  const anterior = entries.filter((e) => {
    const diff = agora - new Date(e.date).getTime();
    return diff > dias * DIA && diff <= dias * 2 * DIA;
  });
  return { atual: calcTaxaResistencia(atual), anterior: calcTaxaResistencia(anterior) };
}

export interface TaxaResistenciaPorGatilho {
  gatilho: string;
  total: number;
  percentResistencia: number;
}

const MIN_ENTRADAS_POR_GATILHO = 2;

/**
 * Taxa de resistência isolada por gatilho, do pior pro melhor desempenho.
 * Gatilhos com menos de MIN_ENTRADAS_POR_GATILHO registros ficam de fora —
 * evita sugerir um padrão baseado numa única ocorrência.
 */
export function calcTaxaResistenciaPorGatilho(entries: TriggerEntry[]): TaxaResistenciaPorGatilho[] {
  const porGatilho = new Map<string, TriggerEntry[]>();
  entries.forEach((e) => {
    const lista = porGatilho.get(e.trigger) ?? [];
    lista.push(e);
    porGatilho.set(e.trigger, lista);
  });
  return [...porGatilho.entries()]
    .filter(([, lista]) => lista.length >= MIN_ENTRADAS_POR_GATILHO)
    .map(([gatilho, lista]) => ({
      gatilho,
      total: lista.length,
      percentResistencia: calcTaxaResistencia(lista).percentResistencia,
    }))
    .sort((a, b) => a.percentResistencia - b.percentResistencia);
}

export interface PadraoGatilhoHorario {
  gatilho: string;
  inicioHora: number;
  fimHora: number;
  total: number;
}

const MIN_OCORRENCIAS_PADRAO = 2;

/**
 * Combinações gatilho + bloco de 2h que se repetem, da mais pra menos
 * frequente — cruza os dois eixos que hoje aparecem separados (ver
 * `contarGatilhos` e `calcRiscoHorario`). Só entram combinações com pelo
 * menos MIN_OCORRENCIAS_PADRAO registros.
 */
export function calcPadroesGatilhoHorario(entries: TriggerEntry[]): PadraoGatilhoHorario[] {
  const contagem = new Map<string, { gatilho: string; bloco: number; total: number }>();
  entries.forEach((e) => {
    const bloco = Math.floor(new Date(e.date).getHours() / 2);
    const chave = `${e.trigger}#${bloco}`;
    const atual = contagem.get(chave);
    if (atual) atual.total += 1;
    else contagem.set(chave, { gatilho: e.trigger, bloco, total: 1 });
  });
  return [...contagem.values()]
    .filter((p) => p.total >= MIN_OCORRENCIAS_PADRAO)
    .map((p) => ({ gatilho: p.gatilho, inicioHora: p.bloco * 2, fimHora: p.bloco * 2 + 2, total: p.total }))
    .sort((a, b) => b.total - a.total);
}

export interface TaxaPorDiaSemana {
  diaSemana: number;
  total: number;
  percentResistencia: number;
}

const MIN_ENTRADAS_DIA_SEMANA = 2;

/**
 * Taxa de resistência agrupada por dia da semana (0 = domingo, ver
 * `Date.getDay()`). Só entram dias com pelo menos MIN_ENTRADAS_DIA_SEMANA
 * registros — o `StreakCalendar` (free) já mostra as datas cruas, aqui o
 * valor é a agregação por dia da semana.
 */
export function calcTaxaPorDiaSemana(entries: TriggerEntry[]): TaxaPorDiaSemana[] {
  const porDia: TriggerEntry[][] = Array.from({ length: 7 }, () => []);
  entries.forEach((e) => porDia[new Date(e.date).getDay()].push(e));
  return porDia
    .map((lista, diaSemana) => ({
      diaSemana,
      total: lista.length,
      percentResistencia: calcTaxaResistencia(lista).percentResistencia,
    }))
    .filter((d) => d.total >= MIN_ENTRADAS_DIA_SEMANA);
}

export interface Recomendacao {
  gatilho: string;
  janela: { inicioHora: number; fimHora: number } | null;
}

/** Combina o gatilho mais frequente com o padrão de horário mais forte dele, se houver, numa recomendação acionável. */
export function gerarRecomendacao(
  gatilhos: ContagemGatilho[],
  padroes: PadraoGatilhoHorario[],
): Recomendacao | null {
  const topGatilho = gatilhos[0];
  if (!topGatilho) return null;
  const padraoDoTopGatilho = padroes.find((p) => p.gatilho === topGatilho.gatilho);
  return {
    gatilho: topGatilho.gatilho,
    janela: padraoDoTopGatilho
      ? { inicioHora: padraoDoTopGatilho.inicioHora, fimHora: padraoDoTopGatilho.fimHora }
      : null,
  };
}
