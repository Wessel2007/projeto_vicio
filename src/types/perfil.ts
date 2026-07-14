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

export const OPCOES_COMPORTAMENTO: { id: ComportamentoAlvo; label: string }[] = [
  { id: 'conteudo_adulto', label: 'Consumo compulsivo de conteúdo adulto' },
  { id: 'masturbacao_compulsiva', label: 'Masturbação compulsiva' },
  { id: 'ambos', label: 'Os dois' },
  { id: 'prefiro_nao_dizer', label: 'Prefiro não dizer agora' },
];

export const OPCOES_TEMPO: { id: TempoIncomoda; label: string }[] = [
  { id: 'menos_6_meses', label: 'Menos de 6 meses' },
  { id: 'alguns_anos', label: 'Alguns anos' },
  { id: 'a_vida_toda', label: 'A vida toda' },
];

export const OPCOES_MOTIVO: { id: MotivoMudanca; label: string }[] = [
  { id: 'saude_mental', label: 'Saúde mental' },
  { id: 'controle_da_vida', label: 'Retomar o controle' },
  { id: 'saude_fisica', label: 'Saúde física' },
  { id: 'relacionamentos', label: 'Relacionamentos' },
  { id: 'vida_espiritual', label: 'Vida espiritual' },
  { id: 'autoestima', label: 'Autoestima e orgulho' },
  { id: 'produtividade', label: 'Produtividade e foco' },
  { id: 'sono_e_energia', label: 'Sono e energia' },
  { id: 'financas', label: 'Finanças' },
  { id: 'outro', label: 'Outro' },
];

export const OPCOES_ESTILO: { id: EstiloMotivacional; label: string; description: string }[] = [
  {
    id: 'direto',
    label: 'Direto e desafiador',
    description: 'Frases que cobram e confrontam. Tipo David Goggins.',
  },
  {
    id: 'acolhedor',
    label: 'Acolhedor e gentil',
    description: 'Frases que acompanham com compaixão, sem cobrança pesada.',
  },
];

export const OPCOES_IMPORTANCIA: {
  id: ImportanciaSobriedade;
  label: string;
  description: string;
}[] = [
  { id: 'urgente', label: 'Urgente', description: 'Preciso mudar agora, não aguento mais' },
  { id: 'alta', label: 'Alta', description: 'É a minha prioridade número um' },
  { id: 'moderada', label: 'Moderada', description: 'Quero melhorar, mas ainda não é tudo' },
  { id: 'exploracao', label: 'Exploração', description: 'Só estou testando o terreno por enquanto' },
];

export const OPCOES_MARCO: { id: MarcoEsperado; label: string }[] = [
  { id: 'primeiras_24h', label: 'Primeiras 24 horas' },
  { id: 'fim_de_semana', label: 'Sobreviver ao fim de semana' },
  { id: 'uma_semana', label: 'Completar uma semana inteira' },
  { id: 'um_mes', label: 'Um mês de disciplina' },
  { id: 'dizer_nao', label: 'Aprender a dizer "não" no gatilho' },
  { id: 'superar_recorde', label: 'Superar meu recorde atual' },
  { id: 'acordar_em_paz', label: 'Acordar em paz pela primeira vez' },
  { id: 'outro', label: 'Outro' },
];
