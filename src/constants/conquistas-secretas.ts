import type { AppData } from '@/types';

export interface ContextoConquistas {
  dados: AppData;
  streakDias: number;
  totalXP: number;
}

export interface ConquistaSecreta {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  condicao: (ctx: ContextoConquistas) => boolean;
}

export const CONQUISTAS_SECRETAS: ConquistaSecreta[] = [
  {
    id: 'primeira-resistencia',
    nome: 'Primeira Vitória',
    descricao: 'Resistiu a um gatilho pela primeira vez usando o botão de pânico.',
    icone: 'shield-checkmark',
    condicao: ({ dados }) => dados.entries.some((e) => e.resisted),
  },
  {
    id: 'cronista',
    nome: 'Cronista',
    descricao: 'Registrou 10 entradas no diário de gatilhos.',
    icone: 'book',
    condicao: ({ dados }) => dados.entries.length >= 10,
  },
  {
    id: 'semana-inabalavel',
    nome: 'Semana Inabalável',
    descricao: 'Resistiu a um gatilho 7 vezes.',
    icone: 'flame',
    condicao: ({ dados }) => dados.entries.filter((e) => e.resisted).length >= 7,
  },
  {
    id: 'multi-gatilho',
    nome: 'Autoconhecimento',
    descricao: 'Identificou 5 gatilhos diferentes no diário.',
    icone: 'compass',
    condicao: ({ dados }) => new Set(dados.entries.map((e) => e.trigger)).size >= 5,
  },
  {
    id: 'fenix',
    nome: 'Fênix',
    descricao: 'Voltou a 7 dias de streak depois de uma recaída.',
    icone: 'sunny',
    condicao: ({ dados, streakDias }) => dados.entries.some((e) => !e.resisted) && streakDias >= 7,
  },
  {
    id: 'guarda-noturno',
    nome: 'Guarda-Noturno',
    descricao: 'Resistiu a um gatilho de madrugada (0h–5h).',
    icone: 'moon',
    condicao: ({ dados }) =>
      dados.entries.some((e) => e.resisted && new Date(e.date).getHours() < 5),
  },
  {
    id: 'mil-guerreiro',
    nome: 'Mil Dias de Forja',
    descricao: 'Acumulou 1000 XP total.',
    icone: 'trophy',
    condicao: ({ totalXP }) => totalXP >= 1000,
  },
];
