# Metadados de loja — FORJA

Rascunho para o formulário de submissão da App Store Connect e do Google
Play Console. Segue a restrição do CLAUDE.md: nenhuma menção a
"pornografia" ou termos explícitos — o enquadramento é sempre autocontrole/
disciplina/hábitos saudáveis. Conteúdo em pt-BR (idioma principal de
lançamento); tradução de metadados para en/es fica para depois do MVP
validado (ver Fase 3 do `PLANO_POLIMENTO.md`).

## Categoria

- **Apple App Store:** Saúde e Fitness (categoria primária). Estilo de Vida
  como alternativa se a revisão da Apple considerar o enquadramento de
  "hábito"/"vício comportamental" mais próximo de estilo de vida do que de
  saúde física.
- **Google Play:** Saúde e fitness. O Play pede confirmação de classificação
  de conteúdo (questionário IARC) — como o app trata de autocontrole
  comportamental sem imagens/texto explícito, a expectativa é classificação
  livre ou 12+, a confirmar no questionário no momento da submissão.

## Nome do app

**FORJA** — nome já definido, mantém-se igual nas duas lojas.

## Subtítulo (App Store — máx. 30 caracteres)

`Disciplina vira hábito`

## Descrição curta (Google Play — máx. 80 caracteres, mostrada na busca e no topo da ficha)

`Vença hábitos compulsivos com progressão, diário e apoio no momento do gatilho.`

## Descrição completa

```
FORJA transforma sua jornada de autocontrole em uma progressão real — não é
só um contador de dias.

Toda vez que você resiste, você avança. Toda recaída é registrada, mas seu
progresso de longo prazo (XP e patente) nunca é apagado — só sua sequência
atual reinicia. Isso significa que um dia difícil não destrói meses de
esforço, e você nunca perde motivo para continuar.

COMO FUNCIONA

• Progressão por patentes — de Recruta a Imortal, cada sequência de dias sem
  recair te aproxima da próxima patente. XP acumula para sempre.

• Botão de pânico — no momento do gatilho, um fluxo guiado de respiração,
  identificação do que você está sentindo e uma sugestão de ação concreta
  para atravessar a vontade sem recair.

• Diário de gatilhos — registre o que disparou a vontade e acompanhe
  padrões ao longo do tempo (horário, situação, frequência).

• Conteúdo diário curado — frases de pensadores e figuras de disciplina
  (estoicismo, alta performance) para reforçar sua decisão todos os dias,
  não autoajuda genérica.

• Onboarding personalizado — suas respostas sobre gatilhos, tempo de
  incômodo e estilo motivacional adaptam o tom das notificações e mensagens
  do app a você.

• 100% privado — todo o seu progresso e diário ficam só no seu aparelho,
  cifrados. Nada é enviado para servidores, não há conta, não há
  rastreamento.

FORJA é uma ferramenta de apoio de hábito, não um serviço de saúde — não
substitui terapia ou acompanhamento profissional.
```

## Palavras-chave (App Store — campo separado, máx. 100 caracteres, sem espaços após vírgula)

```
autocontrole,disciplina,habitos,streak,vicio,foco,produtividade,motivacao,diario,recaida
```

## Screenshots

**Pendente** — precisa rodar o app em simulador/dispositivo real (iOS e
Android) para capturar. Ver Fase 5 do `PLANO_POLIMENTO.md`. Telas
recomendadas para a sequência de screenshots (ordem pensada para contar a
história do app, primeira imagem é a mais importante):

1. Home com streak + patente em destaque
2. Botão de pânico (fluxo de respiração ou sugestão de ação)
3. Tela de Conquistas/progressão de patentes
4. Diário de Gatilhos
5. Frase do dia / biblioteca de frases

## Política de Privacidade (URL pública)

**Pronta** — hospedada via GitHub Pages a partir de `docs/privacidade/`
(gerado por `scripts/gerar-paginas-legais.js` a partir de
`locales/*/politica.json`). URL a usar no formulário de submissão das duas
lojas:

```
https://wessel2007.github.io/projeto_vicio/privacidade/
```

Versões em inglês e espanhol em `/en/` e `/es/`, mas o campo de URL única
das lojas deve apontar para a versão em pt-BR acima (idioma de
lançamento).
