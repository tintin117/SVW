/* ═══════════════════════════════════════════
   WILD LIVES — App Logic
═══════════════════════════════════════════ */

(function () {
  'use strict';

  let activeSpecies = null;
  let stopCurrentGame = null;
  const loadedScripts = new Set();

  // ── DOM references ──────────────────────
  const panelsArea    = document.getElementById('panels-area');
  const detailModal   = document.getElementById('detail-modal');
  const detailBackdrop= document.getElementById('detail-backdrop');
  const gameModal     = document.getElementById('game-modal');
  const gameCanvas    = document.getElementById('game-canvas');

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
  const counterEl       = document.getElementById('carousel-counter');

  // ── Accordion state ─────────────────────
  let currentIndex = 0;
  let panelEls = [];

  // Placeholder backgrounds — replace each entry with the species' real photo when ready
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

  // Short panel display names (large serif, single/double word)
  const PANEL_NAMES = {
    turtle:      'Sea Turtle',
    elephant:    'Elephant',
    orangutan:   'Orangutan',
    snow_leopard:'Snow Leopard',
    whale:       'Blue Whale',
    pangolin:    'Pangolin',
    rhino:       'Rhinoceros',
    axolotl:     'Axolotl',
  };

  // ── Panel state ─────────────────────────
  function updatePanels() {
    const total = SPECIES.length;
    panelEls.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === currentIndex);
    });
    const cur = String(currentIndex + 1).padStart(2, '0');
    const tot = String(total).padStart(2, '0');
    counterEl.innerHTML = `<b>${cur}</b> / ${tot}`;
  }

  function goTo(index) {
    const n = SPECIES.length;
    const next = ((index % n) + n) % n;
    if (next === currentIndex) return;
    currentIndex = next;
    updatePanels();
  }

  // ── Render Accordion Gallery ─────────────
  function renderGallery() {
    SPECIES.forEach((sp, i) => {
      const panel = document.createElement('article');
      panel.className = 'species-panel';
      panel.setAttribute('tabindex', '0');
      panel.setAttribute('role', 'button');
      panel.setAttribute('aria-label', `${sp.name} — tap to explore`);

      const panelName = PANEL_NAMES[sp.id] || sp.name;

      panel.innerHTML = `
        <div class="panel-bg" style="background-image: url('${PLACEHOLDERS[i]}')"></div>
        <div class="panel-overlay"></div>
        <div class="panel-content">
          <h2 class="panel-name">${panelName}</h2>
          <div class="panel-rule"></div>
          <p class="panel-desc">${sp.threat}</p>
        </div>`;

      panel.addEventListener('click', () => {
        if (i === currentIndex) {
          openDetail(sp);
        } else {
          goTo(i);
        }
      });

      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (i === currentIndex) openDetail(sp);
          else goTo(i);
        }
      });

      panelsArea.appendChild(panel);
      panelEls.push(panel);
    });

    updatePanels();
  }

  // ── Detail Modal ─────────────────────────
  function openDetail(sp) {
    activeSpecies = sp;

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
  }

  // ── Game Modal ───────────────────────────
  function openGame(sp) {
    closeDetail();

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
