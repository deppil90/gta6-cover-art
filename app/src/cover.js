// Vice Cover Studio — drawing engine.
//
// A cover is a set of photo panels on a poster, a painted sunset sky with a
// low sun disc, bold gradient caption lettering, and a colour grade laid over
// everything. Nothing here is copied from any game: the panels, the sun, the
// palm silhouettes and the lettering are all drawn from scratch with canvas
// shapes, and the type is a plain system sans-serif in heavy weight.

/** The panels fill the top of the cover; the bottom band stays open sky for the sun and the title. */
export const PANEL_AREA = 0.8;

/** The three panel layouts, each a list of rectangles in fractions of the panel area. */
export const LAYOUTS = {
  strip: {
    label: 'Sunset Strip',
    panels: [
      { x: 0, y: 0, w: 1, h: 0.6 },
      { x: 0, y: 0.6, w: 1 / 3, h: 0.4 },
      { x: 1 / 3, y: 0.6, w: 1 / 3, h: 0.4 },
      { x: 2 / 3, y: 0.6, w: 1 / 3, h: 0.4 },
    ],
  },
  grid: {
    label: 'Neon Grid',
    panels: [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  split: {
    label: 'Vice Split',
    panels: [
      { x: 0, y: 0, w: 0.62, h: 1 },
      { x: 0.62, y: 0, w: 0.38, h: 0.5 },
      { x: 0.62, y: 0.5, w: 0.38, h: 0.5 },
    ],
  },
};

/** Colour grades: a sky gradient, a tint washed over the photos, and caption colours. */
export const GRADES = {
  sunset: {
    label: 'Sunset',
    sky: ['#2b1055', '#7597de'],
    skyBottom: '#ff7e5f',
    tint: 'rgba(255, 110, 60, 0.20)',
    tint2: 'rgba(150, 30, 120, 0.22)',
    title: ['#ffe259', '#ffa751'],
    accent: '#ff5e8a',
  },
  neon: {
    label: 'Neon Nights',
    sky: ['#0f0c29', '#302b63'],
    skyBottom: '#ff2fb3',
    tint: 'rgba(0, 229, 255, 0.16)',
    tint2: 'rgba(255, 47, 179, 0.24)',
    title: ['#7df9ff', '#ff7ad9'],
    accent: '#00e5ff',
  },
  gold: {
    label: 'Golden Hour',
    sky: ['#3a1c00', '#b25a1b'],
    skyBottom: '#ffd166',
    tint: 'rgba(255, 180, 60, 0.22)',
    tint2: 'rgba(180, 60, 20, 0.18)',
    title: ['#fff3b0', '#ffb703'],
    accent: '#ff8c42',
  },
  dusk: {
    label: 'Dusk Drive',
    sky: ['#141e30', '#355c7d'],
    skyBottom: '#c06c84',
    tint: 'rgba(90, 120, 255, 0.20)',
    tint2: 'rgba(192, 108, 132, 0.20)',
    title: ['#e0c3fc', '#8ec5fc'],
    accent: '#c06c84',
  },
};

/** One panel's photo state: which photo, how far zoomed, and where it is panned. */
export function freshPanel(photoIndex) {
  return { photo: photoIndex, zoom: 1, ox: 0, oy: 0 };
}

/** The default cover state: strip layout, sunset grade, two sample photos. */
export function defaultState() {
  return {
    layout: 'strip',
    grade: 'sunset',
    title: 'Sunset Heist',
    subtitle: 'VICE BOULEVARD • EST. TONIGHT',
    titleSize: 1,
    warmth: 1,
    panels: [freshPanel(0), freshPanel(1), freshPanel(0), freshPanel(1)],
  };
}

/** Draws one photo into a rectangle, cover-fitting it with zoom and pan. */
function drawPhotoInto(ctx, photo, rect, panel) {
  const iw = photo.naturalWidth;
  const ih = photo.naturalHeight;
  const base = Math.max(rect.w / iw, rect.h / ih) * panel.zoom;
  const pw = iw * base;
  const ph = ih * base;
  const cx = rect.x + rect.w / 2 + panel.ox * rect.w;
  const cy = rect.y + rect.h / 2 + panel.oy * rect.h;
  ctx.drawImage(photo, cx - pw / 2, cy - ph / 2, pw, ph);
}

/** Paints the sunset sky, sun disc and palm silhouettes behind the caption band. */
function drawSky(ctx, w, h, grade, warmth) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grade.sky[0]);
  sky.addColorStop(0.55, grade.sky[1]);
  sky.addColorStop(1, grade.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const sunR = h * 0.075;
  const sunX = w * 0.86;
  const sunY = h * 0.9;
  const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.6);
  glow.addColorStop(0, 'rgba(255, 220, 120, 0.85)');
  glow.addColorStop(1, 'rgba(255, 120, 80, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sunX - sunR * 2.6, sunY - sunR * 2.6, sunR * 5.2, sunR * 5.2);
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = grade.skyBottom;
  for (let i = 0; i < 3; i += 1) {
    ctx.fillRect(sunX - sunR, sunY - sunR + ((i + 1) * 2 * sunR) / 4, sunR * 2, sunR * 0.09);
  }
  drawPalm(ctx, w * 0.03, h * 0.995, h * 0.15);
  void warmth;
}

/** A simple palm silhouette: a curved trunk with five drooping fronds. */
function drawPalm(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(20, 8, 30, 0.9)';
  ctx.fillStyle = 'rgba(20, 8, 30, 0.9)';
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.08, -size * 0.5, size * 0.02, -size * 0.95);
  ctx.stroke();
  ctx.translate(size * 0.02, -size * 0.95);
  for (let i = 0; i < 5; i += 1) {
    const angle = -Math.PI * (0.08 + i * 0.18);
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(size * 0.3, 0, size * 0.32, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/** Bold caption lettering: gradient fill, dark outline, soft shadow, centred. */
function drawTitle(ctx, w, h, state, grade) {
  const title = state.title.trim().toUpperCase();
  const sub = state.subtitle.trim().toUpperCase();
  const bandY = h * 0.885;
  if (title) {
    let size = h * 0.105 * state.titleSize;
    const family = '"Arial Black", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${size}px ${family}`;
    while (ctx.measureText(title).width > w * 0.92 && size > 14) {
      size -= 3;
      ctx.font = `900 ${size}px ${family}`;
    }
    const fill = ctx.createLinearGradient(0, bandY - size * 0.6, 0, bandY + size * 0.6);
    fill.addColorStop(0, grade.title[0]);
    fill.addColorStop(1, grade.title[1]);
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(3, size * 0.09);
    ctx.strokeStyle = 'rgba(20, 8, 30, 0.95)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = size * 0.18;
    ctx.shadowOffsetY = size * 0.05;
    ctx.strokeText(title, w / 2, bandY);
    ctx.fillStyle = fill;
    ctx.fillText(title, w / 2, bandY);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  if (sub) {
    const subSize = Math.max(11, h * 0.024);
    ctx.font = `700 ${subSize}px "Helvetica Neue", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const subWidth = ctx.measureText(sub).width;
    const pad = subSize * 0.9;
    const barY = bandY + h * 0.075;
    ctx.fillStyle = 'rgba(20, 8, 30, 0.72)';
    const barW = subWidth + pad * 2;
    ctx.fillRect((w - barW) / 2, barY - subSize * 0.85, barW, subSize * 1.7);
    ctx.fillStyle = grade.accent;
    ctx.fillRect((w - barW) / 2, barY - subSize * 0.85, Math.max(4, w * 0.006), subSize * 1.7);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(sub, w / 2, barY);
  }
}

/**
 * Draws the whole cover onto a canvas at its own pixel size.
 * `photos` is an array of images (or nulls); `state` is a cover state object.
 */
export function drawCover(canvas, photos, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grade = GRADES[state.grade] ?? GRADES.sunset;
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.strip;
  drawSky(ctx, w, h, grade, state.warmth);
  const gutter = Math.max(3, Math.round(w * 0.008));
  layout.panels.forEach((panel, i) => {
    const slot = state.panels[i] ?? freshPanel(-1);
    const px = panel.x * w;
    const py = panel.y * h * PANEL_AREA;
    const pw = panel.w * w;
    const ph = panel.h * h * PANEL_AREA;
    const rect = {
      x: px + (panel.x > 0 ? gutter / 2 : 0),
      y: py + (panel.y > 0 ? gutter / 2 : 0),
      w: pw - (panel.x > 0 ? gutter / 2 : 0) - (panel.x + panel.w < 1 ? gutter / 2 : 0),
      h: ph - (panel.y > 0 ? gutter / 2 : 0) - (panel.y + panel.h < 1 ? gutter / 2 : 0),
    };
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    const photo = slot.photo >= 0 ? photos[slot.photo] : null;
    if (photo) {
      drawPhotoInto(ctx, photo, rect, slot);
    } else {
      ctx.fillStyle = '#1c1030';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = `600 ${Math.max(13, h * 0.02)}px "Helvetica Neue", Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    }
    ctx.fillStyle = grade.tint;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = grade.tint2;
    const wash = ctx.createLinearGradient(rect.x, rect.y + rect.h * 0.5, rect.x, rect.y + rect.h);
    wash.addColorStop(0, 'rgba(0,0,0,0)');
    wash.addColorStop(1, grade.tint2);
    ctx.fillStyle = wash;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = gutter;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  });
  const shade = ctx.createLinearGradient(0, h * 0.55, 0, h * PANEL_AREA);
  shade.addColorStop(0, 'rgba(20, 8, 30, 0)');
  shade.addColorStop(1, 'rgba(20, 8, 30, 0.35)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h * PANEL_AREA);
  drawTitle(ctx, w, h, state, grade);
}

/** Which panel rectangle contains a point (in canvas pixels), or -1. */
export function panelAt(state, px, py, w, h) {
  const layout = LAYOUTS[state.layout] ?? LAYOUTS.strip;
  for (let i = layout.panels.length - 1; i >= 0; i -= 1) {
    const p = layout.panels[i];
    if (px >= p.x * w && px < (p.x + p.w) * w && py >= p.y * h * PANEL_AREA && py < (p.y + p.h) * h * PANEL_AREA) return i;
  }
  return -1;
}

/** Sizes the canvas for an export and draws the cover into it, returning the canvas. */
export function renderExport(photos, state, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  drawCover(canvas, photos, state);
  return canvas;
}
