/* ═══════════════════════════════════════════
   WILD LIVES — Sunda Pangolin
   Game: Roll to safety! Dodge the poacher.
         Tap left/right to roll the pangolin.
         Reach the forest sanctuary!
═══════════════════════════════════════════ */

window.GAME_START = function (canvas, onWin, onLose) {
  'use strict';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const sp = window.SPECIES.find(s => s.id === 'pangolin');

  let distance = 0, collected = 0, gameOver = false, frame = 0;
  const GOAL = 900;
  const particles = [];
  const termites = [];
  let stopFn;

  // ── Terrain ──────────────────────────────
  const TERRAIN_POINTS = 40;
  let terrainOffset = 0;

  function getTerrainY(worldX) {
    const base = H * 0.72;
    return base
      + Math.sin(worldX * 0.008) * H * 0.07
      + Math.sin(worldX * 0.018 + 1) * H * 0.04
      + Math.sin(worldX * 0.035 + 3) * H * 0.03;
  }

  function getTerrainSlopeAt(worldX) {
    const dx = 5;
    return (getTerrainY(worldX + dx) - getTerrainY(worldX - dx)) / (dx * 2);
  }

  // ── Pangolin ─────────────────────────────
  const pang = {
    screenX: W * 0.28,
    worldX: 0,
    y: 0,
    vy: 0,
    vx: 0,
    rolling: false,
    rollAngle: 0,
    size: Math.min(W, H) * 0.065
  };
  pang.y = getTerrainY(pang.worldX) - pang.size;

  // ── Poacher ──────────────────────────────
  const poacher = {
    worldX: -W * 0.7,
    speed: 1.6
  };

  // ── Input state ──────────────────────────
  let pushLeft = false, pushRight = false;

  // ── Background ──────────────────────────
  function drawBg() {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#1a3a10');
    sky.addColorStop(1, '#3a6a20');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // Distant forest silhouette
    const forestOffX = -(distance * 0.15) % W;
    for (let rep = -1; rep <= 1; rep++) {
      ctx.fillStyle = '#1a4a0a';
      for (let i = 0; i < 12; i++) {
        const tx = forestOffX + rep * W + i * (W/11);
        const th = H * 0.28 + Math.sin(i * 1.7) * H * 0.1;
        ctx.beginPath();
        ctx.moveTo(tx, H * 0.55);
        ctx.lineTo(tx - 22, H * 0.55 - th);
        ctx.lineTo(tx + 22, H * 0.55 - th);
        ctx.closePath(); ctx.fill();
        ctx.fillRect(tx - 6, H * 0.55 - th, 12, th);
      }
    }

    // Sanctuary (destination) — far right
    const sanctX = pang.screenX + (GOAL - distance);
    if (sanctX < W + 100) {
      const sx = Math.min(sanctX, W + 80);
      ctx.fillStyle = '#2a6a10';
      ctx.beginPath();
      ctx.arc(sx, H * 0.6, 70, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a8a20';
      ctx.beginPath();
      ctx.arc(sx - 30, H * 0.65, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + 35, H * 0.68, 44, 0, Math.PI * 2);
      ctx.fill();
      // Entrance
      ctx.fillStyle = '#4a2808';
      ctx.fillRect(sx - 18, H * 0.65, 36, 55);
      ctx.fillStyle = '#1a0a00';
      ctx.beginPath(); ctx.arc(sx, H * 0.65, 18, Math.PI, 0); ctx.fill();
      // Label
      ctx.fillStyle = '#d4a227';
      ctx.font = `bold ${Math.min(W,H)*0.028}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('SANCTUARY', sx, H * 0.6 - 75);
    }
  }

  // ── Terrain drawing ──────────────────────
  function drawTerrain() {
    ctx.fillStyle = '#5a3a10';
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let i = 0; i <= TERRAIN_POINTS; i++) {
      const sx = (i / TERRAIN_POINTS) * W;
      const worldX = distance + sx - pang.screenX;
      ctx.lineTo(sx, getTerrainY(worldX));
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();

    // Grass top
    ctx.strokeStyle = '#4a8020';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= TERRAIN_POINTS; i++) {
      const sx = (i / TERRAIN_POINTS) * W;
      const worldX = distance + sx - pang.screenX;
      if (i === 0) ctx.moveTo(sx, getTerrainY(worldX));
      else ctx.lineTo(sx, getTerrainY(worldX));
    }
    ctx.stroke();
  }

  // ── Termite mounds ────────────────────────
  function spawnTermite() {
    const worldX = distance + W * 1.1;
    termites.push({
      worldX,
      size: 14,
      collected: false
    });
  }

  function drawTermites() {
    termites.forEach(t => {
      const sx = pang.screenX + (t.worldX - distance);
      if (sx < -20 || sx > W + 20) return;
      const ty = getTerrainY(t.worldX) - 5;
      ctx.fillStyle = '#8a6020';
      ctx.beginPath();
      ctx.ellipse(sx, ty, t.size, t.size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd090';
      ctx.font = `${Math.min(W,H)*0.022}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('🐜', sx, ty - 4);
    });
  }

  // ── Pangolin drawing ─────────────────────
  function drawPangolin() {
    const py = getTerrainY(pang.worldX) - pang.size;
    pang.y = py;

    ctx.save();
    ctx.translate(pang.screenX, py);

    const s = pang.size;
    pang.rollAngle += (pang.vx > 0 ? 0.06 : pang.vx < 0 ? -0.06 : 0);

    ctx.rotate(pang.rollAngle);

    // Body circle (rolled up)
    ctx.fillStyle = '#a8845c';
    ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();

    // Scale segments (pie slices)
    ctx.strokeStyle = '#6b5030'; ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r1 = s * 0.35, r2 = s;
      const alternating = i % 2 === 0 ? '#8a6840' : '#a8845c';
      ctx.beginPath();
      ctx.moveTo(r1 * Math.cos(a), r1 * Math.sin(a));
      ctx.arc(0, 0, r2, a, a + Math.PI / 8);
      ctx.arc(0, 0, r1, a + Math.PI / 8, a, true);
      ctx.closePath();
      ctx.fillStyle = alternating; ctx.fill();
      ctx.stroke();
    }

    // Center eye
    ctx.fillStyle = '#1a1000';
    ctx.beginPath(); ctx.arc(s * 0.45, 0, s * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(s * 0.43, -s * 0.04, s * 0.05, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  // ── Poacher drawing ──────────────────────
  function drawPoacher() {
    const sx = pang.screenX + (poacher.worldX - pang.worldX);
    if (sx < -80 || sx > W + 80) return;

    const py2 = getTerrainY(poacher.worldX);
    ctx.save();
    ctx.translate(sx, py2 - 10);
    ctx.scale(pang.worldX > poacher.worldX ? 1 : -1, 1); // face toward pangolin

    const walkA = Math.sin(frame * 0.18) * 0.35;
    ctx.fillStyle = '#2a2a2a';

    // Body
    ctx.fillRect(-8, -50, 16, 30);
    // Head
    ctx.beginPath(); ctx.arc(0, -58, 12, 0, Math.PI * 2); ctx.fill();
    // Hat
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-14, -68, 28, 6);
    ctx.fillRect(-8, -80, 16, 14);
    // Arms
    ctx.fillStyle = '#2a2a2a';
    ctx.save(); ctx.rotate(walkA); ctx.fillRect(8, -50, 6, 25); ctx.restore();
    ctx.save(); ctx.rotate(-walkA); ctx.fillRect(-14, -50, 6, 25); ctx.restore();
    // Legs
    ctx.save(); ctx.rotate(walkA * 0.8); ctx.fillRect(-8, -20, 7, 22); ctx.restore();
    ctx.save(); ctx.rotate(-walkA * 0.8); ctx.fillRect(1, -20, 7, 22); ctx.restore();

    // Exclamation if close
    const d = Math.abs(pang.worldX - poacher.worldX);
    if (d < W * 0.5) {
      ctx.fillStyle = '#e74c3c';
      ctx.font = `bold ${Math.min(W,H)*0.04}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -88);
    }

    ctx.restore();
  }

  // ── HUD ──────────────────────────────────
  function drawHUD() {
    const pw = Math.min(W * 0.55, 320), ph = 16;
    const px = (W - pw) / 2, py = 14;
    GE.roundRect(ctx, px, py, pw, ph, 8, 'rgba(0,0,0,0.4)');
    GE.roundRect(ctx, px, py, (distance / GOAL) * pw, ph, 8, '#4caf78');
    ctx.fillStyle = '#f5f0e8';
    ctx.font = `bold ${Math.min(W,H)*0.027}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText(`To sanctuary: ${Math.max(0, Math.round(GOAL - distance))}m`, W/2, py + ph - 3);

    ctx.fillStyle = '#f5f0e8';
    ctx.font = `${Math.min(W,H)*0.027}px system-ui`;
    ctx.textAlign = 'left';
    ctx.fillText(`🐜 ${collected}`, 16, 38);

    if (frame < 150) {
      ctx.fillStyle = 'rgba(245,240,232,0.8)';
      ctx.font = `${Math.min(W,H)*0.028}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('Tap left/right to roll! Collect termite mounds.', W/2, H - 22);
    }
  }

  // ── Win / Lose ────────────────────────────
  function triggerWin() {
    if (gameOver) return; gameOver = true;
    cancelAnimationFrame(raf);
    stopFn = GE.drawEndScreen(ctx, canvas, true, sp.conservationMessage, sp, onWin);
  }
  function triggerLose() {
    if (gameOver) return; gameOver = true;
    cancelAnimationFrame(raf);
    stopFn = GE.drawEndScreen(ctx, canvas, false,
      'The poacher caught up! Keep rolling and don\'t slow down. Every pangolin deserves to reach safety.', sp, onLose);
  }

  // ── Game loop ────────────────────────────
  let raf;

  function loop() {
    if (gameOver) return;
    frame++;

    // Input to velocity
    const slope = getTerrainSlopeAt(pang.worldX);
    const gravity = slope * 4;

    if (pushRight) pang.vx += 1.8;
    else if (pushLeft) pang.vx -= 1.8;

    pang.vx += gravity; // roll downhill naturally
    pang.vx *= 0.88;    // friction
    pang.vx = GE.clamp(pang.vx, -8, 10);

    // Move pangolin
    pang.worldX += pang.vx;
    distance = Math.max(distance, pang.worldX);

    // Poacher chases, speeds up if pangolin is slow
    const catchupExtra = pang.vx < 1 ? 0.8 : 0;
    poacher.worldX += poacher.speed + catchupExtra + (distance / GOAL) * 0.8;

    // Caught?
    if (poacher.worldX >= pang.worldX - pang.size * 0.5) {
      triggerLose(); return;
    }

    // Spawn termites periodically
    if (frame % 95 === 0) spawnTermite();

    // Collect termites
    for (let i = termites.length - 1; i >= 0; i--) {
      const t = termites[i];
      const sx = pang.screenX + (t.worldX - distance);
      if (sx < -30) { termites.splice(i, 1); continue; }
      const ty = getTerrainY(t.worldX);
      const pd = GE.dist({x: pang.screenX, y: getTerrainY(pang.worldX) - pang.size},
                          {x: sx, y: ty});
      if (pd < pang.size + t.size && !t.collected) {
        t.collected = true;
        collected++;
        GE.burst(particles, pang.screenX, pang.y, 10, ['#ffd090','#8a6020','#d4a227'], 3, 4);
        termites.splice(i, 1);
      }
    }

    // Goal
    if (distance >= GOAL) { triggerWin(); return; }

    GE.updateParticles(particles, 1);

    drawBg();
    drawTerrain();
    drawTermites();
    drawPoacher();
    GE.drawParticles(ctx, particles);
    drawPangolin();
    drawHUD();

    raf = requestAnimationFrame(loop);
  }

  // ── Input ────────────────────────────────
  function handleDown(e) {
    e.preventDefault();
    const pos = GE.getPos(e, canvas);
    if (pos.x < W / 2) pushLeft = true;
    else pushRight = true;
  }
  function handleUp(e) {
    e.preventDefault();
    const pos = GE.getPos(e, canvas);
    if (pos.x < W / 2) pushLeft = false;
    else pushRight = false;
  }

  GE.onInput(canvas, 'down', handleDown);
  GE.onInput(canvas, 'up', handleUp);

  // Keyboard fallback
  function handleKey(e) {
    if (e.type === 'keydown') {
      if (e.key === 'ArrowLeft')  pushLeft  = true;
      if (e.key === 'ArrowRight') pushRight = true;
    } else {
      if (e.key === 'ArrowLeft')  pushLeft  = false;
      if (e.key === 'ArrowRight') pushRight = false;
    }
  }
  window.addEventListener('keydown', handleKey);
  window.addEventListener('keyup', handleKey);

  raf = requestAnimationFrame(loop);

  return function stop() {
    cancelAnimationFrame(raf);
    if (typeof stopFn === 'function') stopFn();
    GE.offInput(canvas, 'down', handleDown);
    GE.offInput(canvas, 'up', handleUp);
    window.removeEventListener('keydown', handleKey);
    window.removeEventListener('keyup', handleKey);
  };
};
