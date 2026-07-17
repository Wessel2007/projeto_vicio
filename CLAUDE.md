# CLAUDE.md — Contexto do Projeto

## Visão Geral

App mobile (iOS + Android) de recuperação/controle de vício em pornografia, no
estilo "I am Sober", mas fortemente gamificado e voltado especificamente para
esse público (não é um app genérico de hábitos).

Diferenciais em relação ao concorrente direto (I am Sober):
- Progressão narrativa por patentes (não é só um contador de dias)
- Ferramentas de intervenção no momento do gatilho (botão de pânico)
- Diário de gatilhos com histórico
- Conteúdo diário curado (frases de pensadores/filósofos/figuras como
  estoicos, David Goggins, etc — não autoajuda genérica)
- Separação entre progresso de longo prazo (patente/XP, não reseta) e streak
  atual (reseta na recaída) — isso evita que o usuário abandone o app após
  uma recaída, problema identificado no concorrente

## Stack Técnica

- **Framework:** React Native com Expo
- **Motivo da escolha:** notificações push nativas, storage local robusto,
  possibilidade de reaproveitar backend em Python/FastAPI depois. Curva de
  aprendizado mais rápida que Flutter para quem vem de Python/web.
- **Navegação:** React Navigation
- **Estado local (MVP):** AsyncStorage (JSON persistente no dispositivo)
- **Backend (futuro, pós-MVP):** a decidir — Firebase (rápido) ou API própria
  em FastAPI (reaproveita conhecimento em Python) — necessário apenas quando
  houver comunidade/sync entre dispositivos
- **Dev do usuário:** primeira vez desenvolvendo apps mobile. Já tem
  experiência com Python e projetos web. Precisa de explicações didáticas
  sobre conceitos específicos de mobile/React Native, não só o código pronto.

## Sistema de Gamificação — Jornada do Guerreiro/Monge

Duas camadas separadas:
- **XP total** (nunca reseta, só acumula) → determina a patente
- **Streak atual** (dias sem recaída, reseta ao recair) → exibido separado

### Tabela de patentes (3 sublevels cada, baseado em dias consecutivos/XP)

| Patente | Sublevel I | Sublevel II | Sublevel III |
|---|---|---|---|
| Recruta | 1 dia | 2 dias | 3 dias |
| Aprendiz | 4 dias | 6 dias | 7 dias |
| Guerreiro | 8 dias | 11 dias | 14 dias |
| Guardião | 15 dias | 21 dias | 30 dias |
| Espartano | 31 dias | 45 dias | 60 dias |
| Monge | 61 dias | 75 dias | 90 dias |
| Mestre | 91 dias | 135 dias | 180 dias |
| Lenda | 181 dias | 270 dias | 365 dias |
| Imortal | 365+ dias (sem teto, só acumula) | — | — |

XP base: 10 por dia consecutivo, com curva de recompensa mais rápida no
início (retenção inicial) e mais espaçada depois (engajamento longo prazo).

## Telas do MVP

1. **Onboarding** — introdução, dias sem recair (popula streak inicial),
   seleção de gatilhos comuns, permissão de notificação
2. **Home/Dashboard** — streak atual, patente + sublevel, barra de progresso,
   frase do dia, botão de pânico sempre visível
3. **Botão de Pânico** — fluxo modal: respiração guiada → pergunta o que
   está sentindo → sugestão de ação → confirmação "resisti" (vira evento
   registrado)
4. **Diário de Gatilhos** — histórico de entradas (data, gatilho, texto
   opcional), base para insights futuros (ex: horário/gatilho mais comum)
5. **Conquistas/Patente** — visualização da progressão Recruta → Imortal
6. **Perfil/Configurações** — notificações, horário da frase diária,
   exportar/apagar dados, assinatura premium

Comunidade/fórum: **fora do MVP** — alto risco de moderação e rejeição na
App Store, feature mais cara. Validar o resto primeiro.

## Monetização

Freemium:
- **Grátis:** tracker, patente básica, frase do dia
- **Premium (assinatura):** diário de gatilhos completo, conteúdo em áudio,
  botão de pânico completo, patentes avançadas
- Afiliados possíveis: terapeutas especializados, cursos, livros (menos
  óbvio que outros nichos, explorar depois)

## Cuidados com App Store (Apple) — CRÍTICO

- Nunca usar a palavra "pornografia" ou imagens sugestivas no ícone,
  screenshots ou descrição da loja. Usar "autocontrole", "disciplina",
  "hábitos saudáveis"
- Categoria da loja: "Saúde e Fitness" ou "Estilo de vida", não "Adulto"
- Se houver UGC/comunidade no futuro: moderação ativa obrigatória (report,
  bloqueio, remoção de conteúdo) — guideline explícita da Apple
- Google Play é mais flexível, mas exige confirmação de idade dependendo da
  descrição do conteúdo

## Privacidade — CRÍTICO

Tema sensível + público vulnerável. Dado não pode ser tratado como feature
secundária:
- Evitar vincular dados sensíveis (diário de gatilhos, recaídas) à
  identidade sem necessidade real
- Criptografia de dados sensíveis
- Deixar claro nos termos que o app não substitui terapia para compulsão
  sexual — é apoio de hábito, não tratamento clínico

## Internacionalização

- **Biblioteca:** i18next (v26) + react-i18next (v17), com detecção de
  idioma do dispositivo via expo-localization (v17). Config em `src/i18n/index.ts`.
- **Idiomas ativos:** `pt-BR` (padrão/fallback), `en`, `es`.
- **Detecção e persistência:** no primeiro uso, o idioma é detectado a
  partir do dispositivo (`expo-localization`); qualquer idioma não suportado
  cai em `pt-BR`. A partir do momento em que o usuário troca manualmente em
  Perfil > Idioma, a escolha é persistida em AsyncStorage
  (`src/storage/idioma.ts`, chave própria `idioma_app_v1`, separada de
  `dados_app_v1`) e passa a ter prioridade sobre o idioma do sistema.
- **Estrutura de arquivos:** `/locales/<idioma>/<namespace>.json`, um
  namespace por tela/feature: `common`, `onboarding`, `home`, `panicButton`,
  `triggerJournal`, `achievements`, `profile`. `common` é o namespace
  default e concentra o que é reaproveitado entre telas (nomes de patente,
  nomes de gatilhos, botões genéricos, textos de notificação, paywall,
  formatação de data).
- **Convenção de nomenclatura de chaves:** `secao.label` dentro de cada
  arquivo de namespace (o namespace já identifica a tela, ex.:
  `onboarding.json` → `step3.title`, `profile.json` → `sections.aura`).
  Para textos reutilizados entre telas, prefixar o namespace explicitamente
  na chamada (`t('common:ranks.Guerreiro')`).
- **Identificadores vs. texto exibido:** valores usados como chave de dados
  (nome de patente em `NIVEIS`/`PATENTE_BADGES`, string de gatilho em
  `GATILHOS_COMUNS`/`AppData.selectedTriggers`/`TriggerEntry.trigger`)
  continuam fixos em pt-BR — são identificadores internos/dados persistidos,
  não texto de UI. A tradução acontece só na exibição, via
  `t('common:ranks.<nome>')` / `t('common:gatilhos.<nome>')`.
- **Nomes de patente traduzidos literalmente** por idioma (ex.: Guerreiro →
  Warrior → Guerrero) — decisão de produto tomada em 2026-07-14, não é uma
  tradução automática a ser revisada.
- **Regra fixa:** toda string nova de UI deve usar `t('chave')`, nunca texto
  hardcoded. Ao adicionar uma tela nova, criar um namespace próprio (ou
  reaproveitar `common` se for elemento compartilhado) e extrair as 3
  traduções (pt-BR/en/es) antes de considerar a feature pronta.
- **Pendente:** revisão humana final por falante nativo das strings
  sensíveis (Botão de Pânico e Diário de Gatilhos) antes de produção — a
  tradução automática já recebeu uma revisão de qualidade em 2026-07-16
  (ver Fase 3 do `PLANO_POLIMENTO.md`). As telas adicionadas depois do MVP
  original (`celebracao`, `frases`, `patente-revelada`, `plano-gerado`,
  `reflexao-recaida`, `relatorio`, `streak-detalhe`, `termos-de-servico`)
  foram todas traduzidas nessa mesma rodada e não seguem mais hardcoded em
  pt-BR.

## Status Atual do Projeto

- [x] Ideação e validação de conceito
- [x] Definição da árvore de patentes
- [x] Escolha de stack (React Native + Expo)
- [x] Esboço das telas do MVP
- [x] Nome/marca do app — **FORNALHA** (renomeado de "FORJA" em 2026-07-17:
      já existia app publicado homônimo na mesma categoria de disciplina/
      hábitos no Google Play; domínio principal escolhido é `appfornalha.com`;
      título de loja combinado "Fornalha: Forje autocontrole", ver
      `STORE_LISTING.md`)
- [x] Setup inicial do projeto Expo (Expo Router, TypeScript, fontes)
- [x] Implementação das telas (onboarding, home, pânico, diário, conquistas,
      perfil — as 6 telas do MVP existem em `src/app/`)
- [x] Estilização/design visual (redesign "dark-fogo" com animações,
      Reanimated, gradientes, glass cards — ver `design/`)
- [x] Lógica de XP/patente/streak (`src/utils/gamification.ts`,
      `src/hooks/useAppData.ts`)
- [x] Storage local (AsyncStorage, `src/storage/index.ts`)
- [x] Notificações push locais (lembrete diário agendável, `src/notifications/`)
- [x] Criptografia/proteção de dados sensíveis (`src/storage/crypto.ts`:
      AES-256-GCM via `@noble/ciphers`, chave mestra de 256 bits gerada com
      `expo-crypto` e guardada no Keychain/Keystore via `expo-secure-store`;
      `src/storage/index.ts` e `src/storage/perfil.ts` cifram antes de
      `AsyncStorage.setItem` e decifram depois de `getItem`, com fallback
      automático para dado legado em texto puro)
- [ ] Testes em dispositivo real
- [ ] Monetização (paywall/IAP) — modelo definido, não implementado
- [ ] Preparação para submissão nas lojas (política de privacidade,
      screenshots, descrição)
