import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextType =
  | 'default'
  | 'body'
  | 'small'
  | 'smallBold'
  | 'quote'
  | 'eyebrow' // Archivo 700, 10px, ls 3px, UPPERCASE — rótulos cerimoniais de seção
  | 'dataLabel' // Space Grotesk 600, 10px, ls 2px, UPPERCASE — labels de card de dados
  | 'title' // Archivo 800, 28px — manchete de tela
  | 'titleBig' // Archivo 800, 32px — telas cerimoniais
  | 'titleHuge' // Archivo 900, 40px — celebração
  | 'subtitle' // Archivo 800, 24px
  | 'heroNumber' // Space Grotesk 700, 64px — dias no anel
  | 'cardTitle' // Archivo 800, 24px
  | 'link'
  | 'linkPrimary'
  | 'code';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        styles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.body.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    lineHeight: 22,
  },
  small: {
    fontFamily: Fonts.body.medium,
    fontSize: 13,
    lineHeight: 19,
  },
  smallBold: {
    fontFamily: Fonts.body.bold,
    fontSize: 13,
    lineHeight: 19,
  },
  quote: {
    fontFamily: Fonts.body.medium,
    fontStyle: 'italic',
    fontSize: 13.5,
    lineHeight: 21,
  },
  eyebrow: {
    fontFamily: Fonts.display.bold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  dataLabel: {
    fontFamily: Fonts.data.semibold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.display.extrabold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  titleBig: {
    fontFamily: Fonts.display.extrabold,
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -0.5,
  },
  titleHuge: {
    fontFamily: Fonts.display.black,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.display.extrabold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  heroNumber: {
    fontFamily: Fonts.data.bold,
    fontSize: 64,
    lineHeight: 66,
    letterSpacing: -2,
  },
  cardTitle: {
    fontFamily: Fonts.display.extrabold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  link: {
    fontFamily: Fonts.body.medium,
    fontSize: 13,
    lineHeight: 28,
  },
  linkPrimary: {
    fontFamily: Fonts.body.bold,
    fontSize: 13,
    lineHeight: 28,
    color: '#FF7A36',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
