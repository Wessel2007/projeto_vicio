import i18n from '@/i18n';
import { AppData } from '@/types';

const MS_POR_DIA = 1000 * 60 * 60 * 24;

// Mapeia o idioma ativo do app para uma localidade do Intl — só afeta a
// formatação (separador decimal, posição do símbolo), não o código da moeda,
// que continua vindo de AppData.moedaCodigo.
const INTL_LOCALE_POR_IDIOMA: Record<string, string> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
};

export interface EconomiaEconomizada {
  dinheiro: number | null;
  minutos: number | null;
}

// Calcula em cima do streak atual (não do XP total): se o usuário recair e o
// streak resetar, streakStartDate volta a "agora" e o valor economizado volta
// a ~0 junto — uma recaída volta a gerar o gasto/tempo perdido.
export function calcEconomia(
  dados: Pick<AppData, 'streakStartDate' | 'habitoCustoValor' | 'habitoCustoPeriodo' | 'habitoTempoMinutos'>,
): EconomiaEconomizada {
  if (!dados.streakStartDate) return { dinheiro: null, minutos: null };

  const diasFracionarios =
    Math.max(0, Date.now() - new Date(dados.streakStartDate).getTime()) / MS_POR_DIA;

  const custoPorDia =
    dados.habitoCustoValor == null
      ? null
      : dados.habitoCustoPeriodo === 'semana'
        ? dados.habitoCustoValor / 7
        : dados.habitoCustoValor;

  return {
    dinheiro: custoPorDia == null ? null : custoPorDia * diasFracionarios,
    minutos: dados.habitoTempoMinutos == null ? null : dados.habitoTempoMinutos * diasFracionarios,
  };
}

export function formatarMoeda(valor: number, moedaCodigo: string = 'BRL'): string {
  const locale = INTL_LOCALE_POR_IDIOMA[i18n.language] ?? 'pt-BR';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: moedaCodigo }).format(valor);
}

export function formatarTempoEconomizado(minutos: number): string {
  const totalMin = Math.round(minutos);
  const horas = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return horas === 0 ? `${min}min` : `${horas}h ${min}min`;
}
