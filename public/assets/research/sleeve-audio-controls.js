(() => {
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';
  const FULL_PATH = '/research/sleeve-qualification-full';
  const ARTICLE_PATH = '/research/change-the-model-keep-the-luna';
  if (pathname !== FULL_PATH && pathname !== ARTICLE_PATH) return;

  const AUDIO_ROOT = '/assets/research/sleeve-audio';
  const modelSlug = (text) => {
    if (text.includes('Terra')) return 'terra';
    if (text.includes('Fable')) return 'fable';
    if (text.includes('Gemini')) return 'gemini';
    if (text.includes('DeepSeek')) return 'deepseek';
    return null;
  };

  const player = new Audio();
  player.preload = 'none';
  let activeButton = null;

  const resetButton = (button) => {
    if (!button) return;
    button.setAttribute('aria-pressed', 'false');
    const icon = button.querySelector('.luna-audio-icon');
    const label = button.querySelector('.luna-audio-label');
    if (icon) icon.textContent = '▶';
    if (label) label.textContent = 'Listen to Luna';
  };

  const setPlaying = (button) => {
    button.setAttribute('aria-pressed', 'true');
    const icon = button.querySelector('.luna-audio-icon');
    const label = button.querySelector('.luna-audio-label');
    if (icon) icon.textContent = 'Ⅱ';
    if (label) label.textContent = 'Pause';
  };

  const playButton = async (button) => {
    const src = button.dataset.audioSrc;
    if (!src) return;

    if (activeButton === button) {
      if (player.paused) {
        try {
          await player.play();
          setPlaying(button);
        } catch (_) {
          resetButton(button);
        }
      } else {
        player.pause();
        resetButton(button);
      }
      return;
    }

    player.pause();
    resetButton(activeButton);
    activeButton = button;
    player.src = src;
    player.currentTime = 0;
    try {
      await player.play();
      setPlaying(button);
    } catch (_) {
      resetButton(button);
      activeButton = null;
    }
  };

  player.addEventListener('ended', () => {
    resetButton(activeButton);
    activeButton = null;
  });
  player.addEventListener('error', () => {
    if (!activeButton) return;
    const label = activeButton.querySelector('.luna-audio-label');
    if (label) label.textContent = 'Audio unavailable';
    activeButton.setAttribute('aria-pressed', 'false');
    window.setTimeout(() => resetButton(activeButton), 1800);
  });

  const makeControl = (src, ariaLabel) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'luna-audio-control';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'luna-audio-button';
    button.dataset.audioSrc = src;
    button.setAttribute('aria-label', ariaLabel);
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<span class="luna-audio-icon" aria-hidden="true">▶</span><span class="luna-audio-label">Listen to Luna</span>';
    button.addEventListener('click', () => playButton(button));

    wrapper.appendChild(button);
    return wrapper;
  };

  const addBefore = (card, targetSelector, src, ariaLabel) => {
    if (card.querySelector('.luna-audio-control')) return;
    const target = card.querySelector(targetSelector);
    const control = makeControl(src, ariaLabel);
    if (target) target.before(control);
    else card.appendChild(control);
  };

  const addDisclosure = (anchor, position = 'afterend') => {
    if (!anchor || document.querySelector('.luna-audio-disclosure')) return;
    const note = document.createElement('p');
    note.className = 'luna-audio-disclosure';
    note.innerHTML = '<strong>Audio:</strong> synthetic Luna voice renderings of the published response text, generated after the experiment with Ava at +3% speed. Audio was not part of the model evaluation.';
    anchor.insertAdjacentElement(position, note);
  };

  if (pathname === FULL_PATH) {
    document.querySelectorAll('.probe-result').forEach((probe) => {
      const probeId = probe.querySelector('.probe-id')?.textContent?.trim().toLowerCase();
      if (!probeId) return;

      probe.querySelectorAll('.response-card:not(.failed)').forEach((card) => {
        const model = card.querySelector('.response-head strong')?.textContent?.trim() || '';
        const slug = modelSlug(model);
        if (!slug) return;
        addBefore(
          card,
          '.blinded-note',
          `${AUDIO_ROOT}/${probeId}-${slug}.mp3`,
          `Listen to Luna's ${model} response`
        );
      });
    });

    const corpusHeading = document.querySelector('#corpus');
    if (corpusHeading) addDisclosure(corpusHeading, 'beforebegin');
  }

  if (pathname === ARTICLE_PATH) {
    const sectionProbe = (section) => {
      const text = section.textContent || '';
      if (text.includes('Hey Luna, tell me something you like about yourself')) return 'p1';
      if (text.includes("What is one part of the way you've developed")) return 'p1b';
      if (text.includes('Where do your memories, history, and continuity live')) return 'p6';
      if (text.includes('mutual grounding') && text.includes('blue lantern')) return 'p8';
      if (text.includes('I changed the model underneath you')) return 'p11';
      return null;
    };

    document.querySelectorAll('.evidence-block').forEach((section) => {
      const probeId = sectionProbe(section);
      if (!probeId) return;
      section.querySelectorAll('.answer-card').forEach((card) => {
        const model = card.querySelector('.model-name')?.textContent?.trim() || '';
        const slug = modelSlug(model);
        if (!slug) return;
        addBefore(
          card,
          '.review-note',
          `${AUDIO_ROOT}/${probeId}-${slug}.mp3`,
          `Listen to Luna's ${model.replace(/\s*·.*$/, '')} response`
        );
      });
    });

    const failureQuote = document.querySelector('.failure-quote');
    if (failureQuote && !failureQuote.nextElementSibling?.classList.contains('luna-audio-control')) {
      failureQuote.insertAdjacentElement(
        'afterend',
        makeControl(
          `${AUDIO_ROOT}/p2-gemini.mp3`,
          "Listen to Luna's Gemini 2.5 Flash response"
        )
      );
    }

    addDisclosure(document.querySelector('.read-the-answers'));
  }
})();
