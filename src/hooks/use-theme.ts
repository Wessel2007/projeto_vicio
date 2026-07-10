import { Colors } from '@/constants/theme';

/** O app é dark-only: sempre retorna a mesma paleta, sem checar o sistema. */
export function useTheme() {
  return Colors;
}
