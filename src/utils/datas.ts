// Helpers de data usados no redesign "Aço & Brasa". Os rótulos (dias da
// semana, meses, "hoje"/"ontem") vêm de common.json e seguem o idioma ativo
// do i18next — a lógica de cálculo de datas em si não muda por idioma.
import i18n from '@/i18n';

function diasSemana(): string[] {
  return i18n.t('common:dates.weekdaysShort', { returnObjects: true }) as string[];
}

function meses(): string[] {
  return i18n.t('common:dates.monthsShort', { returnObjects: true }) as string[];
}

/** Ex.: "SEG, 13 JUL" — usado no header da Home. */
export function formatarCabecalhoData(d = new Date()): string {
  return `${diasSemana()[d.getDay()]}, ${d.getDate()} ${meses()[d.getMonth()]}`;
}

/** Rótulo de agrupamento da timeline do diário: "HOJE", "ONTEM" ou "SEX, 10 JUL". */
export function rotuloDiaTimeline(iso: string, hoje = new Date()): string {
  const d = new Date(iso);
  const meiaNoite = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDias = Math.round((meiaNoite(hoje) - meiaNoite(d)) / (24 * 60 * 60 * 1000));
  if (diffDias <= 0) return i18n.t('common:dates.today');
  if (diffDias === 1) return i18n.t('common:dates.yesterday');
  return `${diasSemana()[d.getDay()]}, ${d.getDate()} ${meses()[d.getMonth()]}`;
}

/** Chave de dia (YYYY-MM-DD local) para agrupar entradas. */
export function chaveDia(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Hora "HH:MM" em 24h para a coluna mono da timeline. */
export function horaCurta(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Régua da semana: 7 booleans (posição 0 = terça, para bater com os rótulos
 * T Q Q S S D S do protótipo) indicando se aquele dia da semana corrente já
 * foi cumprido — cumprido = dia já passou (ou é hoje) sem recaída registrada
 * naquele dia, e dentro da streak atual.
 */
export function calcularSemana(
  streakStartDate: string | null,
  relapseDates: string[],
  agora = new Date(),
): boolean[] {
  // Ordem dos rótulos: terça(2) qua(3) qui(4) sex(5) sab(6) dom(0) seg(1).
  const ordem = [2, 3, 4, 5, 6, 0, 1];
  const meiaNoite = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const hojeMid = meiaNoite(agora);
  const inicioStreak = streakStartDate ? meiaNoite(new Date(streakStartDate)) : Infinity;
  const recaidasDias = new Set(relapseDates.map((r) => meiaNoite(new Date(r))));

  // Segunda-feira da semana corrente como âncora.
  const diaSemanaHoje = agora.getDay(); // 0=dom
  const offsetParaSegunda = (diaSemanaHoje + 6) % 7;
  const segunda = new Date(agora);
  segunda.setDate(agora.getDate() - offsetParaSegunda);
  const segundaMid = meiaNoite(segunda);
  const DIA = 24 * 60 * 60 * 1000;

  return ordem.map((diaAlvo) => {
    // offset a partir de segunda: seg=0, ter=1, ... dom=6
    const offset = (diaAlvo + 6) % 7;
    const dataMid = segundaMid + offset * DIA;
    if (dataMid > hojeMid) return false; // dia futuro
    if (dataMid < inicioStreak) return false; // antes do início da streak
    if (recaidasDias.has(dataMid)) return false; // recaiu nesse dia
    return true;
  });
}
