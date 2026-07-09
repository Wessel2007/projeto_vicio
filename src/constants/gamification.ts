export const XP_POR_DIA = 10;

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
