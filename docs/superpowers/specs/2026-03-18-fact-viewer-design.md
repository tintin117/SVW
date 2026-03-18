# Fact Viewer — Design Spec
**Date:** 2026-03-18
**Project:** Wild Lives Mobile Museum

---

## Overview

Add a fullscreen fact slideshow that opens when a user taps the active species panel in the existing carousel. The carousel layout and behaviour remain completely unchanged. The fact viewer is a new overlay component layered on top.

---

## User Flow

1. User sees the existing vertical swipe carousel (unchanged).
2. User taps the **active (centre) panel** → fact viewer opens fullscreen.
3. User taps anywhere on the screen → advances to the next fact slide.
4. On the **last slide**, tapping closes the viewer and resumes the carousel.
5. The **✕ button** (top-right) closes the viewer at any time.
6. **60 seconds of no interaction** → viewer closes automatically and carousel resumes.

Tapping a non-active panel still navigates the carousel (unchanged).

---

## Components

### `#fact-viewer` overlay

A new fullscreen element added to `index.html` with the `hidden` attribute set by default (matching the existing `#detail-modal` pattern), so it does not flash on page load. JS removes/adds `hidden` to show/close it.

**Structure:**
```
#fact-viewer
  .fv-slide-area        ← tap target for advancing
    .fv-image-slide     ← shown when fact image is available
      img.fv-img
    .fv-text-slide      ← shown when no image (fallback)
      .fv-species-label
      .fv-did-you-know
      .fv-fact-text
  .fv-bar               ← bottom bar (always visible)
    .fv-dots            ← progress dots
    .fv-hint            ← "TAP TO CONTINUE" label
    .fv-counter         ← "1 / 3"
  button.fv-close       ← ✕ top-right
```

**Slide content logic (mutually exclusive modes):**
- If `species.factImages > 0`, the viewer shows **only** image slides: `asset/{species.id}/fact1.png` through `fact{N}.png`. The `facts[]` text array is ignored.
- If `species.factImages === 0` (default), the viewer shows **only** text cards, one per entry in `species.facts[]`.
- There is no mixed mode. A species is always in image mode or text mode. When images are ready for a species, set `factImages` to the correct count and the text cards automatically stop being used.
- `factImages` is a new integer field added to each entry in `data.js` (default: `0`).

**Accent colour:** Each text slide uses `species.accentColor` for the "Did you know?" label and progress dots.

---

## Asset Structure

Each species gets its own folder under `asset/`. Naming convention:

```
asset/
  {species_id}/
    avatar.png       ← carousel panel background image
    fact1.png        ← infographic slide 1
    fact2.png        ← infographic slide 2
    …
```

Species folders to create: `turtle`, `elephant`, `orangutan`, `snow_leopard`, `whale`, `pangolin` (exists), `rhino`, `axolotl`.

The existing loose files `asset/tiger.png` and `asset/saola.png` remain in place — they are still used by the current carousel as placeholders until per-species `avatar.png` files are added. Creating `tiger` and `saola` species folders is out of scope for this work item.

The `asset/pangolin/` subfolder already contains `pangolin.jpg`, `pangolin.png`, `pangolin_fact1.png`, and `pangolin_fact2.png`.

Migration steps for pangolin:
1. Rename `asset/pangolin/pangolin_fact1.png` → `asset/pangolin/fact1.png`
2. Rename `asset/pangolin/pangolin_fact2.png` → `asset/pangolin/fact2.png`
3. Set `factImages: 2` for pangolin in `data.js`

---

## Changes to Existing Files

| File | Change |
|------|--------|
| `index.html` | Add `#fact-viewer` HTML block; remove `#detail-modal` block (lines 47–78) |
| `style/main.css` | Add fact viewer styles; remove all styles for `.modal-overlay`, `.modal-backdrop`, `.infographic-card`, `.infographic-bg`, `.infographic-body`, `.infographic-meta`, `.infographic-title`, `.infographic-sci`, `.infographic-placeholder`, `.ph-*`, `.btn-close`, `.infographic-close`, `.status-badge` |
| `js/app.js` | Add `openFactViewer`, `closeFactViewer`, slide navigation, idle timer; remove `openInfographic`, `closeDetail`, and all DOM bindings for `detailModal`, `detailBackdrop`, `closeDetailBtn`, `modalArt`, `modalStatus`, `modalName`, `modalScientific`; remove event listeners for `closeDetailBtn`, `detailBackdrop`, and the `Escape` keydown handler |
| `js/data.js` | Add `factImages: N` field to each species (0 for all except pangolin = 2) |

---

## Idle Timeout

- **Duration:** 60 seconds (constant `IDLE_TIMEOUT = 60000`, easy to change).
- **Reset trigger:** Any `touchstart` or `mousedown` anywhere in the document while the viewer is open resets the timer. The `click` event on `button.fv-close` also resets the timer before closing (so a slow tap does not race the timeout).
- **On timeout:** `closeFactViewer()` is called — viewer closes, carousel auto-loop resumes.
- The carousel's existing idle/loop logic is unaffected.

## Accessibility

ARIA roles (`role="dialog"`, `aria-modal`, `aria-labelledby`) are intentionally omitted. This is a touch kiosk; screen reader support is not a requirement. If keyboard/assistive support is added later, ARIA roles and a focus trap will need to be revisited at that time.

---

## Carousel Integration

- `openFactViewer` calls `pauseLoop()` (already exists in `app.js`).
- `closeFactViewer` calls `resumeLoop()` (already exists in `app.js`).
- No other changes to carousel logic.

---

## Out of Scope

- No changes to carousel navigation, drag/swipe, or auto-loop behaviour.
- No landing page redesign.
- No per-species avatar images (the carousel keeps using existing placeholder images until provided).
- No back-navigation within the fact viewer (tap always goes forward).
