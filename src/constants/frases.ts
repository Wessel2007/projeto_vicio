export type TemaFrase = 'Estoicismo' | 'Disciplina' | 'Superação' | 'Autoconhecimento' | 'Motivação';

export interface Frase {
  texto: string;
  autor: string;
  tema: TemaFrase;
}

export const FRASES: Frase[] = [
  { texto: 'Você não tem controle sobre o que acontece com você, mas tem controle sobre como responde.', autor: 'Epicteto', tema: 'Estoicismo' },
  { texto: 'O homem que conquista a si mesmo é maior do que aquele que conquista mil batalhas.', autor: 'Buda', tema: 'Autoconhecimento' },
  { texto: 'A primeira e melhor vitória é conquistar a si mesmo.', autor: 'Platão', tema: 'Autoconhecimento' },
  { texto: 'Sofra a dor do treino ou sofra a dor da mediocridade. A escolha é sua.', autor: 'David Goggins', tema: 'Disciplina' },
  { texto: 'Não pergunte por uma vida mais fácil. Peça por forças para suportar uma mais difícil.', autor: 'Bruce Lee', tema: 'Superação' },
  { texto: 'O prazer que você busca agora é o peso que você carregará amanhã.', autor: 'Sêneca', tema: 'Estoicismo' },
  { texto: 'Disciplina é a ponte entre objetivos e conquistas.', autor: 'Jim Rohn', tema: 'Disciplina' },
  { texto: 'Esteja de boa com o desconforto de crescer.', autor: 'David Goggins', tema: 'Superação' },
  { texto: 'O vício começa como uma diversão e termina como um grilhão.', autor: 'Baltasar Gracián', tema: 'Disciplina' },
  { texto: 'Aquele que luta com monstros deve cuidar para não se tornar um monstro.', autor: 'Nietzsche', tema: 'Autoconhecimento' },
  { texto: 'A fraqueza de atitude se torna fraqueza de caráter.', autor: 'Albert Einstein', tema: 'Disciplina' },
  { texto: 'Toda batalha é vencida antes que seja lutada.', autor: 'Sun Tzu', tema: 'Disciplina' },
  { texto: 'Você é o resultado das suas escolhas mais repetidas.', autor: 'Aristóteles', tema: 'Disciplina' },
  { texto: 'O mais corajoso dos homens é aquele que conquista seus próprios desejos.', autor: 'Aristóteles', tema: 'Autoconhecimento' },
  { texto: 'Não é porque as coisas são difíceis que não ousamos. É porque não ousamos que são difíceis.', autor: 'Sêneca', tema: 'Motivação' },
  { texto: 'Governe sua mente ou ela vai te governar.', autor: 'Horácio', tema: 'Disciplina' },
  { texto: 'A maior conquista de um homem é a autoconsciência.', autor: 'Marco Aurélio', tema: 'Autoconhecimento' },
  { texto: 'Fique com o que é difícil. A facilidade é a saída mais cara.', autor: 'David Goggins', tema: 'Superação' },
  { texto: 'A mente que abre a uma nova ideia jamais voltará ao seu tamanho original.', autor: 'Albert Einstein', tema: 'Motivação' },
  { texto: 'O sofrimento que você evita hoje volta com juros amanhã.', autor: 'Carl Jung', tema: 'Estoicismo' },
  { texto: 'Aquele que conhece a si mesmo é sábio; aquele que se conquista é forte.', autor: 'Lao Tsé', tema: 'Autoconhecimento' },
  { texto: 'Liberdade não é ausência de compromisso; é a capacidade de escolher o que é certo.', autor: 'Paulo Coelho', tema: 'Motivação' },
  { texto: 'O corpo suporta quase tudo. É a mente que você tem que convencer.', autor: 'David Goggins', tema: 'Superação' },
  { texto: 'Conhece-te a ti mesmo.', autor: 'Sócrates', tema: 'Autoconhecimento' },
  { texto: 'Você se tornará aquilo em que você habitualmente pensa.', autor: 'Marco Aurélio', tema: 'Autoconhecimento' },
  { texto: 'Aprenda a dizer não. Isso vai te servir mais do que a lógica latina.', autor: 'Epicteto', tema: 'Disciplina' },
  { texto: 'A autodisciplina começa com o domínio dos seus pensamentos.', autor: 'Napoleon Hill', tema: 'Disciplina' },
  { texto: 'Toda crise é uma oportunidade vestida de problema.', autor: 'Confúcio', tema: 'Motivação' },
  { texto: 'O vencedor é simplesmente aquele que nunca desistiu.', autor: 'Anônimo', tema: 'Superação' },
  { texto: 'Ontem você disse amanhã. Hoje é o dia.', autor: 'Nike', tema: 'Motivação' },
];

export const TEMAS_FRASES: TemaFrase[] = ['Estoicismo', 'Disciplina', 'Superação', 'Autoconhecimento', 'Motivação'];

/** Índice do dia (0..FRASES.length-1), estável entre idiomas — usado para
 * buscar a tradução da frase do dia em home.json (chave `quotes.<indice>`). */
export function getFraseDoDiaIndex(): number {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return dayOfYear % FRASES.length;
}

/** Frase do dia em pt-BR (fallback). Para exibição na Home, prefira traduzir
 * via `t('home:quotes.' + getFraseDoDiaIndex())`, que resolve no idioma ativo. */
export function getFraseDoDia(): Frase {
  return FRASES[getFraseDoDiaIndex()];
}
