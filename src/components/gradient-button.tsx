import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Accent, Fonts, Radius } from '@/constants/theme';

/** CTA primário "Aço & Brasa": gradiente de brasa 135deg + sombra quente, texto Archivo. */
export function GradientButton({
  label,
  onPress,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[disabled && styles.disabled, style]}>
      <LinearGradient
        colors={[Accent.ctaStart, Accent.ctaMid, Accent.ctaEnd]}
        locations={Accent.ctaLocations}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: { opacity: 0.4 },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.button,
    height: 56,
    paddingHorizontal: 24,
    shadowColor: Accent.brasa,
    shadowOpacity: 0.28,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  label: {
    fontFamily: Fonts.display.extrabold,
    fontSize: 15,
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
});
