import i18n from '@/i18n';

/** Sugestões contextuais do fluxo de reflexão pós-recaída, indexadas pelas
 * mesmas tags de GATILHOS_COMUNS (constants/gatilhos.ts) — nenhuma taxonomia
 * nova. A mesma lista serve tanto para "o que eu faria diferente" (etapa 4)
 * quanto para o microcompromisso das próximas 24h (etapa 5), como sugerido
 * no briefing da feature. Conteúdo traduzido em reflexaoRecaida.json
 * (sugestoes.<gatilho> / sugestoesPadrao). */
export function getSugestoesPorGatilho(gatilho: string | null): string[] {
  if (!gatilho) return i18n.t('reflexaoRecaida:sugestoesPadrao', { returnObjects: true }) as string[];
  const sugestoes = i18n.t(`reflexaoRecaida:sugestoes.${gatilho}`, { returnObjects: true, defaultValue: null });
  return Array.isArray(sugestoes)
    ? (sugestoes as string[])
    : (i18n.t('reflexaoRecaida:sugestoesPadrao', { returnObjects: true }) as string[]);
}
