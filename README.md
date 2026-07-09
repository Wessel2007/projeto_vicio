# Projeto Vício

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

- **Framework:** React Native com [Expo](https://expo.dev)
- **Navegação:** Expo Router / React Navigation
- **Estado local:** AsyncStorage (JSON persistente no dispositivo)

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

## Status do Projeto

Veja o arquivo [`CLAUDE.md`](./CLAUDE.md) para o contexto completo do
projeto, o roadmap de desenvolvimento e as decisões de produto/técnicas
tomadas até agora.

## Licença

Este é um projeto pessoal em desenvolvimento, sem licença de código aberto.
Todos os direitos reservados.
