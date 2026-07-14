import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MarkdownLite } from '@/components/markdown-lite';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { TERMOS_DE_SERVICO_MD } from '@/constants/termos';

export default function TermosDeServicoScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <MarkdownLite content={TERMOS_DE_SERVICO_MD} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: { padding: Spacing.three, paddingBottom: 40 },
});
