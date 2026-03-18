/* ═══════════════════════════════════════════
   WILD LIVES — App Logic
═══════════════════════════════════════════ */

(function () {
  'use strict';

  // ── DOM references ──────────────────────
  const panelsArea     = document.getElementById('panels-area');

  const counterCurrent  = document.getElementById('counter-current');
  const counterTotal    = document.getElementById('counter-total');

  // ── Fact Viewer DOM refs ────────────
  const factViewer  = document.getElementById('fact-viewer');
  const fvSlideArea = document.getElementById('fv-slide-area');
  const fvClose     = document.getElementById('fv-close');
  const fvDots      = document.getElementById('fv-dots');
  const fvHint      = document.getElementById('fv-hint');
  const fvCounter   = document.getElementById('fv-counter');

  // ── Accordion state ─────────────────────
  let currentIndex = 0;
  let panelEls = [];
  let dotEls   = [];
  let progressBar = null;   // active panel's progress bar element
  let wasDragging = false;  // suppress click after a completed drag

  // ── Fact Viewer state ───────────────
  let fvSpecies    = null;
  let fvSlideIndex = 0;
  let fvSlideCount = 0;
  let fvIdleTimer  = null;

  const IDLE_TIMEOUT = 60000; // ms — time before auto-closing viewer

  // Auto-loop interval (ms) — time each species is displayed
  const LOOP_INTERVAL = 5000;
  let loopTimer = null;

  // Carousel panel backgrounds. Use species avatar if defined, else rotate placeholders.
  const IMAGES = [
    'asset/pangolin/pangolin.png',
    'asset/tiger.png',
    'asset/saola.png',
  ];
  const PLACEHOLDERS = SPECIES.map((sp, i) => sp.avatar || IMAGES[i % IMAGES.length]);

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
    const n = SPECIES.length;
    const prevIdx = ((currentIndex - 1) + n) % n;
    const nextIdx = (currentIndex + 1) % n;

    panelEls.forEach((panel, i) => {
      panel.classList.remove('is-prev', 'is-active', 'is-next');
      if (i === currentIndex) panel.classList.add('is-active');
      else if (i === prevIdx)  panel.classList.add('is-prev');
      else if (i === nextIdx)  panel.classList.add('is-next');
    });

    dotEls.forEach((dot, i) => dot.classList.toggle('is-active', i === currentIndex));

    counterCurrent.textContent = currentIndex + 1;
    counterTotal.textContent   = n;
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
    startLoop();
  }

  // Animate the progress bar on the active panel
  function startProgressBar() {
    const activePanel = panelEls[currentIndex];
    if (!activePanel) return;
    progressBar = activePanel.querySelector('.panel-progress');
    if (!progressBar) return;

    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    progressBar.getBoundingClientRect();
    progressBar.style.transition = `width ${LOOP_INTERVAL}ms linear`;
    progressBar.style.width = '100%';
  }

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

  // ── Fact Viewer ──────────────────────
  function renderSlide(index) {
    const sp    = fvSpecies;
    const total = fvSlideCount;
    const isLast = index === total - 1;

    if (sp.factImages > 0) {
      fvSlideArea.innerHTML = `
        <div class="fv-species-overlay">${PANEL_NAMES[sp.id] || sp.name}</div>
        <div class="fv-image-slide">
          <img class="fv-img" src="asset/${sp.id}/fact${index + 1}.png"
               alt="Fact ${index + 1} — ${PANEL_NAMES[sp.id] || sp.name}">
        </div>`;
    } else {
      fvSlideArea.innerHTML = `
        <div class="fv-text-slide">
          <div class="fv-species-label">${PANEL_NAMES[sp.id] || sp.name}</div>
          <div class="fv-did-you-know" style="color:${sp.accentColor}">Did you know?</div>
          <div class="fv-fact-text">${sp.facts[index]}</div>
        </div>`;
    }

    fvHint.textContent = isLast ? 'TAP TO CLOSE' : 'TAP TO CONTINUE';
    fvCounter.textContent = `${index + 1} / ${total}`;

    fvDots.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = 'fv-dot' + (i === index ? ' is-active' : '');
      if (i === index) dot.style.background = sp.accentColor;
      fvDots.appendChild(dot);
    }
  }

  function openFactViewer(sp) {
    fvSpecies    = sp;
    fvSlideIndex = 0;
    fvSlideCount = sp.factImages > 0 ? sp.factImages : sp.facts.length;
    renderSlide(0);
    factViewer.hidden = false;
    document.body.style.overflow = 'hidden';
    pauseLoop();
    resetIdleTimer();
  }

  function closeFactViewer() {
    clearTimeout(fvIdleTimer);
    factViewer.hidden = true;
    document.body.style.overflow = '';
    resumeLoop();
  }

  function nextSlide() {
    resetIdleTimer();
    if (fvSlideIndex < fvSlideCount - 1) {
      fvSlideIndex++;
      renderSlide(fvSlideIndex);
    } else {
      closeFactViewer();
    }
  }

  function resetIdleTimer() {
    clearTimeout(fvIdleTimer);
    fvIdleTimer = setTimeout(closeFactViewer, IDLE_TIMEOUT);
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
        if (wasDragging) return;
        if (i === currentIndex) {
          openFactViewer(sp);
        } else {
          goTo(i);
          resetLoop();
        }
      });

      panel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (i === currentIndex) openFactViewer(sp);
          else { goTo(i); resetLoop(); }
        }
      });

      panelsArea.appendChild(panel);
      panelEls.push(panel);
    });

    // Floating dot indicators
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    SPECIES.forEach((sp, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to ${PANEL_NAMES[sp.id] || sp.name}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(i);
        resetLoop();
      });
      dotsContainer.appendChild(dot);
      dotEls.push(dot);
    });
    panelsArea.appendChild(dotsContainer);

    updatePanels();
    startLoop();
    initDrag();
  }

  // ── Drag / Swipe (vertical) ──────────────
  function initDrag() {
    const THRESHOLD     = 100;  // px — mid-drag commit distance
    const VEL_THRESHOLD = 0.3;  // px/ms — release-velocity fallback
    let startY   = 0;
    let dragY    = 0;
    let dragging = false;
    let lastY    = 0;
    let lastTime = 0;
    let velocity = 0;  // px/ms, positive = downward

    function visiblePanels() {
      return panelEls.filter(p =>
        p.classList.contains('is-prev') ||
        p.classList.contains('is-active') ||
        p.classList.contains('is-next')
      );
    }

    function setDragTransform(dy) {
      visiblePanels().forEach(p => { p.style.transform = `translateY(${dy}px)`; });
    }

    function onStart(y) {
      startY      = y;
      dragY       = 0;
      dragging    = true;
      wasDragging = false;
      lastY       = y;
      lastTime    = Date.now();
      velocity    = 0;
      panelEls.forEach(p => { p.style.transition = 'none'; });
      panelsArea.classList.add('is-dragging');
      pauseLoop();
    }

    function onMove(y) {
      if (!dragging) return;
      const now = Date.now();
      const dt  = now - lastTime;
      if (dt > 0) velocity = (y - lastY) / dt;
      lastY    = y;
      lastTime = now;
      dragY = y - startY;
      if (Math.abs(dragY) > 5) wasDragging = true;

      if (dragY < -THRESHOLD) {
        goTo(currentIndex + 1);
        startY = y;
        dragY  = 0;
      } else if (dragY > THRESHOLD) {
        goTo(currentIndex - 1);
        startY = y;
        dragY  = 0;
      }

      setDragTransform(dragY);
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      panelsArea.classList.remove('is-dragging');

      if (dragY > -THRESHOLD && dragY < THRESHOLD) {
        if      (velocity < -VEL_THRESHOLD) goTo(currentIndex + 1);
        else if (velocity >  VEL_THRESHOLD) goTo(currentIndex - 1);
      }

      panelEls.forEach(p => { p.style.transition = ''; p.style.transform = ''; });
      resetLoop();
      setTimeout(() => { wasDragging = false; }, 100);
    }

    // Touch
    panelsArea.addEventListener('touchstart',  (e) => onStart(e.touches[0].clientY), { passive: true });
    panelsArea.addEventListener('touchmove',   (e) => onMove(e.touches[0].clientY),  { passive: true });
    panelsArea.addEventListener('touchend',    onEnd, { passive: true });
    panelsArea.addEventListener('touchcancel', onEnd, { passive: true });

    // Mouse
    panelsArea.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e.clientY); });
    window.addEventListener('mousemove', (e) => { if (dragging) onMove(e.clientY); });
    window.addEventListener('mouseup',   onEnd);
  }

  // ── Event Listeners ──────────────────────
  fvSlideArea.addEventListener('click', nextSlide);

  fvClose.addEventListener('click', () => {
    resetIdleTimer();
    closeFactViewer();
  });

  document.addEventListener('touchstart', () => {
    if (!factViewer.hidden) resetIdleTimer();
  }, { passive: true });

  document.addEventListener('mousedown', () => {
    if (!factViewer.hidden) resetIdleTimer();
  });

  // ── Init ─────────────────────────────────
  renderGallery();
})();
