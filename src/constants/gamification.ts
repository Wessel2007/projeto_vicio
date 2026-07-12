export const XP_POR_DIA = 10;

// Fração do XP da streak perdida ao registrar uma recaída (o restante é
// bancado em savedXP). Pesa na consciência sem zerar o progresso todo.
export const RECAIDA_PENALIDADE_PERCENT = 0.25;

export interface NivelPatente {
  nome: string;
  sublevel: 1 | 2 | 3 | null;
  minDias: number;
}

// Flat list of all levels/sublevels in ascending order.
// sublevel null = Imortal (no ceiling).
export const NIVEIS: NivelPatente[] = [
  { nome: 'Recruta',    sublevel: 1, minDias: 1   },
  { nome: 'Recruta',    sublevel: 2, minDias: 2   },
  { nome: 'Recruta',    sublevel: 3, minDias: 3   },
  { nome: 'Aprendiz',  sublevel: 1, minDias: 4   },
  { nome: 'Aprendiz',  sublevel: 2, minDias: 6   },
  { nome: 'Aprendiz',  sublevel: 3, minDias: 7   },
  { nome: 'Guerreiro', sublevel: 1, minDias: 8   },
  { nome: 'Guerreiro', sublevel: 2, minDias: 11  },
  { nome: 'Guerreiro', sublevel: 3, minDias: 14  },
  { nome: 'Guardião',  sublevel: 1, minDias: 15  },
  { nome: 'Guardião',  sublevel: 2, minDias: 21  },
  { nome: 'Guardião',  sublevel: 3, minDias: 30  },
  { nome: 'Espartano', sublevel: 1, minDias: 31  },
  { nome: 'Espartano', sublevel: 2, minDias: 45  },
  { nome: 'Espartano', sublevel: 3, minDias: 60  },
  { nome: 'Monge',     sublevel: 1, minDias: 61  },
  { nome: 'Monge',     sublevel: 2, minDias: 75  },
  { nome: 'Monge',     sublevel: 3, minDias: 90  },
  { nome: 'Mestre',    sublevel: 1, minDias: 91  },
  { nome: 'Mestre',    sublevel: 2, minDias: 135 },
  { nome: 'Mestre',    sublevel: 3, minDias: 180 },
  { nome: 'Lenda',     sublevel: 1, minDias: 181 },
  { nome: 'Lenda',     sublevel: 2, minDias: 270 },
  { nome: 'Lenda',     sublevel: 3, minDias: 365 },
  { nome: 'Imortal',   sublevel: null, minDias: 366 },
];

// Teto de patente para usuários do plano Free (checklist: "Recruta → Guerreiro,
// trava após e sinaliza upgrade"). Guardião em diante é exclusivo do plano PRO.
export const FREE_MAX_RANK_NOME = 'Guerreiro';
export const FREE_MAX_RANK_INDEX = NIVEIS.reduce(
  (acc, n, i) => (n.nome === FREE_MAX_RANK_NOME ? i : acc),
  -1,
);
