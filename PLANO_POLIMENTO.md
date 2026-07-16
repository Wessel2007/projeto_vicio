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

### ✅ 1.6 Escritas no storage sem tratamento de erro (+ correção de race condition em 2026-07-16)
`src/hooks/useAppData.ts` — `salvarDados(next)` é chamado sem `await`/
`.catch()` em `atualizar`, `registrarReflexaoRecaida` e `adicionarEntrada`.
Falhas de criptografia/AsyncStorage são engolidas silenciosamente, e
escritas concorrentes podem persistir fora de ordem.

**Correção inicial:** `.catch()` com log em cada chamada.

**Bug real encontrado depois, em produção:** o `.catch()` sozinho não
resolvia a reordenação — duas chamadas de `salvarDados()` próximas no tempo
podiam ter suas promises do `AsyncStorage.setItem` resolvidas fora de ordem,
e a escrita mais antiga (com dado desatualizado) podia terminar por último e
sobrescrever o storage com um snapshot antigo. Sintoma relatado: streak
mostrando corretamente "0 dias" em memória durante o uso, mas ao fechar e
reabrir o app reaparecia um snapshot de dias atrás (dado antigo que venceu a
corrida de escrita). **Correção final:** fila de escrita (`filaEscrita`,
`useRef<Promise<void>>`) em `src/hooks/useAppData.tsx` — todas as chamadas
de `salvarDados` passam por `persistir()`, que as encadeia em sequência
estrita; `resetarApp()` também aguarda a fila antes de prosseguir.

---

## Fase 2 — Personalização do onboarding (perfil sigiloso) — ✅ concluída em 2026-07-16

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

- [x] 2.1. Perfil carregado junto com `AppData` no `AppDataProvider`
  (Fase 1.1), exposto como `perfil` no contexto (`src/hooks/useAppData.tsx`).
  `resetarApp()` também reseta `perfil` para `DEFAULT_USER_PROFILE` em
  memória (senão ficaria com o perfil antigo até reabrir o app).
- [x] 2.2. `estiloMotivacional` (`direto`/`acolhedor`) escolhe o tom via o
  recurso de `context` do i18next (`t(chave, { context: estilo })` busca
  `chave_acolhedor` antes de cair na chave padrão): texto da notificação
  diária (`agendarLembreteDiario`/`ativarNotificacoes`, agora recebem o
  estilo) e mensagem de vitória do botão de pânico (`panico.tsx`, step
  "vitoria"). Variantes escritas em pt-BR/en/es (`common.json` e
  `panicButton.json`).
- [x] 2.3. `marcoEsperado` destacado na Home via `MarcoProximoCard`
  (`src/components/marco-proximo-card.tsx`) quando o marco estiver a até 5
  dias de distância (`calcMarcoProximo` em `src/utils/marco.ts`). Cobre os
  marcos com alvo numérico claro (primeiras 24h, uma semana, um mês,
  superar recorde); os comportamentais/subjetivos ("dizer não",
  "acordar em paz", "outro") não têm cálculo de proximidade e não
  disparam o card.
- [x] 2.4. Gatilhos já selecionados no onboarding (`dados.selectedTriggers`,
  estruturado — não o texto livre `gatilhosDetalhes`) agora aparecem
  primeiro na grade de gatilhos do Diário (`diario.tsx`); o Botão de
  Pânico já fazia isso antes (`panico.tsx` já filtrava por
  `selectedTriggers`).

Isso cumpre a promessa de personalização sem exigir reescrever todo o
conteúdo de frases. `gatilhosDetalhes` (elaboração livre) e `areasMelhoria`
(áreas de vida) continuam salvos mas sem uso na UI — são texto livre/
multi-seleção sem um encaixe natural e de baixo risco no polimento atual;
ficam como candidato a uma futura tela de "reflexão" ou relatório mais
rico, fora deste escopo.

---

## Fase 3 — Internacionalização (itens já mapeados no CHECKLIST.md) — parcialmente concluída em 2026-07-16

### ✅ 3.1 Revisão de tradução das strings sensíveis
`locales/en/panicButton.json` e `locales/en/triggerJournal.json` (e os
equivalentes `es/`) foram lidos e comparados linha a linha com o pt-BR:
tom natural, sem artefato de tradução literal, terminologia sensível
(gatilho, recaída, ajuda) tratada com cuidado em ambos os idiomas.
**Ainda vale uma revisão humana final por um falante nativo antes de
produção** — o que foi feito aqui é uma revisão de qualidade/precisão via
IA, não substitui esse passo.

### ✅ 3.2 i18n completo de `frases.tsx`, `relatorio.tsx`, `streak-detalhe.tsx`, `termos-de-servico.tsx`
Todas confirmadas 100% hardcoded em pt-BR, agora usando `t()`:
- `frases.tsx`: reaproveita as 30 traduções já existentes em
  `home.json > quotes` (mesma ordem de índice de `constants/frases.ts`,
  validado por script) em vez de duplicar conteúdo; temas (Estoicismo,
  Disciplina, etc.) e UI movidos para novo namespace `frases`.
- `relatorio.tsx` e `streak-detalhe.tsx`: novos namespaces `relatorio` e
  `streakDetalhe`.
- `termos-de-servico.tsx`: Termos de Serviço completos traduzidos para
  en/es (novo namespace `termos`), substituindo
  `constants/termos.ts` (removido — conteúdo passou a viver 100% nos
  locales, consistente com os demais textos de UI).
- **Bug relacionado corrigido:** `utils/audio-frases.ts` narrava toda
  frase com voz fixa em `pt-BR` (`expo-speech`), mesmo com o app em
  inglês/espanhol — corrigido para usar o idioma ativo do i18next.

### ✅ 3.3 Completar i18n parcial de `celebracao.tsx`, `patente-revelada.tsx`, `reflexao-recaida.tsx`
- `celebracao.tsx`: metáforas de patente e textos traduzidos (novo
  namespace `celebracao`); `useRankUpCelebration.ts` ajustado para passar
  o nome da próxima patente separado do sublevel (`proxNome`/
  `proxSublevel`) em vez de uma string pt-BR pré-formatada, permitindo
  tradução no destino.
- `patente-revelada.tsx`: usa novo bloco `onboarding.json > revelada`.
- `reflexao-recaida.tsx`: fluxo completo traduzido (novo namespace
  `reflexaoRecaida`), incluindo as sugestões contextuais por gatilho que
  antes viviam fixas em pt-BR em `constants/reflexao.ts`
  (`getSugestoesPorGatilho` agora busca via `i18n.t`, mesmo padrão já
  usado em `getAcaoPorGatilho` do botão de pânico).
- **Bônus (fora da lista original, mas no mesmo grupo "telas pós-MVP" do
  `CLAUDE.md`):** `plano-gerado.tsx` também estava 100% hardcoded e foi
  traduzido junto (novo bloco `onboarding.json > plano`) — a tela
  antecede `patente-revelada.tsx` no mesmo fluxo, fazia pouco sentido
  traduzir uma e não a outra.

`tsc --noEmit` e `expo lint` limpos após as mudanças (só os 2 warnings
pré-existentes de `i18next` default-export em `src/i18n/index.ts`,
não relacionados).

### ⏳ Pendente (fora do alcance de mudança de código)
- [ ] Revisão humana final (falante nativo) das strings sensíveis antes
      de produção — ver 3.1.
- [ ] Testar em dispositivo real com idioma do sistema em en/es,
      validando quebras de layout com textos ~20% mais longos.
- [ ] Localizar metadata de loja (nome, descrição, screenshots, palavras-
      chave) para en/es.

---

## Fase 4 — Preparação de build e submissão — parcialmente concluída em 2026-07-16

### ✅ 4.1 `app.json` e `eas.json`
`ios.bundleIdentifier` e `android.package` = `com.forjaapp.forja`
(placeholder — trocar quando tiver conta de desenvolvedor/domínio
definitivo). `eas.json` criado com perfis `development`/`preview`/
`production` + `submit.production`.
✅ `eas init` rodado em 2026-07-16 com a conta pessoal do Luiz
(`wessel077`) — projeto criado em
`@wessel077/projeto_vicio`, `app.json` ganhou `extra.eas.projectId` e
`owner: "wessel077"` automaticamente.

### ✅ 4.2 Ícone adaptativo e splash
`android-icon-foreground.png` e `splash-icon.png` eram bytes idênticos ao
logo oficial (fundo de pedra quadrado embutido) — não respeitavam a
safe-zone do ícone adaptativo Android nem funcionavam como um recorte
transparente para o splash. Gerados via `scripts/gerar-assets-icone.js`
(script Node com `sharp`, não faz parte do app em runtime): recorte do
emblema com fundo transparente (máscara por luminância com
median+blur+threshold para eliminar tanto o ruído da textura da pedra
quanto os buracos causados pelo sombreado interno do metal, preservando os
vãos reais do desenho — fenda da gravata, guarda da chama), reamostrado
para ~60% do canvas de 1024×1024 no ícone adaptativo (dentro do círculo de
segurança de 66% do Android) e ~86% num canvas de 800×800 para o splash.
`icon.png`/`favicon.png` mantidos como o logo quadrado completo (com fundo)
— uso normal e correto para ícone de loja/favicon.

### ✅ 4.3 Categoria de submissão
Decidido: **Saúde e Fitness** como categoria primária nas duas lojas
(Estilo de Vida como alternativa na Apple, caso a revisão avalie diferente).
Documentado em `STORE_LISTING.md`, junto com a expectativa de classificação
etária no questionário IARC do Google Play (livre/12+, a confirmar na
submissão).

### ✅ 4.4 Tela de Política de Privacidade
Nova tela `/politica-de-privacidade` (`src/app/politica-de-privacidade.tsx`),
mesmo padrão de `termos-de-servico.tsx`, com conteúdo próprio em
pt-BR/en/es (`locales/*/politica.json`, namespace `politica`) cobrindo: que
dados são coletados, que **tudo fica só no aparelho** (sem backend, sem
analytics, sem chamada de rede), criptografia AES-256-GCM via
`expo-secure-store`, direitos LGPD (acesso/exportação/exclusão já
disponíveis em Perfil > Dados) e aviso de que não substitui tratamento
clínico. Link adicionado em Perfil > Sobre, ao lado de Termos de Serviço.
**Bônus relacionado (gap da Fase 3):** os títulos de header das telas
modais (`frases`, `relatorio`, `streak-detalhe`, `termos-de-servico`,
`politica-de-privacidade`) estavam hardcoded em pt-BR direto em
`src/app/_layout.tsx` — não usavam `t()` apesar do conteúdo dessas telas já
estar traduzido. Corrigido: `_layout.tsx` agora usa `useTranslation()` e
chaves `headerTitle` novas em cada namespace (`frases`, `relatorio`,
`streakDetalhe`, `termos`, `politica`).
**Pendente (ação externa):** App Store Connect e Play Console exigem uma
URL pública própria no formulário de submissão, não uma tela dentro do
app — precisa hospedar o conteúdo em algum lugar (ex.: GitHub Pages,
Notion público) antes da submissão. Anotado em `STORE_LISTING.md`.

### ✅ 4.5 Descrição de loja
Rascunho completo em `STORE_LISTING.md`: nome, subtítulo (App Store),
descrição curta (Google Play), descrição completa, palavras-chave — todos
dentro dos limites de caracteres de cada loja, respeitando a restrição de
não mencionar "pornografia" (usa "autocontrole", "disciplina", "hábitos").
Conteúdo em pt-BR (idioma de lançamento); en/es ficam para depois do MVP
validado, junto com o restante da localização de metadata de loja (item já
listado como pendente na Fase 3).

✅ Política de Privacidade hospedada publicamente em 2026-07-16 via GitHub
Pages (`docs/privacidade/`, gerado a partir de `locales/*/politica.json`
por `scripts/gerar-paginas-legais.js` — fonte única, sem duplicar texto).
URL a usar no formulário de submissão das lojas:
**https://wessel2007.github.io/projeto_vicio/privacidade/** (com
`/en/`/`/es/` para as outras traduções).

### ⏳ Pendente (fora do alcance de mudança de código)
- [ ] Screenshots reais de loja — precisa rodar o app em simulador/
      dispositivo (iOS e Android); sequência recomendada já está em
      `STORE_LISTING.md`. Só faz sentido depois da Fase 5.
- [ ] Revisão humana final da Política de Privacidade e dos Termos, junto
      com a revisão de tradução já pendente da Fase 3.

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
