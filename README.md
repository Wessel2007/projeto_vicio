# FORNALHA

Projeto pessoal de um app mobile (iOS + Android) de recuperação e controle de
vício em pornografia, no estilo "I am Sober", mas fortemente gamificado e
voltado especificamente para esse público.

Este é um projeto que estou desenvolvendo por conta própria, com o objetivo
de terminá-lo e publicá-lo na **App Store** e no **Google Play**.

## Diferenciais

- Progressão narrativa por patentes (Recruta → Imortal), não é só um contador
  de dias
- Onboarding personalizado (fluxo de 9 telas) que coleta comportamento-alvo,
  tempo de vício, gatilhos e estilo motivacional preferido, para adaptar
  copy do app — respostas sigilosas, guardadas só no dispositivo
- Ferramenta de intervenção no momento do gatilho (botão de pânico com
  respiração guiada)
- Diário de gatilhos com histórico e insights (horário/gatilho recorrente)
- Conteúdo diário curado (frases de pensadores/filósofos), com biblioteca
  pesquisável e narração em áudio (TTS)
- Separação entre progresso de longo prazo (patente/XP, não reseta) e streak
  atual (reseta na recaída)
- Modelo freemium com patentes, ferramentas e personalização avançadas
  reservadas ao plano PRO
- Internacionalizado (pt-BR/en/es), com detecção automática do idioma do
  dispositivo

## Privacidade

Todos os dados do usuário (streak, XP, diário de gatilhos, reflexões de
recaída, contato de confiança, respostas do onboarding) são armazenados
localmente no dispositivo via `AsyncStorage`, em chaves separadas. O app não
faz nenhuma chamada de rede, não usa analytics/telemetria e não envia dados
para servidores externos.

Os dados sensíveis (diário de gatilhos, reflexões, perfil de onboarding) são
cifrados em repouso com **AES-256-GCM** (`src/storage/crypto.ts`, via
`@noble/ciphers`), com a chave mestra gerada por `expo-crypto` e guardada no
Keychain/Keystore do sistema via `expo-secure-store`. Dado legado em texto
puro (de versões anteriores do app) é lido normalmente e recifrado na
próxima escrita.

> Pendente: documento/tela de Política de Privacidade dedicada (hoje é só
> referenciada dentro dos Termos de Serviço) — ver seção Status.

## Stack Técnica

- **Framework:** React Native com [Expo](https://expo.dev) (SDK 54)
- **Navegação:** Expo Router (file-based, grupo `(tabs)` + modais para
  pânico, celebração, frases, relatório e detalhe de streak)
- **Estado local:** AsyncStorage (JSON persistente no dispositivo, chaves
  separadas para dados de gamificação e perfil de onboarding)
- **UI/Animações:** React Native Reanimated, Moti, Linear Gradient, Expo
  Glass Effect, React Native SVG
- **Notificações:** expo-notifications (lembrete diário agendável)
- **Áudio:** expo-speech (narração TTS das frases do dia, feature PRO)
- **Internacionalização:** i18next + react-i18next, com detecção de idioma
  do dispositivo via expo-localization (pt-BR/en/es)
- **Criptografia:** `@noble/ciphers` (AES-256-GCM) + expo-crypto +
  expo-secure-store, para cifrar dados sensíveis em repouso
- **Fontes:** Space Grotesk, Archivo e Manrope (Google Fonts via Expo)

## Estrutura do projeto

```
src/
  app/                    # telas e rotas (Expo Router)
    (tabs)/               # abas principais: home, diário, conquistas, perfil
    onboarding.tsx        # fluxo inicial de 9 telas (personalização)
    panico.tsx            # botão de pânico (respiração + ação + registro)
    celebracao.tsx         # modal de subida de patente
    patente-revelada.tsx    # modal de revelação de nova patente
    plano-gerado.tsx        # loading animado do plano personalizado pós-onboarding
    reflexao-recaida.tsx    # fluxo de reflexão pós-recaída (substitui reset seco)
    frases.tsx             # biblioteca de frases (histórico + busca, PRO)
    relatorio.tsx           # relatório semanal/mensal de progresso (PRO)
    streak-detalhe.tsx      # detalhe da jornada/streak atual
    termos-de-servico.tsx   # Termos de Serviço (acessível pelo Perfil)
    pro.tsx                 # tela de upgrade/paywall FORNALHA PRO
    _layout.tsx             # layout raiz (fontes, splash, stack de modais)
  components/             # componentes de UI reutilizáveis (cards, botões,
                           # anéis de progresso, badges, efeitos de partícula...)
  constants/              # tema, frases, gatilhos, tabela de patentes/XP,
                           # temas visuais de patente, conquistas secretas, termos
  hooks/                  # useAppData, use-theme, useElapsedTime,
                           # useRankUpCelebration
  i18n/                   # setup do i18next/react-i18next
  notifications/          # agendamento de notificações locais
  services/               # assinatura.ts — ponto único de contato com a
                           # "loja" de assinaturas (hoje mock, ver Status)
  storage/                # leitura/escrita no AsyncStorage (dados de
                           # gamificação e perfil de onboarding), camada de
                           # criptografia (crypto.ts) e idioma persistido
  types/                  # tipos compartilhados
  utils/                  # gamificação (XP/patente), insights do diário,
                           # datas, economia (tempo/dinheiro poupado), áudio
                           # das frases, paywall (gate PRO)

locales/<idioma>/         # traduções pt-BR/en/es, um namespace JSON por tela/feature
assets/images/            # ícones, splash e artes das patentes usados pelo app
design_handoff_forja/      # handoff de design vigente ("Aço & Brasa") —
                           # protótipo HTML, design tokens e specs de tela
design/redesign/           # material de referência visual anterior
                           # ("dark-fogo"), mantido como histórico
```

## Como rodar

1. Instale as dependências

   ```bash
   npm install
   ```

2. Inicie o app

   ```bash
   npx expo start
   ```

No terminal você verá as opções para abrir o app em um
[development build](https://docs.expo.dev/develop/development-builds/introduction/),
emulador Android, simulador iOS, ou no [Expo Go](https://expo.dev/go).

## Status do projeto

**FREE — implementado e funcional:**

- Contador de streak e sistema de patente/XP (Recruta → Guerreiro liberados;
  patentes acima sinalizam upgrade PRO)
- Onboarding personalizado de 9 telas (comportamento-alvo, tempo de vício,
  gatilhos, motivo de mudança, estilo motivacional)
- Frase do dia, botão de pânico com respiração guiada, diário de gatilhos
  (registro), notificação diária de lembrete
- Fluxo de reflexão pós-recaída (substitui o reset seco de streak)
- Tempo e dinheiro economizado na streak atual (opcional, configurável em
  Perfil)
- Identidade visual FORNALHA ("Aço & Brasa": ícone, splash, animações,
  gradientes, glass cards — ver `design_handoff_forja/`)

**PRO — implementado e funcional:**

- Patentes completas (Guerreiro → Imortal) e conquistas secretas
- Histórico completo de frases com biblioteca pesquisável por tema
- Narração em áudio das frases (TTS do sistema via `expo-speech`)
- Insights do diário de gatilhos (padrões de horário/gatilho recorrente)
- Botão de pânico expandido (meditação guiada, playlist de foco, contato
  rápido de accountability partner)
- Temas visuais alternativos para o badge de patente (aura ouro/prata/brasa)
- Relatório semanal/mensal de progresso
- Notificação diária com horário customizável
- Tela de upgrade Free → Pro (`src/app/pro.tsx`, planos mensal/anual) — a
  compra é simulada localmente via `src/services/assinatura.ts`, sem
  cobrança real ainda

**Transversal — implementado e funcional:**

- Internacionalização pt-BR/en/es das 6 telas do MVP (Onboarding, Home,
  Botão de Pânico, Diário de Gatilhos, Conquistas, Perfil), com seletor
  manual de idioma em Perfil
- Criptografia AES-256-GCM dos dados sensíveis em repouso (diário de
  gatilhos, reflexões, perfil de onboarding)
- Termos de Serviço (`termos-de-servico.tsx`, acessível pelo Perfil)

**Fora do escopo deste MVP** (decisão de 2026-07-16, período de polimento
pré-submissão):

- Widget de tela inicial (streak visível sem abrir o app)
- Backup em nuvem / sync entre dispositivos
- Feature completa de accountability partner (convite + notificação
  discreta de recaída/marco) — permanece só a versão simples já
  implementada (contato de confiança manual)
- Modo "SOS gatilho específico" (contexto situacional casa/trabalho/cama)
- Guia de configuração de bloqueadores de conteúdo (Screen Time, apps
  terceiros)

**Pendente:**

- Integração real de pagamento in-app (RevenueCat ou nativo Apple/Google) —
  hoje `pro.tsx` só simula a compra, sem cobrança
- Revisão humana das traduções automáticas de strings sensíveis (Botão de
  Pânico e Diário de Gatilhos em en/es) e i18n das telas adicionadas após o
  MVP original (`frases`, `relatorio`, `streak-detalhe`,
  `termos-de-servico` ainda hardcoded em pt-BR)
- Política de Privacidade dedicada (hoje só referenciada dentro dos Termos)
- `bundleIdentifier`/`package` e perfis de build (`eas.json`) para
  `eas build`; assets de ícone/splash finais (hoje placeholders)
- Testes em dispositivo real
- Preparação final para submissão nas lojas (screenshots, descrição,
  localização de metadata)

Veja o arquivo [`CLAUDE.md`](./CLAUDE.md) para o contexto completo do
projeto e as decisões de produto/técnicas, e [`CHECKLIST.md`](./CHECKLIST.md)
para a checklist detalhada e sempre atualizada de funcionalidades por camada
(Free/Pro/i18n/build).

## Licença

Este é um projeto pessoal em desenvolvimento, sem licença de código aberto.
Todos os direitos reservados.
