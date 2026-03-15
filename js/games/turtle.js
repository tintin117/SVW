/* ═══════════════════════════════════════════
   WILD LIVES — Green Sea Turtle
   Game: Guide the hatchling to the sea!
   Touch/drag anywhere to steer the turtle.
═══════════════════════════════════════════ */

window.GAME_START = function (canvas, onWin, onLose) {
  'use strict';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const sp = window.SPECIES.find(s => s.id === 'turtle');

  let lives = 3, score = 0, frame = 0, gameOver = false, won = false;
  const particles = [];

  // ── Turtle ──────────────────────────────
  const turtle = {
    x: W / 2, y: H * 0.12,
    vx: 0, vy: 0,
    angle: Math.PI / 2, // facing down (toward water)
    size: Math.min(W, H) * 0.055,
    confused: 0  // confused timer (from hotel lights)
  };

  // Target position (where the player is touching)
  let targetX = W / 2, targetY = H * 0.5;
  let touching = false;

  // ── Obstacles ──────────────────────────
  const crabs    = [];
  const plastics = [];

  function spawnCrab() {
    const fromLeft = Math.random() < 0.5;
    crabs.push({
      x: fromLeft ? -40 : W + 40,
      y: GE.randBetween(H * 0.15, H * 0.7),
      vx: fromLeft ? GE.randBetween(1.2, 2.4) : GE.randBetween(-2.4, -1.2),
      size: Math.min(W, H) * 0.04,
      legAngle: 0
    });
  }

  function spawnPlastic() {
    plastics.push({
      x: GE.randBetween(W * 0.05, W * 0.95),
      y: -30,
      vy: GE.randBetween(0.6, 1.4),
      rot: GE.randBetween(0, Math.PI * 2),
      rotV: GE.randBetween(-0.04, 0.04),
      size: Math.min(W, H) * 0.038
    });
  }

  // ── Hotel lights (danger zones) ─────────
  const hotelLights = [
    { x: W * 0.05, y: H * 0.06, r: Math.min(W, H) * 0.12 },
    { x: W * 0.95, y: H * 0.06, r: Math.min(W, H) * 0.12 }
  ];

  // ── Draw scene ──────────────────────────
  function drawScene() {
    // Night sky
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#080c18');
    sky.addColorStop(1, '#12203a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H * 0.55);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137.5) % W);
      const sy = ((i * 89.3) % (H * 0.45));
      const ss = (i % 3 === 0) ? 1.5 : 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, ss, 0, Math.PI * 2);
      ctx.fill();
    }

    // Moon
    ctx.fillStyle = '#f0e8c0';
    ctx.beginPath();
    ctx.arc(W * 0.5, H * 0.07, Math.min(W, H) * 0.04, 0, Math.PI * 2);
    ctx.fill();

    // Moonlight path on beach (safe zone hint)
    const moonPath = ctx.createLinearGradient(W * 0.5, H * 0.07, W * 0.5, H);
    moonPath.addColorStop(0, 'rgba(240,232,192,0)');
    moonPath.addColorStop(0.4, 'rgba(240,232,192,0.06)');
    moonPath.addColorStop(1, 'rgba(240,232,192,0.15)');
    ctx.fillStyle = moonPath;
    ctx.fillRect(W * 0.3, 0, W * 0.4, H);

    // Sandy beach
    const beach = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.85);
    beach.addColorStop(0, '#c8b878');
    beach.addColorStop(1, '#a89058');
    ctx.fillStyle = beach;
    ctx.fillRect(0, H * 0.5, W, H * 0.4);

    // Ocean waves
    const wave = ctx.createLinearGradient(0, H * 0.82, 0, H);
    wave.addColorStop(0, '#1a6aa8');
    wave.addColorStop(1, '#0e4070');
    ctx.fillStyle = wave;
    ctx.beginPath();
    ctx.moveTo(0, H * 0.84);
    for (let x = 0; x <= W; x += 20) {
      ctx.lineTo(x, H * 0.84 + Math.sin(x * 0.04 + frame * 0.03) * (H * 0.012));
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

    // Ocean sparkle
    ctx.fillStyle = 'rgba(100,200,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.86);
    for (let x = 0; x <= W; x += 20) {
      ctx.lineTo(x, H * 0.86 + Math.sin(x * 0.04 + frame * 0.03 + 1) * (H * 0.008));
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

    // Hotel lights glow (danger!)
    hotelLights.forEach(l => {
      const grd = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
      grd.addColorStop(0, 'rgba(255,220,100,0.35)');
      grd.addColorStop(1, 'rgba(255,220,100,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fill();
      // Light bulb
      ctx.fillStyle = '#ffe070';
      ctx.beginPath();
      ctx.arc(l.x, l.y, Math.min(W,H)*0.022, 0, Math.PI * 2);
      ctx.fill();
    });

    // Danger label
    ctx.fillStyle = 'rgba(255,200,50,0.75)';
    ctx.font = `bold ${Math.min(W,H)*0.022}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('⚠ Hotel light', W * 0.06, H * 0.17);
    ctx.fillText('⚠ Hotel light', W * 0.94, H * 0.17);
  }

  function drawCrabs() {
    crabs.forEach(c => {
      ctx.save();
      ctx.translate(c.x, c.y);
      const dir = c.vx > 0 ? 1 : -1;
      ctx.scale(dir, 1);

      // Body
      ctx.fillStyle = '#e06030';
      GE.roundRect(ctx, -c.size, -c.size * 0.5, c.size * 2, c.size, 4, '#e06030');

      // Eyes (stalks)
      ctx.fillStyle = '#c04010';
      ctx.fillRect(-c.size * 0.4, -c.size * 0.8, c.size * 0.2, c.size * 0.35);
      ctx.fillRect(c.size * 0.2, -c.size * 0.8, c.size * 0.2, c.size * 0.35);
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath(); ctx.arc(-c.size * 0.3, -c.size * 0.9, c.size * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c.size * 0.3, -c.size * 0.9, c.size * 0.12, 0, Math.PI * 2); ctx.fill();

      // Claws
      ctx.fillStyle = '#e06030';
      ctx.beginPath(); ctx.arc(-c.size * 1.2, 0, c.size * 0.38, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(c.size * 1.2, 0, c.size * 0.38, 0, Math.PI * 2); ctx.fill();

      // Legs (animated)
      ctx.strokeStyle = '#c04010'; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const lx = -c.size * 0.5 + i * c.size * 0.5;
        const swing = Math.sin(c.legAngle + i * 1.2) * c.size * 0.5;
        ctx.beginPath(); ctx.moveTo(lx, c.size * 0.3); ctx.lineTo(lx - c.size * 0.3, c.size * 0.8 + swing); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx, c.size * 0.3); ctx.lineTo(lx + c.size * 0.3, c.size * 0.8 - swing); ctx.stroke();
      }
      ctx.restore();
    });
  }

  function drawPlastics() {
    plastics.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 2;
      // Plastic bag shape
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.bezierCurveTo(p.size, -p.size, p.size * 1.2, p.size * 0.5, 0, p.size);
      ctx.bezierCurveTo(-p.size * 1.2, p.size * 0.5, -p.size, -p.size, 0, -p.size);
      ctx.stroke();
      // Handles
      ctx.beginPath(); ctx.arc(-p.size * 0.3, -p.size, p.size * 0.25, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(p.size * 0.3, -p.size, p.size * 0.25, Math.PI, 0); ctx.stroke();
      ctx.restore();
    });
  }

  function drawTurtle() {
    ctx.save();
    ctx.translate(turtle.x, turtle.y);
    ctx.rotate(turtle.confused > 0
      ? turtle.angle + Math.sin(frame * 0.3) * 0.8
      : turtle.angle - Math.PI / 2);  // -PI/2 so "up" = facing forward

    const s = turtle.size;

    // Shell
    ctx.fillStyle = turtle.confused > 0 ? '#8aaa3a' : '#3aaa8f';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.9, s * 0.7, 0, 0, Math.PI * 2); ctx.fill();

    // Shell lines
    ctx.strokeStyle = '#1d7a68'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -s * 0.7); ctx.lineTo(0, s * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.45, s * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.75, s * 0.55, 0, 0, Math.PI * 2); ctx.stroke();

    // Head
    ctx.fillStyle = '#3aaa8f';
    ctx.beginPath(); ctx.ellipse(0, -s * 0.85, s * 0.3, s * 0.25, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(-s * 0.1, -s * 0.9, s * 0.08, 0, Math.PI * 2); ctx.fill();

    // Flippers (animated)
    const flipA = Math.sin(frame * 0.18) * 0.4;
    ctx.fillStyle = '#2d8a78';
    ctx.save(); ctx.rotate(flipA); ctx.beginPath(); ctx.ellipse(-s, 0, s * 0.38, s * 0.2, -0.4, 0, Math.PI*2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.rotate(-flipA); ctx.beginPath(); ctx.ellipse(s, 0, s * 0.38, s * 0.2, 0.4, 0, Math.PI*2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.rotate(-flipA); ctx.beginPath(); ctx.ellipse(-s * 0.7, s * 0.6, s * 0.3, s * 0.15, 0.5, 0, Math.PI*2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.rotate(flipA); ctx.beginPath(); ctx.ellipse(s * 0.7, s * 0.6, s * 0.3, s * 0.15, -0.5, 0, Math.PI*2); ctx.fill(); ctx.restore();

    ctx.restore();
  }

  function drawHUD() {
    // Lives
    GE.drawLives(ctx, lives, 3, 18, 18, 18);
    // Score
    ctx.font = `bold ${Math.min(W,H)*0.035}px system-ui`;
    ctx.fillStyle = '#f5f0e8';
    ctx.textAlign = 'right';
    ctx.fillText(`Score: ${score}`, W - 16, 36);

    // Touch hint
    if (frame < 140) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(245,240,232,0.7)';
      ctx.font = `${Math.min(W,H)*0.028}px system-ui`;
      ctx.fillText('Touch to steer the turtle to the moonlit sea!', W/2, H * 0.93);
    }

    // Goal arrow (if turtle near top)
    if (turtle.y < H * 0.5) {
      ctx.fillStyle = 'rgba(240,232,192,0.6)';
      ctx.font = `${Math.min(W,H)*0.03}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('↓ Head to the sea!', W / 2, H * 0.48);
    }
  }

  // ── Collision ───────────────────────────
  function checkCollisions() {
    // Crabs
    for (let i = crabs.length - 1; i >= 0; i--) {
      if (GE.dist(turtle, crabs[i]) < turtle.size * 0.9 + crabs[i].size * 0.7) {
        crabs.splice(i, 1);
        loseLife('A crab blocked the path!');
        return;
      }
    }
    // Plastics
    for (let i = plastics.length - 1; i >= 0; i--) {
      if (GE.dist(turtle, plastics[i]) < turtle.size * 0.8 + plastics[i].size) {
        plastics.splice(i, 1);
        loseLife('Plastic bag!');
        return;
      }
    }
    // Hotel lights
    hotelLights.forEach(l => {
      if (GE.dist(turtle, l) < l.r * 0.85 && turtle.confused <= 0) {
        turtle.confused = 120;
      }
    });

    // Reached ocean
    if (turtle.y > H * 0.86) {
      score += 100;
      triggerWin();
    }
  }

  function loseLife(reason) {
    lives--;
    GE.burst(particles, turtle.x, turtle.y, 20,
      ['#e74c3c','#ff8c00','#fff'], 4, 6);
    if (lives <= 0) triggerLose();
    else {
      turtle.x = W / 2; turtle.y = H * 0.12;
      turtle.confused = 0;
    }
  }

  // ── Win / Lose ──────────────────────────
  function triggerWin() {
    if (gameOver) return;
    gameOver = won = true;
    GE.burst(particles, turtle.x, turtle.y, 40,
      ['#4caf78','#d4a227','#3aaa8f','#fff'], 6, 8);
    cancelAnimationFrame(raf);
    raf = null;
    stopFn = GE.drawEndScreen(ctx, canvas, true, sp.conservationMessage, sp, onWin);
  }

  function triggerLose() {
    if (gameOver) return;
    gameOver = true;
    cancelAnimationFrame(raf);
    raf = null;
    stopFn = GE.drawEndScreen(ctx, canvas, false,
      'Try again! Remember — avoid the hotel lights and plastic bags.', sp, onLose);
  }

  // ── Game loop ───────────────────────────
  let raf, stopFn;
  let lastTime = 0;

  function loop(ts) {
    if (gameOver) return;
    const dt = Math.min((ts - lastTime) / 16.67, 3);
    lastTime = ts;
    frame++;

    // Spawn obstacles
    if (frame % 80 === 0) spawnCrab();
    if (frame % 55 === 0) spawnPlastic();

    // Move crabs
    crabs.forEach(c => {
      c.x += c.vx;
      c.legAngle += 0.15;
      if (c.x < -60 || c.x > W + 60) c.x = c.vx > 0 ? -40 : W + 40;
    });

    // Move plastics
    for (let i = plastics.length - 1; i >= 0; i--) {
      plastics[i].y += plastics[i].vy;
      plastics[i].rot += plastics[i].rotV;
      if (plastics[i].y > H + 40) plastics.splice(i, 1);
    }

    // Move turtle toward touch target
    if (touching || frame > 1) {
      const speed = turtle.confused > 0 ? 2.5 : 3.8;
      const dx = targetX - turtle.x, dy = targetY - turtle.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d > 5) {
        if (turtle.confused > 0) {
          // Confused: drift sideways
          turtle.x += Math.cos(turtle.angle + Math.PI / 2) * speed * 0.6;
          turtle.y += Math.sin(turtle.angle + Math.PI / 2) * speed * 0.4;
          turtle.confused--;
        } else {
          turtle.x += (dx / d) * speed;
          turtle.y += (dy / d) * speed;
          turtle.angle = Math.atan2(dy, dx) + Math.PI / 2;
        }
      }
    }

    // Clamp to screen
    turtle.x = GE.clamp(turtle.x, turtle.size, W - turtle.size);
    turtle.y = GE.clamp(turtle.y, turtle.size, H - turtle.size);

    // Update particles
    GE.updateParticles(particles, dt);

    // Draw
    drawScene();
    drawPlastics();
    drawCrabs();
    drawTurtle();
    GE.drawParticles(ctx, particles);
    drawHUD();

    checkCollisions();

    raf = requestAnimationFrame(loop);
  }

  // ── Input ────────────────────────────────
  function handleDown(e) {
    e.preventDefault();
    touching = true;
    const pos = GE.getPos(e, canvas);
    targetX = pos.x; targetY = pos.y;
  }
  function handleMove(e) {
    e.preventDefault();
    if (!touching) return;
    const pos = GE.getPos(e, canvas);
    targetX = pos.x; targetY = pos.y;
  }
  function handleUp(e) { touching = false; }

  GE.onInput(canvas, 'down', handleDown);
  GE.onInput(canvas, 'move', handleMove);
  GE.onInput(canvas, 'up', handleUp);

  lastTime = performance.now();
  raf = requestAnimationFrame(loop);

  // ── Stop function ────────────────────────
  return function stop() {
    cancelAnimationFrame(raf);
    if (typeof stopFn === 'function') stopFn();
    GE.offInput(canvas, 'down', handleDown);
    GE.offInput(canvas, 'move', handleMove);
    GE.offInput(canvas, 'up', handleUp);
  };
};
