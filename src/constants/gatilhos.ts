export const GATILHOS_COMUNS = [
  'Tédio',
  'Solidão',
  'Estresse',
  'Ansiedade',
  'Conflito / Briga',
  'Cansaço',
  'Redes sociais',
  'Álcool ou outras substâncias',
  'Excesso de tempo livre',
  'Notificações / celular',
];

export const ACOES_POR_GATILHO: Record<string, string> = {
  'Tédio': 'Faça 20 flexões agora. Movimento muda o estado mental.',
  'Solidão': 'Ligue para alguém — amigo, familiar. Conexão real é mais forte que qualquer vício.',
  'Estresse': 'Saia para caminhar por 10 minutos. Ambiente novo, mente nova.',
  'Ansiedade': 'Escreva 3 coisas pelas quais você é grato neste momento.',
  'Conflito / Briga': 'Distancie-se da situação por 15 minutos antes de reagir.',
  'Cansaço': 'Durma. O cansaço é o gatilho mais subestimado. Seu cérebro precisa de recuperação.',
  'Redes sociais': 'Coloque o celular em outro cômodo por 30 minutos. Literalmente — distância física funciona.',
  'Álcool ou outras substâncias': 'Beba um copo d\'água agora e chame alguém de confiança.',
  'Excesso de tempo livre': 'Abra sua agenda e planeje a próxima hora com uma tarefa concreta.',
  'Notificações / celular': 'Ative o modo não perturbe e coloque o celular virado para baixo.',
};

export function getAcaoPorGatilho(gatilho: string): string {
  return ACOES_POR_GATILHO[gatilho] ?? 'Respire fundo, conte até 10 e lembre por que você começou.';
}
