// Script utilitário one-off: gera as páginas estáticas de
// docs/privacidade/ (GitHub Pages) a partir do mesmo conteúdo usado no
// app (locales/*/politica.json), pro link público exigido pela App Store
// Connect e pelo Play Console. Não faz parte do app em runtime.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', 'privacidade');

const LANGS = [
  { code: 'pt-BR', dir: '', htmlLang: 'pt-BR', switcherLabel: 'PT' },
  { code: 'en', dir: 'en', htmlLang: 'en', switcherLabel: 'EN' },
  { code: 'es', dir: 'es', htmlLang: 'es', switcherLabel: 'ES' },
];

// Mesmo parser de markdown reduzido do src/components/markdown-lite.tsx
// (h1 "# ", h2 "## ", listas "- ", negrito "**texto**", parágrafo).
function parseBlocks(markdown) {
  return markdown
    .trim()
    .split(/\n\s*\n/)
    .map((raw) => {
      const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 1 && lines[0].startsWith('# ')) return { type: 'h1', text: lines[0].slice(2) };
      if (lines.length === 1 && lines[0].startsWith('## ')) return { type: 'h2', text: lines[0].slice(3) };
      if (lines.every((l) => l.startsWith('- '))) return { type: 'list', items: lines.map((l) => l.slice(2)) };
      return { type: 'paragraph', text: lines.join(' ') };
    });
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderInline(text) {
  return escapeHtml(text)
    .split('**')
    .map((seg, i) => (i % 2 === 1 ? `<strong>${seg}</strong>` : seg))
    .join('');
}

function renderBlocks(blocks) {
  return blocks
    .map((block) => {
      if (block.type === 'h1') return `<h1>${renderInline(block.text)}</h1>`;
      if (block.type === 'h2') return `<h2>${renderInline(block.text)}</h2>`;
      if (block.type === 'list') {
        return `<ul>${block.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`;
      }
      return `<p>${renderInline(block.text)}</p>`;
    })
    .join('\n');
}

function renderSwitcher(activeCode) {
  return LANGS.map((l) => {
    const href = l.dir ? `/projeto_vicio/privacidade/${l.dir}/` : `/projeto_vicio/privacidade/`;
    const active = l.code === activeCode ? ' class="active"' : '';
    return `<a href="${href}"${active}>${l.switcherLabel}</a>`;
  }).join('');
}

function renderPage({ blocks, htmlLang, activeCode }) {
  return `<!doctype html>
<html lang="${htmlLang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(blocks[0]?.text ?? 'Privacy Policy')} — FORJA</title>
<meta name="robots" content="index, follow" />
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: #0D0B09;
    color: #F4EFE9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
  }
  header {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: rgba(13,11,9,0.92);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  header .brand { font-weight: 700; letter-spacing: 0.04em; color: #E8B458; text-decoration: none; font-size: 15px; }
  .switcher { display: flex; gap: 4px; }
  .switcher a {
    color: rgba(244,239,233,0.55);
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 99px;
  }
  .switcher a.active { color: #0D0B09; background: #E8B458; }
  main {
    max-width: 680px;
    margin: 0 auto;
    padding: 40px 20px 80px;
  }
  h1 { color: #E8B458; font-size: 26px; margin: 0 0 4px; }
  h2 { color: #F4EFE9; font-size: 17px; margin: 32px 0 8px; }
  p { color: rgba(244,239,233,0.78); font-size: 15px; margin: 0 0 12px; }
  ul { margin: 0 0 12px; padding-left: 20px; color: rgba(244,239,233,0.78); font-size: 15px; }
  li { margin-bottom: 6px; }
  strong { color: #F4EFE9; font-weight: 700; }
  a.inline { color: #FF7A36; }
  footer { text-align: center; padding: 24px 20px 40px; color: rgba(244,239,233,0.4); font-size: 12px; }
</style>
</head>
<body>
<header>
  <span class="brand">FORJA</span>
  <nav class="switcher">${renderSwitcher(activeCode)}</nav>
</header>
<main>
${renderBlocks(blocks)}
</main>
<footer>FORJA — heyxist3r@gmail.com</footer>
</body>
</html>
`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const lang of LANGS) {
  const { content } = require(path.join(ROOT, 'locales', lang.code, 'politica.json'));
  const blocks = parseBlocks(content);
  const html = renderPage({ blocks, htmlLang: lang.htmlLang, activeCode: lang.code });
  const targetDir = lang.dir ? path.join(OUT_DIR, lang.dir) : OUT_DIR;
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
  console.log('gerado:', path.relative(ROOT, path.join(targetDir, 'index.html')));
}
