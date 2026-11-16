// Sunny Squeeze - modern illustrated scene renderer (no heavy outlines, soft lighting)
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const W = 800, H = 500, GROUND = 325;

  const S = { cars: [], carTimer: 2.5 };
  const CAR_COLORS = ['#ef4444', '#3b82f6', '#f8fafc', '#10b981', '#f59e0b', '#64748b'];

  // ---------------------------------------------------------------- helpers
  const rbox = (c, x, y, w, h, r, f) => { c.fillStyle = f; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); };
  const circ = (c, x, y, r, f) => { c.fillStyle = f; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  const lg = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; };
  const rg = (c, x, y, r0, r1, stops) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; };
  const font = (c, px, w = 700) => { c.font = `${w} ${px}px Outfit, Inter, 'Segoe UI', sans-serif`; };
  const soft = (c, color, blur, oy = 2) => { c.shadowColor = color; c.shadowBlur = blur; c.shadowOffsetY = oy; };
  const nosoft = c => { c.shadowColor = 'transparent'; c.shadowBlur = 0; c.shadowOffsetY = 0; };

  // ---------------------------------------------------------------- sky / weather
  const SKY = {
    sunny: ['#2f8fe8', '#8fd0fb', '#d9f1ff'],
    heatwave: ['#2f86e0', '#ffd28a', '#ffe9b5'],
    cloudy: ['#6aa6d6', '#b6cde0', '#e3ebf2'],
    breezy: ['#5aa0dd', '#a8d0ec', '#e0eef7'],
    rainy: ['#4b5a6e', '#7d8ca0', '#aab6c4']
  };

  function sky(c, D, t, p) {
    const { state, sim } = D, wId = state.weather.id, pal = SKY[wId];
    c.fillStyle = lg(c, 0, 0, 0, 330, [[0, pal[0]], [0.65, pal[1]], [1, pal[2]]]);
    c.fillRect(0, 0, W, H);

    if (wId !== 'rainy') {
      const sx = 90 + p * 620, sy = 108 - Math.sin(p * Math.PI) * 52, r = wId === 'heatwave' ? 34 : 28;
      c.fillStyle = rg(c, sx, sy, 4, wId === 'heatwave' ? 150 : 110, [[0, 'rgba(255,244,190,.95)'], [0.25, 'rgba(255,220,120,.45)'], [1, 'rgba(255,220,120,0)']]);
      c.fillRect(0, 0, W, 330);
      c.fillStyle = lg(c, sx, sy - r, sx, sy + r, [[0, '#fff6c2'], [1, wId === 'heatwave' ? '#ffb347' : '#ffd84d']]);
      c.beginPath(); c.arc(sx, sy, r, 0, TAU); c.fill();
    }

    // soft layered clouds
    sim.clouds.forEach(cl => {
      const alpha = wId === 'rainy' ? 0.85 : 0.95, col = wId === 'rainy' ? `rgba(110,124,142,${alpha})` : `rgba(255,255,255,${alpha})`;
      c.fillStyle = col;
      c.beginPath();
      c.ellipse(cl.x, cl.y, 46, 17, 0, 0, TAU); c.ellipse(cl.x + 24, cl.y - 11, 30, 19, 0, 0, TAU); c.ellipse(cl.x - 22, cl.y - 6, 26, 15, 0, 0, TAU);
      c.fill();
      c.fillStyle = wId === 'rainy' ? 'rgba(60,72,90,.25)' : 'rgba(150,185,215,.22)';
      c.beginPath(); c.ellipse(cl.x, cl.y + 9, 44, 8, 0, 0, TAU); c.fill();
    });

    // birds
    if (wId !== 'rainy') {
      c.strokeStyle = 'rgba(30,41,59,.55)'; c.lineWidth = 2; c.lineCap = 'round';
      sim.birds.forEach(b => {
        const f = Math.sin(b.p) * 6;
        c.beginPath(); c.moveTo(b.x - 10, b.y - f); c.quadraticCurveTo(b.x - 4, b.y - 6, b.x, b.y); c.quadraticCurveTo(b.x + 4, b.y - 6, b.x + 10, b.y - f); c.stroke();
      });
    }
  }

  function hills(c, wId) {
    const dim = wId === 'rainy' ? 0.55 : 1;
    c.fillStyle = `rgba(120,170,150,${0.55 * dim})`;
    c.beginPath(); c.moveTo(0, 270); c.bezierCurveTo(120, 215, 230, 240, 340, 262); c.bezierCurveTo(470, 285, 560, 220, 690, 236); c.bezierCurveTo(740, 242, 780, 252, 800, 258); c.lineTo(800, 330); c.lineTo(0, 330); c.fill();
    c.fillStyle = `rgba(86,150,120,${0.7 * dim})`;
    c.beginPath(); c.moveTo(0, 292); c.bezierCurveTo(140, 262, 300, 296, 430, 280); c.bezierCurveTo(560, 264, 690, 296, 800, 276); c.lineTo(800, 330); c.lineTo(0, 330); c.fill();
  }

  // ---------------------------------------------------------------- backdrops
  function backdrop(c, D, L, t) {
    const { has } = D;
    if (L === 'driveway' || L === 'park' || L === 'boardwalk' || L === 'fairgrounds') hills(c, D.state.weather.id);

    if (L === 'driveway') {
      c.fillStyle = lg(c, 0, 250, 0, 330, [[0, '#7fcf8a'], [1, '#5eb872']]); c.fillRect(0, 252, W, 80);
      // house
      rbox(c, 70, 150, 172, 118, 4, lg(c, 0, 150, 0, 268, [[0, '#f8ead0'], [1, '#e8d3ae']]));
      c.fillStyle = lg(c, 0, 88, 0, 150, [[0, '#d9534f'], [1, '#b73d3b']]);
      c.beginPath(); c.moveTo(54, 154); c.lineTo(156, 88); c.lineTo(258, 154); c.closePath(); c.fill();
      c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.moveTo(156, 88); c.lineTo(258, 154); c.lineTo(156, 154); c.closePath(); c.fill();
      rbox(c, 138, 196, 38, 72, 3, '#7a4a2b'); circ(c, 168, 232, 2.4, '#f2c261');
      [[88, 172], [192, 172]].forEach(w => { rbox(c, w[0], w[1], 34, 32, 3, '#8ed1f5'); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(w[0] + 3, w[1] + 3, 12, 26); c.fillStyle = '#d8c39a'; c.fillRect(w[0] + 16, w[1], 2, 32); c.fillRect(w[0], w[1] + 15, 34, 2); });
      // hedge + fence
      for (let x = 12; x < W; x += 26) { if (x > 290 && x < 520) continue; rbox(c, x, 284, 15, 44, 3, lg(c, x, 284, x + 15, 284, [[0, '#ffffff'], [1, '#dfe6ee']])); }
    } else if (L === 'park') {
      c.fillStyle = lg(c, 0, 245, 0, 330, [[0, '#6fd08a'], [1, '#4fb86d']]); c.fillRect(0, 248, W, 84);
      [[90, 1.0], [215, 0.85], [625, 1.0], [738, 0.9]].forEach(([tx, sc], i) => {
        const sway = Math.sin(t * 1.3 + i) * 2.5;
        rbox(c, tx - 7 * sc, 205, 14 * sc, 68, 5, '#7a4e2c');
        circ(c, tx + sway, 178, 44 * sc, '#2f9e57'); circ(c, tx - 20 * sc + sway, 192, 30 * sc, '#3cb86a'); circ(c, tx + 22 * sc + sway, 194, 28 * sc, '#38b062');
        circ(c, tx + 8 * sc + sway, 160, 18 * sc, 'rgba(255,255,255,.12)');
      });
      // bench
      rbox(c, 528, 288, 70, 8, 3, '#8b5a33'); rbox(c, 532, 296, 6, 18, 2, '#4b5563'); rbox(c, 588, 296, 6, 18, 2, '#4b5563'); rbox(c, 528, 272, 70, 7, 3, '#a06a3c');
    } else if (L === 'downtown') {
      [{ x: 18, w: 98, h: 198, a: '#7c8ba3', b: '#5d6c85' }, { x: 124, w: 112, h: 238, a: '#55637c', b: '#3f4c63' }, { x: 556, w: 106, h: 224, a: '#7c8ba3', b: '#5d6c85' }, { x: 670, w: 112, h: 182, a: '#a3b0c4', b: '#8794ab' }].forEach((b, bi) => {
        rbox(c, b.x, GROUND - b.h, b.w, b.h, 4, lg(c, 0, GROUND - b.h, 0, GROUND, [[0, b.a], [1, b.b]]));
        for (let wy = GROUND - b.h + 16, r = 0; wy < GROUND - 24; wy += 32, r++) for (let wx = b.x + 14, cc = 0; wx < b.x + b.w - 22; wx += 26, cc++) {
          const lit = ((Math.floor(t / 4) + r * 3 + cc + bi) % 4) !== 0;
          rbox(c, wx, wy, 14, 18, 2, lit ? '#ffe9a8' : '#34425a');
        }
      });
    } else if (L === 'boardwalk') {
      c.fillStyle = lg(c, 0, 245, 0, 300, [[0, '#2a9fd6'], [1, '#1b78b4']]); c.fillRect(0, 248, W, 52);
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.lineCap = 'round';
      for (let i = 0; i < 7; i++) { const wx = ((i * 130 + t * 18) % (W + 80)) - 40, wy = 262 + (i % 3) * 11; c.beginPath(); c.moveTo(wx, wy); c.quadraticCurveTo(wx + 14, wy - 6, wx + 28, wy); c.stroke(); }
      c.fillStyle = lg(c, 0, 296, 0, 326, [[0, '#f6e2a8'], [1, '#e8cd8a']]); c.fillRect(0, 296, W, 32);
      // palm
      c.strokeStyle = '#7a5a36'; c.lineWidth = 7; c.beginPath(); c.moveTo(690, 300); c.quadraticCurveTo(700, 240, 686, 196); c.stroke();
      c.strokeStyle = '#2f9e57'; c.lineWidth = 6; for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.55; c.beginPath(); c.moveTo(686, 196); c.quadraticCurveTo(686 + Math.cos(a) * 30, 190 + Math.sin(a) * 18, 686 + Math.cos(a) * 52, 204 + Math.sin(a) * 10 + 12); c.stroke(); }
    } else if (L === 'fairgrounds') {
      c.fillStyle = lg(c, 0, 250, 0, 330, [[0, '#7bc67e'], [1, '#58a863']]); c.fillRect(0, 254, W, 76);
      const cx = 150, cy = 178, R = 84;
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3;
      c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke(); c.beginPath(); c.arc(cx, cy, R * 0.55, 0, TAU); c.stroke();
      const cols = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#eab308'];
      for (let i = 0; i < 8; i++) { const a = t * 0.3 + i * Math.PI / 4, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R; c.beginPath(); c.moveTo(cx, cy); c.lineTo(px, py); c.stroke(); rbox(c, px - 8, py - 6, 16, 14, 4, cols[i]); }
      c.strokeStyle = '#cbd5e1'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx - 24, 330); c.lineTo(cx, cy); c.lineTo(cx + 24, 330); c.stroke();
      // tent
      c.fillStyle = lg(c, 0, 150, 0, 290, [[0, '#ef4a5f'], [1, '#c92e46']]); c.beginPath(); c.moveTo(560, 292); c.lineTo(655, 158); c.lineTo(750, 292); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(655, 158); c.lineTo(574 + i * 36, 292); c.lineTo(592 + i * 36, 292); c.closePath(); c.fill(); }
    }

    if (has('billboard')) {
      rbox(c, 598, 150, 7, 178, 2, '#4b5563'); rbox(c, 704, 150, 7, 178, 2, '#4b5563');
      soft(c, 'rgba(0,0,0,.3)', 10, 4);
      rbox(c, 568, 78, 172, 80, 8, lg(c, 0, 78, 0, 158, [[0, '#ffe066'], [1, '#ffc233']]));
      nosoft(c);
      c.fillStyle = '#1f2937'; c.textAlign = 'center'; font(c, 23, 800); c.fillText('SUNNY SQUEEZE', 654, 112); font(c, 15, 600); c.fillText('Ice cold lemonade', 654, 138); c.textAlign = 'left';
    }
  }

  // ---------------------------------------------------------------- ground / street
  function ground(c, D, L, t) {
    // sidewalk
    c.fillStyle = L === 'boardwalk' ? lg(c, 0, GROUND, 0, 440, [[0, '#c98b4d'], [1, '#a96f38']]) : lg(c, 0, GROUND, 0, 440, [[0, '#dbe3ee'], [1, '#bcc7d6']]);
    c.fillRect(0, GROUND, W, 118);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(0, GROUND, W, 4);
    c.strokeStyle = L === 'boardwalk' ? 'rgba(80,45,15,.35)' : 'rgba(100,116,139,.22)'; c.lineWidth = 1.5;
    for (let y = GROUND + 28; y < 440; y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    if (L !== 'boardwalk') for (let x = -((t * 0) % 70); x < W; x += 70) { for (let y = GROUND + 28; y < 440; y += 60) { c.beginPath(); c.moveTo(x + (y % 120 ? 35 : 0), y); c.lineTo(x + (y % 120 ? 35 : 0), y + 30); c.stroke(); } }
    // curb + road
    c.fillStyle = '#e8edf4'; c.fillRect(0, 440, W, 6);
    c.fillStyle = L === 'boardwalk' ? lg(c, 0, 446, 0, 500, [[0, '#f0dcA0'], [1, '#e3c880']]) : lg(c, 0, 446, 0, 500, [[0, '#4b5668'], [1, '#334155']]);
    c.fillRect(0, 446, W, 54);
    if (L !== 'boardwalk') { c.fillStyle = 'rgba(255,255,255,.55)'; for (let x = -((t * 40) % 70); x < W; x += 70) c.fillRect(x, 476, 36, 4); }
    // sidewalk contact shadow under stand
    c.fillStyle = 'rgba(15,23,42,.16)'; c.beginPath(); c.ellipse(400, 346, 150, 11, 0, 0, TAU); c.fill();
  }

  function car(c, k) {
    c.save(); c.translate(k.x, 468); c.scale(k.dir, 1);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 20, 48, 6, 0, 0, TAU); c.fill();
    rbox(c, -46, -4, 92, 22, 9, k.color);
    c.fillStyle = k.color; c.beginPath(); c.moveTo(-26, -4); c.quadraticCurveTo(-18, -22, 0, -22); c.lineTo(16, -22); c.quadraticCurveTo(30, -20, 34, -4); c.closePath(); c.fill();
    c.fillStyle = 'rgba(190,225,250,.9)'; c.beginPath(); c.moveTo(-20, -5); c.quadraticCurveTo(-14, -18, -2, -18); c.lineTo(-2, -5); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(3, -5); c.lineTo(3, -18); c.lineTo(15, -18); c.quadraticCurveTo(24, -16, 27, -5); c.closePath(); c.fill();
    rbox(c, 40, 4, 6, 5, 2, '#fff3b0');
    circ(c, -26, 18, 8, '#1e293b'); circ(c, 26, 18, 8, '#1e293b'); circ(c, -26, 18, 3.5, '#9aa7b8'); circ(c, 26, 18, 3.5, '#9aa7b8');
    c.restore();
  }

  // ---------------------------------------------------------------- stand
  function stand(c, D, t) {
    const { state, sim, phase, has, money } = D;
    const x = 320, y = 212, away = phase === 'open' && sim.away > 0;

    if (has('umbrella')) {
      rbox(c, x + 168, y - 52, 5, 168, 2, '#6b7280');
      c.fillStyle = lg(c, 0, y - 110, 0, y - 50, [[0, '#38bdf8'], [1, '#0ea5e9']]);
      c.beginPath(); c.moveTo(x + 94, y - 50); c.quadraticCurveTo(x + 170, y - 126, x + 246, y - 50); c.quadraticCurveTo(x + 232, y - 58, x + 218, y - 50); c.quadraticCurveTo(x + 194, y - 60, x + 170, y - 50); c.quadraticCurveTo(x + 146, y - 60, x + 122, y - 50); c.quadraticCurveTo(x + 108, y - 58, x + 94, y - 50); c.fill();
    }

    // posts + back wall
    rbox(c, x + 22, y + 28, 116, 44, 0, lg(c, 0, y + 28, 0, y + 72, [[0, '#f3e3c3'], [1, '#e5cfa6']]));
    rbox(c, x + 6, y + 26, 12, 106, 4, lg(c, x + 6, 0, x + 18, 0, [[0, '#8a5a30'], [1, '#6a4020']]));
    rbox(c, x + 142, y + 26, 12, 106, 4, lg(c, x + 142, 0, x + 154, 0, [[0, '#8a5a30'], [1, '#6a4020']]));
    // shelf with lemons
    rbox(c, x + 24, y + 46, 114, 4, 2, '#a8763f');
    for (let i = 0; i < 5; i++) { c.fillStyle = '#ffd84d'; c.beginPath(); c.ellipse(x + 98 + i * 7, y + 42, 5, 4, 0, 0, TAU); c.fill(); }

    // helper
    if (has('helper') && !away) {
      const hb = Math.sin(t * 4) * 1.5, hx = x + 88;
      rbox(c, hx - 11, y + 44 + hb, 22, 28, 7, '#f8fafc');
      rbox(c, hx - 8, y + 54 + hb, 16, 18, 3, '#f59e0b');
      circ(c, hx, y + 36 + hb, 9.5, '#e8b98f');
      c.fillStyle = '#3b2a20'; c.beginPath(); c.arc(hx, y + 33 + hb, 10, Math.PI, 0); c.fill();
      c.fillStyle = '#ef4444'; c.beginPath(); c.arc(hx, y + 31 + hb, 10, Math.PI, 0); c.fill(); c.fillRect(hx - 2, y + 29 + hb, 14, 3);
      circ(c, hx + 3, y + 37 + hb, 1.2, '#1f2937'); circ(c, hx - 4, y + 37 + hb, 1.2, '#1f2937');
    }

    // counter
    soft(c, 'rgba(0,0,0,.3)', 10, 4);
    rbox(c, x - 4, y + 72, 168, 62, 5, lg(c, 0, y + 72, 0, y + 134, [[0, '#d9a45f'], [1, '#a9722f']]));
    nosoft(c);
    rbox(c, x - 8, y + 68, 176, 9, 4, '#efc88a');
    c.strokeStyle = 'rgba(80,45,15,.25)'; c.lineWidth = 1.5; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x - 4, y + 72 + i * 15); c.lineTo(x + 164, y + 72 + i * 15); c.stroke(); }
    // chalkboard
    rbox(c, x + 28, y + 84, 104, 42, 5, '#8a5a30');
    rbox(c, x + 31, y + 87, 98, 36, 3, '#1e293b');
    c.textAlign = 'center'; c.fillStyle = '#e2e8f0'; font(c, 12, 600); c.fillText('FRESH LEMONADE', x + 80, y + 100);
    c.fillStyle = '#fcd34d'; font(c, 19, 800); c.fillText(money(state.recipe.price), x + 80, y + 118); c.textAlign = 'left';

    // awning
    soft(c, 'rgba(0,0,0,.28)', 10, 5);
    for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#fff8e6' : '#ffc928'; c.fillRect(x - 10 + i * 30, y - 2, 30, 30); }
    nosoft(c);
    c.fillStyle = lg(c, 0, y - 2, 0, y + 28, [[0, 'rgba(0,0,0,.16)'], [1, 'rgba(0,0,0,0)']]); c.fillRect(x - 10, y - 2, 180, 30);
    for (let i = 0; i < 6; i++) { const wob = Math.sin(t * 2 + i) * 1.2; c.fillStyle = i % 2 ? '#fff8e6' : '#ffc928'; c.beginPath(); c.arc(x - 10 + i * 30 + 15, y + 28 + wob, 15, 0, Math.PI); c.fill(); }

    // string lights
    c.strokeStyle = 'rgba(30,41,59,.65)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 36, y - 8); c.quadraticCurveTo(x + 80, y + 18, x + 196, y - 8); c.stroke();
    for (let i = 0; i < 9; i++) {
      const u = (i + 0.5) / 9, fx = x - 36 + 232 * u, fy = (1 - u) * (1 - u) * (y - 8) + 2 * u * (1 - u) * (y + 18) + u * u * (y - 8);
      const pulse = 0.65 + Math.sin(t * 2.2 + i * 1.3) * 0.25;
      c.fillStyle = rg(c, fx, fy + 4, 0, 14, [[0, `rgba(255,224,130,${pulse})`], [1, 'rgba(255,224,130,0)']]); c.fillRect(fx - 14, fy - 10, 28, 28);
      circ(c, fx, fy + 4, 3, '#fff1b8');
    }

    // glass dispenser
    const lvl = phase === 'open' ? Math.max(0.12, sim.pitcher / 10) : 0.85;
    rbox(c, x + 12, y + 30, 28, 40, 7, 'rgba(210,235,250,.35)');
    const lh = 34 * lvl; rbox(c, x + 14, y + 68 - lh, 24, lh, 5, 'rgba(255,224,90,.9)');
    for (let i = 0; i < 3; i++) rbox(c, x + 17 + i * 6, y + 62 - lh * 0.6 - i * 3, 6, 6, 1.5, 'rgba(255,255,255,.7)');
    circ(c, x + 25, y + 52, 5, 'rgba(255,238,140,.95)'); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1; c.beginPath(); c.arc(x + 25, y + 52, 5, 0, TAU); c.stroke();
    rbox(c, x + 10, y + 26, 32, 6, 3, '#94a3b8'); rbox(c, x + 36, y + 62, 8, 4, 2, '#94a3b8');
    // cups stack
    for (let i = 0; i < 4; i++) { c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x + 52, y + 70 - i * 4); c.lineTo(x + 66, y + 70 - i * 4); c.lineTo(x + 64, y + 62 - i * 4); c.lineTo(x + 54, y + 62 - i * 4); c.closePath(); c.fill(); }
    c.fillStyle = '#ffc928'; c.fillRect(x + 53, y + 66, 12, 2);
    // tip jar
    rbox(c, x + 72, y + 54, 16, 16, 4, 'rgba(210,235,250,.5)'); c.fillStyle = '#fcd34d'; for (let i = 0; i < 3; i++) circ(c, x + 76 + i * 4, y + 67, 2.2, '#fcd34d');
    // register
    if (has('register')) { rbox(c, x + 108, y + 52, 34, 20, 4, '#475569'); rbox(c, x + 112, y + 40, 26, 14, 3, '#cbd5e1'); rbox(c, x + 115, y + 43, 20, 8, 2, '#86efac'); }
    // menu expansions on counter / side
    if (has('icedtea')) {
      rbox(c, x - 34, y + 34, 24, 34, 6, 'rgba(210,235,250,.35)');
      rbox(c, x - 32, y + 42, 20, 24, 4, 'rgba(217,119,6,.88)');
      rbox(c, x - 36, y + 30, 28, 5, 2, '#475569');
      circ(c, x - 22, y + 50, 3, '#4ade80');
    }
    if (has('smoothie')) {
      rbox(c, x + 90, y + 56, 16, 12, 3, '#334155');
      rbox(c, x + 91, y + 36, 14, 20, 4, 'rgba(244,114,182,.85)');
      rbox(c, x + 90, y + 33, 16, 4, 2, '#f43f5e');
    }
    if (has('pretzel')) {
      rbox(c, x - 48, y + 34, 30, 34, 4, '#334155');
      rbox(c, x - 45, y + 38, 24, 24, 3, 'rgba(254,240,138,.4)');
      circ(c, x - 33, y + 50, 6, '#d97706');
      circ(c, x - 33, y + 50, 2.5, 'rgba(254,240,138,.6)');
    }
    if (has('coffee')) {
      rbox(c, x + 144, y + 38, 24, 30, 4, '#475569');
      rbox(c, x + 148, y + 44, 16, 10, 2, '#1e293b');
      rbox(c, x + 151, y + 58, 10, 8, 2, '#f8fafc');
    }
    // neon sign
    if (has('sign')) {
      const on = Math.sin(t * 5) > -0.4;
      c.shadowColor = on ? '#ff4fa3' : 'transparent'; c.shadowBlur = on ? 14 : 0;
      c.strokeStyle = on ? '#ff7cc0' : '#7a2d56'; c.lineWidth = 3; c.beginPath(); c.roundRect(x + 42, y - 40, 78, 24, 12); c.stroke();
      c.fillStyle = on ? '#ffd1ea' : '#7a2d56'; c.textAlign = 'center'; font(c, 13, 700); c.fillText('ICE COLD', x + 81, y - 23); c.textAlign = 'left'; nosoft(c);
    }
    if (has('cooler')) { rbox(c, x - 46, y + 96, 38, 36, 6, '#0ea5e9'); rbox(c, x - 48, y + 92, 42, 9, 4, '#e0f2fe'); rbox(c, x - 36, y + 108, 18, 4, 2, 'rgba(255,255,255,.55)'); }
    if (has('icemaker')) { rbox(c, x - 104, y + 76, 46, 56, 6, lg(c, 0, y + 76, 0, y + 132, [[0, '#e2e8f0'], [1, '#b6c2d3']])); rbox(c, x - 97, y + 84, 32, 20, 4, '#9ad8f7'); circ(c, x - 70, y + 120, 3.5, Math.sin(t * 4) > 0 ? '#4ade80' : '#166534'); }
    if (has('slush')) {
      rbox(c, x + 172, y + 74, 38, 60, 7, lg(c, 0, y + 74, 0, y + 134, [[0, '#f1f5f9'], [1, '#b6c2d3']]));
      const sh = (Math.sin(t * 2) + 1) * 2.5; rbox(c, x + 177, y + 80 + sh, 28, 28 - sh, 5, lg(c, x + 177, 0, x + 205, 0, [[0, '#f472b6'], [1, '#60a5fa']]));
      rbox(c, x + 186, y + 116, 10, 10, 2, '#64748b');
    }
    if (has('boombox')) {
      const bx = x + 220, by = y + 108, bump = Math.abs(Math.sin(t * 8));
      rbox(c, bx, by, 42, 24, 6, '#334155'); circ(c, bx + 11, by + 13, 7 + bump * 0.8, '#94a3b8'); circ(c, bx + 31, by + 13, 7 + bump * 0.8, '#94a3b8'); circ(c, bx + 11, by + 13, 3, '#1f2937'); circ(c, bx + 31, by + 13, 3, '#1f2937');
      for (let i = 0; i < 2; i++) { const nt = (t * 0.8 + i * 0.5) % 1; c.globalAlpha = 1 - nt; c.fillStyle = '#e2e8f0'; circ(c, bx + 12 + nt * 30 + i * 10, by - 6 - nt * 40, 3.5, '#e2e8f0'); c.fillRect(bx + 14 + nt * 30 + i * 10, by - 20 - nt * 40, 2, 15); c.globalAlpha = 1; }
    }

    if (away) {
      c.save(); c.translate(x + 80, y + 78); soft(c, 'rgba(0,0,0,.3)', 8, 3);
      rbox(c, -62, -26, 124, 48, 8, '#1e293b'); nosoft(c); c.fillStyle = '#fcd34d'; c.textAlign = 'center'; font(c, 17, 800); c.fillText('BACK SOON', 0, -2); font(c, 11, 600); c.fillStyle = '#cbd5e1'; c.fillText('restocking', 0, 14); c.restore(); c.textAlign = 'left';
    }
  }

  // ---------------------------------------------------------------- people
  function limb(c, x0, y0, x1, y1, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }

  function cup(c, x, y) {
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x - 4, y - 8); c.lineTo(x + 4, y - 8); c.lineTo(x + 3, y + 3); c.lineTo(x - 3, y + 3); c.closePath(); c.fill();
    c.fillStyle = '#ffd84d'; c.fillRect(x - 3.6, y - 5, 7.2, 4);
    limb(c, x + 1, y - 8, x + 4, y - 13, 1.5, '#ef4444');
  }

  function hair(c, w) {
    const hc = w.hairColor;
    c.fillStyle = hc;
    if (w.hair === 'long') { c.beginPath(); c.roundRect(-10, -47, 13, 24, 6); c.fill(); }
    if (w.hair === 'bun') circ(c, -7, -49, 4.5, hc);
    if (w.hair === 'curly') { circ(c, -6, -44, 6, hc); circ(c, 0, -48, 6.5, hc); circ(c, 6, -45, 5.5, hc); }
    if (w.hair !== 'buzz') { c.beginPath(); c.arc(1, -38, 10.2, Math.PI * 1.02, Math.PI * 2.02); c.fill(); c.fillRect(-9, -39, 5, 6); }
    else { c.beginPath(); c.arc(1, -38, 9.8, Math.PI * 1.1, Math.PI * 1.95); c.fill(); }
  }

  function person(c, w, ambient, t) {
    const s = w.scale, stop = w.state === 'stop', sw = stop ? 0 : Math.sin(w.phase * 1.4);
    const bob = stop ? 0 : Math.abs(Math.sin(w.phase * 1.4)) * 1.6;
    c.save(); c.translate(w.x, w.y);
    c.fillStyle = 'rgba(15,23,42,.24)'; c.beginPath(); c.ellipse(0, 16 * s, 15 * s, 4.5 * s, 0, 0, TAU); c.fill();
    c.translate(0, -bob * s); c.scale(w.dir * s, s);

    // back arm, legs
    limb(c, -1, -22, -1 - sw * 7, -8, 4.6, w.color); limb(c, -1 - sw * 7 * 0.55, -14, -1 - sw * 7, -7, 4.2, w.skin);
    const legCol = w.pants, shoe = '#1f2937';
    rbox(c, -3.5 - sw * 7, 0, 7, 16, 3, legCol); rbox(c, -4.5 - sw * 7, 13, 10, 4.5, 2, shoe);
    rbox(c, -3.5 + sw * 7, 0, 7, 16, 3, legCol); rbox(c, -4.5 + sw * 7, 13, 10, 4.5, 2, shoe);
    c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-3.5 - sw * 7, 0, 7, 16);

    // torso
    const torso = w.critic ? '#243044' : w.color;
    c.fillStyle = lg(c, 0, -27, 0, 3, [[0, torso], [1, torso]]); c.beginPath(); c.roundRect(-9.5, -27, 19, 30, 7); c.fill();
    c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.roundRect(-9.5, -9, 19, 12, [0, 0, 7, 7]); c.fill();
    if (w.pattern === 1) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-9.5, -18, 19, 3); c.fillRect(-9.5, -11, 19, 3); }
    if (w.critic) { c.fillStyle = '#f8fafc'; c.fillRect(-2, -27, 4, 14); c.fillStyle = '#ef4444'; c.beginPath(); c.moveTo(0, -25); c.lineTo(2.5, -17); c.lineTo(0, -12); c.lineTo(-2.5, -17); c.closePath(); c.fill(); }
    rbox(c, -2.6, -30, 5.2, 6, 2, w.skin);

    // head
    circ(c, 0.5, -37, 9.6, w.skin);
    circ(c, -8, -36, 2.4, w.skin);
    hair(c, w);
    circ(c, 4.6, -37.5, 1.3, '#1f2937');
    if (stop) { c.strokeStyle = '#7a3b2e'; c.lineWidth = 1.3; c.beginPath(); c.arc(4, -33.5, 2.6, 0.2, 2.9); c.stroke(); } else { rbox(c, 3, -33, 3.6, 1.2, 0.6, 'rgba(122,59,46,.7)'); }
    if (w.hat === 'cap') { c.fillStyle = w.hatColor; c.beginPath(); c.arc(0.5, -39, 10.4, Math.PI, 0); c.fill(); rbox(c, 4, -41, 11, 3.2, 1.6, w.hatColor); }
    else if (w.hat === 'beanie') { c.fillStyle = w.hatColor; c.beginPath(); c.arc(0.5, -40, 10.4, Math.PI, 0); c.fill(); rbox(c, -10, -42, 21, 4, 2, 'rgba(255,255,255,.35)'); circ(c, 0.5, -50.5, 2.6, w.hatColor); }
    else if (w.hat === 'sunhat') { c.fillStyle = '#f3d77a'; c.beginPath(); c.ellipse(0.5, -43, 17, 4.2, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0.5, -43, 9, Math.PI, 0); c.fill(); rbox(c, -9, -45, 19, 2.2, 1, w.color); }
    else if (w.hat === 'shades' || w.critic) { rbox(c, -1, -40, 13, 5.2, 2.6, '#111827'); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(1, -39, 3, 1.2); }

    // front arm (+ cup / clipboard)
    if (stop && (w.cup || w.critic)) {
      limb(c, 2, -22, 11, -20, 4.6, torso); limb(c, 8, -20.5, 14, -22, 4.2, w.skin);
      if (w.critic) { rbox(c, 11, -34, 11, 15, 2, '#f8fafc'); c.fillStyle = '#94a3b8'; c.fillRect(13, -30, 7, 1.2); c.fillRect(13, -26, 7, 1.2); } else cup(c, 16, -24);
    } else {
      limb(c, 2, -22, 2 + sw * 7, -8, 4.6, torso); limb(c, 2 + sw * 7 * 0.55, -14, 2 + sw * 7, -7, 4.2, w.skin);
      if (w.cup) cup(c, 2 + sw * 7 + 3, -4);
    }
    c.restore();

    if (w.bubble && !ambient) {
      c.save(); c.translate(w.x, w.y - 66 * s - 12); font(c, 17, 700);
      const tw = c.measureText(w.bubble).width + 22;
      soft(c, 'rgba(0,0,0,.28)', 8, 3); c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(-tw / 2, -26, tw, 30, 15); c.fill();
      c.beginPath(); c.moveTo(-5, 3); c.lineTo(0, 11); c.lineTo(5, 3); c.closePath(); c.fill(); nosoft(c);
      c.fillStyle = w.bubbleColor || '#ffffff'; c.beginPath(); c.roundRect(-tw / 2, -26, 9, 30, [15, 0, 0, 15]); c.fill();
      c.fillStyle = '#1f2937'; c.textAlign = 'center'; c.fillText(w.bubble, 3, -5); c.textAlign = 'left'; c.restore();
    }
  }

  function dog(c, w) {
    c.save(); c.translate(w.x, w.y + 22); c.scale(w.dir, 1);
    c.fillStyle = 'rgba(15,23,42,.22)'; c.beginPath(); c.ellipse(0, 8, 20, 4, 0, 0, TAU); c.fill();
    const lgs = Math.sin(w.phase * 2) * 5;
    rbox(c, -14 + lgs, -2, 5, 10, 2, '#a0642a'); rbox(c, 8 - lgs, -2, 5, 10, 2, '#a0642a');
    rbox(c, -18, -15, 36, 16, 8, '#c58a45'); circ(c, 20, -17, 8, '#c58a45'); c.fillStyle = '#7a4a1e'; c.beginPath(); c.ellipse(16, -20, 3, 6, 0.3, 0, TAU); c.fill();
    circ(c, 23, -18, 1.4, '#1f2937'); circ(c, 27, -15, 1.8, '#1f2937');
    limb(c, -17, -11, -26, -19 + Math.sin(w.phase * 4) * 4, 3.5, '#c58a45');
    c.restore();
  }

  function bike(c, w) {
    c.save(); c.translate(w.x, w.y + 18); c.scale(w.dir, 1);
    c.fillStyle = 'rgba(15,23,42,.22)'; c.beginPath(); c.ellipse(0, 12, 28, 4, 0, 0, TAU); c.fill();
    c.strokeStyle = '#1e293b'; c.lineWidth = 2.4; c.beginPath(); c.arc(-16, 0, 11, 0, TAU); c.arc(16, 0, 11, 0, TAU); c.stroke();
    c.strokeStyle = '#ef4444'; c.lineWidth = 3; c.beginPath(); c.moveTo(-16, 0); c.lineTo(-2, -15); c.lineTo(16, 0); c.moveTo(-2, -15); c.lineTo(8, -16); c.lineTo(14, -2); c.stroke();
    const pa = w.phase * 1.2; limb(c, -2, -14, -2 + Math.cos(pa) * 6, -2 + Math.sin(pa) * 6, 4, '#1f2937');
    rbox(c, -10, -42, 18, 22, 8, w.color); limb(c, 2, -38, 12, -24, 4, w.skin);
    circ(c, 0, -50, 8.5, w.skin); c.fillStyle = '#e11d48'; c.beginPath(); c.arc(0, -52, 9, Math.PI, 0); c.fill();
    c.restore();
  }

  function walker(c, w, ambient, t) {
    if (w.kind === 'dog') dog(c, w); else if (w.kind === 'bike') bike(c, w); else person(c, w, ambient, t);
  }

  // ---------------------------------------------------------------- main
  function draw(c, D, dt) {
    const { state, sim, phase, money } = D;
    sim.t += dt; const t = sim.t, wId = state.weather.id, L = state.locationId;
    const p = phase === 'open' ? sim.elapsed : 0.3;
    c.lineJoin = 'round'; c.lineCap = 'round'; c.textAlign = 'left'; nosoft(c);

    // street traffic
    S.carTimer -= dt;
    if (S.carTimer <= 0 && L !== 'boardwalk') { S.carTimer = 5 + Math.random() * 6; const left = Math.random() < 0.5; S.cars.push({ x: left ? -80 : 880, dir: left ? 1 : -1, v: 110 + Math.random() * 60, color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)] }); }
    S.cars.forEach(k => { k.x += k.dir * k.v * dt; });
    S.cars = S.cars.filter(k => k.dir > 0 ? k.x < 900 : k.x > -100);

    sky(c, D, t, p);
    backdrop(c, D, L, t);
    ground(c, D, L, t);

    // butterflies
    if ((L === 'driveway' || L === 'park') && wId !== 'rainy') sim.flutter.forEach(f => {
      f.p += dt * 3; const bx = f.cx + Math.sin(f.p) * 55, by = f.cy + Math.cos(f.p * 1.7) * 18, fl = Math.abs(Math.sin(f.p * 9)) * 5 + 2;
      c.fillStyle = '#fb7185'; c.beginPath(); c.ellipse(bx - 3.5, by, fl, 5, 0, 0, TAU); c.ellipse(bx + 3.5, by, fl, 5, 0, 0, TAU); c.fill();
    });

    sim.ambient.forEach(a => walker(c, a, true, t));
    stand(c, D, t);
    sim.customers.forEach(cu => walker(c, cu, false, t));
    S.cars.forEach(k => car(c, k));

    // sparks + popups
    sim.sparks.forEach(s => { c.globalAlpha = Math.max(0, s.life); c.fillStyle = '#fde68a'; c.beginPath(); c.arc(s.x, s.y, 3, 0, TAU); c.fill(); });
    c.globalAlpha = 1;
    sim.popups.forEach(pp => { c.save(); c.globalAlpha = Math.max(0, pp.a); font(c, 24, 800); c.textAlign = 'center'; soft(c, 'rgba(0,0,0,.55)', 6, 2); c.fillStyle = pp.color; c.fillText(pp.text, pp.x, pp.y); c.restore(); });
    nosoft(c); c.textAlign = 'left';

    if (wId === 'rainy') { c.strokeStyle = 'rgba(190,225,250,.7)'; c.lineWidth = 1.6; sim.rain.forEach(r => { r.y += r.s * dt; r.x -= 40 * dt; if (r.y > H) { r.y = -15; r.x = Math.random() * (W + 60); } c.beginPath(); c.moveTo(r.x, r.y); c.lineTo(r.x - 3, r.y + r.l); c.stroke(); }); }

    // grading: time of day + vignette
    let tint = null;
    if (p < 0.15) tint = `rgba(255,170,90,${(0.15 - p) / 0.15 * 0.16})`; else if (p > 0.78) tint = `rgba(255,105,70,${(p - 0.78) / 0.22 * 0.3})`;
    if (tint) { c.fillStyle = tint; c.fillRect(0, 0, W, H); }
    c.fillStyle = rg(c, W / 2, H / 2, 200, 560, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(10,18,36,.32)']]); c.fillRect(0, 0, W, H);

    // banner
    if (sim.banner) {
      const b = sim.banner, a = Math.min(1, b.t * 2.2), yy = 14 - (1 - a) * 30;
      c.save(); c.globalAlpha = a; font(c, 22, 700); const w = c.measureText(b.text).width + 54;
      soft(c, 'rgba(0,0,0,.4)', 14, 4); c.fillStyle = 'rgba(15,23,42,.94)'; c.beginPath(); c.roundRect(400 - w / 2, yy + 36, w, 44, 22); c.fill(); nosoft(c);
      circ(c, 400 - w / 2 + 22, yy + 58, 7, '#fcd34d');
      c.fillStyle = '#f8fafc'; c.textAlign = 'center'; c.fillText(b.text, 400 + 10, yy + 66); c.restore(); c.textAlign = 'left';
    }
  }

  window.Art = { draw };
})();
