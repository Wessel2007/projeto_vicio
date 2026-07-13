import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { Accent } from '@/constants/theme';

/**
 * Orbe-brasa do fluxo de pânico: esfera com radial-gradient (destaque em
 * "38% 30%") + sombra externa laranja para dar volume de carvão vivo. Puramente
 * presentacional — a animação de respiração (breathe) fica a cargo do wrapper.
 */
export function EmberOrb({
  size = 200,
  children,
  style,
}: {
  size?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          shadowRadius: size * 0.4,
        },
        style,
      ]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="emberOrb" cx="38%" cy="30%" r="75%">
            <Stop offset="0%" stopColor={Accent.orbStart} />
            <Stop offset="55%" stopColor={Accent.orbMid} />
            <Stop offset="100%" stopColor={Accent.orbEnd} />
          </RadialGradient>
          {/* Sombra interna inferior para volume de carvão. */}
          <RadialGradient id="emberShade" cx="50%" cy="90%" r="60%">
            <Stop offset="0%" stopColor="#4A1000" stopOpacity={0.55} />
            <Stop offset="60%" stopColor="#4A1000" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill="url(#emberOrb)" />
        <Circle cx="50" cy="50" r="50" fill="url(#emberShade)" />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Accent.orbMid,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
});
