export interface TriggerEntry {
  id: string;
  date: string;
  trigger: string;
  notes: string;
  resisted: boolean;
}

export type PatenteTheme = 'ouro' | 'prata' | 'carmesim';

export interface AppData {
  onboardingDone: boolean;
  streakStartDate: string | null;
  savedXP: number;
  entries: TriggerEntry[];
  selectedTriggers: string[];
  notificationsEnabled: boolean;
  dailyQuoteHour: number;
  dailyQuoteMinute: number;
  // Flag de plano. Sem integração de pagamento ainda (ver CHECKLIST.md,
  // seção Monetização) — hoje alternável manualmente em Perfil > modo de
  // teste, existe para já gatear as features PRO na UI (patente acima de
  // Guerreiro, horário customizável, biblioteca de frases, insights, etc).
  isPro: boolean;
  // Personalização visual do badge de patente (feature PRO).
  patenteTheme: PatenteTheme;
  // Contato de confiança para o "contato rápido" do botão de pânico (PRO).
  accountabilityName: string;
  accountabilityPhone: string;
}

export const DEFAULT_DATA: AppData = {
  onboardingDone: false,
  streakStartDate: null,
  savedXP: 0,
  entries: [],
  selectedTriggers: [],
  notificationsEnabled: false,
  dailyQuoteHour: 8,
  dailyQuoteMinute: 0,
  isPro: false,
  patenteTheme: 'ouro',
  accountabilityName: '',
  accountabilityPhone: '',
};
