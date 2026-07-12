import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';

interface CountdownBlocoProps {
  valor: number;
  label: string;
  /** Texto claro (sobre superfícies escuras/gradiente), em vez da cor padrão do tema. */
  light?: boolean;
  /** 'large' aumenta o tamanho da fonte para telas de detalhe. */
  size?: 'compact' | 'large';
}

export function CountdownBloco({ valor, label, light = false, size = 'compact' }: CountdownBlocoProps) {
  const valorCor = light ? '#FFFFFF' : undefined;
  const labelCor = light ? 'rgba(255,255,255,0.7)' : undefined;

  return (
    <View style={styles.container}>
      <ThemedText
        style={[
          styles.valor,
          size === 'large' ? styles.valorLarge : styles.valorCompact,
          valorCor ? { color: valorCor } : undefined,
        ]}>
        {String(valor).padStart(2, '0')}
      </ThemedText>
      <ThemedText
        type="small"
        themeColor={light ? undefined : 'textSecondary'}
        style={[styles.label, labelCor ? { color: labelCor } : undefined]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 48,
  },
  valor: {
    fontFamily: Fonts.mono,
    fontWeight: '700',
  },
  valorCompact: {
    fontSize: 24,
    lineHeight: 28,
  },
  valorLarge: {
    fontSize: 40,
    lineHeight: 46,
  },
  label: {
    fontSize: 11,
    marginTop: 2,
  },
});
