/* ═══════════════════════════════════════════
   WILD LIVES — Game Engine Utilities
   Shared by all mini-games
═══════════════════════════════════════════ */

window.GE = (function () {
  'use strict';

  // ── Math helpers ────────────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }
  function randBetween(lo, hi) { return Math.random() * (hi - lo) + lo; }
  function randInt(lo, hi) { return Math.floor(randBetween(lo, hi + 1)); }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

  // ── Unified input (touch + mouse) ───────
  function getPos(e, canvas) {
    const rect  = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? (e.touches[0] || e.changedTouches[0]) : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY
    };
  }

  // Attach both touch and mouse listeners with a single handler
  function onInput(element, type, handler) {
    const map = { down: ['mousedown','touchstart'], move: ['mousemove','touchmove'], up: ['mouseup','touchend'] };
    (map[type] || [type]).forEach(ev => element.addEventListener(ev, handler, { passive: false }));
  }

  function offInput(element, type, handler) {
    const map = { down: ['mousedown','touchstart'], move: ['mousemove','touchmove'], up: ['mouseup','touchend'] };
    (map[type] || [type]).forEach(ev => element.removeEventListener(ev, handler));
  }

  // ── Canvas drawing helpers ───────────────
  function roundRect(ctx, x, y, w, h, r, fill, stroke, lineWidth) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y,     x + w, y + r,     r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x,     y + h, x,     y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x,     y,     x + r, y,         r);
    ctx.closePath();
    if (fill)   { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.lineWidth = lineWidth || 2; ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function drawHeart(ctx, cx, cy, size, color) {
    ctx.save();
    ctx.fillStyle = color || '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.35);
    ctx.bezierCurveTo(cx, cy, cx - size * 0.5, cy, cx - size * 0.5, cy + size * 0.35);
    ctx.bezierCurveTo(cx - size * 0.5, cy + size * 0.65, cx, cy + size * 0.85, cx, cy + size);
    ctx.bezierCurveTo(cx, cy + size * 0.85, cx + size * 0.5, cy + size * 0.65, cx + size * 0.5, cy + size * 0.35);
    ctx.bezierCurveTo(cx + size * 0.5, cy, cx, cy, cx, cy + size * 0.35);
    ctx.fill();
    ctx.restore();
  }

  function drawLives(ctx, lives, maxLives, x, y, size) {
    for (let i = 0; i < maxLives; i++) {
      drawHeart(ctx, x + i * (size + 6), y, size, i < lives ? '#e74c3c' : 'rgba(255,255,255,0.2)');
    }
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let lines = [];
    words.forEach(w => {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line.trim());
        line = w + ' ';
      } else {
        line = test;
      }
    });
    lines.push(line.trim());
    lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
    return lines.length * lineHeight;
  }

  // ── Particle system ─────────────────────
  function createParticle(x, y, vx, vy, life, color, size) {
    return { x, y, vx, vy, life, maxLife: life || 60, color: color || '#fff', size: size || 4 };
  }

  function updateParticles(particles, dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += 0.15 * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles(ctx, particles) {
    particles.forEach(p => {
      const a = clamp(p.life / p.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function burst(particles, x, y, count, colors, speed, size) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + randBetween(-0.3, 0.3);
      const s     = randBetween(speed * 0.5, speed);
      particles.push(createParticle(
        x, y,
        Math.cos(angle) * s,
        Math.sin(angle) * s,
        randBetween(40, 80),
        colors[i % colors.length],
        randBetween(size * 0.5, size)
      ));
    }
  }

  // ── End screen ──────────────────────────
  function drawEndScreen(ctx, canvas, won, message, species, onClose) {
    const W = canvas.width, H = canvas.height;
    const particles = [];
    let frame = 0;
    let raf;
    let closed = false;

    if (won) {
      burst(particles, W / 2, H / 2, 40, ['#4caf78','#d4a227','#f4e04a','#3aaa8f','#fff'], 6, 8);
    }

    const drawFrame = () => {
      if (closed) return;
      frame++;

      // Semi-transparent overlay
      ctx.fillStyle = won ? 'rgba(8,30,15,0.88)' : 'rgba(20,5,5,0.9)';
      ctx.fillRect(0, 0, W, H);

      updateParticles(particles, 1);
      drawParticles(ctx, particles);
      if (won && frame % 12 === 0) {
        burst(particles, randBetween(W*0.2, W*0.8), randBetween(H*0.1, H*0.4),
          12, ['#4caf78','#d4a227','#f4e04a'], 4, 5);
      }

      // Card
      const cw = Math.min(W - 40, 520), ch = 360;
      const cx = (W - cw) / 2, cy = (H - ch) / 2;
      roundRect(ctx, cx, cy, cw, ch, 20, won ? '#0f2a14' : '#1a0505', won ? '#4caf78' : '#c0392b', 2);

      // Icon
      ctx.font = `bold ${Math.min(W, H) * 0.09}px serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = won ? '#4caf78' : '#e74c3c';
      ctx.fillText(won ? '✓' : '✕', W / 2, cy + 72);

      // Title
      ctx.font = `bold ${clamp(W * 0.045, 18, 28)}px Georgia, serif`;
      ctx.fillStyle = '#f5f0e8';
      ctx.fillText(won ? 'Well done!' : 'Keep trying!', W / 2, cy + 120);

      // Species name
      if (species) {
        ctx.font = `italic ${clamp(W * 0.028, 12, 17)}px Georgia, serif`;
        ctx.fillStyle = won ? '#4caf78' : '#e07060';
        ctx.fillText(species.name, W / 2, cy + 148);
      }

      // Conservation message
      if (message) {
        ctx.font = `${clamp(W * 0.026, 11, 15)}px system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(245,240,232,0.82)';
        wrapText(ctx, message, W / 2, cy + 178, cw - 48, 22);
      }

      // Close button
      const bw = Math.min(cw - 40, 220), bh = 48;
      const bx = (W - bw) / 2, by = cy + ch - 68;
      roundRect(ctx, bx, by, bw, bh, 24, won ? '#2d7a4a' : '#7a2020', null);
      ctx.font = `bold ${clamp(W * 0.03, 13, 16)}px system-ui, sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.fillText('Back to Gallery', W / 2, by + 30);

      raf = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    // Click/tap to close
    function handleClose(e) {
      e.preventDefault();
      const pos = GE.getPos(e, canvas);
      const bw = Math.min(W - 40, 220), bh = 48;
      const bx = (W - bw) / 2;
      const ch = 360, cy = (H - ch) / 2;
      const by = cy + ch - 68;
      if (pos.x >= bx && pos.x <= bx + bw && pos.y >= by && pos.y <= by + bh) {
        closed = true;
        cancelAnimationFrame(raf);
        canvas.removeEventListener('click', handleClose);
        canvas.removeEventListener('touchend', handleClose);
        if (typeof onClose === 'function') onClose();
        // Trigger gallery close from app.js
        document.getElementById('close-game').click();
      }
    }
    setTimeout(() => {
      canvas.addEventListener('click', handleClose);
      canvas.addEventListener('touchend', handleClose);
    }, 800);

    return () => { closed = true; cancelAnimationFrame(raf); };
  }

  // ── Public API ───────────────────────────
  return {
    lerp, clamp, dist, randBetween, randInt, easeOut, easeInOut,
    getPos, onInput, offInput,
    roundRect, drawHeart, drawLives, wrapText,
    createParticle, updateParticles, drawParticles, burst,
    drawEndScreen
  };
})();
