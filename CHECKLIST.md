# Checklist de Funcionalidades — Implementação

## FREE

- [x] Contador de streak (dias sem recair)
- [x] Sistema de patente/XP (Recruta → Guerreiro, trava após e sinaliza upgrade)
- [x] Frase do dia (1 por dia, sem histórico)
- [x] Botão de pânico com respiração guiada
- [x] Diário de gatilhos — registro (sem insights)
- [x] Notificação diária de lembrete
- [x] Onboarding personalizado (fluxo de 9 telas com identidade visual
      "forja/fogo" — comportamento-alvo, tempo de incômodo, gatilhos,
      motivo de mudança, estilo motivacional; respostas sigilosas, só
      no dispositivo)
- [x] Tempo e dinheiro economizado na streak atual (opcional, configurável em
      Perfil; reseta junto com o streak na recaída)
- [x] Card "Horário de Risco" na Home (`src/components/horario-risco-card.tsx`):
      identifica o bloco de 2h com mais registros no Diário de Gatilhos
      (`calcRiscoHorario` em `src/utils/insights.ts`); exige mínimo de 5
      registros para exibir o padrão, senão mostra nudge "continue
      registrando"
- [~] Widget de tela inicial (streak visível sem abrir o app) — **fora do
      escopo deste MVP** (decisão de 2026-07-16, período de polimento
      pré-submissão)

## PRO (assinatura)

- [x] Patentes completas (Guerreiro → Imortal) + conquistas extras/secretas
- [x] Histórico completo de frases + biblioteca pesquisável por tema
- [x] Frases em áudio narrado (TTS do sistema via `expo-speech`; sem voz humana gravada)
- [x] Insights do diário de gatilhos (gráficos de horário/gatilho recorrente, tendências)
- [x] Botão de pânico expandido (meditação guiada, playlist de foco, contato rápido accountability partner)
- [~] Backup em nuvem (sync entre dispositivos) — **fora do escopo deste
      MVP** (decisão de 2026-07-16); depende da decisão de backend (Firebase
      vs FastAPI, ver CLAUDE.md)
- [x] Temas visuais alternativos de patente (personalização)
- [x] Relatório semanal/mensal de progresso
- [x] Notificação diária com horário customizável

## Diferenciais / Pós-MVP

- [~] Accountability partner completo (convite + notificação discreta de
      recaída/marco) — **fora do escopo deste MVP** (decisão de 2026-07-16);
      permanece só a versão simples já implementada (contato de confiança
      manual no botão de pânico/Perfil, sem convite/conta vinculada)
- [~] Modo "SOS gatilho específico" (pergunta contexto situacional:
      casa/trabalho/cama) — **fora do escopo deste MVP** (decisão de
      2026-07-16)
- [~] Guia de configuração de bloqueadores de conteúdo (Screen Time, apps
      terceiros) — **fora do escopo deste MVP** (decisão de 2026-07-16)
- [x] Modo "recaída controlada" (fluxo de reflexão pós-recaída) — já
      implementado (`reflexao-recaida.tsx`), mantido no MVP
- [x] Tela de upgrade Free → Pro (ver seção Monetização / Loja abaixo)

## Estrutura de dados a implementar (lógica base)

- [x] Streak atual (reseta na recaída)
- [x] XP total (nunca reseta, só acumula)
- [x] Tabela de patentes/sublevels (ver CLAUDE.md)
- [x] Lista de gatilhos selecionáveis (usada no onboarding, diário e botão de pânico)
- [x] Registro de eventos do botão de pânico ("resisti" vs "recaí")
- [x] Flag de usuário Free/Pro (controla acesso às features acima)
- [x] Custo/tempo médio do hábito (opcional, usado só para a métrica de
      tempo e dinheiro economizado)

## Monetização / Loja

- [x] Definir preço mensal e anual (R$19,90/mês ou R$149,90/ano, ~37% de desconto)
- [x] Copy da tela de upgrade: "Leve sua disciplina além" / "Desbloqueie todo o caminho até Imortal — e as ferramentas que fazem a diferença nos momentos mais difíceis"
- [x] Tela de upgrade Free → Pro implementada visualmente (`src/app/pro.tsx`)
- [~] Integração de pagamento in-app via RevenueCat — SDK `react-native-purchases`
      instalado e `src/services/assinatura.ts` já chama a API real
      (`configurarCompras`, `comprarPlano`, `restaurarCompras`,
      `sincronizarStatusPro` revalidando o entitlement Pro a cada boot via
      `useAppData`); falta preencher as API keys em `src/config/revenuecat.ts`
      (placeholders `SUBSTITUA_...`) e criar os produtos `forja_pro_mensal`/
      `forja_pro_anual` no Play Console (feito) + App Store Connect (pendente,
      depende de Apple Developer Program) + dashboard RevenueCat com o
      entitlement `pro`. Sem API key configurada, o app roda normalmente com o
      toggle de simulação em Perfil > Modo de teste. **Requer EAS dev build**
      para testar (módulo nativo, não roda no Expo Go)
- [x] Descrição/copy de loja (nome, subtítulo, descrição curta e completa,
      palavras-chave) — rascunho pt-BR completo em `STORE_LISTING.md`
- [x] Categoria de submissão definida — Saúde e Fitness (primária) nas duas
      lojas, Estilo de Vida como alternativa na Apple; documentado em
      `STORE_LISTING.md` junto com expectativa do questionário IARC (Play)
- [ ] Screenshots reais de loja — pendente, depende de rodar o app em
      simulador/dispositivo real (ver seção Testes); sequência de telas
      recomendada já definida em `STORE_LISTING.md`

## Build e submissão nas lojas

- [x] Nome/marca do app — FORJA (`app.json`)
- [x] Paleta e redesign visual (dark-fogo, animações, Reanimated — ver `design/`)
- [x] `bundleIdentifier` (iOS) e `package` (Android) — `com.forjaapp.forja`
      nos dois, em `app.json` (placeholder de identidade; trocar quando
      houver domínio/conta de desenvolvedor definitivos — ver Fase 4.1 do
      `PLANO_POLIMENTO.md`)
- [x] `eas.json` — perfis `development` (dev client, necessário pra testar
      módulos nativos como RevenueCat fora do Expo Go), `preview` e
      `production` configurados; `eas init` já rodado (`extra.eas.projectId`
      + `owner: "wessel077"` em `app.json`)
- [x] Assets de ícone/splash finais — `android-icon-foreground.png` e
      `splash-icon.png` regenerados respeitando a safe-zone do ícone
      adaptativo Android e o recorte transparente do splash (script
      `scripts/gerar-assets-icone.js`); `icon.png`/`favicon.png`
      permanecem o logo quadrado completo (uso correto para ícone de
      loja/favicon, não é placeholder)
- [x] Termos de Serviço (tela `termos-de-servico.tsx`, conteúdo em
      `locales/*/termos.json`, traduzido pt-BR/en/es)
- [x] Política de Privacidade dedicada — tela `politica-de-privacidade.tsx`
      no app **e** página pública hospedada via GitHub Pages
      (`docs/privacidade/`, gerada a partir de `locales/*/politica.json`
      por `scripts/gerar-paginas-legais.js`), com versões en/es. URL para o
      formulário de submissão das lojas:
      https://wessel2007.github.io/projeto_vicio/privacidade/
- [ ] Testes em dispositivo real (iOS/Android) — ver seção Testes abaixo

## Testes em dispositivo real

- [ ] Rodar o app completo em iOS e Android físicos (não só simulador),
      cobrindo: onboarding → plano gerado → Home; botão de pânico → resisti
      → Home atualizada sem reabrir o app; recaída → reflexão → streak
      reseta e Home reflete na hora; apagar todos os dados → notificação
      realmente para; troca de idioma com notificação ativa → nova
      notificação sai no idioma novo; compra do plano PRO → todas as
      features PRO liberam
- [ ] Testar com o idioma do sistema em inglês e espanhol, validando
      quebras de layout com textos mais longos (~20% maior que pt-BR)
- [ ] Screenshots reais de loja durante esses testes (ver seção Monetização
      / Loja)

## Internacionalização (i18n)

- [x] Setup i18next + react-i18next + expo-localization, detecção automática
      de idioma do dispositivo com fallback pt-BR (ver CLAUDE.md, seção
      Internacionalização)
- [x] Seletor de idioma manual em Perfil, com persistência local
      (`src/storage/idioma.ts`)
- [x] Tradução completa (pt-BR/en/es) de todas as telas do app — as 6 telas
      do MVP original (Onboarding, Home, Botão de Pânico, Diário de
      Gatilhos, Conquistas/Patente, Perfil) e as telas adicionadas depois
      (`plano-gerado`, `patente-revelada`, `celebracao`,
      `reflexao-recaida`, `frases`, `relatorio`, `streak-detalhe`,
      `termos-de-servico`, `politica-de-privacidade`), além das
      constants/utils compartilhados (gatilhos, patentes, frase do dia,
      notificações, paywall, sugestões por gatilho, formatação de
      data/moeda)
- [ ] **Revisão humana obrigatória** por falante nativo das strings
      sensíveis traduzidas automaticamente (Botão de Pânico, Diário de
      Gatilhos, Reflexão de Recaída, Política de Privacidade, Termos) em
      `locales/en/*` e `locales/es/*` antes de ir para produção — já
      recebeu uma revisão de qualidade via IA em 2026-07-16 (Fase 3 do
      `PLANO_POLIMENTO.md`), mas isso não substitui revisão humana
- [ ] Localização de metadata da App Store/Play Store (nome, descrição,
      screenshots, palavras-chave) para en/es — `STORE_LISTING.md` está em
      pt-BR (idioma de lançamento) por decisão, fica para depois do MVP
      validado
- [ ] Testar o app em dispositivo real com idioma do sistema em en/es (ver
      seção Testes em dispositivo real)
