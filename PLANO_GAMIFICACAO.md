# Plano de Evolução da Gamificação

Acompanhamento das melhorias ao sistema de patente/XP discutidas em
2026-07-23. Cada item vira `[x]` quando implementado e integrado
(código + i18n pt-BR/en/es quando aplicável). Ver `CLAUDE.md` para o
sistema atual de patentes/XP e `CHECKLIST.md` para o roadmap geral do app.

- [x] **1. XP por resistência ativa no Botão de Pânico** — hoje XP só vem
      de dias de streak passando (`XP_POR_DIA`) + bônus fixo da reflexão
      pós-recaída. Registrar uma `TriggerEntry` com `resisted: true` não
      gera XP nenhum. Adicionar um XP pequeno por resistência registrada.
      **Feito em 2026-07-23:** novo `RESISTENCIA_XP_BONUS` (5 XP) em
      `src/constants/gamification.ts`, somado em `savedXP` dentro de
      `adicionarEntrada` (`src/hooks/useAppData.tsx`) sempre que
      `resisted: true` — cobre tanto o Botão de Pânico quanto o
      lançamento manual no Diário, já que ambos passam por essa mesma
      função (recaída tem caminho próprio em `registrarReflexaoRecaida`,
      sem risco de dupla contagem). Feedback visual "+5 XP por resistir"
      adicionado na tela de vitória do pânico (`src/app/panico.tsx`),
      chave `victory.xpGained` traduzida em pt-BR/en/es.
- [ ] **2. Combo de resistências consecutivas** — contador paralelo ao
      streak (resistências seguidas sem recaída); a cada N vitórias,
      pequeno multiplicador de XP ou selo visual temporário.
- [ ] **3. Conquistas a partir do motor de insights já existente**
      (`src/utils/insights.ts`) — ex.: "dominar" um gatilho (alta taxa de
      resistência contra o mesmo gatilho, várias vitórias seguidas).
- [ ] **4. Títulos equipáveis** além do nome da patente, desbloqueados
      pelas conquistas secretas (ex.: "Guardião do Amanhecer" via
      `guarda-noturno`), exibidos no perfil/badge. Possível diferencial
      PRO adicional ao lado de `PATENTE_THEMES`.
- [ ] **5. Novas conquistas secretas** cobrindo telas ainda não
      contempladas: onboarding completo com gatilhos mapeados, uso
      recorrente do relatório, personalização de tema de patente, sessão
      de respiração guiada concluída no pânico, bater o recorde pessoal
      (`calcMaiorStreak`) pela primeira vez.
- [ ] **6. Celebração ao ultrapassar o recorde pessoal** — hoje
      `calcMaiorStreak` é calculado e exibido, mas passar do recorde
      anterior não dispara nenhum evento comemorativo.

## Descartados (decisão em 2026-07-23)

- **Marcos intermediários narrativos dentro de patentes longas** — adiado,
  sem problema identificado que justifique agora.
- **Streak freeze / perdão de dia** — conflita com a mecânica de
  honestidade já existente (retenção de 75% do XP + bônus de reflexão ao
  registrar recaída real); incentivaria não registrar recaídas de
  verdade. Não implementar.
