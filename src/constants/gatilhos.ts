import i18n from '@/i18n';

// Identificadores canônicos dos gatilhos — sempre em pt-BR. São persistidos em
// AppData.selectedTriggers e TriggerEntry.trigger, então não podem mudar por
// idioma (quebraria dados já salvos e a contagem de insights). Para exibição,
// traduza via `t('common:gatilhos.' + gatilho)`.
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

/** Sugestão de ação do botão de pânico para o gatilho selecionado, traduzida
 * (ver panicButton.json > gatilhoAcoes — conteúdo sinalizado para revisão humana). */
export function getAcaoPorGatilho(gatilho: string): string {
  return i18n.t(`panicButton:gatilhoAcoes.${gatilho}`, {
    defaultValue: i18n.t('panicButton:gatilhoAcoes.default'),
  });
}
