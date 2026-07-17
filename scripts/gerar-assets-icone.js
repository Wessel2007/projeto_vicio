// Script utilitário one-off para a Fase 4 do docs-projeto/historico/PLANO_POLIMENTO.md — gera as
// variantes de ícone/splash a partir de assets/images/logo_oficial.png
// (recorte com fundo transparente, ícone adaptativo Android respeitando a
// safe-zone, e splash proporcional). Não faz parte do app em runtime.
const path = require('path');
const sharp = require('sharp');

const SRC = path.join(__dirname, '..', 'assets', 'images', 'logo_oficial.png');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'images');

// Fundo é uma pedra escura com veios mais claros (ruído de textura); o
// emblema é dourado/vermelho (luminância bem mais alta). Um blur pesado
// antes do threshold apaga o ruído da textura (áreas pequenas) mantendo a
// silhueta do emblema (área grande) praticamente intacta; um blur leve
// depois do threshold só suaviza a borda final (antisserrilhado).
const THRESHOLD = 50;

async function recortarFundo() {
  const { data: rgbData, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info; // channels === 3 (sem alpha na origem)

  const maskSoft = await sharp(SRC)
    .greyscale()
    .median(7)
    .blur(2)
    .threshold(THRESHOLD)
    .blur(1.2)
    .raw()
    .toBuffer();

  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = rgbData[i * channels];
    rgba[i * 4 + 1] = rgbData[i * channels + 1];
    rgba[i * 4 + 2] = rgbData[i * channels + 2];
    rgba[i * 4 + 3] = maskSoft[i];
  }

  return sharp(rgba, { raw: { width, height, channels: 4 } }).png();
}

async function main() {
  const recorte = await recortarFundo().then((s) => s.toBuffer());

  // Recorta a margem transparente sobrando ao redor do emblema.
  const trimmed = await sharp(recorte).trim({ threshold: 10 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  console.log('Emblema recortado:', meta.width, 'x', meta.height);

  // --- android-icon-foreground.png ---
  // Canvas 1024x1024, emblema ocupando ~60% da largura (dentro da safe-zone
  // de 66% do adaptive icon do Android), fundo transparente (a cor de fundo
  // já vem de app.json > android.adaptiveIcon.backgroundColor).
  const CANVAS = 1024;
  const emblemaSize = Math.round(CANVAS * 0.6);
  const emblemaResized = await sharp(trimmed)
    .resize(emblemaSize, emblemaSize, { fit: 'inside', withoutEnlargement: false })
    .toBuffer();
  const emblemaMeta = await sharp(emblemaResized).metadata();
  await sharp({
    create: {
      width: CANVAS,
      height: CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: emblemaResized,
        left: Math.round((CANVAS - emblemaMeta.width) / 2),
        top: Math.round((CANVAS - emblemaMeta.height) / 2),
      },
    ])
    .png()
    .toFile(path.join(OUT_DIR, 'android-icon-foreground.png'));
  console.log('android-icon-foreground.png gerado');

  // --- splash-icon.png ---
  // Mesmo recorte, canvas quadrado com uma margem pequena, fundo transparente
  // (expo-splash-screen compõe sobre a backgroundColor definida em app.json).
  const SPLASH_CANVAS = 800;
  const splashEmblemaSize = Math.round(SPLASH_CANVAS * 0.86);
  const splashResized = await sharp(trimmed)
    .resize(splashEmblemaSize, splashEmblemaSize, { fit: 'inside', withoutEnlargement: false })
    .toBuffer();
  const splashMeta = await sharp(splashResized).metadata();
  await sharp({
    create: {
      width: SPLASH_CANVAS,
      height: SPLASH_CANVAS,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: splashResized,
        left: Math.round((SPLASH_CANVAS - splashMeta.width) / 2),
        top: Math.round((SPLASH_CANVAS - splashMeta.height) / 2),
      },
    ])
    .png()
    .toFile(path.join(OUT_DIR, 'splash-icon.png'));
  console.log('splash-icon.png gerado');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
