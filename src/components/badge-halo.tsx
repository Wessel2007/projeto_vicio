import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ParticleField } from '@/components/particle-field';

const SPARK_COLORS = ['#FFC46B', '#FF8A3D', '#FFE0B0'];

/**
 * Moldura cerimonial de um badge de patente: anéis concêntricos de bronze
 * (ondas da martelada) + fagulhas subindo. Usado no onboarding final, na
 * vitória do pânico, na celebração de marco e no hero de Patentes.
 */
export function BadgeHalo({
  size,
  rings = 2,
  sparks = true,
  children,
  style,
}: {
  size: number;
  rings?: number;
  sparks?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ width: size, height: size }, styles.wrap, style]}>
      {Array.from({ length: rings }).map((_, i) => {
        // Anéis crescendo pra fora, com opacidade decrescente.
        const inset = -i * 16;
        const opacity = 0.4 - i * 0.14;
        return (
          <View
            key={i}
            pointerEvents="none"
            style={[
              styles.ring,
              {
                top: inset,
                left: inset,
                right: inset,
                bottom: inset,
                borderRadius: (size - inset * 2) / 2,
                borderColor: `rgba(232,180,88,${Math.max(0.06, opacity)})`,
              },
            ]}
          />
        );
      })}
      {sparks && (
        <ParticleField mode="rise" count={3} colors={SPARK_COLORS} style={styles.sparks} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  sparks: {
    // Fagulhas sobem por trás/ao redor do badge.
    overflow: 'visible',
  },
});
