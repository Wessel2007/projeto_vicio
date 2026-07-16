# Plano de Polimento — FORJA (pré-submissão)

Gerado em 2026-07-16. Baseado em auditoria do código atual (TypeScript e
lint limpos — os problemas abaixo são de lógica/integração e itens
incompletos, não erros de sintaxe) + `CHECKLIST.md` já existente.

Decisões já tomadas nesta rodada (confirmadas com o Luiz em 2026-07-16):

- Bug de estado do `useAppData` (item 1 abaixo) → **corrigir agora, é P0**.
- Perfil de personalização do onboarding hoje é dado morto → **implementar
  uso real**, com escopo pragmático (ver item 5).
- Integração de pagamento real (RevenueCat/IAP nativo) → **fora deste
  polimento**, fica para uma fase futura separada.
- `bundleIdentifier`/`package` → usar placeholder `com.forjaapp.forja`
  (trocar depois quando houver conta de desenvolvedor/domínio definitivo).

---

## Fase 1 — Bugs funcionais críticos (P0) — ✅ concluída em 2026-07-16

Encontrados numa auditoria de fluxo ponta a ponta (onboarding → home →
pânico/recaída → paywall → notificações → storage). Nenhum aparece em
`tsc`/lint porque são bugs de lógica, não de tipo.

### ✅ 1.1 Estado do app não é compartilhado entre telas
`src/hooks/useAppData.ts` é chamado de forma independente em cada tela —
não existe um Context compartilhado. `panico.tsx` e `reflexao-recaida.tsx`
são modais empilhados sobre as tabs (a Home não é desmontada, só fica
coberta). Resultado: registrar "resisti" ou uma recaída **não atualiza a
Home por baixo** (streak, XP, patente, card de Horário de Risco) até o app
ser fechado e reaberto.

**Correção:** extrair `useAppData` para um `AppDataProvider` (React
Context) montado uma vez em `src/app/_layout.tsx`, e trocar todo `useAppData()`
local pelo hook de contexto (`useAppDataContext()` ou similar). Isso garante
uma única fonte de verdade em memória, atualizada de forma síncrona para
todas as telas monstadas simultaneamente.

### ✅ 1.2 `progressoPercent` negativo no dia 0
`src/utils/gamification.ts:43-48` (`calcPatente`) — com `diasEfetivos = 0`
(logo após onboarding ou logo após uma recaída), a conta gera
`progressoPercent = -100`. Em `src/app/(tabs)/conquistas.tsx:71-76` esse
valor vira `width: -100%` na barra de progresso animada, sem clamp — quebra
visualmente a tela de Conquistas no primeiro dia de cada streak.

**Correção:** clampar `progressoPercent` em `Math.max(0, ...)` dentro de
`calcPatente`.

### ✅ 1.3 `resetarApp()` não cancela notificações agendadas
`src/hooks/useAppData.ts:101-107` — "Apagar todos os dados" reseta o
AsyncStorage mas nunca chama `cancelarLembreteDiario()`/
`desativarNotificacoes()` (ambas já existem em `src/notifications/`).
Notificação diária continua disparando para sempre, dessincronizada do
app (que mostra o toggle como desligado).

**Correção:** chamar `desativarNotificacoes()` dentro de `resetarApp()`
antes de gravar `DEFAULT_DATA`.

### ✅ 1.4 Campos de economia não resetam na tela de Perfil
`src/app/(tabs)/perfil.tsx:44-54` — `custoTexto`/`tempoTexto` sincronizam
com os dados só uma vez, via `useRef` que nunca é resetado
(`bufferEconomiaSincronizado`). Depois de um reset total dos dados, os
campos de texto continuam mostrando os valores antigos.

**Correção:** resetar `bufferEconomiaSincronizado.current = false` (ou
remover a trava) sempre que `resetarApp()` for chamado — na prática, mais
simples: reagir a uma mudança de identidade dos dados (ex: comparar
referência do objeto `dados` pós-reset) em vez de sincronizar só uma vez.

### ✅ 1.5 Troca de idioma não reagenda a notificação
`src/app/(tabs)/perfil.tsx:118-120` (`selecionarIdioma`) — troca o idioma
da UI via `mudarIdioma`, mas o texto da notificação diária já agendada
(montado com `i18n.t` no momento do `agendarLembreteDiario`) só atualiza
na próxima troca de horário ou reabertura do app.

**Correção:** se `dados.notificationsEnabled`, chamar
`agendarLembreteDiario(dados.dailyQuoteHour, dados.dailyQuoteMinute)`
de novo logo após `mudarIdioma()` em `selecionarIdioma`.

### ✅ 1.6 Escritas no storage sem tratamento de erro
`src/hooks/useAppData.ts` — `salvarDados(next)` é chamado sem `await`/
`.catch()` em `atualizar`, `registrarReflexaoRecaida` e `adicionarEntrada`.
Falhas de criptografia/AsyncStorage são engolidas silenciosamente, e
escritas concorrentes podem persistir fora de ordem.

**Correção:** no mínimo, adicionar `.catch()` com log (não precisa de UI
de erro para isso — é um app 100% local, mas silenciar completamente uma
falha de persistência de dado sensível é arriscado). Avaliar se vale
serializar as escritas (fila simples) ao mexer no Context da Fase 1.1.

---

## Fase 2 — Personalização do onboarding (perfil sigiloso)

`src/storage/perfil.ts` salva o perfil (`comportamentoAlvo`,
`tempoIncomoda`, `importanciaSobriedade`, `gatilhosDetalhes`,
`areasMelhoria`, `estiloMotivacional`, `marcoEsperado`) mas
`carregarPerfil()` **nunca é chamado em nenhum outro lugar do app** — dado
gravado e nunca lido de volta. A promessa de "app se adapta a você" na
copy hoje não tem efeito nenhum.

**Aviso de escopo:** implementar personalização *completa* (variar as
~365 frases do dia por tom direto/acolhedor, por exemplo) é um trabalho de
conteúdo, não só de código — teria que escrever 2 variantes de cada frase.
Escopo recomendado para este polimento (pragmático, sem trabalho de
redação em massa):

- 2.1. Carregar o perfil junto com `AppData` no novo `AppDataProvider`
  (Fase 1.1), expondo `perfil` no contexto.
- 2.2. Usar `estiloMotivacional` (`direto`/`acolhedor`) para escolher entre
  duas variantes curtas e já dimensionadas de copy: texto da notificação
  diária e mensagem de confirmação do botão de pânico (poucas strings,
  viável escrever as 2 variantes em pt-BR/en/es).
- 2.3. Usar `marcoEsperado` para destacar, na Home ou em
  `streak-detalhe.tsx`, quando o marco escolhido pelo usuário no
  onboarding está próximo ("faltam 2 dias para o fim de semana que você
  marcou como meta").
- 2.4. Usar `gatilhosDetalhes`/`areasMelhoria` para priorizar a ordem dos
  gatilhos sugeridos no Diário e no Botão de Pânico (gatilhos já
  selecionados no onboarding aparecem primeiro).

Isso cumpre a promessa de personalização sem exigir reescrever todo o
conteúdo de frases.

---

## Fase 3 — Internacionalização (itens já mapeados no CHECKLIST.md)

- [ ] Revisão humana das traduções automáticas sensíveis em
      `locales/en/panicButton.json`, `locales/en/triggerJournal.json` (e
      `locales/es/...` equivalentes) antes de produção.
- [ ] i18n de `frases.tsx`, `relatorio.tsx`, `streak-detalhe.tsx`,
      `termos-de-servico.tsx` — confirmado 100% hardcoded em pt-BR (0
      chamadas a `t()`).
- [ ] Completar i18n parcial de `celebracao.tsx`, `patente-revelada.tsx`,
      `reflexao-recaida.tsx` (usam `t()` só residualmente).
- [ ] Testar em dispositivo real com idioma do sistema em en/es,
      validando quebras de layout com textos ~20% mais longos.
- [ ] Localizar metadata de loja (nome, descrição, screenshots, palavras-
      chave) para en/es.

---

## Fase 4 — Preparação de build e submissão

- [ ] `app.json`: adicionar `ios.bundleIdentifier` e
      `android.package` = `com.forjaapp.forja` (placeholder — trocar
      quando tiver conta de desenvolvedor/domínio definitivo).
- [ ] Criar `eas.json` com perfis `development`/`preview`/`production`.
- [ ] Assets de ícone/splash finais: confirmado por hash que
      `icon.png`, `favicon.png`, `android-icon-foreground.png` e
      `splash-icon.png` são hoje bytes idênticos ao logo oficial — falta
      gerar variantes próprias (ícone adaptativo Android precisa respeitar
      a safe-zone; splash tem proporção diferente de um ícone quadrado).
- [ ] Definir categoria de submissão (Saúde e Fitness / Estilo de vida).
- [ ] Documento/tela de Política de Privacidade dedicada — hoje só
      referenciada dentro dos Termos; App Store Connect e Play Console
      exigem URL pública própria no formulário de submissão.
- [ ] Screenshots e descrição de loja — lembrar da restrição da Apple:
      nada de referência visual/textual explícita a pornografia (usar
      "autocontrole", "disciplina", "hábitos saudáveis").

---

## Fase 5 — Testes em dispositivo real

- [ ] Rodar o app completo em iOS e Android físicos (não só simulador),
      cobrindo os fluxos:
  - Onboarding completo → plano gerado → Home (primeiro uso)
  - Botão de pânico → resisti → volta pra Home com streak/XP atualizados
    (validar o fix da Fase 1.1)
  - Recaída → reflexão → streak reseta, XP retido corretamente, Home
    reflete o reset sem precisar reabrir o app
  - Apagar todos os dados → notificação realmente para de disparar
    (validar o fix da Fase 1.3)
  - Trocar idioma com notificação ativa → nova notificação sai no idioma
    novo (validar o fix da Fase 1.5)
  - Compra simulada do plano PRO → todas as features PRO liberam
    (relatório, frases, insights, temas de patente, notificação
    customizável, botão de pânico expandido)
  - Testar com idioma do sistema em en/es (Fase 3)

---

## Fora do escopo deste polimento (fica para depois)

- Integração real de pagamento (RevenueCat ou IAP nativo Apple/Google) —
  decisão de 2026-07-16, fase futura separada, após o restante do
  polimento estar fechado.
- Widget de tela inicial, backup em nuvem, accountability partner
  completo, modo "SOS gatilho específico", guia de bloqueadores de
  conteúdo — já formalizados como fora do MVP no `CHECKLIST.md`.

---

## Ordem de execução sugerida

1. Fase 1 (bugs P0) — sem isso, qualquer teste em dispositivo real vai
   mascarar problemas de dado desatualizado.
2. Fase 2 (personalização) — depende do Context criado na Fase 1.1.
3. Fase 3 (i18n) — trabalho de conteúdo, pode rodar em paralelo às Fases
   1-2 se for outra pessoa revisando as traduções.
4. Fase 4 (build/loja) — em paralelo, não depende de código.
5. Fase 5 (testes reais) — só faz sentido depois das Fases 1-4 fechadas.
