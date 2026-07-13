import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Accent, Colors, Spacing } from '@/constants/theme';

/**
 * Opção selecionável do onboarding com feedback de "acender": ao selecionar,
 * a borda e o fundo transitam suavemente para laranja-brasa e o card dá um
 * leve "pop" de escala — como se estivesse pegando fogo.
 */
export function IgniteChip({
  label,
  description,
  selected,
  onPress,
  wide,
}: {
  label: string;
  description?: string;
  selected?: boolean;
  onPress?: () => void;
  wide?: boolean;
}) {
  const glow = useSharedValue(selected ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    glow.value = withTiming(selected ? 1 : 0, { duration: 260, easing: Easing.out(Easing.quad) });
    if (selected) {
      scale.value = withSequence(
        withTiming(1.04, { duration: 120, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 180 }),
      );
    }
  }, [selected, glow, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(glow.value, [0, 1], [Colors.border, Accent.orange]),
    backgroundColor: interpolateColor(
      glow.value,
      [0, 1],
      [Colors.backgroundElement, 'rgba(255,122,61,0.16)'],
    ),
    shadowOpacity: glow.value * 0.5,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={wide && styles.wideWrap}>
      <Animated.View style={[styles.card, wide && styles.wideCard, animatedStyle]}>
        <ThemedText type={description ? 'default' : 'small'} style={selected && styles.labelSelected}>
          {label}
        </ThemedText>
        {description && (
          <ThemedText type="small" themeColor="textSecondary">
            {description}
          </ThemedText>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wideWrap: { width: '100%' },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 3,
    shadowColor: Accent.orange,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  wideCard: {
    borderRadius: 18,
    padding: Spacing.three,
    gap: 4,
  },
  labelSelected: {
    color: Accent.orangeLight,
  },
});
