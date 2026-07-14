// Perfil de personalização coletado no onboarding — sigiloso, usado só para
// adaptar copy (frases, sugestões do diário, mensagens do botão de pânico).
// Fica numa chave própria de storage (ver storage/perfil.ts), separado de
// AppData (streak/XP): nunca deve ser sincronizado nem exposto na UI.

export type ComportamentoAlvo =
  | 'conteudo_adulto'
  | 'masturbacao_compulsiva'
  | 'ambos'
  | 'prefiro_nao_dizer';

export type TempoIncomoda = 'menos_6_meses' | 'alguns_anos' | 'a_vida_toda';

export type ImportanciaSobriedade = 'urgente' | 'alta' | 'moderada' | 'exploracao';

// Representa "áreas da vida que a pessoa quer melhorar" — nome do type
// mantido por compatibilidade com o histórico do arquivo, mas o valor no
// perfil (ver UserProfile.areasMelhoria) agora é uma lista, não um único item.
export type MotivoMudanca =
  | 'saude_mental'
  | 'controle_da_vida'
  | 'saude_fisica'
  | 'relacionamentos'
  | 'vida_espiritual'
  | 'autoestima'
  | 'produtividade'
  | 'sono_e_energia'
  | 'financas'
  | 'outro';

export type EstiloMotivacional = 'direto' | 'acolhedor';

export type MarcoEsperado =
  | 'primeiras_24h'
  | 'fim_de_semana'
  | 'uma_semana'
  | 'um_mes'
  | 'dizer_nao'
  | 'superar_recorde'
  | 'acordar_em_paz'
  | 'outro';

export interface UserProfile {
  comportamentoAlvo: ComportamentoAlvo | null;
  tempoIncomoda: TempoIncomoda | null;
  importanciaSobriedade: ImportanciaSobriedade | null;
  // Elaboração livre e opcional sobre gatilhos, além da seleção estruturada
  // (que continua vivendo em AppData.selectedTriggers, reaproveitada no
  // diário e no botão de pânico).
  gatilhosDetalhes: string;
  // Até 3 áreas selecionadas (era campo único `motivoMudanca` antes desta
  // versão — perfis antigos no AsyncStorage mantêm o campo órfão, ignorado).
  areasMelhoria: MotivoMudanca[];
  estiloMotivacional: EstiloMotivacional | null;
  marcoEsperado: MarcoEsperado | null;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  comportamentoAlvo: null,
  tempoIncomoda: null,
  importanciaSobriedade: null,
  gatilhosDetalhes: '',
  areasMelhoria: [],
  estiloMotivacional: null,
  marcoEsperado: null,
};

// Os rótulos/descrições de cada opção vivem em locales/*/onboarding.json
// (chaves comportamento.*, tempoIncomoda.*, motivo.*, estilo.*, importancia.*,
// marco.*) — aqui só os ids, que são a parte persistida/business logic.
export const OPCOES_COMPORTAMENTO: ComportamentoAlvo[] = [
  'conteudo_adulto',
  'masturbacao_compulsiva',
  'ambos',
  'prefiro_nao_dizer',
];

export const OPCOES_TEMPO: TempoIncomoda[] = ['menos_6_meses', 'alguns_anos', 'a_vida_toda'];

export const OPCOES_MOTIVO: MotivoMudanca[] = [
  'saude_mental',
  'controle_da_vida',
  'saude_fisica',
  'relacionamentos',
  'vida_espiritual',
  'autoestima',
  'produtividade',
  'sono_e_energia',
  'financas',
  'outro',
];

export const OPCOES_ESTILO: EstiloMotivacional[] = ['direto', 'acolhedor'];

export const OPCOES_IMPORTANCIA: ImportanciaSobriedade[] = ['urgente', 'alta', 'moderada', 'exploracao'];

export const OPCOES_MARCO: MarcoEsperado[] = [
  'primeiras_24h',
  'fim_de_semana',
  'uma_semana',
  'um_mes',
  'dizer_nao',
  'superar_recorde',
  'acordar_em_paz',
  'outro',
];
