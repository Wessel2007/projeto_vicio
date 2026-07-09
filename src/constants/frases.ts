export interface Frase {
  texto: string;
  autor: string;
}

export const FRASES: Frase[] = [
  { texto: 'Você não tem controle sobre o que acontece com você, mas tem controle sobre como responde.', autor: 'Epicteto' },
  { texto: 'O homem que conquista a si mesmo é maior do que aquele que conquista mil batalhas.', autor: 'Buda' },
  { texto: 'A primeira e melhor vitória é conquistar a si mesmo.', autor: 'Platão' },
  { texto: 'Sofra a dor do treino ou sofra a dor da mediocridade. A escolha é sua.', autor: 'David Goggins' },
  { texto: 'Não pergunte por uma vida mais fácil. Peça por forças para suportar uma mais difícil.', autor: 'Bruce Lee' },
  { texto: 'O prazer que você busca agora é o peso que você carregará amanhã.', autor: 'Sêneca' },
  { texto: 'Disciplina é a ponte entre objetivos e conquistas.', autor: 'Jim Rohn' },
  { texto: 'Esteja de boa com o desconforto de crescer.', autor: 'David Goggins' },
  { texto: 'O vício começa como uma diversão e termina como um grilhão.', autor: 'Baltasar Gracián' },
  { texto: 'Aquele que luta com monstros deve cuidar para não se tornar um monstro.', autor: 'Nietzsche' },
  { texto: 'A fraqueza de atitude se torna fraqueza de caráter.', autor: 'Albert Einstein' },
  { texto: 'Toda batalha é vencida antes que seja lutada.', autor: 'Sun Tzu' },
  { texto: 'Você é o resultado das suas escolhas mais repetidas.', autor: 'Aristóteles' },
  { texto: 'O mais corajoso dos homens é aquele que conquista seus próprios desejos.', autor: 'Aristóteles' },
  { texto: 'Não é porque as coisas são difíceis que não ousamos. É porque não ousamos que são difíceis.', autor: 'Sêneca' },
  { texto: 'Governe sua mente ou ela vai te governar.', autor: 'Horácio' },
  { texto: 'A maior conquista de um homem é a autoconsciência.', autor: 'Marco Aurélio' },
  { texto: 'Fique com o que é difícil. A facilidade é a saída mais cara.', autor: 'David Goggins' },
  { texto: 'A mente que abre a uma nova ideia jamais voltará ao seu tamanho original.', autor: 'Albert Einstein' },
  { texto: 'O sofrimento que você evita hoje volta com juros amanhã.', autor: 'Carl Jung' },
  { texto: 'Aquele que conhece a si mesmo é sábio; aquele que se conquista é forte.', autor: 'Lao Tsé' },
  { texto: 'Liberdade não é ausência de compromisso; é a capacidade de escolher o que é certo.', autor: 'Paulo Coelho' },
  { texto: 'O corpo suporta quase tudo. É a mente que você tem que convencer.', autor: 'David Goggins' },
  { texto: 'Conhece-te a ti mesmo.', autor: 'Sócrates' },
  { texto: 'Você se tornará aquilo em que você habitualmente pensa.', autor: 'Marco Aurélio' },
  { texto: 'Aprenda a dizer não. Isso vai te servir mais do que a lógica latina.', autor: 'Epicteto' },
  { texto: 'A autodisciplina começa com o domínio dos seus pensamentos.', autor: 'Napoleon Hill' },
  { texto: 'Toda crise é uma oportunidade vestida de problema.', autor: 'Confúcio' },
  { texto: 'O vencedor é simplesmente aquele que nunca desistiu.', autor: 'Anônimo' },
  { texto: 'Ontem você disse amanhã. Hoje é o dia.', autor: 'Nike' },
];

export function getFraseDoDia(): Frase {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return FRASES[dayOfYear % FRASES.length];
}
