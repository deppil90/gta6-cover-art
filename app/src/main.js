// Vice Cover Studio — page wiring.
//
// Flow: load photos from the machine (or the two bundled samples), tap a panel
// to pick it, tap a photo to fill it, drag to crop and position, type the
// caption, pick a layout and a grade, then export a PNG in one of the three
// post sizes. Photos are read locally with object URLs and never uploaded.

import { LAYOUTS, GRADES, defaultState, freshPanel, drawCover, panelAt, renderExport } from './cover.js';
import { runShot } from './shots.js';

const $ = (id) => document.getElementById(id);
const canvas = $('cover');
const status = $('status');
const state = defaultState();
let photos = [];
let selected = 0;
let dragging = null;

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function redraw() {
  drawCover(canvas, photos, state);
  syncPanelControls();
  document.querySelectorAll('.panel-dot').forEach((dot, i) => {
    dot.classList.toggle('on', i === selected);
  });
}

function note(message) {
  status.textContent = message;
}

/** Adds a photo from a File or URL and returns its index. */
async function addPhoto(source) {
  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  const img = await loadImage(url);
  photos.push(img);
  return photos.length - 1;
}

function renderStrip() {
  const strip = $('strip');
  strip.innerHTML = '';
  photos.forEach((img, i) => {
    const thumb = document.createElement('button');
    thumb.type = 'button';
    thumb.className = 'thumb';
    thumb.title = `Photo ${i + 1} — tap to put it in the selected panel`;
    const preview = document.createElement('canvas');
    preview.width = 120;
    preview.height = 90;
    const pctx = preview.getContext('2d');
    const scale = Math.max(120 / img.naturalWidth, 90 / img.naturalHeight);
    pctx.drawImage(img, (120 - img.naturalWidth * scale) / 2, (90 - img.naturalHeight * scale) / 2, img.naturalWidth * scale, img.naturalHeight * scale);
    thumb.appendChild(preview);
    thumb.appendChild(document.createTextNode(`Photo ${i + 1}`));
    thumb.addEventListener('click', () => {
      state.panels[selected] = { ...state.panels[selected], photo: i };
      redraw();
      note(`Photo ${i + 1} is in panel ${selected + 1}.`);
    });
    strip.appendChild(thumb);
  });
}

function syncPanelControls() {
  const slot = state.panels[selected] ?? freshPanel(-1);
  $('zoom').value = String(slot.zoom);
  $('panx').value = String(Math.round(slot.ox * 100));
  $('pany').value = String(Math.round(slot.oy * 100));
  $('zoomVal').textContent = `${Math.round(slot.zoom * 100)}%`;
  $('panxVal').textContent = `${Math.round(slot.ox * 100)}`;
  $('panyVal').textContent = `${Math.round(slot.oy * 100)}`;
  $('panelLabel').textContent = `Panel ${selected + 1} of ${state.panels.length}`;
}

function buildPickers() {
  const layoutBox = $('layouts');
  Object.entries(LAYOUTS).forEach(([key, layout]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = layout.label;
    button.addEventListener('click', () => {
      const old = state.panels;
      state.layout = key;
      state.panels = layout.panels.map((_, i) => old[i] ?? freshPanel(photos.length ? 0 : -1));
      if (selected >= state.panels.length) selected = 0;
      document.querySelectorAll('#layouts .chip').forEach((c) => c.classList.remove('on'));
      button.classList.add('on');
      redraw();
    });
    if (key === state.layout) button.classList.add('on');
    layoutBox.appendChild(button);
  });
  const gradeBox = $('grades');
  Object.entries(GRADES).forEach(([key, grade]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.textContent = grade.label;
    button.addEventListener('click', () => {
      state.grade = key;
      document.querySelectorAll('#grades .chip').forEach((c) => c.classList.remove('on'));
      button.classList.add('on');
      redraw();
    });
    if (key === state.grade) button.classList.add('on');
    gradeBox.appendChild(button);
  });
  const dots = $('dots');
  for (let i = 0; i < 4; i += 1) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'panel-dot';
    dot.textContent = String(i + 1);
    dot.addEventListener('click', () => {
      selected = i;
      redraw();
    });
    dots.appendChild(dot);
  }
}

function sizePreview(width, height) {
  canvas.width = width;
  canvas.height = height;
  redraw();
}

/** Exports the cover at a post size and starts its PNG download. */
export function exportCover(width, height) {
  const out = renderExport(photos, state, width, height);
  return new Promise((resolve) => {
    out.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `vice-cover-${width}x${height}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      note(`Saved vice-cover-${width}x${height}.png`);
      resolve(blob);
    }, 'image/png');
  });
}

async function loadSamples() {
  for (const name of ['pier', 'boulevard']) {
    const index = await addPhoto(`samples/${name}.jpg`);
    if (name === 'pier') state.panels[0] = freshPanel(index);
    if (name === 'boulevard') state.panels[1] = freshPanel(index);
  }
  renderStrip();
  redraw();
  note('Two sample photos loaded — replace them with your own.');
}

$('photo').addEventListener('change', async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  for (const file of files) {
    const index = await addPhoto(file);
    state.panels[selected] = { ...state.panels[selected], photo: index };
    selected = (selected + 1) % state.panels.length;
  }
  renderStrip();
  redraw();
  note(`${files.length} photo${files.length > 1 ? 's' : ''} loaded from your machine. Nothing was uploaded.`);
  e.target.value = '';
});

$('fillAll').addEventListener('click', () => {
  if (!photos.length) return note('Load a photo first.');
  const index = state.panels[selected].photo >= 0 ? state.panels[selected].photo : 0;
  state.panels = state.panels.map(() => freshPanel(index));
  redraw();
  note('Every panel now uses the selected photo.');
});

$('samples').addEventListener('click', loadSamples);

$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
$('titleSize').addEventListener('input', (e) => {
  state.titleSize = Number(e.target.value);
  $('titleSizeVal').textContent = `${Math.round(state.titleSize * 100)}%`;
  redraw();
});
$('zoom').addEventListener('input', (e) => {
  state.panels[selected].zoom = Number(e.target.value);
  redraw();
});
$('panx').addEventListener('input', (e) => {
  state.panels[selected].ox = Number(e.target.value) / 100;
  redraw();
});
$('pany').addEventListener('input', (e) => {
  state.panels[selected].oy = Number(e.target.value) / 100;
  redraw();
});

$('size').addEventListener('change', (e) => {
  const [w, h] = e.target.value.split('x').map(Number);
  sizePreview(w, h);
});

document.querySelectorAll('[data-export]').forEach((button) => {
  button.addEventListener('click', () => {
    const [w, h] = button.dataset.export.split('x').map(Number);
    exportCover(w, h);
  });
});

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

canvas.addEventListener('pointerdown', (event) => {
  const point = canvasPoint(event);
  const hit = panelAt(state, point.x, point.y, canvas.width, canvas.height);
  if (hit < 0) return;
  selected = hit;
  dragging = { x: point.x, y: point.y, ox: state.panels[hit].ox, oy: state.panels[hit].oy };
  canvas.setPointerCapture(event.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  const point = canvasPoint(event);
  const slot = state.panels[selected];
  slot.ox = dragging.ox + (point.x - dragging.x) / canvas.width;
  slot.oy = dragging.oy + (point.y - dragging.y) / canvas.height;
  slot.ox = Math.max(-0.6, Math.min(0.6, slot.ox));
  slot.oy = Math.max(-0.6, Math.min(0.6, slot.oy));
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = null; });
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const slot = state.panels[selected];
  slot.zoom = Math.max(1, Math.min(3, slot.zoom * (event.deltaY < 0 ? 1.08 : 0.93)));
  redraw();
}, { passive: false });

buildPickers();
sizePreview(1080, 1080);

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), async (setup) => {
    for (const name of setup.photos) await addPhoto(`samples/${name}.jpg`);
    state.layout = setup.layout;
    state.grade = setup.grade;
    state.title = setup.title;
    state.subtitle = setup.subtitle;
    state.panels = setup.panels.map((photo) => freshPanel(photo));
    if (setup.size) sizePreview(setup.size[0], setup.size[1]);
    renderStrip();
    redraw();
  });
} else {
  loadSamples();
}
