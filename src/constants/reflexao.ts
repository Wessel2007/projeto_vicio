import i18n from '@/i18n';

/** Sugestões contextuais do fluxo de reflexão pós-recaída (etapa "o que eu
 * faria diferente"), indexadas pelas mesmas tags de GATILHOS_COMUNS
 * (constants/gatilhos.ts) — nenhuma taxonomia nova. Conteúdo traduzido em
 * reflexaoRecaida.json (sugestoes.<gatilho> / sugestoesPadrao). */
export function getSugestoesPorGatilho(gatilho: string | null): string[] {
  if (!gatilho) return i18n.t('reflexaoRecaida:sugestoesPadrao', { returnObjects: true }) as string[];
  const sugestoes = i18n.t(`reflexaoRecaida:sugestoes.${gatilho}`, { returnObjects: true, defaultValue: null });
  return Array.isArray(sugestoes)
    ? (sugestoes as string[])
    : (i18n.t('reflexaoRecaida:sugestoesPadrao', { returnObjects: true }) as string[]);
}

/** Opções do microcompromisso das próximas 24h (etapa final da reflexão).
 * Deliberadamente uma lista fixa e independente do gatilho — não repete
 * `getSugestoesPorGatilho` — porque um compromisso concreto de curto prazo
 * (avisar alguém, tirar o gatilho do alcance, etc.) faz sentido
 * independente do que motivou a recaída, e listar as mesmas frases da etapa
 * anterior fazia as duas telas parecerem idênticas. Conteúdo traduzido em
 * reflexaoRecaida.json (compromissosPadrao). */
export function getCompromissosPadrao(): string[] {
  return i18n.t('reflexaoRecaida:compromissosPadrao', { returnObjects: true }) as string[];
}
