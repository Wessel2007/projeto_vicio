import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';

type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; text: string };

function parseBlocks(markdown: string): Block[] {
  return markdown
    .trim()
    .split(/\n\s*\n/)
    .map((raw) => {
      const lines = raw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length === 1 && lines[0].startsWith('# ')) {
        return { type: 'h1', text: lines[0].slice(2) };
      }
      if (lines.length === 1 && lines[0].startsWith('## ')) {
        return { type: 'h2', text: lines[0].slice(3) };
      }
      if (lines.every((l) => l.startsWith('- '))) {
        return { type: 'list', items: lines.map((l) => l.slice(2)) };
      }
      return { type: 'paragraph', text: lines.join(' ') };
    });
}

// Renderiza `**negrito**` dentro de um bloco de texto corrido.
function InlineText({ text, style }: { text: string; style?: object }) {
  const segments = text.split('**');
  return (
    <ThemedText type="body" themeColor="textSecondary" style={style}>
      {segments.map((seg, i) => (i % 2 === 1 ? <Text key={i} style={styles.bold}>{seg}</Text> : seg))}
    </ThemedText>
  );
}

export function MarkdownLite({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <View style={styles.container}>
      {blocks.map((block, i) => {
        if (block.type === 'h1') {
          return (
            <ThemedText key={i} type="title" style={styles.h1}>
              {block.text}
            </ThemedText>
          );
        }
        if (block.type === 'h2') {
          return (
            <ThemedText key={i} type="subtitle" style={styles.h2}>
              {block.text}
            </ThemedText>
          );
        }
        if (block.type === 'list') {
          return (
            <View key={i} style={styles.list}>
              {block.items.map((item, j) => (
                <View key={j} style={styles.listItem}>
                  <Text style={styles.bullet}>•</Text>
                  <InlineText text={item} style={styles.listItemText} />
                </View>
              ))}
            </View>
          );
        }
        return <InlineText key={i} text={block.text} style={styles.paragraph} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  h1: { marginBottom: Spacing.one },
  h2: { fontSize: 17, marginTop: Spacing.one },
  paragraph: { fontSize: 14.5, lineHeight: 23 },
  bold: { fontFamily: Fonts.body.bold },
  list: { gap: Spacing.two },
  listItem: { flexDirection: 'row', gap: Spacing.two },
  bullet: { fontFamily: Fonts.body.bold, fontSize: 14.5, lineHeight: 23, color: 'rgba(244,239,233,0.55)' },
  listItemText: { flex: 1, fontSize: 14.5, lineHeight: 23 },
});
