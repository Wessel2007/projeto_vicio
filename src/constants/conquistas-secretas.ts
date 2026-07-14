import type { AppData } from '@/types';

export interface ContextoConquistas {
  dados: AppData;
  streakDias: number;
  totalXP: number;
}

// nome/descricao de cada conquista vivem em locales/*/achievements.json
// (chave `secretas.<id>`) — aqui só o id (estável, não muda por idioma),
// o ícone e a condição de desbloqueio, que são lógica de negócio.
export interface ConquistaSecreta {
  id: string;
  icone: string;
  condicao: (ctx: ContextoConquistas) => boolean;
}

export const CONQUISTAS_SECRETAS: ConquistaSecreta[] = [
  {
    id: 'primeira-resistencia',
    icone: 'shield-checkmark',
    condicao: ({ dados }) => dados.entries.some((e) => e.resisted),
  },
  {
    id: 'cronista',
    icone: 'book',
    condicao: ({ dados }) => dados.entries.length >= 10,
  },
  {
    id: 'semana-inabalavel',
    icone: 'flame',
    condicao: ({ dados }) => dados.entries.filter((e) => e.resisted).length >= 7,
  },
  {
    id: 'multi-gatilho',
    icone: 'compass',
    condicao: ({ dados }) => new Set(dados.entries.map((e) => e.trigger)).size >= 5,
  },
  {
    id: 'fenix',
    icone: 'sunny',
    condicao: ({ dados, streakDias }) => dados.entries.some((e) => !e.resisted) && streakDias >= 7,
  },
  {
    id: 'guarda-noturno',
    icone: 'moon',
    condicao: ({ dados }) =>
      dados.entries.some((e) => e.resisted && new Date(e.date).getHours() < 5),
  },
  {
    id: 'mil-guerreiro',
    icone: 'trophy',
    condicao: ({ totalXP }) => totalXP >= 1000,
  },
];
