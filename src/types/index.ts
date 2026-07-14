export interface TriggerEntry {
  id: string;
  date: string;
  trigger: string;
  notes: string;
  resisted: boolean;
}

// Reflexão guiada preenchida no fluxo pós-recaída (substitui o reset "seco"
// do streak). Compartilha as mesmas tags de gatilho do Diário para permitir
// cruzamento futuro (ver utils/insights.ts), mas fica numa lista separada de
// `entries` — é um registro de aprendizado, não uma entrada de diário comum.
export interface RelapseReflection {
  id: string;
  date: string;
  triggerTags: string[];
  emotionBefore: string | null;
  whatWouldChange: string;
  commitment: string;
  streakAtRelapse: number;
  xpAwarded: number;
}

export type PatenteTheme = 'ouro' | 'prata' | 'brasa';

export interface AppData {
  onboardingDone: boolean;
  streakStartDate: string | null;
  // Data real (nunca retroativa) de quando o usuário terminou o onboarding —
  // usada para saber a partir de quando o calendário de streak pode pintar
  // dias, já que streakStartDate pode ser retroativo ("há X dias sem recair").
  trackingStartDate: string | null;
  // Histórico de recaídas (um ISO string por toque em "Registrar recaída"),
  // usado para pintar os dias vermelhos no calendário de streak.
  relapseDates: string[];
  savedXP: number;
  entries: TriggerEntry[];
  relapseReflections: RelapseReflection[];
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
  trackingStartDate: null,
  relapseDates: [],
  savedXP: 0,
  entries: [],
  relapseReflections: [],
  selectedTriggers: [],
  notificationsEnabled: false,
  dailyQuoteHour: 8,
  dailyQuoteMinute: 0,
  isPro: false,
  patenteTheme: 'ouro' as PatenteTheme,
  accountabilityName: '',
  accountabilityPhone: '',
};
