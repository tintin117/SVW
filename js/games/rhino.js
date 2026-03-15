/* ═══════════════════════════════════════════
   WILD LIVES — Black Rhinoceros
   Game: Memory match — flip cards to find
         rhino pairs. Save as many as you can!
═══════════════════════════════════════════ */

window.GAME_START = function (canvas, onWin, onLose) {
  'use strict';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const sp = window.SPECIES.find(s => s.id === 'rhino');

  let rhinosSaved = 0, flipsLeft = 20, gameOver = false, frame = 0;
  const TARGET_SAVE = 5;
  const particles = [];
  let stopFn;

  // ── Card grid ────────────────────────────
  // 4 cols × 3 rows = 12 cards
  // Content: 5× rhino pairs (10 cards) + 2 threat cards (filler)
  const COLS = 4, ROWS = 3;
  const PADDING = Math.min(W, H) * 0.025;
  const CARD_W = (W - PADDING * (COLS + 1)) / COLS;
  const CARD_H = (H * 0.75 - PADDING * (ROWS + 1)) / ROWS;
  const GRID_OFFSET_Y = H * 0.18;

  const CARD_TYPES = [
    ...Array(5).fill('rhino'), ...Array(5).fill('rhino'),  // 5 rhino pairs
    'threat', 'threat'                                     // 2 threats
  ];

  // Shuffle
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const shuffled = shuffle([...CARD_TYPES]);

  const cards = shuffled.map((type, i) => ({
    col: i % COLS,
    row: Math.floor(i / COLS),
    type,
    state: 'hidden',   // hidden | flipping-open | open | flipping-close | matched | removed
    flipProgress: 0,   // 0 = face-down, 1 = face-up
    wobble: 0,
    pairId: i < 10 ? Math.floor(i / 2) : 10 + i  // unique id per pair
  }));

  // Re-assign pairIds so each pair of rhinos gets same id
  const rhinoCards = cards.filter(c => c.type === 'rhino');
  for (let i = 0; i < rhinoCards.length; i += 2) {
    const pid = i / 2;
    rhinoCards[i].pairId     = pid;
    rhinoCards[i + 1].pairId = pid;
  }
  cards.filter(c => c.type === 'threat').forEach((c, i) => c.pairId = 100 + i);

  let flippedCards = [];
  let lockInput = false;

  function cardRect(c) {
    return {
      x: PADDING + c.col * (CARD_W + PADDING),
      y: GRID_OFFSET_Y + PADDING + c.row * (CARD_H + PADDING),
      w: CARD_W,
      h: CARD_H
    };
  }

  // ── Background ──────────────────────────
  function drawBg() {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0d2010');
    bg.addColorStop(1, '#1a3820');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Savannah silhouette
    ctx.fillStyle = '#2a4010';
    ctx.beginPath();
    ctx.moveTo(0, GRID_OFFSET_Y - 10);
    ctx.lineTo(W * 0.1, GRID_OFFSET_Y * 0.5);
    ctx.lineTo(W * 0.12, GRID_OFFSET_Y - 10);
    ctx.lineTo(W * 0.35, GRID_OFFSET_Y * 0.4);
    ctx.lineTo(W * 0.37, GRID_OFFSET_Y - 10);
    ctx.lineTo(W * 0.6, GRID_OFFSET_Y * 0.55);
    ctx.lineTo(W * 0.62, GRID_OFFSET_Y - 10);
    ctx.lineTo(W * 0.85, GRID_OFFSET_Y * 0.45);
    ctx.lineTo(W * 0.87, GRID_OFFSET_Y - 10);
    ctx.lineTo(W, GRID_OFFSET_Y - 10);
    ctx.fill();
  }

  // ── Draw a card ──────────────────────────
  function drawCard(c) {
    const r = cardRect(c);
    if (c.state === 'removed') return;

    // Flip animation: scale X from 0→1 (opening) or 1→0 (closing)
    let displayFlip = c.flipProgress;
    const cx = r.x + r.w / 2;

    ctx.save();
    ctx.translate(cx, r.y + r.h / 2);
    ctx.scale(Math.abs(displayFlip * 2 - 1), 1); // cos-like effect
    ctx.translate(-r.w / 2, -r.h / 2);

    const showFace = displayFlip >= 0.5;

    if (!showFace) {
      // Card back
      GE.roundRect(ctx, 0, 0, r.w, r.h, 12, '#2d6a4f', '#4caf78', 2);
      // Pattern
      ctx.fillStyle = 'rgba(76,175,120,0.2)';
      for (let pi = 0; pi < 6; pi++) {
        for (let pj = 0; pj < 4; pj++) {
          ctx.beginPath();
          ctx.arc(pi * r.w / 5 + 10, pj * r.h / 3 + 10, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // Card face
      let bg = '#f5f0e8', accent = '#3a4a34';
      if (c.state === 'matched') { bg = '#d0f0d8'; accent = '#2d7a4a'; }

      GE.roundRect(ctx, 0, 0, r.w, r.h, 12, bg, accent, 2);

      if (c.type === 'rhino') {
        drawRhinoIcon(ctx, r.w / 2, r.h * 0.42, Math.min(r.w, r.h) * 0.3, c.state === 'matched');
        ctx.fillStyle = c.state === 'matched' ? '#2d7a4a' : '#4a3a2a';
        ctx.font = `bold ${Math.min(r.w, r.h) * 0.13}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText(c.state === 'matched' ? '✓ Saved!' : 'Rhino', r.w / 2, r.h * 0.85);
      } else {
        // Threat card
        ctx.fillStyle = '#c0392b';
        ctx.font = `${Math.min(r.w, r.h) * 0.42}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('⚠', r.w / 2, r.h * 0.58);
        ctx.fillStyle = '#8a3020';
        ctx.font = `bold ${Math.min(r.w, r.h) * 0.11}px system-ui`;
        ctx.fillText('POACHER', r.w / 2, r.h * 0.85);
      }
    }

    ctx.restore();

    // Wobble effect
    if (c.wobble > 0) {
      const wAlpha = c.wobble / 30;
      const wColor = c.type === 'rhino' ? `rgba(76,175,120,${wAlpha})` : `rgba(192,57,43,${wAlpha})`;
      ctx.save();
      ctx.strokeStyle = wColor;
      ctx.lineWidth = 5;
      GE.roundRect(ctx, r.x, r.y, r.w, r.h, 12, null, wColor, 5);
      ctx.restore();
      c.wobble--;
    }
  }

  function drawRhinoIcon(ctx2, cx, cy, s, saved) {
    ctx2.save();
    ctx2.translate(cx, cy);
    const col = saved ? '#2d7a4a' : '#7a6858';
    ctx2.fillStyle = col;
    ctx2.beginPath(); ctx2.ellipse(0, 0, s * 0.9, s * 0.65, 0, 0, Math.PI * 2); ctx2.fill();
    ctx2.beginPath(); ctx2.arc(-s * 0.85, -s * 0.05, s * 0.55, 0, Math.PI * 2); ctx2.fill();
    ctx2.strokeStyle = saved ? '#2a6040' : '#8a5040';
    ctx2.lineWidth = s * 0.12; ctx2.lineCap = 'round';
    ctx2.beginPath(); ctx2.moveTo(-s * 1.2, -s * 0.3); ctx2.lineTo(-s * 1.6, -s * 0.5); ctx2.stroke();
    ctx2.beginPath(); ctx2.moveTo(-s * 1.25, -s * 0.22); ctx2.lineTo(-s * 1.55, -s * 0.32); ctx2.stroke();
    ctx2.restore();
  }

  // ── HUD ──────────────────────────────────
  function drawHUD() {
    ctx.fillStyle = '#f5f0e8';
    ctx.font = `bold ${Math.min(W,H)*0.035}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Black Rhinoceros Memory', W/2, GRID_OFFSET_Y - 30);

    ctx.font = `${Math.min(W,H)*0.027}px system-ui`;
    ctx.fillStyle = '#4caf78';
    ctx.textAlign = 'left';
    ctx.fillText(`🦏 Saved: ${rhinosSaved} / ${TARGET_SAVE}`, 16, GRID_OFFSET_Y - 34);

    ctx.fillStyle = flipsLeft < 6 ? '#e74c3c' : '#f5f0e8';
    ctx.textAlign = 'right';
    ctx.fillText(`Flips left: ${flipsLeft}`, W - 16, GRID_OFFSET_Y - 34);

    if (frame < 140) {
      ctx.fillStyle = 'rgba(245,240,232,0.7)';
      ctx.font = `${Math.min(W,H)*0.026}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('Tap cards to flip them. Match two rhinos to save them!', W/2, H - 18);
    }
  }

  // ── Card flip logic ──────────────────────
  function handleTap(e) {
    e.preventDefault();
    if (lockInput || gameOver) return;
    const pos = GE.getPos(e, canvas);
    for (const c of cards) {
      if (c.state !== 'hidden') continue;
      const r = cardRect(c);
      if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) {
        flipCard(c);
        break;
      }
    }
  }

  function flipCard(c) {
    if (flippedCards.length >= 2) return;
    c.state = 'flipping-open';
    flippedCards.push(c);
    flipsLeft--;

    if (flipsLeft <= 0 && rhinosSaved < TARGET_SAVE) {
      setTimeout(checkGameEnd, 800);
    }
  }

  function checkMatch() {
    const [a, b] = flippedCards;
    if (a.type === 'rhino' && b.type === 'rhino' && a.pairId === b.pairId) {
      // Match!
      a.state = 'matched'; b.state = 'matched';
      a.wobble = 40; b.wobble = 40;
      rhinosSaved++;
      const ra = cardRect(a), rb = cardRect(b);
      GE.burst(particles, ra.x + ra.w/2, ra.y + ra.h/2, 15, ['#4caf78','#d4a227','#fff'], 5, 6);
      GE.burst(particles, rb.x + rb.w/2, rb.y + rb.h/2, 15, ['#4caf78','#d4a227','#fff'], 5, 6);
      setTimeout(() => { a.state = 'removed'; b.state = 'removed'; }, 1200);
      if (rhinosSaved >= TARGET_SAVE) {
        setTimeout(triggerWin, 1400);
      }
    } else {
      // No match
      a.wobble = 30; b.wobble = 30;
      setTimeout(() => {
        a.state = 'flipping-close';
        b.state = 'flipping-close';
      }, 700);
    }
    flippedCards = [];
    lockInput = false;
    checkGameEnd();
  }

  function checkGameEnd() {
    if (gameOver) return;
    if (flipsLeft <= 0 && rhinosSaved < TARGET_SAVE) {
      setTimeout(triggerLose, 500);
    }
  }

  function triggerWin() {
    if (gameOver) return; gameOver = true;
    cancelAnimationFrame(raf);
    stopFn = GE.drawEndScreen(ctx, canvas, true, sp.conservationMessage, sp, onWin);
  }
  function triggerLose() {
    if (gameOver) return; gameOver = true;
    cancelAnimationFrame(raf);
    stopFn = GE.drawEndScreen(ctx, canvas, false,
      `You saved ${rhinosSaved} rhinos! In the 1990s, rangers saved the black rhino from near-extinction. Every rhino saved matters.`, sp, onLose);
  }

  // ── Animation loop ───────────────────────
  let raf;
  const FLIP_SPEED = 0.08;

  function loop() {
    if (gameOver) return;
    frame++;

    // Animate flips
    let readyToCheck = false;
    cards.forEach(c => {
      if (c.state === 'flipping-open') {
        c.flipProgress = Math.min(1, c.flipProgress + FLIP_SPEED);
        if (c.flipProgress >= 1) {
          c.state = 'open';
          if (flippedCards.length === 2 &&
              flippedCards[0].state === 'open' &&
              flippedCards[1].state === 'open') {
            readyToCheck = true;
            lockInput = true;
          }
        }
      } else if (c.state === 'flipping-close') {
        c.flipProgress = Math.max(0, c.flipProgress - FLIP_SPEED);
        if (c.flipProgress <= 0) c.state = 'hidden';
      }
    });

    if (readyToCheck) {
      setTimeout(checkMatch, 300);
    }

    GE.updateParticles(particles, 1);

    drawBg();
    cards.forEach(drawCard);
    GE.drawParticles(ctx, particles);
    drawHUD();

    raf = requestAnimationFrame(loop);
  }

  GE.onInput(canvas, 'down', handleTap);
  raf = requestAnimationFrame(loop);

  return function stop() {
    cancelAnimationFrame(raf);
    if (typeof stopFn === 'function') stopFn();
    GE.offInput(canvas, 'down', handleTap);
  };
};
