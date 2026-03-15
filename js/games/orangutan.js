/* ═══════════════════════════════════════════
   WILD LIVES — Bornean Orangutan
   Game: Catch falling seeds and plant trees
         to restore the forest canopy!
═══════════════════════════════════════════ */

window.GAME_START = function (canvas, onWin, onLose) {
  'use strict';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const sp = window.SPECIES.find(s => s.id === 'orangutan');

  let seedsInBasket = 0, canopy = 0, gameOver = false, frame = 0;
  const particles = [];
  const fallingSeeds = [];
  let stopFn;

  // ── Soil patches (planting spots) ────────
  const patches = [
    { x: W * 0.15, stage: 0, growTimer: 0 },
    { x: W * 0.38, stage: 0, growTimer: 0 },
    { x: W * 0.62, stage: 0, growTimer: 0 },
    { x: W * 0.85, stage: 0, growTimer: 0 }
  ];

  // ── Basket (player-controlled) ───────────
  const basket = {
    x: W / 2,
    y: H * 0.72,
    w: Math.min(W * 0.14, 90),
    h: Math.min(H * 0.07, 44)
  };

  let targetX = W / 2;

  // ── Background ──────────────────────────
  function drawBg() {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#4a8acb');
    sky.addColorStop(1, '#7ab8e8');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.55);

    // Deforested hills (brown/barren)
    ctx.fillStyle = '#8a6a3a';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.55);
    ctx.quadraticCurveTo(W * 0.25, H * 0.42, W * 0.5, H * 0.5);
    ctx.quadraticCurveTo(W * 0.75, H * 0.58, W, H * 0.45);
    ctx.lineTo(W, H * 0.55); ctx.lineTo(0, H * 0.55); ctx.closePath(); ctx.fill();

    // Bare ground
    const ground = ctx.createLinearGradient(0, H * 0.55, 0, H);
    ground.addColorStop(0, '#8a6a3a');
    ground.addColorStop(0.4, '#7a5a2a');
    ground.addColorStop(1, '#6a4a1a');
    ctx.fillStyle = ground; ctx.fillRect(0, H * 0.55, W, H * 0.45);

    // Remaining tree stump (right)
    ctx.fillStyle = '#6a3a10';
    ctx.fillRect(W * 0.9, H * 0.5, 28, 80);
    ctx.fillStyle = '#4a2a08';
    ctx.beginPath(); ctx.ellipse(W * 0.9 + 14, H * 0.5, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
  }

  // ── Draw soil patches ────────────────────
  function drawPatches() {
    patches.forEach(p => {
      const py = H * 0.78;
      if (p.stage === 0) {
        // Glowing empty patch
        const glow = (Math.sin(frame * 0.05) * 0.2 + 0.6);
        ctx.fillStyle = `rgba(200,140,60,${glow})`;
        ctx.beginPath(); ctx.ellipse(p.x, py, 30, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#d4a020'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(p.x, py, 34, 15, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#f5f0e8';
        ctx.font = `${Math.min(W,H)*0.028}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillText('🌱', p.x, py + 24);
      } else if (p.stage === 1) {
        // Sapling
        ctx.fillStyle = '#5a3010'; ctx.fillRect(p.x - 4, py - 30, 8, 35);
        ctx.fillStyle = '#4a9040';
        ctx.beginPath(); ctx.arc(p.x, py - 36, 16, 0, Math.PI * 2); ctx.fill();
      } else if (p.stage === 2) {
        // Young tree
        ctx.fillStyle = '#5a3010'; ctx.fillRect(p.x - 8, py - 60, 16, 65);
        ctx.fillStyle = '#3a7830';
        ctx.beginPath(); ctx.arc(p.x, py - 70, 28, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4a9840';
        ctx.beginPath(); ctx.arc(p.x - 14, py - 80, 20, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x + 14, py - 76, 20, 0, Math.PI * 2); ctx.fill();
      } else {
        // Full canopy tree
        ctx.fillStyle = '#4a2808'; ctx.fillRect(p.x - 12, py - 100, 24, 105);
        ctx.fillStyle = '#2a6020';
        ctx.beginPath(); ctx.arc(p.x, py - 110, 44, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3a8030';
        ctx.beginPath(); ctx.arc(p.x - 22, py - 120, 32, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(p.x + 22, py - 115, 32, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#4aaa40';
        ctx.beginPath(); ctx.arc(p.x, py - 130, 24, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  // ── Falling seeds ────────────────────────
  function spawnSeed() {
    fallingSeeds.push({
      x: GE.randBetween(W * 0.05, W * 0.95),
      y: -20,
      vy: GE.randBetween(2, 4),
      vx: GE.randBetween(-0.8, 0.8),
      rot: GE.randBetween(0, Math.PI * 2),
      rotV: GE.randBetween(-0.05, 0.05)
    });
  }

  function drawSeeds() {
    fallingSeeds.forEach(s => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.fillStyle = '#8a6020';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c0a040';
      ctx.beginPath();
      ctx.ellipse(0, -4, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ── Basket ──────────────────────────────
  function drawBasket() {
    const bx = basket.x - basket.w / 2;
    const by = basket.y;
    // Basket body
    ctx.fillStyle = '#8a5020';
    GE.roundRect(ctx, bx, by, basket.w, basket.h, 8, '#8a5020');
    // Weave lines
    ctx.strokeStyle = '#6a3810'; ctx.lineWidth = 1.2;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(bx, by + (basket.h / 4) * i); ctx.lineTo(bx + basket.w, by + (basket.h / 4) * i); ctx.stroke();
    }
    // Seeds in basket
    for (let i = 0; i < Math.min(seedsInBasket, 5); i++) {
      ctx.fillStyle = '#8a6020';
      ctx.beginPath(); ctx.ellipse(bx + 16 + i * 12, by + basket.h * 0.45, 4, 7, 0, 0, Math.PI*2); ctx.fill();
    }
    // Handle
    ctx.strokeStyle = '#8a5020'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(basket.x, by - 8, basket.w * 0.38, Math.PI, 0);
    ctx.stroke();
  }

  // ── Canopy meter ─────────────────────────
  function drawMeter() {
    const mw = Math.min(W * 0.55, 320), mh = 22;
    const mx = (W - mw) / 2, my = 14;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    GE.roundRect(ctx, mx - 2, my - 2, mw + 4, mh + 4, 12, 'rgba(0,0,0,0.4)');
    GE.roundRect(ctx, mx, my, mw, mh, 10, '#2a4a1a');
    const fill = (canopy / 100) * mw;
    if (fill > 0) {
      const grad = ctx.createLinearGradient(mx, 0, mx + fill, 0);
      grad.addColorStop(0, '#2d7a4a');
      grad.addColorStop(1, '#4caf78');
      ctx.fillStyle = grad;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(mx, my, fill, mh, 10) : GE.roundRect(ctx, mx, my, fill, mh, 10, grad);
      ctx.fillStyle = grad; ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#f5f0e8';
    ctx.font = `bold ${Math.min(W,H)*0.026}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText(`Canopy: ${Math.round(canopy)}%  (target: 80%)`, W/2, my + mh - 5);

    // Seeds counter
    ctx.fillStyle = '#f5f0e8';
    ctx.font = `${Math.min(W,H)*0.026}px system-ui`;
    ctx.textAlign = 'left';
    ctx.fillText(`Seeds: ${seedsInBasket}`, 16, my + mh - 5);

    if (frame < 180) {
      ctx.fillStyle = 'rgba(245,240,232,0.75)';
      ctx.font = `${Math.min(W,H)*0.026}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('Catch seeds! Then tap glowing soil to plant.', W/2, H - 22);
    }
  }

  // ── Win / Lose ──────────────────────────
  function triggerWin() {
    if (gameOver) return;
    gameOver = true;
    cancelAnimationFrame(raf);
    stopFn = GE.drawEndScreen(ctx, canvas, true, sp.conservationMessage, sp, onWin);
  }
  function triggerLose() {
    if (gameOver) return;
    gameOver = true;
    cancelAnimationFrame(raf);
    stopFn = GE.drawEndScreen(ctx, canvas, false,
      'The forest needs more trees! Every seed planted helps an orangutan find a home.', sp, onLose);
  }

  // ── Timer ───────────────────────────────
  let timeLeft = 90; // seconds
  let lastSecond = 0;

  // ── Game loop ────────────────────────────
  let raf;

  function loop(ts) {
    if (gameOver) return;
    frame++;

    // Timer
    const sec = Math.floor(ts / 1000);
    if (sec !== lastSecond) {
      lastSecond = sec;
      timeLeft--;
      if (timeLeft <= 0) { triggerLose(); return; }
    }

    // Spawn seeds
    if (frame % 55 === 0) spawnSeed();

    // Move basket to target
    basket.x += (targetX - basket.x) * 0.18;

    // Move seeds
    for (let i = fallingSeeds.length - 1; i >= 0; i--) {
      const s = fallingSeeds[i];
      s.x += s.vx; s.y += s.vy; s.rot += s.rotV;

      // Catch by basket
      if (s.y > basket.y && s.y < basket.y + basket.h &&
          s.x > basket.x - basket.w / 2 && s.x < basket.x + basket.w / 2) {
        fallingSeeds.splice(i, 1);
        seedsInBasket++;
        GE.burst(particles, s.x, basket.y, 8, ['#8a6020','#c0a040','#d4a227'], 2.5, 4);
        continue;
      }
      if (s.y > H + 20) fallingSeeds.splice(i, 1);
    }

    // Grow planted trees over time
    patches.forEach(p => {
      if (p.stage > 0 && p.stage < 3) {
        p.growTimer++;
        if (p.growTimer > 220) { p.stage++; p.growTimer = 0; recalcCanopy(); }
      }
    });

    GE.updateParticles(particles, 1);

    drawBg();
    drawPatches();
    drawSeeds();
    drawBasket();
    GE.drawParticles(ctx, particles);
    drawMeter();

    // Timer display
    ctx.fillStyle = timeLeft < 20 ? '#e74c3c' : '#f5f0e8';
    ctx.font = `bold ${Math.min(W,H)*0.035}px system-ui`;
    ctx.textAlign = 'right';
    ctx.fillText(`${timeLeft}s`, W - 16, 40);

    raf = requestAnimationFrame(loop);
  }

  function recalcCanopy() {
    const total = patches.length * 3;
    const planted = patches.reduce((a, p) => a + p.stage, 0);
    canopy = Math.round((planted / total) * 100);
    if (canopy >= 80) triggerWin();
  }

  // ── Input ────────────────────────────────
  function handleMove(e) {
    e.preventDefault();
    const pos = GE.getPos(e, canvas);
    targetX = GE.clamp(pos.x, basket.w / 2, W - basket.w / 2);
  }

  function handleTap(e) {
    e.preventDefault();
    if (seedsInBasket <= 0) return;
    const pos = GE.getPos(e, canvas);
    const py = H * 0.78;
    // Check if tapped near a patch
    patches.forEach(p => {
      if (p.stage === 0 && Math.abs(pos.x - p.x) < 50 && Math.abs(pos.y - py) < 40) {
        p.stage = 1;
        seedsInBasket--;
        GE.burst(particles, p.x, py, 16, ['#4caf78','#d4a227','#8a6020','#fff'], 4, 5);
        recalcCanopy();
      }
    });
  }

  GE.onInput(canvas, 'move', handleMove);
  GE.onInput(canvas, 'down', handleMove);
  GE.onInput(canvas, 'down', handleTap);

  raf = requestAnimationFrame(loop);

  return function stop() {
    cancelAnimationFrame(raf);
    if (typeof stopFn === 'function') stopFn();
    GE.offInput(canvas, 'move', handleMove);
    GE.offInput(canvas, 'down', handleMove);
    GE.offInput(canvas, 'down', handleTap);
  };
};
