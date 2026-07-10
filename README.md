# FORJA

Projeto pessoal de um app mobile (iOS + Android) de recuperação e controle de
vício em pornografia, no estilo "I am Sober", mas fortemente gamificado e
voltado especificamente para esse público.

Este é um projeto que estou desenvolvendo por conta própria, com o objetivo
de terminá-lo e publicá-lo na **App Store** e no **Google Play**.

## Diferenciais

- Progressão narrativa por patentes (Recruta → Imortal), não é só um contador
  de dias
- Ferramenta de intervenção no momento do gatilho (botão de pânico)
- Diário de gatilhos com histórico
- Conteúdo diário curado (frases de pensadores/filósofos)
- Separação entre progresso de longo prazo (patente/XP, não reseta) e streak
  atual (reseta na recaída)

## Privacidade

Todos os dados do usuário (streak, XP, diário de gatilhos) são armazenados
localmente no dispositivo via `AsyncStorage`. O app não faz nenhuma chamada
de rede, não usa analytics/telemetria e não envia dados para servidores
externos.

## Stack Técnica

- **Framework:** React Native com [Expo](https://expo.dev) (SDK 54)
- **Navegação:** Expo Router (file-based, grupo `(tabs)`)
- **Estado local:** AsyncStorage (JSON persistente no dispositivo)
- **UI/Animações:** React Native Reanimated, Linear Gradient, Expo Glass Effect
- **Notificações:** expo-notifications (lembrete diário agendável)

## Estrutura do projeto

```
src/
  app/              # telas e rotas (Expo Router)
    (tabs)/          # abas principais: home, diário, conquistas, perfil
    onboarding.tsx   # fluxo inicial
    panico.tsx       # botão de pânico
    _layout.tsx      # layout raiz
  components/        # componentes de UI reutilizáveis
  constants/         # tema, frases, gatilhos, tabela de patentes/XP
  hooks/             # useAppData, useTheme
  notifications/     # agendamento de notificações locais
  storage/           # leitura/escrita no AsyncStorage
  types/             # tipos compartilhados
  utils/             # lógica de gamificação (cálculo de XP/patente)

assets/images/       # ícones, splash e artes das patentes usados pelo app
design/              # material de referência visual (não entra no build)
  branding/          # identidade visual (logo, paleta, mockups)
  redesign/          # mockup HTML interativo do redesign "dark-fogo"
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

**Implementado e funcional:**

- As 6 telas do MVP (onboarding, home, botão de pânico, diário de gatilhos,
  conquistas/patente, perfil)
- Lógica de XP, patente e streak, com persistência local
- Notificação diária de lembrete (horário configurável)
- Identidade visual FORJA (ícone, splash, redesign "dark-fogo" com animações)

**Pendente:**

- Criptografia dos dados sensíveis do diário de gatilhos (hoje salvos em
  texto puro no `AsyncStorage`)
- Testes em dispositivo real
- Monetização (paywall/assinatura) — modelo definido, não implementado
- Preparação para submissão nas lojas (política de privacidade, screenshots,
  descrição)

Veja o arquivo [`CLAUDE.md`](./CLAUDE.md) para o contexto completo do
projeto e as decisões de produto/técnicas, e [`CHECKLIST.md`](./CHECKLIST.md)
para a checklist detalhada de funcionalidades por camada (Free/Pro).

## Licença

Este é um projeto pessoal em desenvolvimento, sem licença de código aberto.
Todos os direitos reservados.
