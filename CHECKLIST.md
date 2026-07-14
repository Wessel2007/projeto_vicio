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
- [ ] Widget de tela inicial (streak visível sem abrir o app)

## PRO (assinatura)

- [x] Patentes completas (Guerreiro → Imortal) + conquistas extras/secretas
- [x] Histórico completo de frases + biblioteca pesquisável por tema
- [x] Frases em áudio narrado (TTS do sistema via `expo-speech`; sem voz humana gravada)
- [x] Insights do diário de gatilhos (gráficos de horário/gatilho recorrente, tendências)
- [x] Botão de pânico expandido (meditação guiada, playlist de foco, contato rápido accountability partner)
- [ ] Backup em nuvem (sync entre dispositivos) — adiado: depende da decisão de backend (Firebase vs FastAPI, ver CLAUDE.md)
- [x] Temas visuais alternativos de patente (personalização)
- [x] Relatório semanal/mensal de progresso
- [x] Notificação diária com horário customizável

## Diferenciais / Pós-MVP

- [ ] Accountability partner (convite + notificação discreta de recaída/marco)
- [ ] Modo "SOS gatilho específico" (pergunta contexto situacional: casa/trabalho/cama)
- [ ] Guia de configuração de bloqueadores de conteúdo (Screen Time, apps terceiros)
- [ ] Modo "recaída controlada" (fluxo de reflexão pós-recaída, não só reset)
- [ ] Tela de upgrade Free → Pro (copy definida, ver seção abaixo)

## Internacionalização (i18n)

- [x] Setup i18next + react-i18next + expo-localization, detecção automática
      de idioma do dispositivo com fallback pt-BR (ver CLAUDE.md, seção
      Internacionalização)
- [x] Seletor de idioma manual em Perfil, com persistência local
      (`src/storage/idioma.ts`)
- [x] Extração e tradução (pt-BR/en/es) das 6 telas do MVP — Onboarding,
      Home, Botão de Pânico, Diário de Gatilhos, Conquistas/Patente, Perfil
      — e das constants/utils compartilhados (gatilhos, patentes, frase do
      dia, notificações, paywall, formatação de data/moeda)
- [ ] **Revisão humana obrigatória** das strings de apoio emocional/sensível
      traduzidas automaticamente em `locales/en/panicButton.json` e
      `locales/en/triggerJournal.json` (e os respectivos `locales/es/...`)
      antes de ir para produção — inclui script de respiração, meditação
      guiada e sugestões de ação por gatilho
- [ ] i18n das telas adicionadas depois do MVP original: `celebracao.tsx`,
      `frases.tsx`, `patente-revelada.tsx`, `plano-gerado.tsx`,
      `reflexao-recaida.tsx`, `relatorio.tsx`, `streak-detalhe.tsx`,
      `termos-de-servico.tsx` — hoje ainda hardcoded em pt-BR
- [ ] Localização de metadata da App Store/Play Store (nome, descrição,
      screenshots, palavras-chave) para en/es
- [ ] Testar o app em dispositivo real (iOS/Android) com o idioma do sistema
      em inglês e espanhol, e validar quebras de layout com textos mais
      longos (alemão/espanhol tendem a ser ~20% mais longos que o pt-BR)

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

- [ ] Definir preço mensal e anual (referência: R$14,90-29,90/mês ou R$99-149/ano)
- [ ] Copy da tela de upgrade: "Leve sua disciplina além" / "Desbloqueie todo o caminho até Imortal — e as ferramentas que fazem a diferença nos momentos mais difíceis"
- [ ] Integração de pagamento in-app (RevenueCat ou nativo Apple/Google)

## Pendências de planejamento (fora do código, mas bloqueiam decisões)

- [ ] Nome/marca do app
- [ ] Identidade visual (cores, ícone — lembrar das restrições da App Store: nada de referência visual/textual explícita a pornografia)
- [ ] Categoria de submissão nas lojas (Saúde e Fitness / Estilo de vida)
- [ ] Termos de uso e política de privacidade
