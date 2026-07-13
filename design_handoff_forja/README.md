# Handoff: Redesign FORJA — App de autocontrole/disciplina (React Native + Expo)

## Overview
Redesign completo da UI/UX do app (repo: Wessel2007/projeto_vicio). Nova direção visual "Aço & Brasa":
dark mode premium com fundo carvão único, fogo/brasa usado APENAS como acento de progresso e ação
(referências: Oura, Whoop, Nike Training Club). Todas as telas foram aprovadas pelo dono do produto.

## About the Design Files
Os arquivos deste pacote são **referências de design criadas em HTML** — protótipos que mostram
aparência e comportamento pretendidos, NÃO código de produção. A tarefa é **recriar estes designs
no codebase React Native + Expo existente**, usando os padrões já estabelecidos
(expo-router, styled via StyleSheet, componentes em src/components/, constantes em src/constants/theme.ts).
Não portar o HTML diretamente.

## Fidelity
**High-fidelity (hifi).** Cores, tipografia, espaçamentos e copy são finais. Recriar pixel-perfect.

## Design Tokens

### Cores
| Token | Hex | Uso |
|---|---|---|
| bg (fundo global) | #0D0B09 | Fundo de TODAS as telas (crise/celebração usam #0A0807–#0B0908, um passo mais escuro) |
| surface (card) | #171310 | Única superfície de card do app ("chapa") |
| surface crise | #161210 | Cards no fluxo de pânico |
| border | rgba(255,255,255,.07) | Borda 1px de todo card |
| text | #F4EFE9 | Texto primário (branco quente, nunca #FFF puro em texto corrido) |
| text-55/50/45/40 | rgba(244,239,233,.55/.50/.45/.40) | Hierarquia de texto secundário |
| brasa (primária) | #FF6B2B | Progresso, tab ativa (#FF7A36 em ícones), acentos |
| brasa clara | #FFC46B | Ponta de progresso, highlights |
| brasa escura | #C9330B / #D8380E | Fim de gradientes |
| bronze/dourado | #E8B458 | Patente, marca "FORJA", tudo relacionado a PRO |
| carmesim | #E5484D | RESERVADO ao SOS/pânico. Nunca usar em outro contexto |
| verde | #58C286 | "Resisti" / taxa de resistência |
| vermelho suave | #F07B72 | "Recaída" / ações destrutivas |
| tab inativa | #6F6558 | Ícones e rótulos de tab inativos |

### Gradientes
- CTA primário: linear-gradient(135deg, #FFB05C, #FF6B2B 55%, #D8380E) + shadow 0 8px 28px rgba(255,107,43,.28)
- Barra/anel de progresso: #FFC46B → #FF6B2B → #C9330B (têmpera do metal)
- Número gigante (opção Aço Vivo): linear 180deg #FFD9A0 → #FF6B2B 58% → #B92E0A com background-clip:text

### Tipografia
- **Space Grotesk** (600/700): números grandes, títulos de dados, labels de card (10px, letter-spacing 2px, UPPERCASE)
- **Archivo** (700–900): manchetes de telas cerimoniais (onboarding, celebração, patentes), marca FORJA, eyebrows (10px / letter-spacing 3px / uppercase)
- **Manrope** (400–800): corpo, botões de texto, listas
- Monospace (ui-monospace/Menlo): horas e timestamps (ex.: "+ 14h 22m", "22:41")

### Raios e espaçamento
- Cards: 16px (destaques 18px) · botões: 15–16px · chips/pills: 99px · badges de status: 7px
- Padding de tela: 22–24px lateral · gap entre cards: 12–18px
- Altura de CTA: 52–56px

### Animações (micro-interações)
- sosBreathe: box-shadow carmesim pulsando, 3s ease-in-out infinite (botão SOS)
- emberPulse: opacity .5→1 + scale .96→1.04, 2s (brasas ativas)
- glowPulse: opacity .35→.8, 3.2s (halos radiais)
- breathe: scale .8→1.08, 12s (orbe de respiração guiada — ciclo completo inspira/expira)
- ripple: scale 1→1.65 + fade, 4s (anéis da respiração)
- rise: fagulhas sobem 50px com fade, 2.2–3s (celebrações)
- flicker: opacity oscilando, ~2.6s (chamas de ícone)

## Screens / Views

### 1. Home (APROVADA — versão "2a" no arquivo de referência)
Estrutura da opção 1b + Anel de Brasa da 1a como hero:
- Header: "SUA FORJA · SEG, 13 JUL" (Space Grotesk 11px, ls 2.5px, 45%) à esquerda; à direita chip de patente
  (borda rgba(232,180,88,.28), fundo rgba(232,180,88,.06), pill, badge PNG 20px + nome em bronze 10.5px UPPERCASE)
- Hero: anel de progresso circular 236px — trilha rgba(255,255,255,.07) 10px, progresso em gradiente de têmpera,
  linecap round, começa às 12h; ponta com dot #FFC46B + halo; halo radial laranja pulsando atrás.
  Centro: dias (Space Grotesk 700, 64px) + "DIAS NA FORJA" (10px ls 3px) + horas em mono bronze ("+ 14h 22m").
  O anel representa o progresso até a PRÓXIMA patente (dias desde o nível atual / dias até o próximo).
- Linha abaixo do anel: "X dias para <próxima patente> · N XP" (12.5px, destaque em #FFC46B)
- Régua da semana: card chapa com 7 dots (9px) — dias cumpridos em #FF6B2B, hoje com gradiente radial + glow + emberPulse, rótulos T Q Q S S D S
- Grid 2 colunas: card BATALHAS (30px número "8 /9" + "89% de resistência" em verde) e card FRASE DO DIA (itálico 11.5px + autor em bronze uppercase)
- SOS fixo acima da tab bar: pill 52px, borda rgba(229,72,77,.45), fundo rgba(229,72,77,.10), dot pulsando + "PRECISO DE AJUDA" (13px ls 2px #F2A9AC), animação sosBreathe
- Tab bar: 4 destinos (Home, Diário, Patente, Perfil), ícones stroke 1.9, ativo #FF7A36, inativo #6F6558, borda superior rgba(255,255,255,.06)
- Tudo cabe sem rolagem num viewport 402×874

### 2. Onboarding (3 telas)
**Boas-vindas**: chama SVG em gradiente dentro de anéis concêntricos bronze + halo pulsante; "FORJA" (Archivo 800 12px ls 6px bronze);
título Archivo 800 30px "Você está prestes a forjar uma nova versão de si"; nota de privacidade; CTA gradiente "Começar minha jornada";
microcopy "Leva 2 minutos · 100% privado".
**Pergunta**: barra de progresso = "temperatura da forja" (gradiente de têmpera enchendo, brasa 11px com glow na ponta, contador "5/8");
eyebrow "A FORJA ESQUENTA"; pergunta Archivo 800 26px; opções em cards chapa 14px radius — a selecionada "acende"
(borda rgba(255,138,61,.75), fundo gradiente quente translúcido, texto #FFC49A, glow, chama pequena à direita com flicker);
rodapé Voltar (texto) + Continuar (CTA gradiente 2/3).
**Forja concluída**: badge PNG recruta-1 150px com drop-shadow laranja, anéis concêntricos, 3 fagulhas subindo (rise);
eyebrow "SUA PRIMEIRA PATENTE"; "Forja concluída" Archivo 800 34px; copy citando Recruta I em bronze; dots de paginação.

### 3. Botão de Pânico (3 telas — fundo #0A0807, SEM tab bar)
**Respiração**: orbe-brasa 236px de diâmetro interno (radial-gradient circle at 38% 30%: #FF9D4D → #FF5A1E 55% → #A82708,
box-shadow externo laranja + inset escuro pra volume), animação breathe 12s; 2 anéis ripple; palavra "Inspire" (Space Grotesk 22px ls 3px);
header "CICLO 1 DE 3" + botão fechar; instrução "Respire com a brasa…"; link discreto "Pular respiração".
**Ação**: chip de gatilho ("Ansiedade") ao lado de "GATILHO IDENTIFICADO"; título "Faça isso agora" Archivo 28px;
card de ação com borda bronze sutil e linha de luz no topo; 3 ferramentas circulares (Meditação, Playlist, Contato) com "·PRO" bronze;
CTA gradiente "Resisti — registrar vitória"; **"Recaí dessa vez" e "Sair sem registrar" em cinza 38% — presentes mas silenciosos**.
**Vitória**: orbe com "+1" Archivo 900 44px, fagulhas; eyebrow "MAIS UMA MARTELADA"; "Vitória forjada" Archivo 800 32px;
CTA outline bronze "Voltar à forja".

### 4. Diário de Gatilhos
- Header: "Diário" Archivo 800 28px + subtítulo de valor "9 batalhas registradas · 89% vencidas";
  à direita pill "Insights ·PRO" (borda bronze)
- Timeline agrupada por dia (eyebrows "HOJE", "ONTEM", "SEX, 10 JUL" — Archivo 10px ls 3px 35%)
- Card de entrada: hora em mono 11px à esquerda, gatilho 700 14.5px + nota opcional 12px 50%, badge à direita
  RESISTI (fundo rgba(88,194,134,.14), texto #58C286) ou RECAÍDA (rgba(240,123,114,.13), #F07B72) — 9.5px 800 ls .8px
- Teaser de insight: card borda TRACEJADA bronze — "Um padrão está surgindo" + preview do insight + menção PRO
- CTA "+ Registrar gatilho" fixo no rodapé sobre gradiente de fade do fundo

### 5. Conquistas/Patentes (trilha vertical)
- Eyebrow "JORNADA DO GUERREIRO" + título "Patentes"
- Hero: badge atual 140px com anel bronze + drop-shadow laranja, nome Archivo 800 24px, "XP · dias", barra de progresso 240px
  (gradiente #FF6B2B→#FFC46B), "X dias para <próximo>"
- Trilha vertical: linha de 2px por item — ACESA (#FF6B2B) até o nível atual, FRIA (rgba(255,255,255,.1)) adiante;
  nó circular por tier (atual = gradiente radial + glow + emberPulse)
- Item de tier: badge PNG 46px, nome 700 14.5px, faixa de dias, 3 pips de sublevel à direita
  (ouro #E8B458 = feito, brasa com glow = atual, outline = futuro)
- Tier atual: card destacado (fundo rgba(255,107,43,.07), borda rgba(255,138,61,.4), glow) + "· VOCÊ ESTÁ AQUI" em #FF8A3D
- Gate PRO como marco NA trilha: card gradiente bronze "Forja avançada · PRO — Do Guardião ao Imortal, 6 patentes e 351 dias"
- Tiers bloqueados: opacity .35–.45 + badge grayscale(.7) — legíveis, não invisíveis

### 6. Perfil/Configurações
- "Cartão de guerreiro" no topo: badge 60px + patente + streak/XP + chevron
- Card FORJA PRO logo abaixo: borda bronze, gradiente translúcido, estrela, "Forje até o Imortal", 3 benefícios,
  preço R$ 9,90/mês + botão "Assinar" gradiente
- Seções com eyebrows (CONFIGURAÇÕES / AURA DA PATENTE ·PRO / CONTATO DE CONFIANÇA ·PRO / DADOS)
- **Seletor de horário COLAPSADO numa linha** (valor mono + chevron) — nunca spinner aberto permanente
- Aura da patente: 3 swatches (Ouro selecionado, Prata, Brasa) — "Carmesim" foi REMOVIDO (reservado ao SOS)
- Toggle: track gradiente brasa quando ativo
- "Apagar todos os dados" em #F07B72; disclaimer terapêutico em 11px 30% no rodapé

### 7. Celebração de marco (subida de patente)
- Fundo #0B0908 + halo radial gigante pulsando
- Eyebrow "PATENTE FORJADA" (Archivo 11px ls 5px bronze)
- Badge PNG 185px com drop-shadow forte + emberPulse suave; 3 anéis concêntricos bronze (fading); fagulhas rise
- Nome "Guerreiro III" Archivo 900 40px; "14 dias de disciplina contínua" bronze;
  copy com metáfora ("O metal só vira lâmina depois de duas semanas no fogo") + próxima têmpera
- CTA "Continuar forjando" + link "Compartilhar conquista"

## Interactions & Behavior
- Anel/barras de progresso: animar preenchimento no mount (ease-out ~800ms), sensação de "acender"
- SOS: sempre visível na Home acima da tab bar; sosBreathe contínuo; carmesim exclusivo dele
- Fluxo de pânico: fullscreen modal, sem tab bar; respiração 12s/ciclo × 3 ciclos, skippable
- Seleção no onboarding: transição de "acender" (borda+glow+chama) ~200ms ease
- Celebração: disparada ao subir de patente; fagulhas em loop; sem confete
- Regra de linguagem: nunca conteúdo adulto explícito — vocabulário é disciplina/forja/batalha

## State Management (dados que a UI consome)
- streak em dias + horas desde meia-noite; nível atual calculado da tabela de patentes (Recruta 1-3d … Imortal 366+)
- % até próxima patente = (dias - min_atual) / (min_próx - min_atual)
- XP acumulado; registros do diário {timestamp, gatilho, nota?, resultado: resisti|recaída}
- taxa de resistência do mês; últimos 7 dias cumpridos (régua da semana)
- flag PRO (gates: patentes além de Guerreiro, insights do diário, ferramentas de crise, horário de lembrete, aura, contato)

## Assets
- `patentes/*.png` — 27 badges 3D existentes do repo (assets/images/patentes/), formato <slug>-<1|2|3>.png,
  slugs: recruta, aprendiz, guerreiro, guardiao, espartano, monge, mestre, lenda, imortal. Manter como estão.
- Ícones: SVGs stroke 1.9–2.2 desenhados no protótipo (home, diário, escudo, perfil, chama, gráfico) — recriar
  com a lib de ícones do projeto ou copiar os paths dos arquivos HTML.
- Fontes Google: Space Grotesk, Archivo, Manrope (Expo: @expo-google-fonts).

## Files
- `Redesign Forja.dc.html` — protótipo completo. Seção "2" (topo) = Home FINAL aprovada (2a).
  Seção "1" = diagnóstico do app antigo + variações de Home (1a/1b/1c, superadas pela 2a) e todas as demais telas
  aprovadas: 1d onboarding, 1e pânico, 1f diário, 1g patentes, 1h perfil, 1i celebração.
- `patentes/` — badges PNG.
