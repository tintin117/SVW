# Fact Viewer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder infographic modal with a fullscreen tap-to-advance fact slideshow that opens when users tap the active species panel.

**Architecture:** A new `#fact-viewer` overlay sits on top of the existing carousel. It is completely independent of the old `#detail-modal` which is removed. Image mode (PNG files) and text mode (data.js `facts[]` array) are mutually exclusive per species, selected by the `factImages` field.

**Tech Stack:** Vanilla HTML/CSS/JavaScript. No build step. No test framework — verification is manual browser checks. Serve with any static server (e.g. `python -m http.server 8080` from project root).

**Spec:** `docs/superpowers/specs/2026-03-18-fact-viewer-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `asset/pangolin/fact1.png` | Rename from `pangolin_fact1.png` | Pangolin fact image 1 |
| `asset/pangolin/fact2.png` | Rename from `pangolin_fact2.png` | Pangolin fact image 2 |
| `asset/turtle/` `asset/elephant/` `asset/orangutan/` `asset/snow_leopard/` `asset/whale/` `asset/rhino/` `asset/axolotl/` | Create (empty) | Per-species asset folders |
| `index.html` | Modify | Remove `#detail-modal` block; add `#fact-viewer` block |
| `style/main.css` | Modify | Remove old modal CSS; add fact viewer CSS |
| `js/data.js` | Modify | Add `factImages: N` field to all 8 species |
| `js/app.js` | Modify | Remove old modal code; add fact viewer logic |

---

## Chunk 1: Assets and HTML

### Task 1: Rename pangolin fact images

**Files:**
- Rename: `asset/pangolin/pangolin_fact1.png` → `asset/pangolin/fact1.png`
- Rename: `asset/pangolin/pangolin_fact2.png` → `asset/pangolin/fact2.png`

- [ ] **Step 1: Rename the files**

```bash
mv asset/pangolin/pangolin_fact1.png asset/pangolin/fact1.png
mv asset/pangolin/pangolin_fact2.png asset/pangolin/fact2.png
```

- [ ] **Step 2: Verify**

```bash
ls asset/pangolin/
```

Expected output: `fact1.png  fact2.png  pangolin.jpg  pangolin.png`

---

### Task 2: Create empty species folders

**Files:**
- Create: `asset/turtle/` `asset/elephant/` `asset/orangutan/` `asset/snow_leopard/` `asset/whale/` `asset/rhino/` `asset/axolotl/`

- [ ] **Step 1: Create folders**

```bash
mkdir -p asset/turtle asset/elephant asset/orangutan asset/snow_leopard asset/whale asset/rhino asset/axolotl
```

- [ ] **Step 2: Verify**

```bash
ls asset/
```

Expected: all 8 species folders listed, plus `tiger.png` and `saola.png`.

---

### Task 3: Replace modal HTML with fact viewer in index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Remove the `#detail-modal` block**

In `index.html`, delete lines 47–78 — the entire block from `<!-- ── Infographic Modal ── -->` through the closing `</div>` of `.modal-overlay`. Replace it with nothing.

- [ ] **Step 2: Add the `#fact-viewer` block in its place**

Add this HTML in the same location (before the `<script>` tags):

```html
  <!-- ── Fact Viewer ── -->
  <div id="fact-viewer" hidden>
    <div class="fv-slide-area" id="fv-slide-area"></div>
    <div class="fv-bar">
      <div class="fv-dots" id="fv-dots"></div>
      <div class="fv-hint" id="fv-hint">TAP TO CONTINUE</div>
      <div class="fv-counter" id="fv-counter"></div>
    </div>
    <button class="fv-close" id="fv-close" aria-label="Close">&#x2715;</button>
  </div>
```

- [ ] **Step 3: Open browser and verify page loads without errors**

Open `http://localhost:8080` in a browser. Open DevTools console.
Expected: no JavaScript errors (some will appear because app.js still references old DOM IDs — that's OK, will be fixed in Task 6).
Expected: carousel renders and auto-loops normally.

- [ ] **Step 4: Commit**

```bash
git add asset/ index.html
git commit -m "feat: add fact viewer HTML, create species asset folders, rename pangolin facts"
```

---

## Chunk 2: CSS

### Task 4: Remove old modal CSS and add fact viewer CSS

**Files:**
- Modify: `style/main.css`

- [ ] **Step 1: Remove the STATUS BADGES section**

First, confirm none of the variables being removed are used outside the modal block:

```bash
grep -n "terracotta\|warm-clay\|olive\|status-cr\|status-en\|status-vu\|bg-card\|text-dark\|text-mid\|text-muted-w" style/main.css
```

Expected: all matches are inside the `:root` block or the modal CSS sections only. If any match appears in another section, do not remove that variable.

Delete these lines (they are only used by the old modal):

```css
/* ═══════════════════════════════════════
   STATUS BADGES
═══════════════════════════════════════ */
.badge-CR { background: var(--status-cr); }
.badge-EN { background: var(--status-en); }
.badge-VU { background: var(--status-vu); }
```

Also remove the following CSS variables from `:root` (all are only used by the old modal):
```css
  --bg-card:      #FAF7F0;
  --text-dark:    #2C1A10;
  --text-mid:     #5C4033;
  --text-muted-w: #8C7060;
  --terracotta:   #C67B5C;
  --warm-clay:    #B5651D;
  --olive:        #6B7B3C;
  --status-cr:    #c0392b;
  --status-en:    #d4631a;
  --status-vu:    #b8960a;
```

- [ ] **Step 2: Remove the MODAL OVERLAY section**

Delete the entire block from `/* ═══════════════════════════════════════` `MODAL OVERLAY` through the end of `.btn-close:active, .btn-close:hover { ... }` — that is, all of:

```css
/* ═══════════════════════════════════════
   MODAL OVERLAY
═══════════════════════════════════════ */
.modal-overlay { ... }
.modal-overlay[hidden] { ... }
.modal-backdrop { ... }
@keyframes slideUp { ... }
.status-badge { ... }
/* ── Close Button ── */
.btn-close { ... }
.btn-close:active,
.btn-close:hover { ... }
```

- [ ] **Step 3: Remove the Infographic Modal section**

Delete the entire block from `/* ── Infographic Modal ── */` through `.ph-note { ... }` — that is, all of:

```css
/* ── Infographic Modal ── */
.infographic-card { ... }
.infographic-bg { ... }
.infographic-close { ... }
.infographic-close:hover, .infographic-close:active { ... }
.infographic-body { ... }
.infographic-meta { ... }
.infographic-title { ... }
.infographic-sci { ... }
/* ── Placeholder blocks ── */
.infographic-placeholder { ... }
.ph-label { ... }
.ph-grid { ... }
.ph-block { ... }
.ph-block--wide  { ... }
.ph-block--sq    { ... }
.ph-block--short { ... }
@keyframes phPulse { ... }
.ph-note { ... }
```

- [ ] **Step 4: Remove modal references from the RESPONSIVE section**

In the `@media (min-width: 1024px)` block, delete:
```css
  .modal-overlay { align-items: center; }
  .infographic-card { border-radius: 24px; height: 88dvh; }
```
If the block becomes empty after this, delete the entire `@media (min-width: 1024px)` rule.

- [ ] **Step 5: Add fact viewer CSS**

Add the following block after the `.carousel-dot.is-active { ... }` rule and before the RESPONSIVE section:

```css
/* ═══════════════════════════════════════
   FACT VIEWER
═══════════════════════════════════════ */
#fact-viewer {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #000;
  display: flex;
  flex-direction: column;
}

#fact-viewer[hidden] { display: none !important; }

.fv-slide-area {
  flex: 1;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-user-select: none;
  user-select: none;
  min-height: 0;
}

/* ── Image slide ── */
.fv-image-slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fv-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* ── Text slide (fallback) ── */
.fv-text-slide {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  text-align: center;
  background: linear-gradient(160deg, #0a0a0a 0%, #1c1c1c 100%);
}

.fv-species-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-bottom: 20px;
}

.fv-did-you-know {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 14px;
  /* colour applied inline via species.accentColor */
}

.fv-fact-text {
  font-family: 'Lora', serif;
  font-style: italic;
  font-size: clamp(1.1rem, 3.5vw, 1.6rem);
  line-height: 1.65;
  color: #e8e0d0;
  max-width: 560px;
}

/* ── Species name overlay on image slides ── */
.fv-species-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  pointer-events: none;
  z-index: 1;
}

/* ── Close button ── */
.fv-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0,0,0,0.55);
  color: rgba(255,255,255,0.8);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.fv-close:active,
.fv-close:hover { background: rgba(0,0,0,0.82); }

/* ── Bottom bar ── */
.fv-bar {
  flex-shrink: 0;
  height: 48px;
  background: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.fv-dots {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 60px;
}

.fv-dot {
  width: 6px;
  height: 3px;
  border-radius: 2px;
  background: rgba(255,255,255,0.25);
  transition: all 0.25s ease;
}

.fv-dot.is-active {
  width: 18px;
  /* active colour applied inline via species.accentColor */
}

.fv-hint {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.28);
}

.fv-counter {
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255,255,255,0.38);
  font-variant-numeric: tabular-nums;
  min-width: 28px;
  text-align: right;
}
```

- [ ] **Step 6: Open browser and verify styles**

Open `http://localhost:8080`. Expected: carousel renders correctly (modal styles are gone but carousel itself should look unchanged). No layout breakage.

- [ ] **Step 7: Commit**

```bash
git add style/main.css
git commit -m "feat: replace modal CSS with fact viewer styles"
```

---

## Chunk 3: JavaScript

### Task 5: Update data.js — add factImages field

**Files:**
- Modify: `js/data.js`

- [ ] **Step 1: Add `factImages` to each species**

Add `factImages: 0` to all species except pangolin. For pangolin, add `factImages: 2`.

In `data.js`, add the field after the `gameKey` line for each species. The complete set of changes:

```javascript
// turtle — add after gameKey: 'turtle',
factImages: 0,

// elephant — add after gameKey: 'elephant',
factImages: 0,

// orangutan — add after gameKey: 'orangutan',
factImages: 0,

// snow_leopard — add after gameKey: 'snow_leopard',
factImages: 0,

// whale — add after gameKey: 'whale',
factImages: 0,

// pangolin — add after gameKey: 'pangolin',
factImages: 2,

// rhino — add after gameKey: 'rhino',
factImages: 0,

// axolotl — add after gameKey: 'axolotl',
factImages: 0,
```

- [ ] **Step 2: Verify in browser console**

Open `http://localhost:8080`, open DevTools console, run:

```javascript
SPECIES.map(s => s.id + ': ' + s.factImages)
```

Expected: `["turtle: 0", "elephant: 0", "orangutan: 0", "snow_leopard: 0", "whale: 0", "pangolin: 2", "rhino: 0", "axolotl: 0"]`

---

### Task 6: Update app.js — remove old modal code

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Remove old DOM reference declarations (top of file)**

Delete these 7 lines near the top of the IIFE:

```javascript
const detailModal    = document.getElementById('detail-modal');
const detailBackdrop = document.getElementById('detail-backdrop');

const closeDetailBtn  = document.getElementById('close-detail');
```
and
```javascript
const modalArt        = document.getElementById('modal-art');
const modalStatus     = document.getElementById('modal-status');
const modalName       = document.getElementById('modal-name');
const modalScientific = document.getElementById('modal-scientific');
```

- [ ] **Step 2: Remove the openInfographic function**

Delete the entire function:

```javascript
// ── Infographic Modal ────────────────
function openInfographic(sp, idx) {
  pauseLoop();

  // Background image
  modalArt.style.backgroundImage = `url('${PLACEHOLDERS[idx]}')`;

  // Status badge
  modalStatus.textContent = sp.statusLabel;
  modalStatus.className = 'status-badge ' + sp.statusClass;

  // Name + scientific
  modalName.textContent = PANEL_NAMES[sp.id] || sp.name;
  modalScientific.textContent = sp.scientificName;

  detailModal.hidden = false;
  setTimeout(() => closeDetailBtn.focus(), 50);
  document.body.style.overflow = 'hidden';
}
```

- [ ] **Step 3: Remove the closeDetail function and its event listeners**

Delete the entire function and the three event listeners that follow it:

```javascript
function closeDetail() {
  detailModal.hidden = true;
  document.body.style.overflow = '';
  resumeLoop();
}

// ── Event Listeners ──────────────────
closeDetailBtn.addEventListener('click', closeDetail);
detailBackdrop.addEventListener('click', closeDetail);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !detailModal.hidden) closeDetail();
});
```

The `// ── Event Listeners ──` comment and the `// ── Init ──` comment/`renderGallery()` call remain.

- [ ] **Step 4: Update the panel click handler to call openFactViewer**

In `renderGallery()`, find the panel click handler. Change:

```javascript
openInfographic(sp, i);
```

to:

```javascript
openFactViewer(sp);
```

Do the same in the `keydown` handler inside `renderGallery`:

```javascript
// Before:
if (i === currentIndex) openInfographic(sp, i);
// After:
if (i === currentIndex) openFactViewer(sp);
```

- [ ] **Step 5: Verify console is clean**

Open `http://localhost:8080`, open DevTools console.
Expected: **zero** errors. The carousel renders and auto-loops. Tapping an active panel does nothing visible yet (openFactViewer not defined until Task 7), but there should be no `TypeError: Cannot read properties of null` errors from the removed DOM refs.

---

### Task 7: Add fact viewer logic to app.js

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Add fact viewer DOM refs**

After the existing DOM reference block (after the `counterTotal` line), add:

```javascript
  // ── Fact Viewer DOM refs ────────────
  const factViewer  = document.getElementById('fact-viewer');
  const fvSlideArea = document.getElementById('fv-slide-area');
  const fvClose     = document.getElementById('fv-close');
  const fvDots      = document.getElementById('fv-dots');
  const fvHint      = document.getElementById('fv-hint');
  const fvCounter   = document.getElementById('fv-counter');
```

- [ ] **Step 2: Add fact viewer state variables**

After the accordion state block (after `let wasDragging = false;`), add:

```javascript
  // ── Fact Viewer state ───────────────
  let fvSpecies    = null;
  let fvSlideIndex = 0;
  let fvSlideCount = 0;
  let fvIdleTimer  = null;

  const IDLE_TIMEOUT = 60000; // ms — time before auto-closing viewer
```

- [ ] **Step 3: Add the renderSlide function**

Add this function after the `resetLoop` / `resumeLoop` functions (before `renderGallery`):

```javascript
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
```

- [ ] **Step 4: Add fact viewer event listeners**

In the `// ── Event Listeners ──` section (before `renderGallery()`), add:

```javascript
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
```

- [ ] **Step 5: Verify text-mode slides work**

Open `http://localhost:8080`. Tap the active (centre) species panel.
Expected:
- Fact viewer opens fullscreen, dark background
- Species name shown in small caps at top of slide
- Coloured "DID YOU KNOW?" label
- Italic fact text in large serif font
- Bottom bar shows dots, "TAP TO CONTINUE", "1 / 3"
- Tapping slide advances to fact 2, then 3
- On fact 3, hint reads "TAP TO CLOSE"
- Tapping closes viewer and carousel resumes

- [ ] **Step 6: Verify pangolin image-mode slides work**

Navigate carousel to the Sunda Pangolin panel. Tap it.
Expected:
- Fact viewer opens showing `asset/pangolin/fact1.png` as a full-frame image
- Species name overlay visible top-left
- Bottom bar shows 2 dots, "1 / 2"
- Tap advances to fact2.png
- Tap again closes viewer

- [ ] **Step 7: Verify ✕ button closes viewer**

Open any species fact viewer. Tap ✕.
Expected: viewer closes immediately, carousel resumes auto-loop.

- [ ] **Step 8: Verify idle timeout**

Open any species fact viewer, then do not touch for 60 seconds.
Expected: viewer closes automatically and carousel resumes.
*(To test quickly, temporarily set `IDLE_TIMEOUT = 5000` in the console or in code, verify it fires, then restore to 60000.)*

- [ ] **Step 9: Commit**

```bash
git add js/data.js js/app.js
git commit -m "feat: implement fact viewer with image/text slides and idle timeout"
```

---

## Done

All three chunks complete. The fact viewer is live. Verify the full flow one final time:

1. Carousel loads and auto-loops — unchanged.
2. Tap non-active panel → navigates carousel — unchanged.
3. Tap active panel → fact viewer opens.
4. Tap through all facts → viewer closes and carousel resumes.
5. ✕ button closes viewer at any time.
6. 60 seconds idle → viewer closes automatically.
7. Pangolin shows real images; all other species show text cards.
