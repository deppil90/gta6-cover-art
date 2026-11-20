// Fixed scenes for screenshots: ?shot=cover shows one exported-style cover on
// its own, ?shot=editor shows the full editor with photos loaded. Each scene
// sets window.__shotReady once the cover has been painted twice, so a
// screenshot tool knows the page is settled.

/** The scene table: photo order, layout, grade, words and export size. */
export const SCENES = {
  cover: {
    photos: ['pier', 'boulevard', 'pier', 'boulevard'],
    layout: 'strip',
    grade: 'sunset',
    title: 'Sunset Heist',
    subtitle: 'VICE BOULEVARD • EST. TONIGHT',
    panels: [0, 1, 0, 1],
    size: [1920, 1080],
    coverOnly: true,
  },
  coverPortrait: {
    photos: ['boulevard', 'pier', 'boulevard', 'pier'],
    layout: 'grid',
    grade: 'neon',
    title: 'Neon Run',
    subtitle: 'MIDNIGHT DRIVE • OCEAN AVENUE',
    panels: [0, 1, 1, 0],
    size: [1080, 1350],
    coverOnly: true,
  },
  coverSquare: {
    photos: ['pier', 'boulevard', 'pier'],
    layout: 'split',
    grade: 'gold',
    title: 'Golden Hour',
    subtitle: 'PALM ROW • LAST LIGHT',
    panels: [0, 1, 0],
    size: [1080, 1080],
    coverOnly: true,
  },
  editor: {
    photos: ['pier', 'boulevard', 'pier', 'boulevard'],
    layout: 'strip',
    grade: 'sunset',
    title: 'Sunset Heist',
    subtitle: 'VICE BOULEVARD • EST. TONIGHT',
    panels: [0, 1, 0, 1],
    size: [1080, 1080],
    coverOnly: false,
  },
};

/** Runs a scene: hides the controls for a cover shot, loads its setup, then signals ready. */
export async function runShot(shot, query, load) {
  const scene = SCENES[shot] ?? SCENES.editor;
  const picked = {
    ...scene,
    title: query.get('caption') ?? scene.title,
    layout: query.get('layout') ?? scene.layout,
    grade: query.get('grade') ?? scene.grade,
  };
  if (picked.coverOnly) document.body.classList.add('shot-cover');
  await load(picked);
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
