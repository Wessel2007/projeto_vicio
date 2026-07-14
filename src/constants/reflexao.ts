// Sugestões contextuais do fluxo de reflexão pós-recaída, indexadas pelas
// mesmas tags de GATILHOS_COMUNS (constants/gatilhos.ts) — nenhuma taxonomia
// nova. A mesma lista serve tanto para "o que eu faria diferente" (etapa 4)
// quanto para o microcompromisso das próximas 24h (etapa 5), como sugerido
// no briefing da feature.
export const SUGESTOES_POR_GATILHO: Record<string, string[]> = {
  'Tédio': [
    'Ter algo pronto pra fazer nos momentos vazios',
    'Sair de casa assim que o tédio começar',
    'Anotar 3 atividades rápidas pra recorrer quando bater o vazio',
  ],
  'Solidão': [
    'Marcar de falar com alguém antes de ficar muito tempo sozinho',
    'Ligar pra uma pessoa de confiança assim que a solidão aparecer',
    'Ir a um lugar com gente, mesmo sem interagir muito',
  ],
  'Estresse': [
    'Descontar o estresse em movimento antes de chegar em casa',
    'Ter um ritual de descompressão de 10 minutos no fim do dia',
    'Escrever sobre o que está causando o estresse',
  ],
  'Ansiedade': [
    'Praticar a respiração antes de a ansiedade virar impulso',
    'Avisar alguém quando perceber a ansiedade subindo',
    'Fazer uma pausa física antes de qualquer tela',
  ],
  'Conflito / Briga': [
    'Se afastar da situação por alguns minutos antes de reagir',
    'Escrever o que sente em vez de agir no calor do momento',
    'Conversar com alguém neutro antes de decidir algo',
  ],
  'Cansaço': [
    'Dormir mais cedo nos próximos dias',
    'Evitar decisões importantes quando estiver exausto',
    'Descansar de verdade em vez de recorrer à tela',
  ],
  'Redes sociais': [
    'Definir um limite de tempo de tela à noite',
    'Tirar notificações dos apps que mais disparam o gatilho',
    'Trocar a rolagem sem fim por outra atividade nesse horário',
  ],
  'Álcool ou outras substâncias': [
    'Evitar ficar sozinho logo depois de beber',
    'Ter um plano combinado com antecedência pra essas situações',
    'Chamar alguém de confiança antes que o efeito passe',
  ],
  'Excesso de tempo livre': [
    'Planejar a próxima hora com algo concreto',
    'Preencher os horários mais vazios da semana com compromissos',
    'Ter uma lista de tarefas pequenas pra esses momentos',
  ],
  'Notificações / celular': [
    'Ativar modo não perturbe nos horários de risco',
    'Deixar o celular fora do quarto à noite',
    'Bloquear ou desinstalar o app que mais gera o gatilho',
  ],
};

export const SUGESTOES_PADRAO = [
  'Pausar e observar o que senti antes de agir',
  'Avisar alguém de confiança quando perceber o gatilho',
  'Ter um plano concreto pronto para o próximo momento difícil',
];

export function getSugestoesPorGatilho(gatilho: string | null): string[] {
  if (!gatilho) return SUGESTOES_PADRAO;
  return SUGESTOES_POR_GATILHO[gatilho] ?? SUGESTOES_PADRAO;
}
