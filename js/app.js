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
  const fvBar       = document.querySelector('.fv-bar');

  // ── Accordion state ─────────────────────
  let currentIndex = 0;
  let panelEls = [];
  let dotEls   = [];
  let progressBar = null;
  let wasDragging = false;

  // ── Fact Viewer state ───────────────
  let fvSpecies     = null;
  let fvScreenIndex = 0;
  let fvScreenCount = 0;
  let fvIdleTimer   = null;

  const IDLE_TIMEOUT = 60000;

  // Auto-loop interval (ms)
  const LOOP_INTERVAL = 5000;
  let loopTimer = null;

  // Carousel panel backgrounds
  const IMAGES = [
    'asset/pangolin/pangolin.png',
    'asset/tiger.png',
    'asset/saola.png',
  ];
  const PLACEHOLDERS = SPECIES.map((sp, i) => sp.avatar || IMAGES[i % IMAGES.length]);

  const PANEL_NAMES = {
    pangolin:      'Sunda Pangolin',
    placeholder_1: 'Placeholder',
    placeholder_2: 'Placeholder',
    placeholder_3: 'Placeholder',
    placeholder_4: 'Placeholder',
    placeholder_5: 'Placeholder',
    placeholder_6: 'Placeholder',
    placeholder_7: 'Placeholder',
  };

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

  function resetLoop() { startLoop(); }

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

  // ── Infographic ───────────────────────
  function renderInfographicScreen(sp, index) {
    fvScreenIndex = index;
    const screen = sp.screens[index];
    const total  = fvScreenCount;
    const progressPct = total > 1 ? (index / (total - 1)) * 100 : 100;

    let nodesHtml = '';
    for (let i = 0; i < total; i++) {
      let cls = 'infographic-step-node';
      if (i < index)      cls += ' is-completed';
      else if (i === index) cls += ' is-active';
      const glow = i === index
        ? `style="box-shadow:0 0 14px ${sp.accentColor};border-color:${sp.accentColor}"`
        : '';
      nodesHtml += `<div class="${cls}" ${glow}></div>`;
    }

    let pillsHtml = '';
    for (let i = 0; i < total; i++) {
      const active = i === index;
      const style = active
        ? `style="background:${sp.accentColor};border-color:${sp.accentColor};color:#000"`
        : '';
      pillsHtml += `<button class="infographic-nav-pill${active ? ' is-active' : ''}" data-idx="${i}" ${style}>${sp.screens[i].label}</button>`;
    }

    fvSlideArea.innerHTML = `
      <div class="infographic">
        <div class="infographic-hero">
          <div class="infographic-text">
            <div class="infographic-label">${sp.name}</div>
            <h2 class="infographic-title">${screen.heading}</h2>
            <p class="infographic-subtitle">${screen.subheading}</p>
            <p class="infographic-instruction" style="color:${sp.accentColor}">${screen.instruction}</p>
          </div>
          <div class="infographic-image-wrap">
            <img class="infographic-img" src="${sp.avatar}" alt="${sp.name}">
            <div class="infographic-glow" style="background:radial-gradient(circle,${sp.accentColor}66 0%,transparent 70%)"></div>
          </div>
        </div>
        <div class="infographic-stepper">
          <div class="infographic-stepper-track">
            <div class="infographic-stepper-progress" style="width:${progressPct}%;background:${sp.accentColor}"></div>
          </div>
          <div class="infographic-stepper-nodes">${nodesHtml}</div>
        </div>
        <nav class="infographic-nav">
          <ul class="infographic-nav-pills">${pillsHtml}</ul>
        </nav>
      </div>`;

    // Per-step image micro-animation (from /asset/app/app.js updateStepperAndNav)
    const img = fvSlideArea.querySelector('.infographic-img');
    if (img) {
      img.style.transform = `scale(${1 + index * 0.02}) rotate(${index * 1.5}deg)`;
      img.style.transition = 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    // Nav pill click handlers — stopPropagation prevents triggering the advance listener
    fvSlideArea.querySelectorAll('.infographic-nav-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderInfographicScreen(sp, parseInt(btn.dataset.idx, 10));
        resetIdleTimer();
      });
    });
  }

  function openFactViewer(sp) {
    fvSpecies     = sp;
    fvScreenIndex = 0;
    fvBar.hidden  = true;

    if (sp.isPlaceholder) {
      fvScreenCount = 1;
      fvSlideArea.innerHTML = `<div class="infographic-placeholder"><p>Coming Soon</p></div>`;
    } else {
      fvScreenCount = sp.screens.length;
      renderInfographicScreen(sp, 0);
    }

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
    if (fvScreenIndex < fvScreenCount - 1) {
      fvScreenIndex++;
      if (fvSpecies && fvSpecies.screens) {
        renderInfographicScreen(fvSpecies, fvScreenIndex);
      } else {
        closeFactViewer();
      }
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
    const THRESHOLD     = 100;
    const VEL_THRESHOLD = 0.3;
    let startY   = 0;
    let dragY    = 0;
    let dragging = false;
    let lastY    = 0;
    let lastTime = 0;
    let velocity = 0;

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
