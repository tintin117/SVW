/* ═══════════════════════════════════════════
   WILD LIVES — App Logic
═══════════════════════════════════════════ */

(function () {
  'use strict';

  let activeSpecies = null;
  let stopCurrentGame = null;
  const loadedScripts = new Set();

  // ── DOM references ──────────────────────
  const panelsArea     = document.getElementById('panels-area');
  const detailModal    = document.getElementById('detail-modal');
  const detailBackdrop = document.getElementById('detail-backdrop');
  const gameModal      = document.getElementById('game-modal');
  const gameCanvas     = document.getElementById('game-canvas');

  const closeDetailBtn  = document.getElementById('close-detail');
  const closeGameBtn    = document.getElementById('close-game');
  const btnPlay         = document.getElementById('btn-play');

  const modalArt        = document.getElementById('modal-art');
  const modalStatus     = document.getElementById('modal-status');
  const modalName       = document.getElementById('modal-name');
  const modalScientific = document.getElementById('modal-scientific');
  const modalPopulation = document.getElementById('modal-population');
  const modalHabitat    = document.getElementById('modal-habitat');
  const modalThreat     = document.getElementById('modal-threat');
  const modalFacts      = document.getElementById('modal-facts');

  // ── Accordion state ─────────────────────
  let currentIndex = 0;
  let panelEls = [];
  let progressBar = null;   // active panel's progress bar element

  // Auto-loop interval (ms) — time each species is displayed
  const LOOP_INTERVAL = 5000;
  let loopTimer = null;
  let progressAnim = null;  // requestAnimationFrame ID

  // Placeholder backgrounds — swap each for the real species photo when ready
  const PLACEHOLDERS = [
    'asset/pangolin.jpg',  // Sea Turtle   (placeholder)
    'asset/pangolin.jpg',  // Elephant     (placeholder)
    'asset/pangolin.jpg',  // Orangutan    (placeholder)
    'asset/pangolin.jpg',  // Snow Leopard (placeholder)
    'asset/pangolin.jpg',  // Blue Whale   (placeholder)
    'asset/pangolin.jpg',  // Pangolin
    'asset/pangolin.jpg',  // Rhinoceros   (placeholder)
    'asset/pangolin.jpg',  // Axolotl      (placeholder)
  ];

  // Short display names for panel headings
  const PANEL_NAMES = {
    turtle:       'Sea Turtle',
    elephant:     'Elephant',
    orangutan:    'Orangutan',
    snow_leopard: 'Snow Leopard',
    whale:        'Blue Whale',
    pangolin:     'Sunda Pangolin',
    rhino:        'Rhinoceros',
    axolotl:      'Axolotl',
  };

  // First sentence of threat text (used as short panel description)
  function shortDesc(sp) {
    const sentence = sp.threat.split(/\.\s/)[0];
    return sentence.endsWith('.') ? sentence : sentence + '.';
  }

  // ── Panel state ─────────────────────────
  function updatePanels() {
    panelEls.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === currentIndex);
    });
    startProgressBar();
  }

  function goTo(index) {
    const n = SPECIES.length;
    currentIndex = ((index % n) + n) % n;
    updatePanels();
  }

  // ── Auto-loop ────────────────────────────
  function startLoop() {
    clearInterval(loopTimer);
    loopTimer = setInterval(() => goTo(currentIndex + 1), LOOP_INTERVAL);
  }

  function resetLoop() {
    startLoop(); // restart countdown after user interaction
  }

  // Animate the progress bar on the active panel
  function startProgressBar() {
    // Cancel any running animation
    if (progressAnim) cancelAnimationFrame(progressAnim);

    // Find the active panel's progress bar
    const activePanel = panelEls[currentIndex];
    if (!activePanel) return;
    progressBar = activePanel.querySelector('.panel-progress');
    if (!progressBar) return;

    // Reset bar
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';

    // Force reflow so the reset registers before we start animating
    progressBar.getBoundingClientRect();

    // Animate to 100% over LOOP_INTERVAL
    progressBar.style.transition = `width ${LOOP_INTERVAL}ms linear`;
    progressBar.style.width = '100%';
  }

  // Pause progress when modals are open
  function pauseLoop() {
    clearInterval(loopTimer);
    if (progressBar) {
      const computed = window.getComputedStyle(progressBar).width;
      progressBar.style.transition = 'none';
      progressBar.style.width = computed;
    }
  }

  function resumeLoop() {
    startLoop();
    startProgressBar();
  }

  // ── Render Panels ────────────────────────
  function renderGallery() {
    SPECIES.forEach((sp, i) => {
      const panel = document.createElement('article');
      panel.className = 'species-panel';
      panel.setAttribute('tabindex', '0');
      panel.setAttribute('role', 'button');
      panel.setAttribute('aria-label', `${sp.name} — tap to explore`);

      const name = PANEL_NAMES[sp.id] || sp.name;
      const desc = shortDesc(sp);

      panel.innerHTML = `
        <div class="panel-bg" style="background-image: url('${PLACEHOLDERS[i]}')"></div>
        <div class="panel-overlay"></div>
        <div class="panel-content">
          <h2 class="panel-name">${name}</h2>
          <p class="panel-status">${sp.statusLabel}</p>
          <p class="panel-desc">${desc}</p>
        </div>
        <div class="panel-progress"></div>`;

      panel.addEventListener('click', () => {
        if (i === currentIndex) {
          openDetail(sp);
        } else {
          goTo(i);
          resetLoop();
        }
      });

      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (i === currentIndex) openDetail(sp);
          else { goTo(i); resetLoop(); }
        }
      });

      panelsArea.appendChild(panel);
      panelEls.push(panel);
    });

    updatePanels();
    startLoop();
  }

  // ── Detail Modal ─────────────────────────
  function openDetail(sp) {
    activeSpecies = sp;
    pauseLoop();

    modalArt.innerHTML = `<div style="position:absolute;inset:0;background:${sp.accentColor};opacity:0.25;"></div>${sp.svgArt}`;
    modalArt.style.background = sp.accentColor + '30';
    modalStatus.textContent = sp.statusLabel;
    modalStatus.className = 'status-badge ' + sp.statusClass;
    modalName.textContent = sp.name;
    modalScientific.textContent = sp.scientificName;
    modalPopulation.textContent = sp.population;
    modalHabitat.textContent = sp.habitat;
    modalThreat.textContent = sp.threat;

    modalFacts.innerHTML = '';
    sp.facts.forEach((f) => {
      const li = document.createElement('li');
      li.textContent = f;
      modalFacts.appendChild(li);
    });

    detailModal.hidden = false;
    setTimeout(() => closeDetailBtn.focus(), 50);
    document.body.style.overflow = 'hidden';
  }

  function closeDetail() {
    detailModal.hidden = true;
    document.body.style.overflow = '';
    activeSpecies = null;
    resumeLoop();
  }

  // ── Game Modal ───────────────────────────
  function openGame(sp) {
    closeDetail();
    pauseLoop();

    gameCanvas.width  = window.innerWidth;
    gameCanvas.height = window.innerHeight;
    gameCanvas.style.width  = '100%';
    gameCanvas.style.height = '100%';

    gameModal.hidden = false;
    document.body.style.overflow = 'hidden';

    loadAndStartGame(sp);
  }

  async function loadAndStartGame(sp) {
    const key = sp.gameKey;
    const src = `js/games/${key}.js`;

    if (!loadedScripts.has(src)) {
      await loadScript(src);
      loadedScripts.add(src);
    }

    if (typeof window.GAME_START === 'function') {
      stopCurrentGame = window.GAME_START(
        gameCanvas,
        () => handleGameEnd('win', sp),
        () => handleGameEnd('lose', sp)
      );
    }
  }

  function handleGameEnd(result, sp) {
    // Game draws its own end screen; close button remains accessible.
  }

  function closeGame() {
    if (typeof stopCurrentGame === 'function') {
      stopCurrentGame();
      stopCurrentGame = null;
    }
    const ctx = gameCanvas.getContext('2d');
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    gameModal.hidden = true;
    document.body.style.overflow = '';
    resumeLoop();
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) existing.remove();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  // ── Event Listeners ──────────────────────
  closeDetailBtn.addEventListener('click', closeDetail);
  detailBackdrop.addEventListener('click', closeDetail);
  btnPlay.addEventListener('click', () => { if (activeSpecies) openGame(activeSpecies); });
  closeGameBtn.addEventListener('click', closeGame);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!gameModal.hidden)   { closeGame();   return; }
      if (!detailModal.hidden) { closeDetail(); }
    }
  });

  window.addEventListener('resize', () => {
    if (!gameModal.hidden) {
      gameCanvas.width  = window.innerWidth;
      gameCanvas.height = window.innerHeight;
    }
  });

  // ── Init ─────────────────────────────────
  renderGallery();
})();
