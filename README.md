# FORJA

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

## Privacidade

Todos os dados do usuário (streak, XP, diário de gatilhos, respostas do
onboarding) são armazenados localmente no dispositivo via `AsyncStorage`, em
chaves separadas. O app não faz nenhuma chamada de rede, não usa
analytics/telemetria e não envia dados para servidores externos.

> Pendente: criptografia do diário de gatilhos e das respostas de perfil,
> hoje salvos em texto puro no `AsyncStorage` (ver seção Status).

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
- **Fontes:** Space Grotesk, Archivo e Manrope (Google Fonts via Expo)

## Estrutura do projeto

```
src/
  app/                    # telas e rotas (Expo Router)
    (tabs)/               # abas principais: home, diário, conquistas, perfil
    onboarding.tsx        # fluxo inicial de 9 telas (personalização)
    panico.tsx            # botão de pânico (respiração + ação + registro)
    celebracao.tsx         # modal de subida de patente
    frases.tsx             # biblioteca de frases (histórico + busca, PRO)
    relatorio.tsx           # relatório semanal/mensal de progresso (PRO)
    streak-detalhe.tsx      # detalhe da jornada/streak atual
    _layout.tsx             # layout raiz (fontes, splash, stack de modais)
  components/             # componentes de UI reutilizáveis (cards, botões,
                           # anéis de progresso, badges, efeitos de partícula...)
  constants/              # tema, frases, gatilhos, tabela de patentes/XP,
                           # temas visuais de patente, conquistas secretas
  hooks/                  # useAppData, use-theme, useElapsedTime,
                           # useRankUpCelebration
  notifications/          # agendamento de notificações locais
  storage/                # leitura/escrita no AsyncStorage (dados de
                           # gamificação e perfil de onboarding)
  types/                  # tipos compartilhados
  utils/                  # gamificação (XP/patente), insights do diário,
                           # datas, áudio das frases, paywall (gate PRO)

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
- Identidade visual FORJA ("Aço & Brasa": ícone, splash, animações,
  gradientes, glass cards — ver `design_handoff_forja/`)

**PRO — implementado e funcional:**

- Patentes completas (Guerreiro → Imortal) e conquistas secretas
- Histórico completo de frases com biblioteca pesquisável por tema
- Narração em áudio das frases (TTS do sistema via `expo-speech`)
- Insights do diário de gatilhos (padrões de horário/gatilho recorrente)
- Temas visuais alternativos para o badge de patente (aura ouro/prata/brasa)
- Relatório semanal/mensal de progresso
- Notificação diária com horário customizável
- Gate de paywall (`utils/paywall.ts`) sinalizando recursos exclusivos

**Pendente:**

- Widget de tela inicial (streak visível sem abrir o app)
- Backup em nuvem / sync entre dispositivos (depende de decisão de backend)
- Botão de pânico expandido (meditação guiada, playlist, contato de
  accountability) e feature de accountability partner
- Integração real de pagamento in-app (RevenueCat ou nativo Apple/Google) —
  hoje o paywall só exibe o aviso, sem cobrança
- Criptografia dos dados sensíveis (diário de gatilhos e perfil de
  onboarding, hoje em texto puro no `AsyncStorage`)
- Testes em dispositivo real
- Preparação para submissão nas lojas (política de privacidade, screenshots,
  descrição)

Veja o arquivo [`CLAUDE.md`](./CLAUDE.md) para o contexto completo do
projeto e as decisões de produto/técnicas, e [`CHECKLIST.md`](./CHECKLIST.md)
para a checklist detalhada de funcionalidades por camada (Free/Pro).

## Licença

Este é um projeto pessoal em desenvolvimento, sem licença de código aberto.
Todos os direitos reservados.
