/* ═══════════════════════════════════════════
   WILD LIVES — App Logic
═══════════════════════════════════════════ */

(function () {
  'use strict';

  let activeSpecies = null;
  let stopCurrentGame = null;
  const loadedScripts = new Set();

  // ── DOM references ──────────────────────
  const grid          = document.getElementById('gallery-grid');
  const detailModal   = document.getElementById('detail-modal');
  const detailBackdrop= document.getElementById('detail-backdrop');
  const gameModal     = document.getElementById('game-modal');
  const gameCanvas    = document.getElementById('game-canvas');

  const closeDetailBtn= document.getElementById('close-detail');
  const closeGameBtn  = document.getElementById('close-game');
  const btnPlay       = document.getElementById('btn-play');

  const modalArt      = document.getElementById('modal-art');
  const modalStatus   = document.getElementById('modal-status');
  const modalName     = document.getElementById('modal-name');
  const modalScientific = document.getElementById('modal-scientific');
  const modalPopulation = document.getElementById('modal-population');
  const modalHabitat  = document.getElementById('modal-habitat');
  const modalThreat   = document.getElementById('modal-threat');
  const modalFacts    = document.getElementById('modal-facts');

  const counterEl     = document.getElementById('carousel-counter');
  const dotsEl        = document.getElementById('carousel-dots');
  const prevBtn       = document.getElementById('carousel-prev');
  const nextBtn       = document.getElementById('carousel-next');

  // ── Carousel state ──────────────────────
  let currentIndex = 0;
  let cardEls = [];

  function updateCarousel(dir = 0) {
    const total = SPECIES.length;
    const incoming = cardEls[currentIndex];

    // ── Pin incoming card at its side-scale starting position ──
    // This creates a "slide in from the side" entry for the new center card.
    if (dir !== 0) {
      incoming.style.transition = 'none';
      incoming.style.scale   = String(parseFloat(getComputedStyle(document.documentElement)
                                .getPropertyValue('--side-scale').trim()) || 0.68);
      incoming.style.translate = `${dir * 110}px 0`;
    }

    cardEls.forEach((card, i) => {
      card.classList.remove('is-center', 'is-left', 'is-right', 'is-hidden');
      if (i === currentIndex) {
        card.classList.add('is-center');
      } else if (i === (currentIndex - 1 + total) % total) {
        card.classList.add('is-left');
      } else if (i === (currentIndex + 1) % total) {
        card.classList.add('is-right');
      } else {
        card.classList.add('is-hidden');
      }
    });

    // ── Release pin → CSS transition animates to final position ──
    if (dir !== 0) {
      incoming.getBoundingClientRect(); // force reflow so browser registers start state
      incoming.style.transition = '';
      incoming.style.scale      = '';
      incoming.style.translate  = '';
    }

    // Counter: <b>01</b>/08
    const cur = String(currentIndex + 1).padStart(2, '0');
    const tot = String(total).padStart(2, '0');
    counterEl.innerHTML = `<b>${cur}</b>/${tot}`;

    // Dots
    dotsEl.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentIndex);
    });
  }

  function goTo(index) {
    const n = SPECIES.length;
    const next = (index + n) % n;
    if (next === currentIndex) return;
    // Determine shortest-path direction: 1 = forward, -1 = backward
    const fwd = ((next - currentIndex) + n) % n;
    const dir = fwd <= n / 2 ? 1 : -1;
    currentIndex = next;
    updateCarousel(dir);
  }

  // ── Drag / swipe support ─────────────────
  function initDrag() {
    const viewport = document.getElementById('carousel-viewport');
    const THRESHOLD = 160; // px to travel before card flips
    let startX = 0;
    let dragX = 0;
    let dragging = false;

    function clearNudge() {
      cardEls.forEach(c => { c.style.translate = ''; });
    }

    function onStart(x) {
      startX = x;
      dragX = 0;
      dragging = true;
    }

    function onMove(x) {
      if (!dragging) return;
      dragX = x - startX;

      // Nudge with rubber-band resistance: moves less as you approach threshold
      const progress = Math.min(Math.abs(dragX) / THRESHOLD, 1);
      const nudge = Math.sign(dragX) * progress * 36 * (1 - progress * 0.4);
      cardEls.forEach(c => {
        if (!c.classList.contains('is-hidden')) c.style.translate = `${nudge}px 0`;
      });

      // Flip card once threshold crossed, then reset origin for continuous drag
      if (Math.abs(dragX) >= THRESHOLD) {
        clearNudge();
        goTo(currentIndex + (dragX < 0 ? 1 : -1));
        startX = x;
        dragX = 0;
      }
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      clearNudge();
    }

    // Touch
    viewport.addEventListener('touchstart',  (e) => onStart(e.touches[0].clientX), { passive: true });
    viewport.addEventListener('touchmove',   (e) => onMove(e.touches[0].clientX),  { passive: true });
    viewport.addEventListener('touchend',    onEnd,                                 { passive: true });
    viewport.addEventListener('touchcancel', onEnd,                                 { passive: true });

    // Mouse (desktop / mouse-based kiosks)
    viewport.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e.clientX); });
    window.addEventListener('mousemove',   (e) => onMove(e.clientX));
    window.addEventListener('mouseup',     onEnd);
  }

  // ── Render Gallery ──────────────────────
  function renderGallery() {
    SPECIES.forEach((sp, i) => {
      const card = document.createElement('article');
      card.className = 'species-card is-hidden';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${sp.name} — tap to learn more`);

      card.innerHTML = `
        <div class="card-art-area" style="background-color:${sp.accentColor}">
          ${sp.svgArt}
          <div class="card-gradient"></div>
          <div class="card-name-overlay">
            <p class="card-name">${sp.name}</p>
          </div>
        </div>`;

      card.addEventListener('click', () => {
        if (i === currentIndex) {
          openDetail(sp);
        } else {
          goTo(i);
        }
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(sp); }
      });

      grid.appendChild(card);
      cardEls.push(card);
    });

    // Build dots
    SPECIES.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to species ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });

    // Nav buttons
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    initDrag();
    updateCarousel();
  }

  // ── Detail Modal ────────────────────────
  function openDetail(sp) {
    activeSpecies = sp;

    // Populate
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

  // ── Game Modal ──────────────────────────
  function openGame(sp) {
    closeDetail();

    // Size canvas to full screen
    gameCanvas.width  = window.innerWidth;
    gameCanvas.height = window.innerHeight;
    gameCanvas.style.width  = '100%';
    gameCanvas.style.height = '100%';

    gameModal.hidden = false;
    document.body.style.overflow = 'hidden';

    loadAndStartGame(sp);
  }

  async function loadAndStartGame(sp) {
    const key  = sp.gameKey;
    const src  = `js/games/${key}.js`;

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
    // The game itself draws the end screen;
    // we just need the close button to remain accessible.
    // If they close, we clean up.
  }

  function closeGame() {
    if (typeof stopCurrentGame === 'function') {
      stopCurrentGame();
      stopCurrentGame = null;
    }
    // Clear canvas
    const ctx = gameCanvas.getContext('2d');
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    gameModal.hidden = true;
    document.body.style.overflow = '';
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Remove existing instance so re-load works
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) existing.remove();

      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  // ── Event Listeners ─────────────────────
  closeDetailBtn.addEventListener('click', closeDetail);
  detailBackdrop.addEventListener('click', closeDetail);
  btnPlay.addEventListener('click', () => { if (activeSpecies) openGame(activeSpecies); });
  closeGameBtn.addEventListener('click', closeGame);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!gameModal.hidden) { closeGame(); return; }
      if (!detailModal.hidden) { closeDetail(); }
    }
  });

  // Handle window resize while game is open
  window.addEventListener('resize', () => {
    if (!gameModal.hidden) {
      gameCanvas.width  = window.innerWidth;
      gameCanvas.height = window.innerHeight;
    }
  });

  // ── Init ────────────────────────────────
  renderGallery();
})();
