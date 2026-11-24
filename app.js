'use strict';
const $ = s => document.querySelector(s);
let scenes = [], selected = null, requested = null, output = 'height', revision = 0;
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = () => reject(new Error('Could not load the scene. Please try again.'));
    image.src = src;
  });
}
async function selectScene(scene) {
  requested = scene;
  const current = ++revision, currentOutput = scene.groundTruthAvailable ? output : 'height';
  $('#comparison').setAttribute('aria-busy', 'true');
  $('#gallery-status').textContent = '';
  try {
    await Promise.all([loadImage(scene.rgb), loadImage(scene[currentOutput])]);
    if (current !== revision) return;
    selected = scene;
    output = currentOutput;
    $('#comparison').classList.toggle('large-area', scene.kind === 'mosaic');
    $('#output-controls').hidden = !scene.groundTruthAvailable;
    $('#output-label').hidden = !!scene.groundTruthAvailable;
    $('#input-full').href = scene.rgb;
    $('#output-full').href = scene[currentOutput];
    $('#observation').src = scene.rgb;
    $('#observation').alt = `Satellite image: ${scene.title}`;
    $('#prediction').src = scene[currentOutput];
    $('#prediction').alt = `${currentOutput === 'height' ? 'GeomSat predicted height' : 'LiDAR ground-truth height'}: ${scene.title}`;
    document.querySelectorAll('.thumbnail').forEach(button => {
      const active = button.dataset.id === scene.id;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-output]').forEach(button => {
      const active = button.dataset.output === currentOutput;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  } catch (error) {
    if (current === revision) $('#gallery-status').textContent = error.message;
  } finally {
    if (current === revision) $('#comparison').removeAttribute('aria-busy');
  }
}
function renderThumbnails() {
  const strip = $('#thumbnails');
  strip.replaceChildren();
  for (const scene of scenes) {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'thumbnail'; button.dataset.id = scene.id;
    button.setAttribute('aria-label', `Show ${scene.title}`);
    button.setAttribute('aria-pressed', 'false');
    const image = document.createElement('img');
    image.src = scene.thumbnail; image.alt = ''; image.width = 144; image.height = 144;
    const title = document.createElement('span'); title.textContent = scene.title;
    button.append(image, title);
    button.addEventListener('click', () => selectScene(scene));
    strip.append(button);
  }
  if (scenes.length) selectScene(scenes[0]);
}
document.querySelectorAll('[data-output]').forEach(button => button.addEventListener('click', () => {
  output = button.dataset.output;
  if (requested || selected) selectScene(requested || selected);
}));
fetch('scenes.json?v=rochefort-first').then(response => {
  if (!response.ok) throw new Error('Could not load test scenes');
  return response.json();
}).then(data => { scenes = data.scenes; renderThumbnails(); }).catch(error => {
  $('#thumbnails').textContent = 'The gallery could not load. Please refresh or serve this folder over HTTP.';
  $('#gallery-status').textContent = error.message;
});
