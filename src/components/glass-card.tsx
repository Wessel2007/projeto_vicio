import { View, type ViewProps } from 'react-native';

import { Colors } from '@/constants/theme';

/** Card translúcido com borda sutil — padrão de superfície usado em quase toda tela do mockup. */
export function GlassCard({ style, ...rest }: ViewProps) {
  return (
    <View
      style={[
        {
          backgroundColor: Colors.backgroundElement,
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: 18,
        },
        style,
      ]}
      {...rest}
    />
  );
}
