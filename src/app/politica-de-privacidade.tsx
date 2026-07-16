import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MarkdownLite } from '@/components/markdown-lite';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function PoliticaDePrivacidadeScreen() {
  const { t } = useTranslation('politica');
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <MarkdownLite content={t('content')} />
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
