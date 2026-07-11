export interface TriggerEntry {
  id: string;
  date: string;
  trigger: string;
  notes: string;
  resisted: boolean;
}

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
  // seção Monetização) — hoje sempre false, existe para já gatear as
  // features PRO na UI (patente acima de Guerreiro, horário customizável).
  isPro: boolean;
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
};
