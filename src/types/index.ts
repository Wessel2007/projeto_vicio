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
};
