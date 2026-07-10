import { Pressable, StyleSheet, Text } from 'react-native';

import { Accent, Colors, Fonts, Spacing } from '@/constants/theme';

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 3,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundElement,
  },
  chipSelected: {
    borderColor: Accent.orange,
    backgroundColor: 'rgba(255,122,61,0.14)',
  },
  label: {
    fontFamily: Fonts.body.semibold,
    fontSize: 14,
    color: Colors.text,
  },
  labelSelected: {
    color: Accent.orangeLight,
  },
});
