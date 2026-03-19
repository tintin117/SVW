# Interactive Infographic Design Spec
**Date:** 2026-03-19
**Project:** Wild Lives — Museum Kiosk

## Overview

Replace the current static fact viewer (text slides / image slides) with the interactive infographic from `/asset/app`. Only the Sunda Pangolin (Java Pangolin) has real data. All other 7 carousel species become fully generic placeholders.

## Scope of Changes

### 1. `js/data.js`

**Pangolin entry:**
- Remove: `facts`, `factImages`, `conservationMessage`
- Add: `screens` array — 7 items taken directly from `/asset/app/app.js`:
  ```
  { id, label, heading, subheading, instruction }
  ```
  Screens: Discover → Ecosystem → Threats → Impact 1 → Impact 2 → Impact 3 → Human Role

**Other 7 species:**
- Replace all fields with generic placeholders:
  ```js
  { id: 'placeholder_N', name: 'Placeholder', scientificName: 'Coming Soon',
    status: 'TBD', statusLabel: 'Coming Soon', statusClass: '',
    accentColor: '#888', threat: 'Coming soon.', isPlaceholder: true }
  ```
- No species names, SVG art, facts, habitat, population, or game data.
- The `PANEL_NAMES` map in `js/app.js` is updated to include keys `placeholder_1` through `placeholder_7` all mapping to `'Placeholder'`. This is intentional — all 7 carousel slots are visually labelled "Placeholder" to signal work-in-progress to reviewers.

### 2. `js/app.js`

**Remove entirely:** `renderSlide()`, and the `fvSlideCount` / `factImages` / `facts` code path in `openFactViewer`. The old text-slide and image-slide rendering is gone.

**`openFactViewer(sp)` — two branches only:**
- If `sp.isPlaceholder`: set an internal screen count of 1, render a "Coming Soon" screen, close on tap.
- If `sp.screens`: render the interactive infographic using `sp.screens`.

**State management:** Replace `fvSlideIndex` and `fvSlideCount` with two module-level variables: `fvScreenIndex` (current step, integer) and `fvScreenCount` (total steps, integer). These are set in `openFactViewer` and read by `renderInfographicScreen`.

**`openFactViewer(sp)` — two branches only:**
- If `sp.isPlaceholder`: set `fvScreenIndex = 0`, `fvScreenCount = 1`, inject `.infographic-placeholder` div inside `fv-slide-area` with a "Coming Soon" message. Clicking `fv-slide-area` closes the viewer.
- If `sp.screens`: set `fvScreenIndex = 0`, `fvScreenCount = sp.screens.length`, call `renderInfographicScreen(sp, 0)`.

**`fv-bar` visibility:** Hide the entire `fv-bar` div (`hidden` attribute) when opening the viewer (both modes). Leave it hidden permanently — it is not restored on close, as the old dots/hint/counter are no longer used.

**New `renderInfographicScreen(sp, index)`:**
Replaces `fv-slide-area` innerHTML each call with:
- **Hero area** (flex row):
  - Left column: small label (`sp.name`), large heading (`sp.screens[index].heading`), body text (`sp.screens[index].subheading`), instruction hint (`sp.screens[index].instruction`)
  - Right column: `<img>` from `sp.avatar` (already present on pangolin in data.js)
- **Stepper section**: horizontal progress bar track + a row of circular nodes (one per step). Nodes before `index` are "completed", node at `index` is "active". Progress bar width = `(index / (fvScreenCount - 1)) * 100%`. Progress bar fill and active node glow use `sp.accentColor`.
- **Nav pills row**: one `<button>` per screen, labelled with `sp.screens[i].label`. Active pill background = `sp.accentColor`. Each pill's click handler calls `e.stopPropagation()` then `renderInfographicScreen(sp, i)`.

**Image micro-animation:** After rendering, apply per-step transform to the `<img>`: `scale(${1 + index * 0.02}) rotate(${index * 1.5}deg)` with `transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1)` — copied verbatim from `/asset/app/app.js` `updateStepperAndNav`.

Navigation:
- Clicking a nav pill jumps to that screen (propagation stopped — does not trigger advance)
- Clicking anywhere else in `fv-slide-area` advances to the next screen (`fvScreenIndex++`); at the last screen, closes the viewer
- `fv-close` button always closes

**Color usage:** `sp.accentColor` is applied to: stepper progress bar fill, active step node glow, active nav pill background, instruction text color. The global `--accent-green` CSS variable is not used inside the infographic component.

### 3. `style/main.css`

Add infographic styles scoped under `.infographic`:
- `.infographic` — full-height flex column, fills `fv-slide-area`
- `.infographic-hero` — flex row (text 60% / image 40%), stacks on narrow screens
- `.infographic-title` — large bold heading
- `.infographic-subtitle` — body text, muted
- `.infographic-instruction` — accent-coloured italic hint
- `.infographic-image-wrap` — centred image container with glow
- `.infographic-stepper` — horizontal track + nodes section
- `.infographic-nav` — nav pills bar at bottom
- `.infographic-nav-pill` — pill button; active state background = `sp.accentColor` (applied inline); label text = `screen.label`
- `.infographic-placeholder` — centred "Coming Soon" text message, used by the JS placeholder branch

Visual reference: `/asset/app/style.css` (adapted from 1920×1080 fixed layout to fluid percentage-based layout to work inside the existing full-screen fact viewer overlay). Responsive: `.infographic-hero` switches from `flex-direction: row` to `column` at `768px` viewport width.

### 4. `index.html`

No structural changes. The `fv-slide-area` receives injected HTML from JS as before.

## Out of Scope

- No changes to carousel drag/swipe logic
- No changes to auto-loop behaviour
- No new image assets required (uses existing `asset/pangolin/pangolin.png`)
