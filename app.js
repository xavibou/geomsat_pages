'use strict';
const $ = (s) => document.querySelector(s);
let scenes = [], selected = null, mode = 'height', filter = 'all', revision = 0;
const comparison = $('#comparison'), range = $('#reveal');
function setReveal(value) {
  const v = Math.max(0, Math.min(100, Number(value)));
  range.value = String(v);
  comparison.style.setProperty('--reveal', `${v}%`);
  range.setAttribute('aria-valuetext', `${v}% satellite image, ${100-v}% prediction`);
}
range.addEventListener('input', () => setReveal(range.value));
// Native range controls retain keyboard support. Map pointer position to the
// actual image bounds so the divider follows the finger at both extremes.
let pointer = null;
function revealFromPointer(event) {
  const bounds = comparison.getBoundingClientRect();
  setReveal((event.clientX - bounds.left) / bounds.width * 100);
}
range.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  pointer = event.pointerId;
  range.setPointerCapture(pointer);
  range.focus({preventScroll:true});
  revealFromPointer(event);
  event.preventDefault();
});
range.addEventListener('pointermove', event => {
  if (pointer === event.pointerId) { revealFromPointer(event); event.preventDefault(); }
});
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  range.addEventListener(type, () => { pointer = null; });
}
$('#reset').addEventListener('click', () => setReveal(50));
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not load scene image'));
    image.src = src;
  });
}
async function selectScene(scene, reset = true) {
  const current = ++revision;
  const outputMode = mode;
  comparison.setAttribute('aria-busy', 'true');
  try {
    // Swap only after both images load, avoiding a different-scene overlay.
    await Promise.all([loadImage(scene.rgb), loadImage(scene[outputMode])]);
    if (current !== revision) return;
    selected = scene;
    $('#observation').src = scene.rgb;
    $('#observation').alt = `Satellite image of ${scene.title}, ${scene.region}`;
    $('#prediction').src = scene[outputMode];
    $('#prediction').alt = `GeomSat predicted ${outputMode === 'height' ? 'height above terrain' : 'surface normals'} for ${scene.title}`;
    $('#scene-title').textContent = scene.title;
    $('#scene-region').textContent = scene.region;
    $('#scene-note').textContent = scene.note;
    $('#prediction-label').textContent = outputMode === 'height' ? 'Predicted height' : 'Predicted normals';
    $('#mode-description').textContent = outputMode === 'height' ? 'Predicted height above terrain from a single satellite image.' : 'Predicted surface orientation from the same model and observation.';
    $('#height-legend').hidden = outputMode !== 'height';
    $('#normal-legend').hidden = outputMode !== 'normal';
    $('#download').href = scene[outputMode];
    $('#download').download = `${scene.id}-${outputMode}.png`;
    $('#gallery-status').textContent = `${scene.title}, ${scene.region}. Showing ${outputMode} prediction.`;
    document.querySelectorAll('.thumbnail').forEach(button => {
      const active = button.dataset.id === scene.id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (reset) setReveal(50);
  } catch (error) {
    if (current === revision) $('#gallery-status').textContent = error.message;
  } finally {
    if (current === revision) comparison.removeAttribute('aria-busy');
  }
}
function renderThumbnails() {
  const strip = $('#thumbnails');
  const visible = scenes.filter(scene => filter === 'all' || scene.group === filter);
  strip.replaceChildren();
  for (const scene of visible) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'thumbnail'; button.dataset.id = scene.id;
    button.setAttribute('aria-label', `Show ${scene.title}, ${scene.region}`);
    const active = selected?.id === scene.id;
    button.setAttribute('aria-pressed', String(active)); button.classList.toggle('active', active);
    const image = document.createElement('img');
    image.src = scene.thumbnail; image.alt = ''; image.width = 144; image.height = 144;
    const title = document.createElement('strong'); title.textContent = scene.title;
    const region = document.createElement('small'); region.textContent = scene.region;
    button.append(image, title, region);
    button.addEventListener('click', () => selectScene(scene));
    strip.append(button);
  }
  if (visible.length && !visible.some(s => s.id === selected?.id)) selectScene(visible[0]);
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b => {
    b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button));
  });
  renderThumbnails();
}));
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode;
  document.querySelectorAll('[data-mode]').forEach(b => {
    b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button));
  });
  if (selected) selectScene(selected, false);
}));
for (const [id, direction] of [['previous', -1], ['next', 1]]) {
  $(`#${id}`).addEventListener('click', () => $('#thumbnails').scrollBy({left: direction * 360, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}));
}
fetch('scenes.json').then(response => {
  if (!response.ok) throw new Error('Could not load test scenes');
  return response.json();
}).then(data => { scenes = data.scenes; renderThumbnails(); }).catch(error => {
  $('#thumbnails').textContent = 'The gallery could not load. Please refresh, or serve this folder over HTTP instead of opening the HTML file directly.';
  $('#gallery-status').textContent = error.message;
});
