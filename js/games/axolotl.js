/* ═══════════════════════════════════════════
   WILD LIVES — Axolotl
   Game: Bubble Shooter! Match 3+ same-color
         pollution bubbles to clean the river.
═══════════════════════════════════════════ */

window.GAME_START = function (canvas, onWin, onLose) {
  'use strict';
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const sp = window.SPECIES.find(s => s.id === 'axolotl');

  let cleared = 0, totalBubbles = 0, gameOver = false, frame = 0;
  const particles = [];
  let stopFn;

  // ── Colors (pollution types) ─────────────
  const COLORS = ['#c05030', '#6050b0', '#508040', '#c09020', '#306090'];
  const COLOR_NAMES = ['Red Dye', 'Chemicals', 'Algae Bloom', 'Sewage', 'Heavy Metal'];

  // ── Bubble grid ──────────────────────────
  const BUBBLE_R = Math.min(W, H) * 0.048;
  const COLS2    = Math.floor((W - 20) / (BUBBLE_R * 2 + 4));
  const ROWS2    = 6;
  const GRID_X   = (W - COLS2 * (BUBBLE_R * 2 + 4)) / 2 + BUBBLE_R + 2;
  const GRID_Y   = Math.min(H * 0.12, 60);

  const grid = [];   // grid[row][col] = {color, x, y} or null

  function initGrid() {
    for (let r = 0; r < ROWS2; r++) {
      grid[r] = [];
      for (let c = 0; c < COLS2; c++) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const x = GRID_X + c * (BUBBLE_R * 2 + 4) + (r % 2 === 0 ? 0 : BUBBLE_R + 2);
        const y = GRID_Y + r * (BUBBLE_R * 1.74);
        grid[r][c] = { color, x, y, popping: false, popAnim: 0 };
        totalBubbles++;
      }
    }
  }

  // ── Shooter ──────────────────────────────
  const shooter = {
    x: W / 2,
    y: H * 0.85,
    angle: -Math.PI / 2,  // pointing up
    nextColor: COLORS[0],
    currentColor: COLORS[Math.floor(Math.random() * COLORS.length)]
  };
  shooter.nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];

  const projectiles = [];

  function shoot() {
    projectiles.push({
      x: shooter.x,
      y: shooter.y,
      vx: Math.cos(shooter.angle) * 12,
      vy: Math.sin(shooter.angle) * 12,
      color: shooter.currentColor,
      r: BUBBLE_R * 0.85
    });
    shooter.currentColor = shooter.nextColor;
    shooter.nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  // ── Grid helpers ─────────────────────────
  function nearestGridCell(x, y) {
    let best = null, bestD = Infinity;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c]) continue;
        const gx = GRID_X + c * (BUBBLE_R * 2 + 4) + (r % 2 === 0 ? 0 : BUBBLE_R + 2);
        const gy = GRID_Y + r * (BUBBLE_R * 1.74);
        const d = Math.sqrt((x-gx)**2 + (y-gy)**2);
        if (d < bestD) { bestD = d; best = {r, c, x: gx, y: gy}; }
      }
    }
    // Also check one row below existing rows
    const newRow = grid.length;
    for (let c = 0; c < COLS2; c++) {
      const gx = GRID_X + c * (BUBBLE_R * 2 + 4) + (newRow % 2 === 0 ? 0 : BUBBLE_R + 2);
      const gy = GRID_Y + newRow * (BUBBLE_R * 1.74);
      const d = Math.sqrt((x-gx)**2 + (y-gy)**2);
      if (d < bestD) { bestD = d; best = {r: newRow, c, x: gx, y: gy}; }
    }
    return best;
  }

  function getNeighbors(r, c) {
    const offsets = r % 2 === 0
      ? [[-1,-1],[-1,0],[0,-1],[0,1],[1,-1],[1,0]]
      : [[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1]];
    return offsets
      .map(([dr, dc]) => [r + dr, c + dc])
      .filter(([nr, nc]) => nr >= 0 && nr < grid.length && nc >= 0 && nc < (grid[nr]||[]).length && grid[nr][nc]);
  }

  function floodFill(r, c, targetColor, visited) {
    const key = `${r},${c}`;
    if (visited.has(key)) return [];
    if (!grid[r] || !grid[r][c] || grid[r][c].color !== targetColor) return [];
    visited.add(key);
    const result = [[r, c]];
    getNeighbors(r, c).forEach(([nr, nc]) => {
      result.push(...floodFill(nr, nc, targetColor, visited));
    });
    return result;
  }

  function popGroup(r, c) {
    const color = grid[r][c].color;
    const group = floodFill(r, c, color, new Set());
    if (group.length >= 3) {
      group.forEach(([gr, gc]) => {
        const b = grid[gr][gc];
        GE.burst(particles, b.x, b.y, 10, [color, '#fff', '#f5f0e8'], 4, 5);
        grid[gr][gc] = null;
        cleared++;
      });
      return group.length;
    }
    return 0;
  }

  // Check if any bubbles fall below danger line
  function checkLose() {
    const dangerY = shooter.y - BUBBLE_R * 3;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < (grid[r]||[]).length; c++) {
        if (grid[r][c] && grid[r][c].y > dangerY) return true;
      }
    }
    return false;
  }

  function countRemaining() {
    let n = 0;
    grid.forEach(row => row && row.forEach(b => { if (b) n++; }));
    return n;
  }

  // ── Background ──────────────────────────
  function drawBg() {
    // River gradient
    const river = ctx.createLinearGradient(0, 0, 0, H);
    river.addColorStop(0, '#1a3a4a');
    river.addColorStop(0.4, '#1a3050');
    river.addColorStop(0.8, '#243a28');
    river.addColorStop(1, '#1a2a1a');
    ctx.fillStyle = river; ctx.fillRect(0, 0, W, H);

    // Flow lines
    ctx.strokeStyle = 'rgba(100,180,220,0.08)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const lx = (i / 7) * W;
      ctx.beginPath();
      for (let y = 0; y < H; y += 20) {
        const x = lx + Math.sin(y * 0.04 + frame * 0.02 + i) * 15;
        if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Danger zone line
    const dz = shooter.y - BUBBLE_R * 3;
    ctx.strokeStyle = 'rgba(220,60,60,0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(0, dz); ctx.lineTo(W, dz); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(220,60,60,0.5)';
    ctx.font = `${Math.min(W,H)*0.022}px system-ui`;
    ctx.textAlign = 'left';
    ctx.fillText('⚠ Danger level', 6, dz - 5);
  }

  // ── Draw grid bubbles ────────────────────
  function drawGrid() {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < (grid[r]||[]).length; c++) {
        const b = grid[r][c];
        if (!b) continue;
        drawBubble(b.x, b.y, BUBBLE_R, b.color);
      }
    }
  }

  function drawBubble(x, y, r, color) {
    // Outer glow
    const grd = ctx.createRadialGradient(x - r*0.3, y - r*0.3, r*0.1, x, y, r);
    grd.addColorStop(0, color + 'ff');
    grd.addColorStop(0.7, color + 'cc');
    grd.addColorStop(1, color + '88');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(x - r*0.28, y - r*0.28, r*0.32, 0, Math.PI * 2); ctx.fill();
    // Outline
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  }

  // ── Shooter / Axolotl ────────────────────
  function drawShooter() {
    const s = Math.min(W, H) * 0.07;
    ctx.save();
    ctx.translate(shooter.x, shooter.y);

    // Axolotl body
    ctx.fillStyle = '#f4a8c0';
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.7, s * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.beginPath(); ctx.arc(-s * 0.55, 0, s * 0.42, 0, Math.PI * 2); ctx.fill();
    // Gills
    ctx.strokeStyle = '#d06888'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-s*0.4, -s*0.35); ctx.lineTo(-s*0.5, -s*0.65); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s*0.55, -s*0.38); ctx.lineTo(-s*0.6, -s*0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s*0.7, -s*0.34); ctx.lineTo(-s*0.8, -s*0.62); ctx.stroke();
    // Eye
    ctx.fillStyle = '#2a1010';
    ctx.beginPath(); ctx.arc(-s*0.68, -s*0.12, s*0.1, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(-s*0.7, -s*0.15, s*0.04, 0, Math.PI*2); ctx.fill();
    // Smile
    ctx.strokeStyle = '#d06070'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(-s*0.55, s*0.08, s*0.2, 0.2, Math.PI - 0.2); ctx.stroke();
    // Tail
    ctx.fillStyle = '#f4a8c0';
    ctx.beginPath(); ctx.moveTo(s*0.65, 0);
    ctx.quadraticCurveTo(s*1.1, -s*0.2, s*1.0, -s*0.6);
    ctx.quadraticCurveTo(s*1.2, -s*0.1, s*0.65, 0); ctx.fill();

    // Aim line
    ctx.strokeStyle = `rgba(${hexToRgb(shooter.currentColor)},0.5)`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, -s*0.2);
    ctx.lineTo(Math.cos(shooter.angle) * H * 0.45, Math.sin(shooter.angle) * H * 0.45);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();

    // Current bubble
    drawBubble(shooter.x, shooter.y - s * 0.6, BUBBLE_R * 0.8, shooter.currentColor);
    // Next bubble (smaller, to the side)
    drawBubble(shooter.x + s * 1.4, shooter.y, BUBBLE_R * 0.55, shooter.nextColor);
    ctx.fillStyle = 'rgba(245,240,232,0.5)';
    ctx.font = `${Math.min(W,H)*0.02}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText('next', shooter.x + s * 1.4, shooter.y + BUBBLE_R * 0.7);
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  // ── HUD ──────────────────────────────────
  function drawHUD() {
    const remaining = countRemaining();
    const progress = totalBubbles > 0 ? Math.min(100, (cleared / totalBubbles) * 100) : 0;

    const pw = Math.min(W * 0.5, 280), ph = 14;
    const px = (W - pw) / 2, py = 14;
    GE.roundRect(ctx, px, py, pw, ph, 7, 'rgba(0,0,0,0.45)');
    if (progress > 0) {
      const grad = ctx.createLinearGradient(px, 0, px + pw, 0);
      grad.addColorStop(0, '#2d7a4a');
      grad.addColorStop(1, '#4caf78');
      ctx.fillStyle = grad;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(px, py, (progress/100)*pw, ph, 7)
                    : GE.roundRect(ctx, px, py, (progress/100)*pw, ph, 7, grad);
      ctx.fillStyle = grad; ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#f5f0e8';
    ctx.font = `bold ${Math.min(W,H)*0.026}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText(`River cleaned: ${Math.round(progress)}%  (target 80%)`, W/2, py + ph - 2);

    if (frame < 160) {
      ctx.fillStyle = 'rgba(245,240,232,0.75)';
      ctx.font = `${Math.min(W,H)*0.027}px system-ui`;
      ctx.fillText('Tap to aim & shoot! Match 3+ same-color bubbles.', W/2, H - 22);
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
      'The pollution reached the axolotl! Keep shooting to clear the river. Try for clusters of 3 or more!', sp, onLose);
  }

  // ── Game loop ────────────────────────────
  let raf;

  function loop() {
    if (gameOver) return;
    frame++;

    // Move projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx; p.y += p.vy;

      // Bounce off walls
      if (p.x - p.r < 0) { p.x = p.r; p.vx = Math.abs(p.vx); }
      if (p.x + p.r > W) { p.x = W - p.r; p.vx = -Math.abs(p.vx); }

      // Hit top
      if (p.y - p.r < GRID_Y - BUBBLE_R) {
        landProjectile(p);
        projectiles.splice(i, 1);
        continue;
      }

      // Collide with grid bubble
      let hit = false;
      outer: for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < (grid[r]||[]).length; c++) {
          const b = grid[r][c];
          if (!b) continue;
          if (GE.dist(p, b) < p.r + BUBBLE_R - 2) {
            landProjectile(p, r, c);
            projectiles.splice(i, 1);
            hit = true;
            break outer;
          }
        }
      }
    }

    // Add new row if remaining < 10% of total
    if (frame % 420 === 0 && countRemaining() > 0) {
      addRow();
    }

    // Check lose
    if (checkLose()) { triggerLose(); return; }

    // Check win
    const progress = totalBubbles > 0 ? (cleared / totalBubbles) * 100 : 0;
    if (progress >= 80) { triggerWin(); return; }

    GE.updateParticles(particles, 1);

    drawBg();
    drawGrid();
    for (const p of projectiles) drawBubble(p.x, p.y, p.r, p.color);
    GE.drawParticles(ctx, particles);
    drawShooter();
    drawHUD();

    raf = requestAnimationFrame(loop);
  }

  function addRow() {
    // Push all rows down one step
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < (grid[r]||[]).length; c++) {
        if (grid[r][c]) grid[r][c].y += BUBBLE_R * 1.74;
      }
    }
    // Insert new top row
    const newRow = [];
    for (let c = 0; c < COLS2; c++) {
      const x = GRID_X + c * (BUBBLE_R * 2 + 4);
      const y = GRID_Y;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      newRow.push({ color, x, y });
      totalBubbles++;
    }
    grid.unshift(newRow);
  }

  function landProjectile(p, nearR, nearC) {
    // Find empty neighbor cell
    let placed = false;
    if (nearR !== undefined) {
      const nbrs = getNeighbors(nearR, nearC);
      for (const [nr, nc] of nbrs) {
        if (!grid[nr][nc]) {
          grid[nr][nc] = {
            color: p.color,
            x: GRID_X + nc * (BUBBLE_R * 2 + 4) + (nr % 2 === 0 ? 0 : BUBBLE_R + 2),
            y: GRID_Y + nr * (BUBBLE_R * 1.74)
          };
          totalBubbles++;
          popGroup(nr, nc);
          placed = true;
          break;
        }
      }
    }
    if (!placed) {
      // Place in nearest empty
      const cell = nearestGridCell(p.x, p.y);
      if (cell) {
        if (!grid[cell.r]) {
          grid[cell.r] = new Array(COLS2).fill(null);
        }
        grid[cell.r][cell.c] = { color: p.color, x: cell.x, y: cell.y };
        totalBubbles++;
        popGroup(cell.r, cell.c);
      }
    }
  }

  // ── Input ────────────────────────────────
  let aiming = false, aimX = W/2, aimY = H/2;

  function handleDown(e) {
    e.preventDefault();
    const pos = GE.getPos(e, canvas);
    aiming = true;
    aimX = pos.x; aimY = pos.y;
    updateAngle(pos.x, pos.y);
  }
  function handleMove(e) {
    e.preventDefault();
    if (!aiming) return;
    const pos = GE.getPos(e, canvas);
    aimX = pos.x; aimY = pos.y;
    updateAngle(pos.x, pos.y);
  }
  function handleUp(e) {
    e.preventDefault();
    aiming = false;
    shoot();
  }
  function updateAngle(x, y) {
    const dx = x - shooter.x, dy = y - shooter.y;
    const a = Math.atan2(dy, dx);
    // Restrict to upward hemisphere
    shooter.angle = GE.clamp(a, -Math.PI + 0.15, -0.15);
  }

  GE.onInput(canvas, 'down', handleDown);
  GE.onInput(canvas, 'move', handleMove);
  GE.onInput(canvas, 'up', handleUp);

  initGrid();
  raf = requestAnimationFrame(loop);

  return function stop() {
    cancelAnimationFrame(raf);
    if (typeof stopFn === 'function') stopFn();
    GE.offInput(canvas, 'down', handleDown);
    GE.offInput(canvas, 'move', handleMove);
    GE.offInput(canvas, 'up', handleUp);
  };
};
