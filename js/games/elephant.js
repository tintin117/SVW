/* ═══════════════════════════════════════════
   WILD LIVES — African Forest Elephant
   Game: Tap snares to remove them before
         the elephant walks into them!
═══════════════════════════════════════════ */

window.GAME_START = function (canvas, onWin, onLose) {
  'use strict';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const sp = window.SPECIES.find(s => s.id === 'elephant');

  let round = 1, maxRounds = 5, saved = 0, gameOver = false;
  const particles = [];
  const snares = [];
  let stopFn;

  // ── Elephant path (figure-8 around two trees) ──
  const tree1 = { x: W * 0.3, y: H * 0.4 };
  const tree2 = { x: W * 0.7, y: H * 0.6 };
  const eleph = {
    x: W * 0.5, y: H * 0.5,
    pathT: 0,
    speed: 0.004,
    size: Math.min(W, H) * 0.07
  };

  // Smooth figure-8 path
  function pathPos(t) {
    const cx = (tree1.x + tree2.x) / 2;
    const cy = (tree1.y + tree2.y) / 2;
    const rx = Math.abs(tree2.x - tree1.x) * 0.5;
    const ry = Math.abs(tree2.y - tree1.y) * 0.6 + H * 0.12;
    const a = t * Math.PI * 2;
    return {
      x: cx + rx * Math.sin(a),
      y: cy + ry * Math.sin(a) * Math.cos(a)
    };
  }

  // ── Background ──────────────────────────
  function drawJungle() {
    // Ground
    const ground = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.8);
    ground.addColorStop(0, '#2d5a1e');
    ground.addColorStop(1, '#1a3a10');
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, W, H);

    // Ground patches
    for (let i = 0; i < 30; i++) {
      const gx = (i * 127.3) % W;
      const gy = (i * 94.7) % H;
      ctx.fillStyle = 'rgba(60,120,30,0.2)';
      ctx.beginPath(); ctx.ellipse(gx, gy, 30 + i%20, 18 + i%12, (i*0.5)%Math.PI, 0, Math.PI*2); ctx.fill();
    }

    // Trees
    [tree1, tree2].forEach(t => {
      ctx.fillStyle = '#4a2e10';
      ctx.fillRect(t.x - 12, t.y - 40, 24, 80);
      // Canopy
      ctx.fillStyle = '#2d6a14';
      ctx.beginPath(); ctx.arc(t.x, t.y - 50, 55, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3d8a1e';
      ctx.beginPath(); ctx.arc(t.x - 20, t.y - 60, 40, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(t.x + 25, t.y - 55, 38, 0, Math.PI * 2); ctx.fill();
    });

    // Border foliage
    for (let i = 0; i < 12; i++) {
      const bx = (i % 6) * (W/5.5);
      const by = i < 6 ? 0 : H - 20;
      ctx.fillStyle = '#2d6a14';
      ctx.beginPath(); ctx.arc(bx, by, 30 + (i%3)*10, 0, Math.PI*2); ctx.fill();
    }
  }

  // ── Snares ──────────────────────────────
  function spawnSnares() {
    const count = round;
    for (let i = 0; i < count; i++) {
      let sx, sy, attempts = 0;
      do {
        sx = GE.randBetween(W * 0.1, W * 0.9);
        sy = GE.randBetween(H * 0.15, H * 0.85);
        attempts++;
      } while (
        (GE.dist({x:sx,y:sy}, tree1) < 80 || GE.dist({x:sx,y:sy}, tree2) < 80) &&
        attempts < 20
      );
      snares.push({ x: sx, y: sy, r: 28, pulse: 0, age: 0 });
    }
  }

  function drawSnares() {
    snares.forEach(s => {
      s.pulse = (s.pulse + 0.08) % (Math.PI * 2);
      const pScale = 1 + Math.sin(s.pulse) * 0.15;

      // Outer alert ring
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin(s.pulse) * 0.15;
      ctx.strokeStyle = '#e06020';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * pScale * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Wire coil
      ctx.strokeStyle = '#c0a020';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 1.8);
      ctx.stroke();
      // Loop end
      ctx.beginPath();
      ctx.arc(s.x + s.r, s.y, 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#c0a020';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Stake
      ctx.strokeStyle = '#8a6010';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.r * 0.5, s.y + s.r * 0.5);
      ctx.stroke();
    });
  }

  // ── Elephant drawing ─────────────────────
  function drawElephant() {
    ctx.save();
    ctx.translate(eleph.x, eleph.y);
    const nextPos = pathPos(eleph.pathT + 0.002);
    const facingRight = nextPos.x > eleph.x;
    if (!facingRight) ctx.scale(-1, 1);

    const s = eleph.size;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(0, s * 0.85, s * 0.9, s * 0.2, 0, 0, Math.PI * 2); ctx.fill();

    // Body
    ctx.fillStyle = '#7a9a7a';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.9, s * 0.7, 0, 0, Math.PI * 2); ctx.fill();

    // Legs (animated)
    const legA = Math.sin(eleph.pathT * 30) * 0.25;
    ctx.fillStyle = '#6a8a6a';
    [[-s*0.4, legA], [-s*0.1, -legA], [s*0.2, legA], [s*0.5, -legA]].forEach(([lx, la]) => {
      ctx.save(); ctx.translate(lx, s * 0.5);
      ctx.rotate(la);
      ctx.fillRect(-7, 0, 14, s * 0.55);
      ctx.restore();
    });

    // Head
    ctx.fillStyle = '#7a9a7a';
    ctx.beginPath(); ctx.arc(-s * 0.9, -s * 0.2, s * 0.5, 0, Math.PI * 2); ctx.fill();

    // Ear
    ctx.fillStyle = '#8aaa8a';
    ctx.beginPath(); ctx.ellipse(-s * 1.1, -s * 0.3, s * 0.35, s * 0.5, -0.3, 0, Math.PI * 2); ctx.fill();

    // Trunk (animated)
    const trunkA = Math.sin(eleph.pathT * 15) * 0.3;
    ctx.strokeStyle = '#7a9a7a'; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 1.35, -s * 0.1);
    ctx.quadraticCurveTo(-s * 1.6 + trunkA * 20, s * 0.3, -s * 1.45 + trunkA * 30, s * 0.65);
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(-s * 1.0, -s * 0.32, s * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(-s * 1.02, -s * 0.35, s * 0.04, 0, Math.PI * 2); ctx.fill();

    // Tusk
    ctx.strokeStyle = '#e8ddb8'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 1.3, -s * 0.05);
    ctx.quadraticCurveTo(-s * 1.7, s * 0.15, -s * 1.8, s * 0.05);
    ctx.stroke();

    ctx.restore();
  }

  // ── HUD ──────────────────────────────────
  function drawHUD() {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    GE.roundRect(ctx, 10, 10, 200, 56, 10, 'rgba(0,0,0,0.45)');

    ctx.fillStyle = '#f5f0e8';
    ctx.font = `bold ${Math.min(W,H)*0.032}px system-ui`;
    ctx.textAlign = 'left';
    ctx.fillText(`Round: ${round} / ${maxRounds}`, 22, 34);
    ctx.fillText(`Saved: ${saved} elephants`, 22, 58);

    ctx.textAlign = 'center';
    ctx.font = `${Math.min(W,H)*0.028}px system-ui`;
    ctx.fillStyle = '#ffd070';
    ctx.fillText(`Snares left: ${snares.length}`, W / 2, H - 20);

    if (round === 1 && snares.length === 1) {
      ctx.fillStyle = 'rgba(245,240,232,0.75)';
      ctx.font = `${Math.min(W,H)*0.028}px system-ui`;
      ctx.fillText('Tap the snare to remove it!', W / 2, H - 46);
    }
  }

  // ── Collision: elephant hits snare ───────
  function checkElephantSnares() {
    for (let i = snares.length - 1; i >= 0; i--) {
      if (GE.dist(eleph, snares[i]) < eleph.size * 0.85 + snares[i].r) {
        if (gameOver) return;
        gameOver = true;
        cancelAnimationFrame(raf);
        stopFn = GE.drawEndScreen(ctx, canvas, false,
          `The elephant stepped on a snare! In the wild, anti-poaching rangers remove thousands of snares like this each year.`, sp, onLose);
        return;
      }
    }
  }

  // ── Round complete ───────────────────────
  function completeRound() {
    saved++;
    GE.burst(particles, W/2, H/2, 30, ['#4caf78','#d4a227','#fff'], 5, 7);
    if (round >= maxRounds) {
      triggerWin();
    } else {
      round++;
      eleph.speed = 0.004 + round * 0.0008;
      setTimeout(spawnSnares, 800);
    }
  }

  function triggerWin() {
    if (gameOver) return;
    gameOver = true;
    cancelAnimationFrame(raf);
    stopFn = GE.drawEndScreen(ctx, canvas, true, sp.conservationMessage, sp, onWin);
  }

  // ── Game loop ────────────────────────────
  let raf, frame = 0;

  function loop() {
    if (gameOver) return;
    frame++;

    // Move elephant along path
    eleph.pathT += eleph.speed;
    if (eleph.pathT >= 1) eleph.pathT -= 1;
    const pos = pathPos(eleph.pathT);
    eleph.x = pos.x; eleph.y = pos.y;

    // Check round completion
    if (snares.length === 0 && frame > 60) {
      completeRound();
    }

    GE.updateParticles(particles, 1);

    drawJungle();
    drawSnares();
    drawElephant();
    GE.drawParticles(ctx, particles);
    drawHUD();

    checkElephantSnares();

    raf = requestAnimationFrame(loop);
  }

  // ── Input: tap snares ────────────────────
  function handleTap(e) {
    e.preventDefault();
    const pos = GE.getPos(e, canvas);
    for (let i = snares.length - 1; i >= 0; i--) {
      if (GE.dist(pos, snares[i]) < snares[i].r * 1.8) {
        GE.burst(particles, snares[i].x, snares[i].y, 16,
          ['#4caf78','#d4a227','#c0a020','#fff'], 3.5, 5);
        snares.splice(i, 1);
        break;
      }
    }
  }

  GE.onInput(canvas, 'down', handleTap);

  spawnSnares();
  raf = requestAnimationFrame(loop);

  return function stop() {
    cancelAnimationFrame(raf);
    if (typeof stopFn === 'function') stopFn();
    GE.offInput(canvas, 'down', handleTap);
  };
};
