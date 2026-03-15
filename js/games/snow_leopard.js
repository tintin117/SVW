/* ═══════════════════════════════════════════
   WILD LIVES — Snow Leopard
   Game: Tap to jump between mountain ledges!
         Collect snowflakes. Don't fall!
═══════════════════════════════════════════ */

window.GAME_START = function (canvas, onWin, onLose) {
  'use strict';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const sp = window.SPECIES.find(s => s.id === 'snow_leopard');

  let lives = 3, score = 0, collected = 0, gameOver = false, frame = 0;
  const TARGET_COLLECT = 10;
  const particles = [];
  const snowflakes = [];
  let stopFn;

  // ── Leopard ──────────────────────────────
  const leo = {
    x: W * 0.18,
    y: 0,          // will be set on first platform
    vy: 0,
    jumping: false,
    jumpCount: 0,
    landedOnId: -1,
    size: Math.min(W, H) * 0.055,
    runCycle: 0
  };

  // ── Platforms ────────────────────────────
  let platforms = [];
  let platformIdCounter = 0;
  const platformW = Math.min(W * 0.22, 140);
  const platformH = 22;
  const scrollSpeed = 2.4;

  function makePlatform(x, y) {
    return {
      id: platformIdCounter++,
      x, y,
      w: platformW + GE.randBetween(-20, 20),
      snowflake: Math.random() < 0.55
    };
  }

  function initPlatforms() {
    // Starting platform right under leopard
    const startY = H * 0.55;
    platforms.push(makePlatform(leo.x - 20, startY));
    leo.y = startY - leo.size;
    leo.landedOnId = platforms[0].id;

    // More platforms to the right
    for (let i = 1; i < 8; i++) {
      const px = W * 0.15 + i * (W * 0.16);
      const py = GE.randBetween(H * 0.35, H * 0.7);
      platforms.push(makePlatform(px, py));
    }
  }

  // ── Background ──────────────────────────
  function drawBg() {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1a2a40');
    sky.addColorStop(0.5, '#3a5878');
    sky.addColorStop(1, '#5a7898');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // Distant mountains (parallax)
    const farOffsetX = -(frame * scrollSpeed * 0.15) % W;
    for (let rep = -1; rep <= 1; rep++) {
      ctx.fillStyle = '#2a3a50';
      ctx.beginPath(); ctx.moveTo(farOffsetX + rep * W, H);
      const peaks = [0, W*0.15, W*0.3, W*0.45, W*0.55, W*0.7, W*0.85, W];
      const heights = [H*0.6, H*0.3, H*0.5, H*0.2, H*0.4, H*0.25, H*0.45, H*0.6];
      peaks.forEach((px, i) => ctx.lineTo(farOffsetX + rep * W + px, heights[i]));
      ctx.lineTo(farOffsetX + rep * W + W, H); ctx.closePath(); ctx.fill();

      // Snow caps
      ctx.fillStyle = 'rgba(240,245,255,0.35)';
      ctx.beginPath(); ctx.moveTo(farOffsetX + rep * W + W*0.45, H*0.2);
      ctx.lineTo(farOffsetX + rep * W + W*0.38, H*0.3); ctx.lineTo(farOffsetX + rep * W + W*0.52, H*0.3); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(farOffsetX + rep * W + W*0.7, H*0.25);
      ctx.lineTo(farOffsetX + rep * W + W*0.63, H*0.35); ctx.lineTo(farOffsetX + rep * W + W*0.77, H*0.35); ctx.closePath(); ctx.fill();
    }

    // Mid mountains
    const midOffsetX = -(frame * scrollSpeed * 0.4) % W;
    for (let rep = -1; rep <= 1; rep++) {
      ctx.fillStyle = '#3a4a60';
      ctx.beginPath(); ctx.moveTo(midOffsetX + rep * W, H);
      for (let x = 0; x <= W; x += W / 6) {
        const my = H * 0.65 + Math.sin(x * 0.008 + 2) * H * 0.18;
        ctx.lineTo(midOffsetX + rep * W + x, my);
      }
      ctx.lineTo(midOffsetX + rep * W + W, H); ctx.closePath(); ctx.fill();
    }

    // Ambient snow particles
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + frame * 0.4) % W);
      const sy = ((i * 79 + frame * 0.8) % H);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ── Draw platforms ───────────────────────
  function drawPlatforms() {
    platforms.forEach(p => {
      // Rocky ledge
      const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + platformH);
      grad.addColorStop(0, '#8899aa');
      grad.addColorStop(1, '#5a6a7a');
      GE.roundRect(ctx, p.x, p.y, p.w, platformH, 6, '#8899aa', '#445566', 1);
      // Snow on top
      ctx.fillStyle = 'rgba(230,240,255,0.7)';
      GE.roundRect(ctx, p.x + 2, p.y, p.w - 4, 7, 4, 'rgba(230,240,255,0.7)');

      // Snowflake collectible
      if (p.snowflake) {
        const sy = p.y - 22;
        const pulse = 1 + Math.sin(frame * 0.08 + p.id) * 0.15;
        ctx.save();
        ctx.translate(p.x + p.w / 2, sy);
        ctx.scale(pulse, pulse);
        ctx.strokeStyle = '#b0d8ff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
          ctx.save();
          ctx.rotate(i * Math.PI / 3);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -12);
          ctx.moveTo(-4, -7); ctx.lineTo(4, -7);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }
    });
  }

  // ── Draw snow leopard ────────────────────
  function drawLeopard() {
    ctx.save();
    ctx.translate(leo.x, leo.y);
    const s = leo.size;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, s * 1.0, s * 0.7, s * 0.15, 0, 0, Math.PI * 2); ctx.fill();

    // Tail (long, curved up)
    const tailSwing = Math.sin(frame * 0.06) * 0.3;
    ctx.strokeStyle = '#ccd4d8'; ctx.lineWidth = s * 0.28; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s * 0.8, 0);
    ctx.quadraticCurveTo(s * 1.4, -s * 0.5, s * 1.6 + tailSwing * 15, -s * 1.1);
    ctx.stroke();

    // Body
    ctx.fillStyle = '#ccd4d8';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.9, s * 0.5, 0, 0, Math.PI * 2); ctx.fill();

    // Spots
    const spotData = [[-s*0.3,-s*0.2],[s*0.1,-s*0.3],[s*0.4,-s*0.1],[s*0.5,s*0.15],
                       [-s*0.6,s*0.1],[-s*0.1,s*0.3],[s*0.2,s*0.2]];
    ctx.fillStyle = 'rgba(100,115,130,0.55)';
    spotData.forEach(([dx,dy]) => {
      ctx.beginPath(); ctx.arc(dx, dy, s*0.12, 0, Math.PI*2); ctx.fill();
    });

    // Legs (running animation)
    leo.runCycle += leo.jumping ? 0.05 : 0.16;
    const leg = Math.sin(leo.runCycle) * s * 0.4;
    ctx.fillStyle = '#b8c0c4';
    ctx.fillRect(-s*0.4, s*0.35, 10, s*0.5 + leg);
    ctx.fillRect(-s*0.1, s*0.35, 10, s*0.5 - leg);
    ctx.fillRect(s*0.25, s*0.35, 10, s*0.5 + leg * 0.6);
    ctx.fillRect(s*0.55, s*0.35, 10, s*0.5 - leg * 0.6);

    // Head
    ctx.fillStyle = '#ccd4d8';
    ctx.beginPath(); ctx.arc(-s * 0.85, -s * 0.25, s * 0.4, 0, Math.PI * 2); ctx.fill();
    // Ears
    ctx.fillStyle = '#b0b8bc';
    ctx.beginPath(); ctx.moveTo(-s*0.95,-s*0.6); ctx.lineTo(-s*1.1,-s*0.82); ctx.lineTo(-s*0.78,-s*0.62); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-s*0.7,-s*0.58); ctx.lineTo(-s*0.6,-s*0.8); ctx.lineTo(-s*0.52,-s*0.58); ctx.closePath(); ctx.fill();
    // Snout
    ctx.fillStyle = '#dde4e8';
    ctx.beginPath(); ctx.ellipse(-s*1.06, -s*0.18, s*0.22, s*0.16, 0, 0, Math.PI*2); ctx.fill();
    // Eye
    ctx.fillStyle = '#3a2810';
    ctx.beginPath(); ctx.arc(-s*0.82, -s*0.32, s*0.1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(-s*0.84, -s*0.34, s*0.04, 0, Math.PI*2); ctx.fill();

    ctx.restore();
  }

  // ── HUD ──────────────────────────────────
  function drawHUD() {
    GE.drawLives(ctx, lives, 3, 16, 16, 20);

    ctx.fillStyle = '#f5f0e8';
    ctx.font = `bold ${Math.min(W,H)*0.032}px system-ui`;
    ctx.textAlign = 'right';
    ctx.fillText(`❄ ${collected} / ${TARGET_COLLECT}`, W - 14, 38);

    if (frame < 120) {
      ctx.fillStyle = 'rgba(245,240,232,0.8)';
      ctx.font = `${Math.min(W,H)*0.028}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('Tap to jump! Double-tap to jump higher.', W/2, H - 22);
    }
  }

  // ── Physics & collision ──────────────────
  function update() {
    // Scroll platforms
    platforms.forEach(p => { p.x -= scrollSpeed; });
    // Remove off-screen
    platforms = platforms.filter(p => p.x + p.w > -20);
    // Spawn new
    const last = platforms[platforms.length - 1];
    if (last && last.x < W) {
      const gapX = GE.randBetween(W * 0.14, W * 0.26);
      const gapY = GE.randBetween(-H * 0.28, H * 0.28);
      const ny = GE.clamp(last.y + gapY, H * 0.2, H * 0.78);
      platforms.push(makePlatform(last.x + last.w + gapX, ny));
    }

    // Gravity
    leo.vy += 0.48;
    leo.y  += leo.vy;

    // Platform landing
    leo.jumping = true;
    for (const p of platforms) {
      if (
        leo.y + leo.size * 0.6 >= p.y &&
        leo.y + leo.size * 0.6 <= p.y + platformH + Math.abs(leo.vy) + 2 &&
        leo.x + leo.size * 0.5 > p.x &&
        leo.x - leo.size * 0.2 < p.x + p.w &&
        leo.vy >= 0
      ) {
        leo.y = p.y - leo.size * 0.6;
        leo.vy = 0;
        leo.jumping = false;
        leo.jumpCount = 0;

        // Collect snowflake
        if (p.snowflake && leo.landedOnId !== p.id) {
          p.snowflake = false;
          collected++;
          GE.burst(particles, leo.x, leo.y - 10, 16,
            ['#b0d8ff','#fff','#90c0ff'], 4, 5);
          if (collected >= TARGET_COLLECT) triggerWin();
        }
        leo.landedOnId = p.id;
        break;
      }
    }

    // Fall off screen
    if (leo.y > H + 60) {
      lives--;
      GE.burst(particles, leo.x, H, 20, ['#e74c3c','#fff'], 4, 5);
      if (lives <= 0) { triggerLose(); return; }
      // Respawn on first platform visible
      const firstVisible = platforms.find(p => p.x > W * 0.1 && p.x < W * 0.5);
      if (firstVisible) {
        leo.x = firstVisible.x + firstVisible.w / 2;
        leo.y = firstVisible.y - leo.size * 0.6;
        leo.vy = 0;
        leo.landedOnId = firstVisible.id;
      }
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
      'The snow leopard needs more space! Try again and collect all snowflakes.', sp, onLose);
  }

  // ── Game loop ────────────────────────────
  let raf;

  function loop() {
    if (gameOver) return;
    frame++;
    GE.updateParticles(particles, 1);
    update();
    drawBg();
    drawPlatforms();
    GE.drawParticles(ctx, particles);
    drawLeopard();
    drawHUD();
    raf = requestAnimationFrame(loop);
  }

  // ── Input ────────────────────────────────
  function handleTap(e) {
    e.preventDefault();
    if (gameOver) return;
    if (leo.jumpCount < 2) {
      leo.vy = leo.jumpCount === 0 ? -12 : -9;
      leo.jumpCount++;
      leo.jumping = true;
    }
  }

  GE.onInput(canvas, 'down', handleTap);

  initPlatforms();
  raf = requestAnimationFrame(loop);

  return function stop() {
    cancelAnimationFrame(raf);
    if (typeof stopFn === 'function') stopFn();
    GE.offInput(canvas, 'down', handleTap);
  };
};
