// Copy, share card and share (spec 13.5–13.6).
// The share card never contains what the user typed — only the excuse.

const SITE_URL = 'https://excuseme852.github.io';
const SITE_LABEL = 'excuseme852.github.io';

// Card size: 4:5 portrait, fits WhatsApp and Instagram feeds.
const CARD_W = 1080;
const CARD_H = 1350;

const COLORS = {
  sky: '#e6d9f4',
  bg: '#f6ecd6',
  accent: '#6b3fa0',
  inkSoft: '#6e5f7a',
  woodDark: '#7a4a22',
  woodLight: '#e8c690',
  woodLight2: '#dcb57c',
  gold: '#f0c14b',
  engrave: '#5a3417',
  light: 'rgba(255, 244, 205, 0.55)',
};

const FONT_UI = 'system-ui, -apple-system, "PingFang HK", "Microsoft JhengHei", "Noto Sans HK", sans-serif';
const FONT_ZH = '"Kaiti TC", "STKaiti", "BiauKai", "DFKai-SB", "KaiTi", ' + FONT_UI;
const FONT_EN = 'Georgia, "Times New Roman", serif';

// ---------- Copy ----------

// Modern clipboard first; the old execCommand route for in-app browsers that block it.
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the old way
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

// ---------- Share card ----------

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Image failed: ${src}`));
    image.src = src;
  });
}

// Chinese punctuation that shouldn't start a line.
const NO_LINE_START = '，。、！？；：」』）》〉…,.!?;:)';

function wrapLines(ctx, text, maxWidth, lang) {
  const tokens = lang === 'en' ? text.split(/(\s+)/) : Array.from(text);
  const lines = [];
  let line = '';
  for (const token of tokens) {
    const test = line + token;
    if (ctx.measureText(test).width > maxWidth && line.trim()) {
      lines.push(line.trimEnd());
      line = token.trimStart();
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trim());
  // Pull a stray leading punctuation mark back onto the previous line.
  for (let i = 1; i < lines.length; i += 1) {
    while (lines[i] && NO_LINE_START.includes(lines[i][0])) {
      lines[i - 1] += lines[i][0];
      lines[i] = lines[i].slice(1);
    }
  }
  return lines.filter(Boolean);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground(ctx) {
  const sky = ctx.createLinearGradient(0, 0, 0, CARD_H);
  sky.addColorStop(0, COLORS.sky);
  sky.addColorStop(0.55, COLORS.bg);
  sky.addColorStop(1, COLORS.bg);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Starlight beams from the top
  [[200, -0.28, 110], [440, -0.09, 150], [660, 0.1, 120], [880, 0.3, 90]].forEach(([x, angle, width]) => {
    ctx.save();
    ctx.translate(x, -40);
    ctx.rotate(angle);
    const beam = ctx.createLinearGradient(0, 0, 0, CARD_H * 0.8);
    beam.addColorStop(0, COLORS.light);
    beam.addColorStop(1, 'rgba(255, 244, 205, 0)');
    ctx.fillStyle = beam;
    ctx.fillRect(-width / 2, 0, width, CARD_H * 0.8);
    ctx.restore();
  });
}

function drawPlaque(ctx, { label, excuse, lang }) {
  const x = 90;
  const y = 230;
  const w = CARD_W - 180;
  const padX = 64;
  const textWidth = w - padX * 2;
  const font = lang === 'en' ? FONT_EN : FONT_ZH;

  // Find the largest size that fits within 6 lines.
  let size = 64;
  let lines = [];
  for (; size >= 36; size -= 4) {
    ctx.font = `700 ${size}px ${font}`;
    lines = wrapLines(ctx, excuse, textWidth, lang);
    if (lines.length <= 6) break;
  }
  const lineHeight = Math.round(size * 1.45);
  const h = Math.max(380, 140 + lines.length * lineHeight + 70);

  // Wooden board: shadow, dark rim, light face, gold inlay
  ctx.save();
  ctx.shadowColor = 'rgba(59, 42, 74, 0.25)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  roundRect(ctx, x, y, w, h, 32);
  ctx.fillStyle = COLORS.woodDark;
  ctx.fill();
  ctx.restore();

  const face = ctx.createLinearGradient(0, y, 0, y + h);
  face.addColorStop(0, COLORS.woodLight);
  face.addColorStop(1, COLORS.woodLight2);
  roundRect(ctx, x + 14, y + 14, w - 28, h - 28, 22);
  ctx.fillStyle = face;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = COLORS.gold;
  roundRect(ctx, x + 24, y + 24, w - 48, h - 48, 16);
  ctx.stroke();

  // Label
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLORS.woodDark;
  ctx.font = `700 34px ${FONT_UI}`;
  ctx.fillText(label, CARD_W / 2, y + 100);

  // Engraved excuse: light edge below, then the dark text
  ctx.font = `700 ${size}px ${font}`;
  const top = y + 100 + 30 + (h - 200 - lines.length * lineHeight) / 2 + size;
  lines.forEach((line, index) => {
    const lineY = top + index * lineHeight;
    ctx.fillStyle = 'rgba(255, 244, 220, 0.85)';
    ctx.fillText(line, CARD_W / 2, lineY + 2);
    ctx.fillStyle = COLORS.engrave;
    ctx.fillText(line, CARD_W / 2, lineY);
  });

  return y + h;
}

// Draws the card and returns it as a PNG blob.
export async function renderCard({ excuse, lang, label, brand, tagline }) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  // Same-origin images only, so the canvas can still be exported.
  const [immortal, cloud] = await Promise.all([
    loadImage('./assets/immortal.svg').catch(() => null),
    loadImage('./assets/cloud.svg').catch(() => null),
  ]);

  drawBackground(ctx);

  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.accent;
  ctx.font = `800 72px ${FONT_UI}`;
  ctx.fillText(brand, CARD_W / 2, 120);
  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = `600 34px ${FONT_UI}`;
  ctx.fillText(tagline, CARD_W / 2, 172);

  const plaqueBottom = drawPlaque(ctx, { label, excuse, lang });

  // The immortal sits on the cloud, below the plaque
  const cloudW = 1000;
  const cloudH = 400;
  const cloudY = CARD_H - 330;
  if (immortal) {
    const imW = 400;
    const imH = imW * (340 / 300);
    const imY = Math.max(plaqueBottom + 10, cloudY + 150 - imH);
    ctx.drawImage(immortal, (CARD_W - imW) / 2, imY, imW, imH);
  }
  if (cloud) ctx.drawImage(cloud, (CARD_W - cloudW) / 2, cloudY, cloudW, cloudH);

  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = `700 36px ${FONT_UI}`;
  ctx.fillText(SITE_LABEL, CARD_W / 2, CARD_H - 48);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Card export failed'))), 'image/png');
  });
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// ---------- Share ----------

// Phones only allow the share sheet right after a tap, so the card is drawn in the
// background as soon as an excuse is shown, and sharing just picks it up.
let prepared = { key: null, card: null };

const cardKey = (details) => `${details.lang}|${details.label}|${details.excuse}`;

export function prepareCard(details) {
  const key = cardKey(details);
  if (prepared.key !== key) {
    prepared = { key, card: renderCard(details) };
    prepared.card.catch((error) => console.error(error));
  }
  return prepared.card;
}

// Returns 'shared' | 'cancelled' | 'saved' (image downloaded + text copied) | 'savedOnly'.
// The excuse travels in the image only; the text is an invite + link.
export async function shareExcuse({ excuse, lang, label, brand, tagline, invite, fileName }) {
  const text = `${invite}\n${SITE_URL}`;
  const blob = await prepareCard({ excuse, lang, label, brand, tagline });
  const file = new File([blob], fileName, { type: 'image/png' });

  // Web Share support doesn't mean file sharing support (spec 13.6), so check files.
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
      // Otherwise fall back below.
    }
  }

  downloadBlob(blob, fileName);
  return (await copyText(text)) ? 'saved' : 'savedOnly';
}
