import type { MarcoEsperado } from '@/types/perfil';

export interface MarcoProximoInfo {
  marco: MarcoEsperado;
  diasRestantes: number;
}

// Só os marcos com um alvo numérico de dias claro entram aqui. Os demais
// ("dizer_nao", "acordar_em_paz", "outro") são comportamentais/subjetivos —
// não dá pra calcular "quão perto" o usuário está, então nunca destacam nada.
const ALVO_DIAS: Partial<Record<MarcoEsperado, number>> = {
  primeiras_24h: 1,
  uma_semana: 7,
  um_mes: 30,
};

// Só mostra o destaque quando o marco estiver de fato próximo (evita poluir
// a Home nos primeiros dias de uma streak de 30 dias, por exemplo).
const JANELA_DESTAQUE_DIAS = 5;

/** Marco esperado (escolhido no onboarding) que está prestes a ser alcançado,
 * pra destacar na Home — ou null se não houver um cálculo aplicável ou o
 * marco ainda estiver longe. */
export function calcMarcoProximo(
  marco: MarcoEsperado | null,
  streakDias: number,
  maiorStreak: number,
): MarcoProximoInfo | null {
  if (!marco) return null;

  if (marco === 'superar_recorde') {
    if (maiorStreak <= 0) return null;
    const restantes = maiorStreak - streakDias;
    return restantes > 0 && restantes <= JANELA_DESTAQUE_DIAS ? { marco, diasRestantes: restantes } : null;
  }

  const alvo = ALVO_DIAS[marco];
  if (alvo == null) return null;

  const restantes = alvo - streakDias;
  return restantes > 0 && restantes <= JANELA_DESTAQUE_DIAS ? { marco, diasRestantes: restantes } : null;
}
