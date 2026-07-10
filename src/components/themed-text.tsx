import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'small'
    | 'smallBold'
    | 'quote'
    | 'eyebrow'
    | 'title'
    | 'subtitle'
    | 'heroNumber'
    | 'cardTitle'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'quote' && styles.quote,
        type === 'eyebrow' && styles.eyebrow,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'heroNumber' && styles.heroNumber,
        type === 'cardTitle' && styles.cardTitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
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
  small: {
    fontFamily: Fonts.body.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Fonts.body.bold,
    fontSize: 14,
    lineHeight: 20,
  },
  quote: {
    fontFamily: Fonts.body.regular,
    fontStyle: 'italic',
    fontSize: 16,
    lineHeight: 25,
  },
  eyebrow: {
    fontFamily: Fonts.display.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: Fonts.display.bold,
    fontSize: 30,
    lineHeight: 37,
  },
  subtitle: {
    fontFamily: Fonts.display.semibold,
    fontSize: 24,
    lineHeight: 30,
  },
  heroNumber: {
    fontFamily: Fonts.display.bold,
    fontSize: 70,
    lineHeight: 74,
  },
  cardTitle: {
    fontFamily: Fonts.display.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  link: {
    fontFamily: Fonts.body.medium,
    fontSize: 14,
    lineHeight: 30,
  },
  linkPrimary: {
    fontFamily: Fonts.body.bold,
    fontSize: 14,
    lineHeight: 30,
    color: '#FF7A3D',
  },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
