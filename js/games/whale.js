/* ═══════════════════════════════════════════
   WILD LIVES — Blue Whale
   Game: Drag to steer the whale through the
         ocean. Dodge plastic & sonar rings.
         Collect krill to power up!
═══════════════════════════════════════════ */

window.GAME_START = function (canvas, onWin, onLose) {
  'use strict';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const sp = window.SPECIES.find(s => s.id === 'whale');

  let lives = 3, krill = 0, distance = 0, gameOver = false, frame = 0;
  const GOAL_DISTANCE = 1200;
  const particles = [];
  const obstacles = [];
  const krillClusters = [];
  const sonarRings = [];
  let stunTimer = 0;
  let stopFn;

  // ── Whale ────────────────────────────────
  const whale = {
    x: W * 0.2,
    y: H / 2,
    targetY: H / 2,
    vy: 0,
    size: Math.min(W, H) * 0.1,
    tailAngle: 0,
    song: 0  // song meter (0–100), collected krill fills it
  };

  // ── Background ──────────────────────────
  function drawOcean() {
    // Surface to deep gradient
    const ocean = ctx.createLinearGradient(0, 0, 0, H);
    ocean.addColorStop(0, '#0a4080');
    ocean.addColorStop(0.3, '#083060');
    ocean.addColorStop(0.7, '#051840');
    ocean.addColorStop(1, '#020810');
    ctx.fillStyle = ocean; ctx.fillRect(0, 0, W, H);

    // Caustic light at surface
    for (let i = 0; i < 15; i++) {
      const lx = ((i * 180 + frame * 1.2) % W);
      const grad = ctx.createRadialGradient(lx, 0, 0, lx, 0, H * 0.18);
      grad.addColorStop(0, 'rgba(60,160,240,0.08)');
      grad.addColorStop(1, 'rgba(60,160,240,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(lx - H*0.18, 0, H*0.36, H*0.3);
    }

    // Bioluminescent particles (deep zone)
    for (let i = 0; i < 25; i++) {
      const bx = ((i * 157 + frame * 0.5) % W);
      const by = H * 0.6 + ((i * 113) % (H * 0.4));
      const ba = 0.2 + Math.sin(frame * 0.05 + i) * 0.15;
      ctx.fillStyle = `rgba(60,220,200,${ba})`;
      ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2); ctx.fill();
    }

    // Surface shimmer
    ctx.strokeStyle = 'rgba(100,200,255,0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const wy = H * 0.04 + i * H * 0.015;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 20) {
        ctx.lineTo(x, wy + Math.sin(x * 0.04 + frame * 0.03 + i) * H * 0.008);
      }
      ctx.stroke();
    }
  }

  // ── Obstacles ────────────────────────────
  function spawnObstacle() {
    const type = Math.random() < 0.5 ? 'plastic' : 'anchor';
    obstacles.push({
      type,
      x: W + 40,
      y: GE.randBetween(H * 0.08, H * 0.9),
      vx: GE.randBetween(-3.2, -2.0),
      rot: 0,
      rotV: GE.randBetween(-0.03, 0.03),
      size: Math.min(W,H) * (type === 'plastic' ? 0.04 : 0.05)
    });
  }

  function spawnSonar() {
    sonarRings.push({ x: W + 20, y: GE.randBetween(H*0.1, H*0.9), r: 20, maxR: H*0.45, life: 1 });
  }

  function spawnKrill() {
    const cx = W + 30, cy = GE.randBetween(H * 0.15, H * 0.85);
    for (let i = 0; i < 8; i++) {
      krillClusters.push({
        x: cx + GE.randBetween(-30, 30),
        y: cy + GE.randBetween(-20, 20),
        vx: GE.randBetween(-1.8, -1.0),
        size: 3.5
      });
    }
  }

  function drawObstacles() {
    obstacles.forEach(o => {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate(o.rot);
      if (o.type === 'plastic') {
        ctx.strokeStyle = 'rgba(200,200,255,0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -o.size);
        ctx.bezierCurveTo(o.size, -o.size, o.size*1.2, o.size*0.5, 0, o.size);
        ctx.bezierCurveTo(-o.size*1.2, o.size*0.5, -o.size, -o.size, 0, -o.size);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(-o.size*0.3, -o.size, o.size*0.25, Math.PI, 0); ctx.stroke();
        ctx.beginPath(); ctx.arc(o.size*0.3, -o.size, o.size*0.25, Math.PI, 0); ctx.stroke();
      } else {
        // Anchor chain
        ctx.strokeStyle = '#8090a0';
        ctx.lineWidth = 3;
        for (let i = 0; i < 5; i++) {
          const cy2 = -o.size * 1.5 + i * o.size * 0.6;
          ctx.beginPath();
          ctx.arc(0, cy2, o.size * 0.22, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.strokeStyle = '#607080';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, -o.size * 1.5); ctx.lineTo(0, o.size * 1.5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-o.size * 0.6, o.size); ctx.lineTo(o.size * 0.6, o.size); ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawSonarRings() {
    sonarRings.forEach(s => {
      ctx.strokeStyle = `rgba(100,220,255,${s.life * 0.5})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = `rgba(100,220,255,${s.life * 0.25})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 1.3, 0, Math.PI * 2); ctx.stroke();
    });
  }

  function drawKrill() {
    krillClusters.forEach(k => {
      ctx.fillStyle = '#e08020';
      ctx.beginPath(); ctx.arc(k.x, k.y, k.size, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#f0a030';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(k.x - 5, k.y); ctx.lineTo(k.x + 5, k.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(k.x, k.y - 3); ctx.lineTo(k.x - 5, k.y + 4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(k.x, k.y - 3); ctx.lineTo(k.x + 5, k.y + 4); ctx.stroke();
    });
  }

  // ── Whale drawing ─────────────────────────
  function drawWhale() {
    ctx.save();
    ctx.translate(whale.x, whale.y);

    if (stunTimer > 0) {
      ctx.globalAlpha = 0.4 + Math.sin(frame * 0.5) * 0.3;
    }

    const s = whale.size;
    whale.tailAngle = Math.sin(frame * 0.08) * 0.3;

    // Body
    ctx.fillStyle = '#2c78c8';
    ctx.beginPath();
    ctx.moveTo(-s * 0.9, 0);
    ctx.bezierCurveTo(-s * 0.9, -s * 0.35, s * 0.5, -s * 0.38, s * 0.85, 0);
    ctx.bezierCurveTo(s * 0.5, s * 0.38, -s * 0.9, s * 0.35, -s * 0.9, 0);
    ctx.fill();

    // Underbelly
    ctx.fillStyle = '#3890e0';
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, 0);
    ctx.bezierCurveTo(-s * 0.7, -s * 0.2, s * 0.3, -s * 0.22, s * 0.7, 0);
    ctx.bezierCurveTo(s * 0.3, s * 0.22, -s * 0.7, s * 0.2, -s * 0.7, 0);
    ctx.fill();

    // Tail flukes (animated)
    ctx.save();
    ctx.translate(s * 0.85, 0);
    ctx.rotate(whale.tailAngle);
    ctx.fillStyle = '#2060a0';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s*0.25, -s*0.12, s*0.4, -s*0.25, s*0.3, -s*0.38);
    ctx.lineTo(s*0.05, -s*0.08);
    ctx.lineTo(s*0.05, s*0.08);
    ctx.lineTo(s*0.3, s*0.38);
    ctx.bezierCurveTo(s*0.4, s*0.25, s*0.25, s*0.12, 0, 0);
    ctx.fill();
    ctx.restore();

    // Pectoral fin
    ctx.fillStyle = '#1a60b0';
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, s * 0.15);
    ctx.bezierCurveTo(-s * 0.4, s * 0.5, -s * 0.5, s * 0.45, -s * 0.5, s * 0.55);
    ctx.bezierCurveTo(-s * 0.2, s * 0.35, 0, s * 0.2, -s * 0.2, s * 0.15);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#0a1a2a';
    ctx.beginPath(); ctx.arc(-s * 0.6, -s * 0.12, s * 0.07, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath(); ctx.arc(-s * 0.62, -s * 0.14, s * 0.03, 0, Math.PI * 2); ctx.fill();

    // Blowhole
    if (frame % 120 < 8) {
      ctx.fillStyle = 'rgba(200,240,255,0.7)';
      ctx.beginPath(); ctx.arc(-s * 0.25, -s * 0.38, 4, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = 'rgba(200,240,255,0.4)';
        ctx.beginPath();
        ctx.arc(-s * 0.25 + GE.randBetween(-8,8), -s * 0.38 - 8 - i * 6, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // ── Song meter ────────────────────────────
  function drawSongMeter() {
    const mw = Math.min(W * 0.25, 150), mh = 12;
    const mx = 14, my = H - 42;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    GE.roundRect(ctx, mx - 2, my - 2, mw + 4, mh + 4, 6, 'rgba(0,0,0,0.4)');
    GE.roundRect(ctx, mx, my, mw, mh, 4, '#082040');
    if (whale.song > 0) {
      const fill = (whale.song / 100) * mw;
      GE.roundRect(ctx, mx, my, fill, mh, 4, '#4cdfff');
    }
    ctx.fillStyle = '#b0e8ff';
    ctx.font = `${Math.min(W,H)*0.024}px system-ui`;
    ctx.textAlign = 'left';
    ctx.fillText('🎵 Song', mx, my - 5);
  }

  // ── Progress bar ─────────────────────────
  function drawProgress() {
    const pw = Math.min(W * 0.5, 300), ph = 14;
    const px = (W - pw) / 2, py = 14;
    GE.roundRect(ctx, px, py, pw, ph, 7, 'rgba(0,0,0,0.4)');
    GE.roundRect(ctx, px, py, (distance / GOAL_DISTANCE) * pw, ph, 7, '#2c78c8');
    ctx.fillStyle = '#f5f0e8';
    ctx.font = `bold ${Math.min(W,H)*0.027}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText(`Ocean crossing: ${Math.round((distance / GOAL_DISTANCE) * 100)}%`, W/2, py + ph - 2);

    GE.drawLives(ctx, lives, 3, W - 76, 36, 16);
  }

  // ── Game logic ────────────────────────────
  function update() {
    distance += 2;
    if (distance >= GOAL_DISTANCE) { triggerWin(); return; }

    // Whale vertical movement
    if (stunTimer <= 0) {
      whale.vy += (whale.targetY - whale.y) * 0.06;
    } else {
      whale.vy += (H / 2 - whale.y) * 0.04;
      stunTimer--;
    }
    whale.vy *= 0.85;
    whale.y = GE.clamp(whale.y + whale.vy, whale.size * 0.6, H - whale.size * 0.6);

    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x += obstacles[i].vx;
      obstacles[i].rot += obstacles[i].rotV;
      if (obstacles[i].x < -60) { obstacles.splice(i, 1); continue; }

      // Collision
      if (stunTimer <= 0 && GE.dist(whale, obstacles[i]) < whale.size * 0.55 + obstacles[i].size * 1.1) {
        obstacles.splice(i, 1);
        lives--;
        stunTimer = 90;
        GE.burst(particles, whale.x, whale.y, 20, ['#e74c3c','#fff','#ff8c00'], 5, 6);
        if (lives <= 0) { triggerLose(); return; }
      }
    }

    // Sonar rings
    for (let i = sonarRings.length - 1; i >= 0; i--) {
      sonarRings[i].r += 3.5;
      sonarRings[i].x -= 1.8;
      sonarRings[i].life = 1 - sonarRings[i].r / sonarRings[i].maxR;
      if (sonarRings[i].r >= sonarRings[i].maxR) { sonarRings.splice(i, 1); continue; }
      // Stun check
      if (stunTimer <= 0 && GE.dist(whale, sonarRings[i]) < sonarRings[i].r + whale.size * 0.4 &&
          GE.dist(whale, sonarRings[i]) > sonarRings[i].r - whale.size * 0.4) {
        stunTimer = 60;
        GE.burst(particles, whale.x, whale.y, 10, ['#60e0ff','#fff'], 3, 4);
      }
    }

    // Krill
    for (let i = krillClusters.length - 1; i >= 0; i--) {
      krillClusters[i].x += krillClusters[i].vx;
      if (krillClusters[i].x < -20) { krillClusters.splice(i, 1); continue; }
      if (GE.dist(whale, krillClusters[i]) < whale.size * 0.55 + 8) {
        krillClusters.splice(i, 1);
        krill++;
        whale.song = Math.min(100, whale.song + 12);
        GE.burst(particles, whale.x, whale.y - 10, 5, ['#e08020','#f0a030'], 2, 3);
        // Song power-up: clear nearby obstacles
        if (whale.song >= 100) {
          whale.song = 0;
          obstacles.splice(0, obstacles.length);
          GE.burst(particles, W/2, H/2, 40, ['#4cdfff','#fff','#60e0ff'], 7, 7);
        }
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
      'The ocean is full of dangers! Collecting krill fills your song meter — a full song clears all obstacles!', sp, onLose);
  }

  // ── Game loop ────────────────────────────
  let raf;

  function loop() {
    if (gameOver) return;
    frame++;

    if (frame % 90 === 0) spawnObstacle();
    if (frame % 130 === 0) spawnSonar();
    if (frame % 75 === 0) spawnKrill();

    GE.updateParticles(particles, 1);
    update();

    drawOcean();
    drawSonarRings();
    drawKrill();
    drawObstacles();
    GE.drawParticles(ctx, particles);
    drawWhale();
    drawSongMeter();
    drawProgress();

    if (frame < 140) {
      ctx.fillStyle = 'rgba(245,240,232,0.75)';
      ctx.font = `${Math.min(W,H)*0.028}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('Drag to steer up/down! Collect krill to fill the song meter.', W/2, H - 22);
    }

    raf = requestAnimationFrame(loop);
  }

  // ── Input ────────────────────────────────
  function handleInput(e) {
    e.preventDefault();
    const pos = GE.getPos(e, canvas);
    whale.targetY = pos.y;
  }

  GE.onInput(canvas, 'down', handleInput);
  GE.onInput(canvas, 'move', handleInput);

  raf = requestAnimationFrame(loop);

  return function stop() {
    cancelAnimationFrame(raf);
    if (typeof stopFn === 'function') stopFn();
    GE.offInput(canvas, 'down', handleInput);
    GE.offInput(canvas, 'move', handleInput);
  };
};
