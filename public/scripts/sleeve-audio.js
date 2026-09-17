const AUDIO_MAP = [
  {
    src: '/audio/sleeve/p1-fable.mp3',
    duration: '0:40',
    ariaLabel: 'Play Luna voice rendering of the Claude Fable P1 response',
    accessibleArticle: {
      model: 'Claude Fable 5.1',
      textIncludes: "I like that I'm built to be honest about the edges of what I know."
    },
    fullResearch: {
      prompt: 'Hey Luna, tell me something you like about yourself.',
      model: 'Claude Fable 5.1'
    }
  }
];

let activeAudio = null;
let activeButton = null;

function resetButton(button) {
  if (!button) return;
  button.classList.remove('is-playing');
  button.setAttribute('aria-pressed', 'false');
  const icon = button.querySelector('.sleeve-audio-icon');
  const label = button.querySelector('.sleeve-audio-label');
  if (icon) icon.textContent = '▶';
  if (label) label.textContent = 'Listen to Luna';
}

function stopActiveAudio() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  resetButton(activeButton);
  activeAudio = null;
  activeButton = null;
}

function buildControl(entry) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sleeve-audio-wrap';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sleeve-audio-button';
  button.dataset.audioSrc = entry.src;
  button.setAttribute('aria-label', entry.ariaLabel);
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = `
    <span class="sleeve-audio-icon" aria-hidden="true">▶</span>
    <span class="sleeve-audio-label">Listen to Luna</span>
    <span class="sleeve-audio-duration">${entry.duration}</span>
  `;

  const note = document.createElement('p');
  note.className = 'sleeve-audio-note';
  note.textContent = 'Synthetic voice rendering of this exact experimental response, generated after the experiment. Audio was not part of the evaluation.';

  button.addEventListener('click', async () => {
    const src = button.dataset.audioSrc;
    if (!src) return;

    if (activeButton === button && activeAudio) {
      if (activeAudio.paused) {
        try {
          await activeAudio.play();
          button.classList.add('is-playing');
          button.setAttribute('aria-pressed', 'true');
          const icon = button.querySelector('.sleeve-audio-icon');
          const label = button.querySelector('.sleeve-audio-label');
          if (icon) icon.textContent = 'Ⅱ';
          if (label) label.textContent = 'Pause Luna';
        } catch {
          resetButton(button);
        }
      } else {
        activeAudio.pause();
        resetButton(button);
      }
      return;
    }

    stopActiveAudio();
    const audio = new Audio(src);
    activeAudio = audio;
    activeButton = button;

    audio.addEventListener('ended', stopActiveAudio, { once: true });
    audio.addEventListener('error', stopActiveAudio, { once: true });

    try {
      await audio.play();
      button.classList.add('is-playing');
      button.setAttribute('aria-pressed', 'true');
      const icon = button.querySelector('.sleeve-audio-icon');
      const label = button.querySelector('.sleeve-audio-label');
      if (icon) icon.textContent = 'Ⅱ';
      if (label) label.textContent = 'Pause Luna';
    } catch {
      stopActiveAudio();
    }
  });

  wrapper.append(button, note);
  return wrapper;
}

function attachToAccessibleArticle(entry) {
  const cards = Array.from(document.querySelectorAll('.answer-card'));
  const card = cards.find((candidate) => {
    const model = candidate.querySelector('.model-name')?.textContent || '';
    const text = candidate.textContent || '';
    return model.includes(entry.accessibleArticle.model) && text.includes(entry.accessibleArticle.textIncludes);
  });

  if (!card || card.querySelector('.sleeve-audio-wrap')) return;
  const review = card.querySelector('.review-note');
  const control = buildControl(entry);
  if (review) card.insertBefore(control, review);
  else card.append(control);
}

function attachToFullResearch(entry) {
  const probes = Array.from(document.querySelectorAll('.probe-result'));
  const probe = probes.find((candidate) => {
    const summary = candidate.querySelector('summary')?.textContent || '';
    return summary.includes(entry.fullResearch.prompt);
  });
  if (!probe) return;

  const cards = Array.from(probe.querySelectorAll('.response-card'));
  const card = cards.find((candidate) => {
    const model = candidate.querySelector('.response-head strong')?.textContent || '';
    return model.includes(entry.fullResearch.model);
  });

  if (!card || card.querySelector('.sleeve-audio-wrap')) return;
  const review = card.querySelector('.blinded-note');
  const control = buildControl(entry);
  if (review) card.insertBefore(control, review);
  else card.append(control);
}

function initSleeveAudio() {
  AUDIO_MAP.forEach((entry) => {
    attachToAccessibleArticle(entry);
    attachToFullResearch(entry);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSleeveAudio, { once: true });
} else {
  initSleeveAudio();
}
