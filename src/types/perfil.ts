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

export type MotivoMudanca =
  | 'saude'
  | 'relacionamento'
  | 'produtividade'
  | 'autoestima'
  | 'espiritualidade'
  | 'outro';

export type EstiloMotivacional = 'direto' | 'acolhedor';

export interface UserProfile {
  comportamentoAlvo: ComportamentoAlvo | null;
  tempoIncomoda: TempoIncomoda | null;
  // Elaboração livre e opcional sobre gatilhos, além da seleção estruturada
  // (que continua vivendo em AppData.selectedTriggers, reaproveitada no
  // diário e no botão de pânico).
  gatilhosDetalhes: string;
  motivoMudanca: MotivoMudanca | null;
  estiloMotivacional: EstiloMotivacional | null;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  comportamentoAlvo: null,
  tempoIncomoda: null,
  gatilhosDetalhes: '',
  motivoMudanca: null,
  estiloMotivacional: null,
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
  { id: 'saude', label: 'Saúde' },
  { id: 'relacionamento', label: 'Relacionamento' },
  { id: 'produtividade', label: 'Produtividade' },
  { id: 'autoestima', label: 'Autoestima' },
  { id: 'espiritualidade', label: 'Espiritualidade' },
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
