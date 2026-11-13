/**
 * SUNNY MINI MART - CARTOON ENTITIES & GAME OBJECTS
 * Smooth vector cartoon art style inspired by Monkey Mart / Mini Mart
 * Features unmistakable labeled stands, cartoon animals, expressive characters, and clear icons
 */

// Math helpers
const distSq = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2;
const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

// Item Definitions across Mart 1, Mart 2, and Mart 3
const ITEM_TYPES = {
  // --- MART 1: SUNNY FARM VALLEY ---
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    standTitle: 'TOMATO STAND',
    plotTitle: 'TOMATO GARDEN',
    color: '#ef4444',
    secondary: '#22c55e',
    awning1: '#ef4444',
    awning2: '#fee2e2',
    standBg: '#dcfce7',
    standBorder: '#15803d',
    price: 6,
    size: 14
  },
  egg: {
    id: 'egg',
    name: 'Farm Egg',
    standTitle: 'EGG RACK',
    plotTitle: 'CHICKEN COOP',
    color: '#fef3c7',
    secondary: '#f59e0b',
    awning1: '#f59e0b',
    awning2: '#fef3c7',
    standBg: '#fef9c3',
    standBorder: '#b45309',
    price: 12,
    size: 13
  },
  apple: {
    id: 'apple',
    name: 'Sweet Apple',
    standTitle: 'APPLE CRATE',
    plotTitle: 'APPLE ORCHARD',
    color: '#84cc16',
    secondary: '#dc2626',
    awning1: '#65a30d',
    awning2: '#ecfccb',
    standBg: '#ecfccb',
    standBorder: '#3f6212',
    price: 18,
    size: 14
  },
  milk: {
    id: 'milk',
    name: 'Fresh Milk',
    standTitle: 'MILK FRIDGE',
    plotTitle: 'DAIRY COW PEN',
    color: '#38bdf8',
    secondary: '#0284c7',
    awning1: '#0ea5e9',
    awning2: '#e0f2fe',
    standBg: '#e0f2fe',
    standBorder: '#0369a1',
    price: 24,
    size: 15
  },
  bread: {
    id: 'bread',
    name: 'Bakery Bread',
    standTitle: 'BREAD BAKERY',
    plotTitle: 'BAKERY OVEN',
    color: '#f59e0b',
    secondary: '#92400e',
    awning1: '#d97706',
    awning2: '#ffedd5',
    standBg: '#ffedd5',
    standBorder: '#9a3412',
    price: 35,
    size: 16
  },

  // --- MART 2: TROPICAL ISLAND BOARDWALK ---
  banana: {
    id: 'banana',
    name: 'Bananas',
    standTitle: 'BANANA STAND',
    plotTitle: 'BANANA GROVE',
    color: '#eab308',
    secondary: '#ca8a04',
    awning1: '#eab308',
    awning2: '#fef08a',
    standBg: '#fef9c3',
    standBorder: '#a16207',
    price: 15,
    size: 14
  },
  coconut: {
    id: 'coconut',
    name: 'Coconut',
    standTitle: 'COCONUT CRATE',
    plotTitle: 'COCONUT PALM',
    color: '#78350f',
    secondary: '#14b8a6',
    awning1: '#0d9488',
    awning2: '#ccfbf1',
    standBg: '#f0fdfa',
    standBorder: '#0f766e',
    price: 25,
    size: 15
  },
  pineapple: {
    id: 'pineapple',
    name: 'Pineapple',
    standTitle: 'PINEAPPLE CART',
    plotTitle: 'PINEAPPLE FIELD',
    color: '#f59e0b',
    secondary: '#15803d',
    awning1: '#f59e0b',
    awning2: '#dcfce7',
    standBg: '#fefce8',
    standBorder: '#b45309',
    price: 38,
    size: 15
  },
  smoothie: {
    id: 'smoothie',
    name: 'Fruit Smoothie',
    standTitle: 'SMOOTHIE BAR',
    plotTitle: 'TIKI BLENDER',
    color: '#ec4899',
    secondary: '#06b6d4',
    awning1: '#06b6d4',
    awning2: '#fce7f3',
    standBg: '#ecfeff',
    standBorder: '#0891b2',
    price: 55,
    size: 15
  },
  icecream: {
    id: 'icecream',
    name: 'Gelato Ice Cream',
    standTitle: 'ICE CREAM BAR',
    plotTitle: 'GELATO CHURNER',
    color: '#f43f5e',
    secondary: '#38bdf8',
    awning1: '#f43f5e',
    awning2: '#e0f2fe',
    standBg: '#fff1f2',
    standBorder: '#be123c',
    price: 75,
    size: 15
  },

  // --- MART 3: SWEET CANDYLAND & CONFECTIONS ---
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    standTitle: 'BERRY STAND',
    plotTitle: 'STRAWBERRY PATCH',
    color: '#f43f5e',
    secondary: '#16a34a',
    awning1: '#f43f5e',
    awning2: '#ffe4e6',
    standBg: '#fff1f2',
    standBorder: '#9f1239',
    price: 30,
    size: 14
  },
  cocoa: {
    id: 'cocoa',
    name: 'Cocoa Beans',
    standTitle: 'COCOA SACKS',
    plotTitle: 'COCOA ORCHARD',
    color: '#713f12',
    secondary: '#d97706',
    awning1: '#713f12',
    awning2: '#fef3c7',
    standBg: '#fef3c7',
    standBorder: '#451a03',
    price: 48,
    size: 14
  },
  chocolate: {
    id: 'chocolate',
    name: 'Artisan Chocolate',
    standTitle: 'CHOCOLATE CASE',
    plotTitle: 'CHOCOLATE VAT',
    color: '#451a03',
    secondary: '#f59e0b',
    awning1: '#b45309',
    awning2: '#fed7aa',
    standBg: '#ffedd5',
    standBorder: '#78350f',
    price: 80,
    size: 15
  },
  donut: {
    id: 'donut',
    name: 'Glazed Donut',
    standTitle: 'DONUT DISPLAY',
    plotTitle: 'DONUT BAKER',
    color: '#f472b6',
    secondary: '#f59e0b',
    awning1: '#ec4899',
    awning2: '#fdf2f8',
    standBg: '#fdf2f8',
    standBorder: '#db2777',
    price: 110,
    size: 15
  },
  candy: {
    id: 'candy',
    name: 'Rainbow Candy',
    standTitle: 'CANDY TOWER',
    plotTitle: 'CANDY CAROUSEL',
    color: '#a855f7',
    secondary: '#06b6d4',
    awning1: '#a855f7',
    awning2: '#f3e8ff',
    standBg: '#faf5ff',
    standBorder: '#7e22ce',
    price: 150,
    size: 15
  }
};

/**
 * HELPER: DRAW CARTOON OVERHEAD SIGNBOARD PILL (With Item Icon + Bold Label)
 */
function drawOverheadSign(ctx, x, y, label, itemType = null, accentColor = '#f59e0b') {
  ctx.save();
  ctx.translate(x, y);

  ctx.font = '700 11px "Fredoka", "Nunito", sans-serif';
  const textW = ctx.measureText(label).width;
  const iconSpace = itemType ? 20 : 0;
  const pillW = Math.max(88, textW + iconSpace + 22);
  const pillH = 24;

  // Drop shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.beginPath();
  ctx.roundRect(-pillW / 2, -pillH / 2 + 3, pillW, pillH, 12);
  ctx.fill();

  // Signboard background
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, 12);
  ctx.fill();
  ctx.stroke();

  // Top color accent bar
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.roundRect(-pillW / 2 + 2, -pillH / 2 + 2, pillW - 4, 5, 4);
  ctx.fill();

  if (itemType) {
    drawItemIcon(ctx, -pillW / 2 + 14, 1, itemType, 0.72);
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, -pillW / 2 + 26, 2);
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, 2);
  }

  ctx.restore();
}

/**
 * PLAYER CHARACTER (Cute Cartoon Shopkeeper)
 */
class MiniMartPlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = 225;
    this.speedLevel = 1;
    this.maxStack = 6;
    this.stackLevel = 1;
    this.carryStack = []; // Array of item ids
    this.radius = 18;
    this.facing = 'down'; // 'left', 'right', 'up', 'down'
    this.walkAnim = 0;
    this.isMoving = false;
    this.stackTilt = 0;
    this.targetTilt = 0;

    // Turbo sprint boost
    this.turbo = false;
    this.turboTimer = 0;
    this.turboCooldown = 0;
  }

  triggerTurbo() {
    if (this.turboCooldown <= 0 && !this.turbo) {
      this.turbo = true;
      this.turboTimer = 1.6;
      this.turboCooldown = 3.8;
      if (window.miniMartAudio) window.miniMartAudio.playDash();
    }
  }

  update(dt, input, bounds, game) {
    if (this.turbo) {
      this.turboTimer -= dt;
      if (this.turboTimer <= 0) {
        this.turbo = false;
      }
    }
    if (this.turboCooldown > 0) {
      this.turboCooldown -= dt;
    }

    let mx = 0;
    let my = 0;

    if (input.keys['KeyW'] || input.keys['ArrowUp']) my -= 1;
    if (input.keys['KeyS'] || input.keys['ArrowDown']) my += 1;
    if (input.keys['KeyA'] || input.keys['ArrowLeft']) mx -= 1;
    if (input.keys['KeyD'] || input.keys['ArrowRight']) mx += 1;

    if (input.gamepadConnected && input.gamepadMoveMagnitude > 0.15) {
      mx = input.gamepadMoveX;
      my = input.gamepadMoveY;
    }

    if (input.touchActive && input.touchMagnitude > 0.1) {
      mx = input.touchMoveX;
      my = input.touchMoveY;
    }

    const mag = Math.hypot(mx, my);
    if (mag > 0.15) {
      this.isMoving = true;
      const normX = mx / mag;
      const normY = my / mag;

      if (Math.abs(normX) > Math.abs(normY)) {
        this.facing = normX > 0 ? 'right' : 'left';
      } else {
        this.facing = normY > 0 ? 'down' : 'up';
      }

      const currentSpeed = (this.speed * (this.turbo ? 1.55 : 1.0)) * Math.min(1, mag);
      this.vx = normX * currentSpeed;
      this.vy = normY * currentSpeed;
      this.walkAnim += dt * 14;

      this.targetTilt = -normX * 0.22;
    } else {
      this.isMoving = false;
      this.vx *= 0.7;
      this.vy *= 0.7;
      this.targetTilt = 0;
    }

    this.stackTilt += (this.targetTilt - this.stackTilt) * Math.min(1, dt * 12);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const pad = 28;
    this.x = Math.max(bounds.minX + pad, Math.min(bounds.maxX - pad, this.x));
    this.y = Math.max(bounds.minY + pad, Math.min(bounds.maxY - pad, this.y));
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Soft cartoon ground shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 17, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Turbo speed aura ring
    if (this.turbo) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 14, 22, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    const legSwing = this.isMoving ? Math.sin(this.walkAnim) * 5 : 0;
    const bounce = this.isMoving ? Math.abs(Math.cos(this.walkAnim)) * 2.5 : 0;

    // Rounded cartoon sneakers
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(-6, 12 + legSwing, 5.5, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(6, 12 - legSwing, 5.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body: Bright Sky-Blue Shirt + Sunny Green Mart Apron
    ctx.fillStyle = '#0ea5e9';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-12, -8 - bounce, 24, 20, 8);
    ctx.fill();
    ctx.stroke();

    // Green Mart Apron with yellow pocket
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(-9, -4 - bounce, 18, 15, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-5, 3 - bounce, 10, 5);

    // Cute cartoon hands
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-14, 1 - legSwing * 0.6 - bounce, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, 1 + legSwing * 0.6 - bounce, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Big Smooth Cartoon Head
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -16 - bounce, 12.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Expressive Cartoon Eyes & Smile
    if (this.facing !== 'up') {
      const eyeOffsetX = this.facing === 'left' ? -3 : (this.facing === 'right' ? 3 : 0);
      // Rosy cheeks
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.ellipse(-6 + eyeOffsetX * 0.5, -13 - bounce, 2.8, 1.8, 0, 0, Math.PI * 2);
      ctx.ellipse(6 + eyeOffsetX * 0.5, -13 - bounce, 2.8, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-4.2 + eyeOffsetX, -16.5 - bounce, 2.4, 0, Math.PI * 2);
      ctx.arc(4.2 + eyeOffsetX, -16.5 - bounce, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // White eye shine dots
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4.8 + eyeOffsetX, -17.3 - bounce, 0.9, 0, Math.PI * 2);
      ctx.arc(3.6 + eyeOffsetX, -17.3 - bounce, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Happy smile
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(eyeOffsetX, -13.5 - bounce, 2.8, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    // Shopkeeper Green & Yellow Cap
    ctx.fillStyle = '#16a34a';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -20 - bounce, 12.5, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Cap visor & yellow badge
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(-13, -21 - bounce, 26, 4.5, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, -25 - bounce, 3, 0, Math.PI * 2);
    ctx.fill();

    // Floating Items on Head
    if (this.carryStack.length > 0) {
      const stackCount = this.carryStack.length;
      for (let i = 0; i < stackCount; i++) {
        const itemId = this.carryStack[i];
        const wobbleX = Math.sin(this.walkAnim * 0.8 + i * 0.4) * (this.isMoving ? 2.5 : 0.5);
        const stackHeight = 36 + i * 13 + bounce;
        const tiltX = this.stackTilt * (i * 12) + wobbleX;
        drawItemIcon(ctx, tiltX, -stackHeight, itemId, 1.05);
      }
    }

    ctx.restore();
  }
}

/**
 * PRODUCTION PLOT (Custom Cartoon Production Zones for All Marts)
 */
class ProductionPlot {
  constructor(opts) {
    this.id = opts.id;
    this.type = opts.type;
    this.name = opts.name;
    this.x = opts.x;
    this.y = opts.y;
    this.width = opts.width || 96;
    this.height = opts.height || 92;
    this.maxStorage = opts.maxStorage || 8;
    this.baseMaxStorage = this.maxStorage;
    this.storage = opts.initialStock || 0;
    this.growTimer = 0;
    this.growInterval = opts.growInterval || 2.2;
    this.baseGrowInterval = this.growInterval;
    this.unlocked = opts.unlocked !== undefined ? opts.unlocked : true;
    this.triggerRadius = 58;
    this.animTimer = Math.random() * 10;
  }

  update(dt, game) {
    if (!this.unlocked) return;
    this.animTimer += dt;

    const prodLevel = (game && game.prodLevel) ? game.prodLevel : 1;
    this.maxStorage = this.baseMaxStorage + (prodLevel - 1) * 2;
    this.growInterval = this.baseGrowInterval * Math.pow(0.86, prodLevel - 1);

    if (this.storage < this.maxStorage) {
      this.growTimer += dt;
      if (this.growTimer >= this.growInterval) {
        this.growTimer = 0;
        this.storage++;
        const itemDef = ITEM_TYPES[this.type];
        if (game && game.spawnPopEffect && itemDef) {
          game.spawnPopEffect(this.x, this.y - 12, itemDef.color);
        }
      }
    }

    const p = game.player;
    if (p && dist(this.x, this.y, p.x, p.y) < this.triggerRadius) {
      this.harvestTo(p, game);
    }

    if (Array.isArray(game.staffHelpers)) {
      for (let i = 0; i < game.staffHelpers.length; i++) {
        const helper = game.staffHelpers[i];
        if (helper && dist(this.x, this.y, helper.x, helper.y) < this.triggerRadius) {
          this.harvestTo(helper, game);
        }
      }
    } else if (game.staffHelper && dist(this.x, this.y, game.staffHelper.x, game.staffHelper.y) < this.triggerRadius) {
      this.harvestTo(game.staffHelper, game);
    }
  }

  harvestTo(carrier, game) {
    if (this.storage > 0 && carrier.carryStack.length < carrier.maxStack) {
      this.storage--;
      carrier.carryStack.push(this.type);
      if (carrier === game.player && window.miniMartAudio) {
        window.miniMartAudio.playHarvest();
        if (game.rumble) game.rumble(30, 0.15, 0.1);
      }
      if (carrier === game.player && game.progressTutorial) {
        game.progressTutorial('harvest_crop', 1);
      }
      game.spawnFlyingItem(this.x, this.y, carrier, this.type);
    }
  }

  draw(ctx) {
    if (!this.unlocked) return;

    const def = ITEM_TYPES[this.type] || ITEM_TYPES.tomato;
    ctx.save();
    ctx.translate(this.x, this.y);

    const w = this.width;
    const h = this.height;

    // 1. Soft 3D Ground Base Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 2, -h / 2 + 7, w, h, 18);
    ctx.fill();

    // 2. Custom Plot Visuals
    if (this.type === 'tomato') {
      // Wooden raised garden planter with fertile dark soil
      ctx.fillStyle = '#b45309';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#5c3418';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, 13);
      ctx.fill();

      // Furrow stripes
      ctx.fillStyle = '#472610';
      ctx.fillRect(-w / 2 + 12, -20, w - 24, 7);
      ctx.fillRect(-w / 2 + 12, 12, w - 24, 7);

      // 4 Lush Cartoon Tomato Bushes
      const bushCoords = [[-20, -16], [20, -16], [-20, 16], [20, 16]];
      bushCoords.forEach(([bx, by], idx) => {
        ctx.fillStyle = '#16a34a';
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, by, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(bx - 3, by - 3, 9, 0, Math.PI * 2);
        ctx.fill();

        if (idx < this.storage) {
          drawItemIcon(ctx, bx - 4, by + 2, 'tomato', 0.78);
        }
        if (idx + 4 < this.storage) {
          drawItemIcon(ctx, bx + 6, by - 3, 'tomato', 0.72);
        }
      });

    } else if (this.type === 'egg') {
      // Sunny Straw Chicken Coop Pen
      ctx.fillStyle = '#fde68a';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      // Golden straw nests
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(-20, 18, 15, 9, 0, 0, Math.PI * 2);
      ctx.ellipse(20, 18, 15, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Red-Roofed Wooden Henhouse
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-24, -h / 2 + 6, 48, 24, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-28, -h / 2 + 10);
      ctx.lineTo(0, -h / 2 - 4);
      ctx.lineTo(28, -h / 2 + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Animated Chickens
      const drawCartoonChicken = (cx, cy, flip, phase) => {
        const bob = Math.sin(this.animTimer * 5 + phase) * 2.5;
        ctx.save();
        ctx.translate(cx, cy + bob);
        ctx.scale(flip, 1);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-3, -11, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(10, -3); ctx.lineTo(16, 0); ctx.lineTo(10, 3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(5, -3, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawCartoonChicken(-18, -2, 1, 0);
      drawCartoonChicken(18, -2, -1, 2.2);

      for (let i = 0; i < Math.min(6, this.storage); i++) {
        const ex = (i % 2 === 0 ? -24 : 14) + (i % 3) * 6;
        const ey = 17 + (i % 2) * 3;
        drawItemIcon(ctx, ex, ey, 'egg', 0.78);
      }

    } else if (this.type === 'apple') {
      // Orchard Grass & Cartoon Apple Tree
      ctx.fillStyle = '#86efac';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#92400e';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-9, 2, 18, 26, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(-16, -4, 19, 0, Math.PI * 2);
      ctx.arc(16, -4, 19, 0, Math.PI * 2);
      ctx.arc(0, -16, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(0, -10, 22, 0, Math.PI * 2);
      ctx.fill();

      const appleSpots = [[-16, -6], [16, -6], [0, -20], [-8, 4], [10, 4], [0, -8]];
      for (let i = 0; i < Math.min(appleSpots.length, this.storage); i++) {
        drawItemIcon(ctx, appleSpots[i][0], appleSpots[i][1], 'apple', 0.85);
      }

    } else if (this.type === 'milk') {
      // Dairy Cow Pen
      ctx.fillStyle = '#bbf7d0';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      const cowBob = Math.sin(this.animTimer * 3.5) * 1.8;
      ctx.save();
      ctx.translate(-4, 2 + cowBob);

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-24, -14, 42, 28, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(-12, -5, 6.5, 0, Math.PI * 2);
      ctx.arc(6, 4, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(16, -6, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbcfe8';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(17, -1, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(13, -8, 2, 0, Math.PI * 2);
      ctx.arc(21, -8, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < Math.min(4, this.storage); i++) {
        drawItemIcon(ctx, -26 + i * 17, 24, 'milk', 0.8);
      }

    } else if (this.type === 'bread') {
      // Warm Bakery Oven
      ctx.fillStyle = '#ffedd5';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c2410c';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 4, 28, Math.PI, 0);
      ctx.lineTo(28, 16); ctx.lineTo(-28, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#431407';
      ctx.beginPath();
      ctx.arc(0, 14, 15, Math.PI, 0);
      ctx.fill();

      const flicker = Math.sin(this.animTimer * 8) * 2;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 14, 11 + flicker * 0.4, Math.PI, 0);
      ctx.fill();

      for (let i = 0; i < Math.min(4, this.storage); i++) {
        drawItemIcon(ctx, -24 + i * 16, 26, 'bread', 0.82);
      }

    // --- MART 2: TROPICAL ISLAND BOARDWALK PLOTS ---
    } else if (this.type === 'banana') {
      // Tropical Banana Grove (Rich Green Grass & Banana Palm)
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      // Curved Palm Trunk
      ctx.fillStyle = '#ca8a04';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-10, -4, 20, 32, 6);
      ctx.fill();
      ctx.stroke();

      // Sweeping Tropical Banana Leaves
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.ellipse(-22, -14, 22, 10, -0.4, 0, Math.PI * 2);
      ctx.ellipse(22, -14, 22, 10, 0.4, 0, Math.PI * 2);
      ctx.ellipse(0, -22, 24, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#365314';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Ripe Banana Bunches hanging
      for (let i = 0; i < Math.min(5, this.storage); i++) {
        const bx = -22 + i * 11;
        const by = 22;
        drawItemIcon(ctx, bx, by, 'banana', 0.85);
      }

    } else if (this.type === 'coconut') {
      // Beach Sand Island with Coconut Palm Tree
      ctx.fillStyle = '#fed7aa';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      // Coconut Palm trunk
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-8, -2, 16, 28, 5);
      ctx.fill();
      ctx.stroke();

      // Palm fronds
      ctx.fillStyle = '#0d9488';
      ctx.beginPath();
      ctx.arc(-16, -14, 18, 0, Math.PI * 2);
      ctx.arc(16, -14, 18, 0, Math.PI * 2);
      ctx.arc(0, -20, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Ready Coconuts on the ground
      for (let i = 0; i < Math.min(4, this.storage); i++) {
        drawItemIcon(ctx, -24 + i * 16, 22, 'coconut', 0.85);
      }

    } else if (this.type === 'pineapple') {
      // Tropical Pineapple Field
      ctx.fillStyle = '#ecfccb';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      // Spiky Pineapple Rosettes
      const pineSpots = [[-22, -12], [22, -12], [0, 4]];
      pineSpots.forEach(([px, py]) => {
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.ellipse(px, py, 14, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      for (let i = 0; i < Math.min(5, this.storage); i++) {
        drawItemIcon(ctx, -24 + i * 12, 22, 'pineapple', 0.82);
      }

    } else if (this.type === 'smoothie') {
      // Tiki Blender Juice Bar
      ctx.fillStyle = '#cffafe';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      // Bamboo Blender Counter
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-30, -10, 60, 28, 6);
      ctx.fill();
      ctx.stroke();

      // 2 Glass Blender Jars with Swirling Smoothie
      const drawBlender = (bx, by, liquidColor) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx - 9, by - 14, 18, 20, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = liquidColor;
        ctx.beginPath();
        ctx.roundRect(bx - 7, by - 6, 14, 10, 2);
        ctx.fill();

        // Lid
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bx - 10, by - 16, 20, 3);
      };

      drawBlender(-14, -6, '#ec4899');
      drawBlender(14, -6, '#06b6d4');

      for (let i = 0; i < Math.min(4, this.storage); i++) {
        drawItemIcon(ctx, -24 + i * 16, 24, 'smoothie', 0.8);
      }

    } else if (this.type === 'icecream') {
      // Vintage Gelato Churner Cart
      ctx.fillStyle = '#ffe4e6';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      // Chrome Gelato Machine
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-26, -18, 52, 34, 8);
      ctx.fill();
      ctx.stroke();

      // Chrome freezer lids
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(-12, -4, 9, 0, Math.PI * 2);
      ctx.arc(12, -4, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      for (let i = 0; i < Math.min(4, this.storage); i++) {
        drawItemIcon(ctx, -24 + i * 16, 24, 'icecream', 0.82);
      }

    // --- MART 3: SWEET CANDYLAND PLOTS ---
    } else if (this.type === 'strawberry') {
      // Sweet Strawberry Patch
      ctx.fillStyle = '#ffe4e6';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      // Lush clover green mounds
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(-18, -8, 16, 0, Math.PI * 2);
      ctx.arc(18, -8, 16, 0, Math.PI * 2);
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // White blossoms
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-12, -14, 4, 0, Math.PI * 2);
      ctx.arc(12, -14, 4, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < Math.min(5, this.storage); i++) {
        drawItemIcon(ctx, -24 + i * 12, 22, 'strawberry', 0.85);
      }

    } else if (this.type === 'cocoa') {
      // Cacao Tree & Cocoa Pods
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-10, -8, 20, 36, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(-16, -18, 18, 0, Math.PI * 2);
      ctx.arc(16, -18, 18, 0, Math.PI * 2);
      ctx.arc(0, -22, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      for (let i = 0; i < Math.min(4, this.storage); i++) {
        drawItemIcon(ctx, -24 + i * 16, 22, 'cocoa', 0.82);
      }

    } else if (this.type === 'chocolate') {
      // Steaming Copper Chocolate Fondue Vat
      ctx.fillStyle = '#fed7aa';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      // Copper Kettle
      ctx.fillStyle = '#c2410c';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Melted Chocolate Swirl
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // Golden stir paddle
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -10); ctx.lineTo(10, 10);
      ctx.stroke();

      for (let i = 0; i < Math.min(4, this.storage); i++) {
        drawItemIcon(ctx, -24 + i * 16, 24, 'chocolate', 0.82);
      }

    } else if (this.type === 'donut') {
      // Donut Baking Station
      ctx.fillStyle = '#fdf2f8';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      // Fryer counter
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-28, -16, 56, 32, 8);
      ctx.fill();
      ctx.stroke();

      // Sizzling oil tray
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.roundRect(-22, -11, 44, 22, 5);
      ctx.fill();

      for (let i = 0; i < Math.min(4, this.storage); i++) {
        drawItemIcon(ctx, -24 + i * 16, 24, 'donut', 0.82);
      }

    } else if (this.type === 'candy') {
      // Rainbow Candy Spinning Carousel
      ctx.fillStyle = '#faf5ff';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 18);
      ctx.fill();
      ctx.stroke();

      // Glass Dome Base
      ctx.fillStyle = '#a855f7';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-26, 0, 52, 16, 6);
      ctx.fill();
      ctx.stroke();

      // Glass sphere dome
      ctx.fillStyle = 'rgba(238, 242, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(0, -8, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rainbow candy swirl in dome
      const swirl = this.animTimer * 2;
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(Math.cos(swirl) * 8, -8 + Math.sin(swirl) * 8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(Math.cos(swirl + 2.1) * 8, -8 + Math.sin(swirl + 2.1) * 8, 5, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < Math.min(4, this.storage); i++) {
        drawItemIcon(ctx, -24 + i * 16, 24, 'candy', 0.82);
      }
    }

    // 3. Overhead Signboard with Icon + Plot Name
    drawOverheadSign(ctx, 0, -h / 2 - 14, def.plotTitle, this.type, def.color);

    // 4. Bottom Stock Counter Pill + Production Progress Bar
    const pillW = 78;
    const pillH = 22;
    const pillY = h / 2 + 4;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-pillW / 2, pillY, pillW, pillH, 11);
    ctx.fill();

    const prog = this.storage >= this.maxStorage ? 1 : (this.growTimer / this.growInterval);
    ctx.fillStyle = this.storage >= this.maxStorage ? '#16a34a' : '#0284c7';
    ctx.beginPath();
    ctx.roundRect(-pillW / 2 + 2, pillY + 2, Math.max(8, (pillW - 4) * prog), pillH - 4, 9);
    ctx.fill();

    ctx.font = '700 11px "Fredoka", "Nunito", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`READY: ${this.storage}/${this.maxStorage}`, 0, pillY + pillH / 2 + 0.5);

    ctx.restore();
  }
}

/**
 * DISPLAY SHELF / GROCERY STAND (Distinct Cartoon Market Stand per Department)
 */
class StoreShelf {
  constructor(opts) {
    this.id = opts.id;
    this.type = opts.type; // item type accepted
    this.name = opts.name;
    this.x = opts.x;
    this.y = opts.y;
    this.width = opts.width || 96;
    this.height = opts.height || 74;
    this.maxCapacity = opts.maxCapacity || 12;
    this.baseMaxCapacity = this.maxCapacity;
    this.items = opts.initialStock || 4;
    this.unlocked = opts.unlocked !== undefined ? opts.unlocked : true;
    this.triggerRadius = 60;
  }

  update(dt, game) {
    if (!this.unlocked) return;

    const prodLevel = (game && game.prodLevel) ? game.prodLevel : 1;
    this.maxCapacity = this.baseMaxCapacity + (prodLevel - 1) * 3;

    const p = game.player;
    if (p && dist(this.x, this.y, p.x, p.y) < this.triggerRadius) {
      this.restockFrom(p, game);
    }

    if (Array.isArray(game.staffHelpers)) {
      for (let i = 0; i < game.staffHelpers.length; i++) {
        const helper = game.staffHelpers[i];
        if (helper && dist(this.x, this.y, helper.x, helper.y) < this.triggerRadius) {
          this.restockFrom(helper, game);
        }
      }
    } else if (game.staffHelper && dist(this.x, this.y, game.staffHelper.x, game.staffHelper.y) < this.triggerRadius) {
      this.restockFrom(game.staffHelper, game);
    }
  }

  restockFrom(carrier, game) {
    if (this.items < this.maxCapacity && carrier.carryStack.length > 0) {
      const idx = carrier.carryStack.indexOf(this.type);
      if (idx !== -1) {
        carrier.carryStack.splice(idx, 1);
        this.items++;
        if (carrier === game.player && window.miniMartAudio) {
          window.miniMartAudio.playRestock();
          if (game.rumble) game.rumble(30, 0.12, 0.1);
        }
        if (carrier === game.player && game.progressTutorial) {
          game.progressTutorial('stock_shelf', 1);
        }
        game.spawnFlyingItem(carrier.x, carrier.y, this, this.type);
      }
    }
  }

  draw(ctx) {
    if (!this.unlocked) return;

    const def = ITEM_TYPES[this.type] || ITEM_TYPES.tomato;
    ctx.save();
    ctx.translate(this.x, this.y);

    const w = this.width;
    const h = this.height;

    // 1. Drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 2, -h / 2 + 7, w, h, 16);
    ctx.fill();

    // 2. Cartoon Market Stand Body
    ctx.fillStyle = def.standBorder || '#d97706';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 16);
    ctx.fill();
    ctx.stroke();

    // Inner display tray recess
    ctx.fillStyle = def.standBg;
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 6, -h / 2 + 12, w - 12, h - 20, 11);
    ctx.fill();

    // Striped Cartoon Market Awning along the top edge of the stand
    const stripeCount = 6;
    const stripeW = (w - 8) / stripeCount;
    for (let s = 0; s < stripeCount; s++) {
      ctx.fillStyle = (s % 2 === 0) ? def.awning1 : def.awning2;
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 4 + s * stripeW, -h / 2 + 2, stripeW, 11, 4);
      ctx.fill();
    }

    // Horizontal shelf divider bar
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-w / 2 + 6, 2, w - 12, 4);

    // 3. Draw up to 12 Visible Item Slots cleanly inside the tray
    const cols = 4;
    const visibleSlots = Math.min(12, this.maxCapacity);
    const visualFilled = Math.min(visibleSlots, this.items);
    for (let i = 0; i < visibleSlots; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ix = -w / 2 + 18 + col * 20;
      const iy = -13 + row * 16;

      if (i < visualFilled) {
        drawItemIcon(ctx, ix, iy, this.type, 0.92);
      } else {
        ctx.save();
        ctx.globalAlpha = 0.2;
        drawItemIcon(ctx, ix, iy, this.type, 0.78);
        ctx.restore();
      }
    }

    // 4. Overhead Department Signboard (Icon + Stand Name)
    drawOverheadSign(ctx, 0, -h / 2 - 14, def.standTitle, this.type, def.color);

    // 5. Bottom Stock Badge
    const isEmpty = this.items === 0;
    const badgeW = isEmpty ? 94 : 68;
    const badgeH = 20;
    const badgeY = h / 2 + 4;

    ctx.fillStyle = isEmpty ? '#ef4444' : '#1e293b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 10.5px "Fredoka", "Nunito", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      isEmpty ? `RESTOCK ${def.name.toUpperCase()}!` : `${this.items}/${this.maxCapacity}`,
      0,
      badgeY + badgeH / 2 + 0.5
    );

    ctx.restore();
  }
}

/**
 * CHECKOUT COUNTER & CASH REGISTER
 */
/**
 * CHECKOUT COUNTER & CASH REGISTER
 * Features an enlarged cashier standing floor mat, precise hit detection,
 * instant customer queue pickup, and automatic cash collection while standing at the register.
 */
class CheckoutCounter {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 136;
    this.height = 78;
    this.cashStash = 0;
    this.activeCustomer = null;
    this.scanTimer = 0;
    this.scanInterval = 0.45;
    this.isPlayerAttending = false;
    this.animPulse = 0;
  }

  // Exact world coordinates of the cashier standing mat center
  getMatCenter() {
    return {
      x: this.x - 104,
      y: this.y
    };
  }

  update(dt, game) {
    this.animPulse += dt * 6;
    const mat = this.getMatCenter();

    // Robust, spacious check for player standing on or touching the mat
    const p = game.player;
    const dx = p ? Math.abs(p.x - mat.x) : 999;
    const dy = p ? Math.abs(p.y - mat.y) : 999;
    const playerOnMat = dx < 48 && dy < 48;
    const playerNearMat = p ? (dist(p.x, p.y, mat.x, mat.y) < 55) : false;
    
    this.isPlayerAttending = playerOnMat || playerNearMat;
    const cashierAttending = game.cashierHired;
    const canScan = this.isPlayerAttending || cashierAttending;

    // 1. Ensure active customer is assigned from queue head
    if (!this.activeCustomer || this.activeCustomer.state === 'LEAVING' || this.activeCustomer.state === 'DONE') {
      if (game.customerQueue && game.customerQueue.length > 0) {
        const head = game.customerQueue[0];
        const queueSlotX = this.x + 52;
        const queueSlotY = this.y - 10;
        const d = dist(head.x, head.y, queueSlotX, queueSlotY);
        if (d < 65) {
          this.activeCustomer = head;
        }
      }
    }

    // 2. Scan items
    const cashierLvl = (game && game.cashierLevel) ? game.cashierLevel : 1;
    const activeScanInterval = cashierAttending
      ? Math.max(0.14, this.scanInterval * Math.pow(0.78, cashierLvl - 1))
      : this.scanInterval;

    if (canScan && this.activeCustomer && this.activeCustomer.basket && this.activeCustomer.basket.length > 0) {
      this.scanTimer += dt;
      if (this.scanTimer >= activeScanInterval) {
        this.scanTimer = 0;
        const item = this.activeCustomer.basket.shift();
        const itemVal = ITEM_TYPES[item] ? ITEM_TYPES[item].price : 8;
        this.cashStash += itemVal;

        if (window.miniMartAudio) window.miniMartAudio.playScan();
        if (game.rumble) game.rumble(30, 0.1, 0.1);

        game.spawnFloatingText(this.x + 12, this.y - 24, `+$${itemVal}`, '#16a34a', 16);

        if (this.activeCustomer.basket.length === 0) {
          const finishedCustomer = this.activeCustomer;
          finishedCustomer.state = 'LEAVING';
          const qIdx = game.customerQueue.indexOf(finishedCustomer);
          if (qIdx !== -1) game.customerQueue.splice(qIdx, 1);

          game.totalCustomersServed = (game.totalCustomersServed || 0) + 1;
          if (game.progressTutorial) {
            game.progressTutorial('serve_customers', 1);
          }
          game.spawnHeartEffect(finishedCustomer.x, finishedCustomer.y - 28);
          this.activeCustomer = null;

          // Check if next customer in line is already waiting
          if (game.customerQueue.length > 0) {
            const nextHead = game.customerQueue[0];
            if (dist(nextHead.x, nextHead.y, this.x + 52, this.y - 10) < 70) {
              this.activeCustomer = nextHead;
            }
          }
        }
      }
    }

    // 3. Collect cash stash
    // Automatically collects cash when attending on mat OR near the desk
    if (this.cashStash > 0 && p) {
      const nearDesk = dist(this.x, this.y, p.x, p.y) < 95;
      if (this.isPlayerAttending || nearDesk) {
        const collected = this.cashStash;
        this.cashStash = 0;
        game.money += collected;
        if (window.miniMartAudio) window.miniMartAudio.playCash();
        if (game.rumble) game.rumble(50, 0.2, 0.15);
        game.spawnFloatingText(this.x, this.y - 34, `+$${collected}`, '#16a34a', 22);
        game.spawnCashParticles(this.x, this.y, 10);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const w = this.width;
    const h = this.height;

    // 1. Extra Large Cashier Standing Floor Mat on the left side of counter
    // Mat center is at (-104, 0), dimensions 58x60
    const matX = -104;
    const matY = 0;
    const matW = 58;
    const matH = 60;

    const isActive = this.isPlayerAttending;

    // Glowing aura when player is standing on mat
    if (isActive) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
      ctx.beginPath();
      ctx.roundRect(matX - matW / 2 - 4, matY - matH / 2 - 4, matW + 8, matH + 8, 14);
      ctx.fill();
    }

    // Mat Body
    ctx.fillStyle = isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.18)';
    ctx.strokeStyle = isActive ? '#15803d' : '#16a34a';
    ctx.lineWidth = isActive ? 3 : 2.5;
    ctx.setLineDash(isActive ? [] : [6, 4]);
    ctx.beginPath();
    ctx.roundRect(matX - matW / 2, matY - matH / 2, matW, matH, 12);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Mat Labels
    ctx.fillStyle = isActive ? '#15803d' : '#16a34a';
    ctx.font = '800 10.5px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isActive) {
      if (this.activeCustomer && this.activeCustomer.basket.length > 0) {
        ctx.fillText('SCANNING', matX, matY - 6);
        ctx.fillText('...', matX, matY + 8);
      } else {
        ctx.fillText('ACTIVE', matX, matY - 6);
        ctx.fillText('READY', matX, matY + 8);
      }
    } else {
      ctx.fillText('STAND', matX, matY - 7);
      ctx.fillText('HERE', matX, matY + 7);
    }

    // 2. Counter Drop Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 2, -h / 2 + 7, w, h, 16);
    ctx.fill();

    // 3. Bright Cartoon Checkout Desk Body
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 16);
    ctx.fill();
    ctx.stroke();

    // Cream countertop surface
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 14, 12);
    ctx.fill();

    // Moving Conveyor Belt
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 12, -22, 60, 44, 6);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 26, -18); ctx.lineTo(-w / 2 + 26, 18);
    ctx.moveTo(-w / 2 + 42, -18); ctx.lineTo(-w / 2 + 42, 18);
    ctx.moveTo(-w / 2 + 58, -18); ctx.lineTo(-w / 2 + 58, 18);
    ctx.stroke();

    // Cartoon Cash Register
    ctx.fillStyle = '#0ea5e9';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(16, -26, 36, 30, 6);
    ctx.fill();
    ctx.stroke();

    // Register Screen
    ctx.fillStyle = isActive ? '#4ade80' : '#22c55e';
    ctx.beginPath();
    ctx.roundRect(20, -22, 28, 14, 3);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 11px "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', 34, -11);

    // Overhead Signboard
    drawOverheadSign(ctx, 0, -h / 2 - 14, 'CHECKOUT REGISTER', null, '#22c55e');

    // Dollar Bills Stacks
    if (this.cashStash > 0) {
      const stacks = Math.min(7, Math.ceil(this.cashStash / 12));
      for (let s = 0; s < stacks; s++) {
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(16, 8 - s * 4, 28, 12, 3);
        ctx.fill();
        ctx.stroke();
      }

      ctx.fillStyle = '#16a34a';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(4, 24, 52, 20, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 11px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`$${this.cashStash}`, 30, 37);
    }

    ctx.restore();
  }
}


/**
 * TRASH CAN / DISPOSAL BIN
 * Allows player to discard unwanted items from their carry stack
 */
class TrashBin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 52;
    this.height = 62;
    this.triggerRadius = 48;
    this.discardTimer = 0;
    this.discardInterval = 0.22;
    this.lidAnim = 0;
    this.isOpen = false;
  }

  update(dt, game) {
    const p = game.player;
    const playerNear = p && dist(this.x, this.y, p.x, p.y) < this.triggerRadius;

    if (playerNear && p.carryStack.length > 0) {
      this.isOpen = true;
      this.discardTimer += dt;
      if (this.discardTimer >= this.discardInterval) {
        this.discardTimer = 0;
        const tossedItem = p.carryStack.pop();
        if (tossedItem) {
          if (window.miniMartAudio) window.miniMartAudio.playBlip();
          if (game.rumble) game.rumble(25, 0.1, 0.08);
          const color = (ITEM_TYPES[tossedItem] && ITEM_TYPES[tossedItem].color) || '#ef4444';
          game.spawnPopEffect(this.x, this.y - 20, color);
          game.spawnFloatingText(this.x, this.y - 34, 'DISCARDED', '#ef4444', 15);
        }
      }
    } else {
      this.isOpen = false;
      this.discardTimer = 0;
    }

    const targetLid = this.isOpen ? 1 : 0;
    this.lidAnim += (targetLid - this.lidAnim) * Math.min(1, dt * 10);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trash Bin Body (Sleek Charcoal / Metallic with Ribs)
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-20, -14, 40, 34, [4, 4, 10, 10]);
    ctx.fill();
    ctx.stroke();

    // Metallic Sheen Ribs
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -4); ctx.lineTo(16, -4);
    ctx.moveTo(-16, 6); ctx.lineTo(16, 6);
    ctx.stroke();

    // Green Recycling / Disposal Symbol in Center
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 4, 7, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(3, -5); ctx.lineTo(8, -3); ctx.lineTo(6, -8);
    ctx.closePath();
    ctx.fill();

    // Animated Hinged Flip Lid
    ctx.save();
    ctx.translate(0, -14);
    ctx.rotate(-this.lidAnim * 0.45); // Flips open when player is discarding!

    // Lid Rim
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-24, -6, 48, 8, 4);
    ctx.fill();
    ctx.stroke();

    // Lid Handle
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(-8, -12, 16, 6, 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Overhead Signboard: "TRASH CAN"
    drawOverheadSign(ctx, 0, -38, 'TRASH CAN', null, '#ef4444');

    // Dashed stand area indicator when player carrying items
    if (this.isOpen) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.ellipse(0, 18, 28, 14, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
}

class MartCustomer {
  constructor(x, y, desiredTypes) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.speed = 108;
    this.basket = [];
    this.shoppingList = [...desiredTypes];
    this.currentGoalShelf = null;
    this.state = 'SPAWN';
    this.shirtColor = ['#38bdf8', '#fb7185', '#a78bfa', '#facc15', '#f97316', '#34d399'][Math.floor(Math.random() * 6)];
    this.hairColor = ['#78350f', '#1e293b', '#b45309', '#eab308'][Math.floor(Math.random() * 4)];
    this.walkAnim = Math.random() * 10;
    this.waitTimer = 0;
  }

  update(dt, game) {
    this.walkAnim += dt * 10;

    if (this.state === 'SPAWN') {
      this.findNextShelf(game);
    } else if (this.state === 'WALKING_TO_SHELF') {
      if (this.currentGoalShelf) {
        this.targetX = this.currentGoalShelf.x;
        this.targetY = this.currentGoalShelf.y + 48;

        this.moveTowards(this.targetX, this.targetY, dt);

        if (dist(this.x, this.y, this.targetX, this.targetY) < 14) {
          if (this.currentGoalShelf.items > 0) {
            this.currentGoalShelf.items--;
            const item = this.currentGoalShelf.type;
            this.basket.push(item);
            this.shoppingList.shift();
            game.spawnFlyingItem(this.currentGoalShelf.x, this.currentGoalShelf.y, this, item);
            this.findNextShelf(game);
          } else {
            this.state = 'WAITING_FOR_RESTOCK';
            this.waitTimer = 0;
          }
        }
      } else {
        this.state = 'WALKING_TO_CHECKOUT';
      }
    } else if (this.state === 'WAITING_FOR_RESTOCK') {
      this.waitTimer += dt;
      if (this.currentGoalShelf && this.currentGoalShelf.items > 0) {
        this.currentGoalShelf.items--;
        const item = this.currentGoalShelf.type;
        this.basket.push(item);
        this.shoppingList.shift();
        game.spawnFlyingItem(this.currentGoalShelf.x, this.currentGoalShelf.y, this, item);
        this.findNextShelf(game);
      } else if (this.waitTimer > 8.0) {
        this.shoppingList.shift();
        this.findNextShelf(game);
      }
    } else if (this.state === 'WALKING_TO_CHECKOUT') {
      const queueIndex = game.customerQueue.indexOf(this);
      const queueSlotY = game.checkout.y - 10 + (queueIndex * 36);
      const queueSlotX = game.checkout.x + 52;

      this.moveTowards(queueSlotX, queueSlotY, dt);
      if (dist(this.x, this.y, queueSlotX, queueSlotY) < 18) {
        this.state = 'IN_QUEUE';
      }
    } else if (this.state === 'IN_QUEUE') {
      const queueIndex = game.customerQueue.indexOf(this);
      if (queueIndex === 0) {
        game.checkout.activeCustomer = this;
      }
      const queueSlotY = game.checkout.y - 10 + (queueIndex * 36);
      const queueSlotX = game.checkout.x + 52;
      this.moveTowards(queueSlotX, queueSlotY, dt);
    } else if (this.state === 'LEAVING') {
      this.moveTowards(game.entranceX, game.entranceY + 40, dt);
      if (dist(this.x, this.y, game.entranceX, game.entranceY + 40) < 16) {
        this.state = 'DONE';
      }
    }
  }

  findNextShelf(game) {
    if (this.shoppingList.length > 0) {
      const nextType = this.shoppingList[0];
      const matchingShelf = game.shelves.find(s => s.type === nextType && s.unlocked);
      if (matchingShelf) {
        this.currentGoalShelf = matchingShelf;
        this.state = 'WALKING_TO_SHELF';
      } else {
        this.shoppingList.shift();
        this.findNextShelf(game);
      }
    } else {
      this.currentGoalShelf = null;
      if (!game.customerQueue.includes(this)) {
        game.customerQueue.push(this);
      }
      this.state = 'WALKING_TO_CHECKOUT';
    }
  }

  moveTowards(tx, ty, dt) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d > 2) {
      this.x += (dx / d) * this.speed * dt;
      this.y += (dy / d) * this.speed * dt;
    }
  }

  draw(ctx) {
    if (this.state === 'DONE') return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const leg = Math.sin(this.walkAnim) * 3.5;

    // Feet
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(-5, 10 + leg, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(5, 10 - leg, 4.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rounded cartoon body
    ctx.fillStyle = this.shirtColor;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-10, -6, 20, 16, 7);
    ctx.fill();
    ctx.stroke();

    // Smooth cartoon head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -14, 10.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair
    ctx.fillStyle = this.hairColor;
    ctx.beginPath();
    ctx.arc(0, -17, 10.5, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Eyes & Smile
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-3.5, -14, 1.8, 0, Math.PI * 2);
    ctx.arc(3.5, -14, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Cute Shopping Basket at side
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(8, -2, 13, 10, 3);
    ctx.fill();
    ctx.stroke();

    if (this.basket.length > 0) {
      drawItemIcon(ctx, 14.5, -3, this.basket[0], 0.55);
    }

    // Smooth Cartoon Thought/Speech Bubble
    if (this.shoppingList.length > 0 && this.state !== 'LEAVING') {
      const wanted = this.shoppingList[0];
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = this.state === 'WAITING_FOR_RESTOCK' ? '#ef4444' : '#1e293b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.roundRect(-18, -48, 36, 22, 11);
      ctx.fill();
      ctx.stroke();

      drawItemIcon(ctx, this.state === 'WAITING_FOR_RESTOCK' ? -5 : 0, -37, wanted, 0.72);
      if (this.state === 'WAITING_FOR_RESTOCK') {
        ctx.fillStyle = '#ef4444';
        ctx.font = '800 12px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', 9, -33);
      }
    } else if ((this.state === 'WALKING_TO_CHECKOUT' || this.state === 'IN_QUEUE') && this.basket.length > 0) {
      ctx.fillStyle = '#dcfce7';
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-14, -46, 28, 20, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#15803d';
      ctx.font = '700 11px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAY', 0, -33);
    }

    ctx.restore();
  }
}

/**
 * AUTOMATED STAFF HELPER (RESTOCKER)
 */
const WORKER_PALETTES = [
  { shirt: '#f97316', cap: '#ea580c', label: 'S1' },
  { shirt: '#0ea5e9', cap: '#0284c7', label: 'S2' },
  { shirt: '#a855f7', cap: '#7e22ce', label: 'S3' },
  { shirt: '#10b981', cap: '#047857', label: 'S4' }
];

class StaffHelper {
  constructor(x, y, workerIndex = 0) {
    this.x = x;
    this.y = y;
    this.workerIndex = workerIndex;
    this.palette = WORKER_PALETTES[workerIndex % WORKER_PALETTES.length];
    this.speed = 145;
    this.carryStack = [];
    this.maxStack = 6;
    this.radius = 16;
    this.walkAnim = Math.random() * 6;
    this.state = 'FIND_SUPPLY';
    this.targetPlot = null;
    this.targetShelf = null;
  }

  update(dt, game) {
    this.walkAnim += dt * 10;
    const workerLevel = (game && game.workerLevel) ? game.workerLevel : 1;
    this.speed = 145 + (workerLevel - 1) * 32;
    this.maxStack = 6 + (workerLevel - 1) * 2;

    if (this.state === 'FIND_SUPPLY') {
      // Pick plots that have stock AND whose shelf still needs stock, staggering across workers
      const validPlots = game.plots.filter(p => {
        if (!p.unlocked || p.storage <= 0) return false;
        const shelf = game.shelves.find(s => s.unlocked && s.type === p.type && s.items < s.maxCapacity);
        return !!shelf;
      });

      if (!this.targetPlot || !validPlots.includes(this.targetPlot)) {
        if (validPlots.length > 0) {
          // Prefer plots with lowest shelf fill ratio, offset by workerIndex for natural spreading
          validPlots.sort((a, b) => {
            const sa = game.shelves.find(s => s.type === a.type);
            const sb = game.shelves.find(s => s.type === b.type);
            const ra = sa ? sa.items / sa.maxCapacity : 1;
            const rb = sb ? sb.items / sb.maxCapacity : 1;
            return ra - rb;
          });
          this.targetPlot = validPlots[this.workerIndex % validPlots.length];
        } else {
          this.targetPlot = game.plots.find(p => p.unlocked && p.storage > 0) || null;
        }
      }

      if (this.targetPlot) {
        this.moveTowards(this.targetPlot.x, this.targetPlot.y, dt);
        if (dist(this.x, this.y, this.targetPlot.x, this.targetPlot.y) < 34) {
          this.targetPlot.harvestTo(this, game);
          if (this.carryStack.length >= this.maxStack || this.targetPlot.storage === 0) {
            this.state = 'DELIVERING';
          }
        }
      } else if (this.carryStack.length > 0) {
        this.state = 'DELIVERING';
      }
    } else if (this.state === 'DELIVERING') {
      if (this.carryStack.length > 0) {
        // Find any shelf that matches an item in carryStack and needs stock
        let shelf = null;
        for (let i = 0; i < this.carryStack.length; i++) {
          const candidate = game.shelves.find(s => s.unlocked && s.type === this.carryStack[i] && s.items < s.maxCapacity);
          if (candidate) {
            shelf = candidate;
            break;
          }
        }

        if (shelf) {
          this.moveTowards(shelf.x, shelf.y + 38, dt);
          if (dist(this.x, this.y, shelf.x, shelf.y + 38) < 34) {
            shelf.restockFrom(this, game);
          }
        } else {
          // If pickup station wants an item we are holding, drop it off instead of wasting!
          if (game.pickupStation && game.pickupStation.needsAnyItem(this.carryStack)) {
            this.moveTowards(game.pickupStation.padX, game.pickupStation.padY, dt);
            if (dist(this.x, this.y, game.pickupStation.padX, game.pickupStation.padY) < 42) {
              game.pickupStation.acceptFrom(this, game);
            }
          } else {
            this.state = 'FIND_SUPPLY';
          }
        }
      } else {
        this.state = 'FIND_SUPPLY';
      }
    }
  }

  moveTowards(tx, ty, dt) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d > 2) {
      this.x += (dx / d) * this.speed * dt;
      this.y += (dy / d) * this.speed * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Worker Uniform & Cap (color-coded by worker slot)
    ctx.fillStyle = this.palette.shirt;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-10, -6, 20, 16, 7);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -14, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.palette.cap;
    ctx.beginPath();
    ctx.arc(0, -17, 10, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    if (this.carryStack.length > 0) {
      for (let i = 0; i < this.carryStack.length; i++) {
        drawItemIcon(ctx, 0, -30 - i * 11, this.carryStack[i], 0.9);
      }
    }

    ctx.restore();
  }
}

/**
 * UNLOCK & EXPANSION ZONE (Clear Cartoon Expansion Pad with Preview Icon)
 */
class UnlockZone {
  constructor(opts) {
    this.id = opts.id;
    this.x = opts.x;
    this.y = opts.y;
    this.width = opts.width || 96;
    this.height = opts.height || 76;
    this.title = opts.title;
    this.targetId = opts.targetId;
    this.cost = opts.cost;
    this.paid = 0;
    this.triggerRadius = 50;
    this.pulse = 0;
  }

  update(dt, game) {
    this.pulse += dt * 4;

    const p = game.player;
    if (p && dist(this.x, this.y, p.x, p.y) < this.triggerRadius) {
      if (game.money > 0 && this.paid < this.cost) {
        const streamRate = Math.max(1, Math.ceil(this.cost / 25));
        const amount = Math.min(streamRate, game.money, this.cost - this.paid);
        game.money -= amount;
        this.paid += amount;

        if (Math.random() < 0.2 && window.miniMartAudio) {
          window.miniMartAudio.playHarvest();
        }

        if (this.paid >= this.cost) {
          this.activate(game);
        }
      }
    }
  }

  activate(game) {
    if (window.miniMartAudio) window.miniMartAudio.playUnlock();
    if (game.rumble) game.rumble(200, 0.4, 0.6);
    game.spawnConfetti(this.x, this.y);
    game.spawnFloatingText(this.x, this.y - 30, 'UNLOCKED!', '#16a34a', 22);

    if (game.progressTutorial) {
      game.progressTutorial('unlock_expansion', 1);
    }

    if (this.targetId === 'hire_stocker') {
      if (game.hireStocker) {
        game.hireStocker(this.x, this.y);
      } else {
        game.staffHelpers.push(new StaffHelper(this.x, this.y, game.staffHelpers.length));
        game.staffHired = true;
      }
    } else if (this.targetId === 'hire_cashier') {
      game.cashierHired = true;
    } else {
      const plot = game.plots.find(p => p.id === this.targetId);
      if (plot) plot.unlocked = true;
      const shelf = game.shelves.find(s => s.id === this.targetId);
      if (shelf) shelf.unlocked = true;
    }

    const idx = game.unlockZones.indexOf(this);
    if (idx !== -1) {
      game.unlockZones.splice(idx, 1);
    }
  }

  getPreviewType() {
    const t = this.targetId.toLowerCase();
    if (t.includes('egg')) return 'egg';
    if (t.includes('milk')) return 'milk';
    if (t.includes('apple')) return 'apple';
    if (t.includes('bakery') || t.includes('bread')) return 'bread';
    if (t.includes('banana')) return 'banana';
    if (t.includes('coconut')) return 'coconut';
    if (t.includes('pineapple')) return 'pineapple';
    if (t.includes('smoothie')) return 'smoothie';
    if (t.includes('icecream') || t.includes('gelato')) return 'icecream';
    if (t.includes('strawberry') || t.includes('berry')) return 'strawberry';
    if (t.includes('cocoa')) return 'cocoa';
    if (t.includes('chocolate')) return 'chocolate';
    if (t.includes('donut')) return 'donut';
    if (t.includes('candy') || t.includes('lollipop')) return 'candy';
    return null;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const w = this.width;
    const h = this.height;
    const bounce = Math.sin(this.pulse) * 2;

    // 1. Cartoon Expansion Card Base
    ctx.fillStyle = 'rgba(255, 251, 235, 0.94)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 16);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Progress Fill Bar
    const progress = this.paid / this.cost;
    if (progress > 0) {
      ctx.fillStyle = 'rgba(34, 197, 94, 0.28)';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 3, -h / 2 + 3, (w - 6) * progress, h - 6, 13);
      ctx.fill();
    }

    // 3. Preview Icon at Top
    const previewType = this.getPreviewType();
    if (previewType) {
      drawItemIcon(ctx, 0, -18 + bounce * 0.5, previewType, 1.0);
    } else {
      ctx.fillStyle = '#0ea5e9';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -18 + bounce * 0.5, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // 4. Clean Bold Label
    ctx.fillStyle = '#1e293b';
    ctx.font = '700 10.5px "Fredoka", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.title, 0, 3);

    // 5. Green Price Pill at Bottom
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-30, 11, 60, 20, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11.5px "Fredoka", sans-serif';
    ctx.fillText(`$${this.cost - this.paid}`, 0, 25);

    ctx.restore();
  }
}

/**
 * HELPER: DRAW GLOSSY VECTOR CARTOON ITEM ICON FOR ALL MARTS
 */
function drawItemIcon(ctx, x, y, type, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // --- MART 1 ITEMS ---
  if (type === 'tomato') {
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 1, 8.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-3, -2, 2.5, 1.5, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-4, -5); ctx.lineTo(0, -8); ctx.lineTo(4, -5); ctx.lineTo(0, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (type === 'egg') {
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.8, 8.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.ellipse(1, 2, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-2.2, -3, 1.8, 2.8, -0.2, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'apple') {
    ctx.fillStyle = '#84cc16';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 1, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-3, -2, 2.2, 1.4, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -6); ctx.lineTo(1, -10);
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(4, -8, 3, 1.6, -0.4, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'milk') {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-6.5, -6, 13, 14, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.moveTo(-6.5, -5); ctx.lineTo(0, -10.5); ctx.lineTo(6.5, -5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-5, -1, 10, 5);

  } else if (type === 'bread') {
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-9, -6, 18, 12, 6);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -3); ctx.lineTo(-2, 3);
    ctx.moveTo(0, -3);  ctx.lineTo(2, 3);
    ctx.moveTo(4, -3);  ctx.lineTo(6, 3);
    ctx.stroke();

  // --- MART 2 ITEMS ---
  } else if (type === 'banana') {
    // Bright Yellow Banana Bunch
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-2, 2, 8, -0.2, 1.6);
    ctx.arc(3, 1, 8.5, -0.2, 1.5);
    ctx.lineTo(2, -7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Green banana stem
    ctx.fillStyle = '#65a30d';
    ctx.fillRect(0, -9, 4, 3);

    // Specular shine
    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    ctx.ellipse(1, 0, 5, 2, 0.4, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'coconut') {
    // Rich Brown Tropical Coconut
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Coconut face 3 dark eyes
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(-2.5, -2, 1.6, 0, Math.PI * 2);
    ctx.arc(2.5, -2, 1.6, 0, Math.PI * 2);
    ctx.arc(0, 2.5, 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Palm leaf fiber highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.ellipse(-3, -3, 2, 4, -0.4, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'pineapple') {
    // Golden Pineapple with Spiky Tropical Crown
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 2, 7.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Scale cross-hatch
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-5, -2); ctx.lineTo(5, 6);
    ctx.moveTo(5, -2); ctx.lineTo(-5, 6);
    ctx.moveTo(-5, 2); ctx.lineTo(3, 8);
    ctx.moveTo(5, 2); ctx.lineTo(-3, 8);
    ctx.stroke();

    // Spiky green crown
    ctx.fillStyle = '#16a34a';
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-5, -6); ctx.lineTo(-7, -12); ctx.lineTo(-2, -8);
    ctx.lineTo(0, -14); ctx.lineTo(2, -8); ctx.lineTo(7, -12); ctx.lineTo(5, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (type === 'smoothie') {
    // Chilled Fruit Smoothie Cup with Straw
    ctx.fillStyle = '#ec4899';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-4.5, 9);
    ctx.lineTo(4.5, 9);
    ctx.lineTo(6, -4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Whipped cream swirl
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -5, 6, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Diagonal striped straw
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(1, -5); ctx.lineTo(5, -13);
    ctx.stroke();

  } else if (type === 'icecream') {
    // Gelato Cone with Double Scoop & Cherry
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-6, 0); ctx.lineTo(0, 11); ctx.lineTo(6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mint Scoop
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -1, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Strawberry Scoop
    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red Cherry on top
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(1, -12, 2.5, 0, Math.PI * 2);
    ctx.fill();

  // --- MART 3 ITEMS ---
  } else if (type === 'strawberry') {
    // Plump Red Strawberry with Seeds
    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 9);
    ctx.bezierCurveTo(-9, 4, -8, -5, 0, -4);
    ctx.bezierCurveTo(8, -5, 9, 4, 0, 9);
    ctx.fill();
    ctx.stroke();

    // Tiny golden seeds
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-3, 0, 1.4, 1.4);
    ctx.fillRect(3, 0, 1.4, 1.4);
    ctx.fillRect(0, 3, 1.4, 1.4);
    ctx.fillRect(-2, -2, 1.4, 1.4);
    ctx.fillRect(2, -2, 1.4, 1.4);

    // Leafy green top
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(0, -5, 5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'cocoa') {
    // Golden-Brown Cocoa Pod
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.5, 9.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pod longitudinal ridges
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(-2, 0); ctx.lineTo(0, 8);
    ctx.moveTo(0, -8); ctx.lineTo(2, 0); ctx.lineTo(0, 8);
    ctx.stroke();

  } else if (type === 'chocolate') {
    // Artisan Chocolate Bar with Gold Foil
    ctx.fillStyle = '#451a03';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-7, -8, 14, 16, 2);
    ctx.fill();
    ctx.stroke();

    // Chocolate Grid Squares
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -8); ctx.lineTo(0, 0);
    ctx.moveTo(-7, -4); ctx.lineTo(7, -4);
    ctx.stroke();

    // Gold foil bottom wrap
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-7, 0, 14, 8);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-7, 0, 14, 2);

  } else if (type === 'donut') {
    // Pink Frosted Glazed Donut with Sprinkles
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pink Icing
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(0, 0, 7.2, 0, Math.PI * 2);
    ctx.fill();

    // Hole in center
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rainbow Sprinkles
    ctx.fillStyle = '#facc15'; ctx.fillRect(-4, -4, 2, 1.2);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(3, -4, 2, 1.2);
    ctx.fillStyle = '#4ade80'; ctx.fillRect(-4, 3, 2, 1.2);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(3, 3, 2, 1.2);

  } else if (type === 'candy') {
    // Rainbow Swirl Lollipop on Stick
    // White stick
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 4); ctx.lineTo(0, 12);
    ctx.stroke();

    // Lollipop Disc
    ctx.fillStyle = '#a855f7';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -2, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rainbow Swirl Petals
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(0, -2, 7.5, 0, Math.PI * 0.5);
    ctx.lineTo(0, -2);
    ctx.fill();

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(0, -2, 7.5, Math.PI, Math.PI * 1.5);
    ctx.lineTo(0, -2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(-2.5, -4.5, 2.5, 1.2, -0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * PICKUP & DELIVERY STATION (Curbside Orders + Animated Delivery Van)
 */
class PickupStation {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.padX = x - 98;
    this.padY = y;
    this.width = 114;
    this.height = 76;
    this.orders = [];
    this.nextOrderId = 1;
    this.spawnTimer = 3.5;
    this.acceptCooldown = 0;
    this.vanAnim = 0; // > 0 when van is dispatching
    this.pulse = 0;
    this.completedCount = 0;
  }

  getMaxOrders(game) {
    const cLvl = (game && game.courierHired) ? (game.courierLevel || 1) : 1;
    return Math.min(4, 2 + Math.floor(cLvl / 2));
  }

  getSpawnInterval(game) {
    const mLvl = (game && game.marketingLevel) ? game.marketingLevel : 1;
    return Math.max(5.5, 11.5 - (mLvl - 1) * 1.3);
  }

  createOrderData(unlockedTypes, courierLevel = 1, marketingLevel = 1, forceId = null) {
    if (!unlockedTypes || unlockedTypes.length === 0) return null;
    const isVip = unlockedTypes.length >= 2 && Math.random() < (0.22 + (marketingLevel - 1) * 0.04);
    const count = isVip
      ? Math.min(4, 3 + (Math.random() < 0.5 ? 1 : 0))
      : (2 + (unlockedTypes.length >= 2 && Math.random() < 0.45 ? 1 : 0));

    const items = [];
    let baseSum = 0;
    for (let i = 0; i < count; i++) {
      const t = unlockedTypes[Math.floor(Math.random() * unlockedTypes.length)];
      items.push(t);
      baseSum += ITEM_TYPES[t] ? ITEM_TYPES[t].price : 8;
    }

    const mult = 1.65 + (courierLevel - 1) * 0.15 + (marketingLevel - 1) * 0.08 + (isVip ? 0.35 : 0);
    const payout = Math.round(baseSum * mult);
    const duration = isVip ? 48 : 62;

    return {
      id: forceId || this.nextOrderId++,
      itemsRemaining: items,
      totalItems: items.length,
      payout,
      isVip,
      maxTime: duration,
      timeLeft: duration
    };
  }

  needsAnyItem(carryStack) {
    if (!carryStack || carryStack.length === 0 || this.orders.length === 0) return false;
    for (let i = 0; i < this.orders.length; i++) {
      const ord = this.orders[i];
      for (let j = 0; j < carryStack.length; j++) {
        if (ord.itemsRemaining.includes(carryStack[j])) return true;
      }
    }
    return false;
  }

  getFirstNeededItem(unlockedShelves) {
    for (let i = 0; i < this.orders.length; i++) {
      const ord = this.orders[i];
      for (let j = 0; j < ord.itemsRemaining.length; j++) {
        const type = ord.itemsRemaining[j];
        const shelf = unlockedShelves.find(s => s.unlocked && s.type === type && s.items > 0);
        if (shelf) return { type, shelf };
      }
    }
    return null;
  }

  update(dt, game) {
    this.pulse += dt * 4.5;
    if (this.acceptCooldown > 0) this.acceptCooldown = Math.max(0, this.acceptCooldown - dt);
    if (this.vanAnim > 0) this.vanAnim = Math.max(0, this.vanAnim - dt);

    const unlockedTypes = game.plots.filter(p => p.unlocked).map(p => p.type);
    const maxOrders = this.getMaxOrders(game);

    // Spawn incoming pickup orders
    if (this.orders.length < maxOrders && unlockedTypes.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.getSpawnInterval(game);
        const order = this.createOrderData(unlockedTypes, game.courierLevel || 1, game.marketingLevel || 1);
        if (order) {
          this.orders.push(order);
          if (window.miniMartAudio) window.miniMartAudio.playOrderBell();
          game.spawnFloatingText(this.x, this.y - 68, order.isVip ? 'VIP PICKUP ORDER!' : 'NEW PICKUP ORDER!', order.isVip ? '#d97706' : '#0284c7', 15);
        }
      }
    }

    // Tick existing pickup order timers
    for (let i = this.orders.length - 1; i >= 0; i--) {
      const ord = this.orders[i];
      ord.timeLeft -= dt;
      if (ord.timeLeft <= 0) {
        this.orders.splice(i, 1);
        game.spawnFloatingText(this.x, this.y - 45, 'ORDER EXPIRED', '#ef4444', 15);
      }
    }

    // Accept items from player on the packing mat
    const p = game.player;
    if (p && this.orders.length > 0) {
      const nearPad = Math.abs(p.x - this.padX) < 52 && Math.abs(p.y - this.padY) < 52;
      if (nearPad) {
        this.acceptFrom(p, game);
      }
    }

    // Accept items from Delivery Courier if near pad
    if (game.deliveryCourier && this.orders.length > 0) {
      if (dist(game.deliveryCourier.x, game.deliveryCourier.y, this.padX, this.padY) < 46) {
        this.acceptFrom(game.deliveryCourier, game);
      }
    }
  }

  acceptFrom(carrier, game) {
    if (!carrier || !carrier.carryStack || carrier.carryStack.length === 0 || this.acceptCooldown > 0) return false;

    for (let i = 0; i < this.orders.length; i++) {
      const ord = this.orders[i];
      for (let j = carrier.carryStack.length - 1; j >= 0; j--) {
        const carriedType = carrier.carryStack[j];
        const neededIdx = ord.itemsRemaining.indexOf(carriedType);
        if (neededIdx !== -1) {
          carrier.carryStack.splice(j, 1);
          ord.itemsRemaining.splice(neededIdx, 1);
          this.acceptCooldown = 0.11;

          game.spawnFlyingItem(carrier.x, carrier.y, this, carriedType);
          if (carrier === game.player && window.miniMartAudio) {
            window.miniMartAudio.playRestock();
            if (game.rumble) game.rumble(25, 0.12, 0.1);
          }

          if (ord.itemsRemaining.length === 0) {
            this.completeOrder(i, game);
          }
          return true;
        }
      }
    }
    return false;
  }

  completeOrder(orderIdx, game) {
    const ord = this.orders.splice(orderIdx, 1)[0];
    if (!ord) return;

    this.completedCount++;
    this.vanAnim = 1.35;
    game.money += ord.payout;
    game.totalProfit += ord.payout;
    game.totalCustomersServed = (game.totalCustomersServed || 0) + 1;

    if (window.miniMartAudio) {
      window.miniMartAudio.playDeliveryHorn();
      window.miniMartAudio.playCash();
    }
    if (game.rumble) game.rumble(110, 0.35, 0.45);

    game.spawnConfetti(this.x + 40, this.y - 20);
    game.spawnCashParticles(this.x + 20, this.y - 10, 12);
    game.spawnFloatingText(
      this.x + 10,
      this.y - 52,
      `${ord.isVip ? 'VIP DELIVERY' : 'PICKUP SENT'} +$${ord.payout}`,
      ord.isVip ? '#d97706' : '#16a34a',
      20
    );
  }

  draw(ctx) {
    ctx.save();

    // 1. Packing Zone Mat (Left side of Pickup Desk)
    const matActive = this.orders.length > 0;
    const pulseAlpha = matActive ? (0.85 + Math.sin(this.pulse) * 0.15) : 0.6;
    ctx.save();
    ctx.translate(this.padX, this.padY);
    ctx.fillStyle = matActive ? `rgba(224, 242, 254, ${pulseAlpha})` : 'rgba(241, 245, 249, 0.85)';
    ctx.strokeStyle = matActive ? '#0284c7' : '#94a3b8';
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.roundRect(-42, -40, 84, 80, 16);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '700 10px "Fredoka", "Nunito", sans-serif';
    ctx.fillStyle = matActive ? '#0369a1' : '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('DROP PICKUP', 0, -24);
    ctx.fillText('ITEMS HERE', 0, 31);

    // Little package box icon inside pad
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-14, -12, 28, 22, 5);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-14, -3);
    ctx.lineTo(14, -3);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, -3);
    ctx.stroke();
    ctx.restore();

    // 2. Delivery Van Bay (Right side of Pickup Counter)
    let vanSlide = 0;
    if (this.vanAnim > 0) {
      const p = 1 - (this.vanAnim / 1.35);
      vanSlide = p < 0.5 ? (p * 2 * 120) : ((1 - p) * 2 * 120);
    }
    ctx.save();
    ctx.translate(this.x + 114 + vanSlide, this.y + 4);
    // Parking bay outline
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(-42 - vanSlide, -34, 86, 66);
    ctx.setLineDash([]);

    // Cartoon Delivery Van
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.beginPath();
    ctx.roundRect(-34, -16, 72, 42, 10);
    ctx.fill();

    // Cargo Box
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-34, -22, 46, 40, 8);
    ctx.fill();
    ctx.stroke();

    // Blue Delivery Stripe
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-32, -5, 42, 9);

    // Van Cab
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(10, -16, 26, 34, 8);
    ctx.fill();
    ctx.stroke();

    // Windshield
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.roundRect(18, -11, 14, 24, 4);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-24, -26, 14, 6, 3);
    ctx.roundRect(-24, 16, 14, 6, 3);
    ctx.roundRect(14, -20, 13, 5, 2);
    ctx.roundRect(14, 15, 13, 5, 2);
    ctx.fill();
    ctx.restore();

    // 3. Pickup Desk Body
    ctx.translate(this.x, this.y);
    const w = this.width;
    const h = this.height;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 2, -h / 2 + 7, w, h, 16);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.roundRect(-w / 2 + 6, -h / 2 + 12, w - 12, h - 20, 11);
    ctx.fill();

    // Striped Blue/Gold Awning
    const stripes = 6;
    const sw = (w - 8) / stripes;
    for (let s = 0; s < stripes; s++) {
      ctx.fillStyle = (s % 2 === 0) ? '#0ea5e9' : '#facc15';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 4 + s * sw, -h / 2 + 2, sw, 11, 4);
      ctx.fill();
    }

    // Desk Countertop Details (Tablet & Crates)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-40, -10, 26, 20, 4);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-37, -7, 20, 14);

    // Signboard Pill
    ctx.fillStyle = '#0369a1';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-58, h / 2 + 4, 116, 20, 10);
    ctx.fill();
    ctx.stroke();
    ctx.font = '700 10.5px "Fredoka", "Nunito", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`PICKUP HUB (${this.orders.length})`, 0, h / 2 + 14.5);

    // 4. Floating Order Cards above Pickup Desk
    if (this.orders.length === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-56, -h / 2 - 34, 112, 24, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#475569';
      ctx.font = '700 10px "Fredoka", "Nunito", sans-serif';
      ctx.fillText('NO ORDERS YET', 0, -h / 2 - 21.5);
    } else {
      const cardH = 38;
      const gap = 6;
      for (let idx = 0; idx < this.orders.length; idx++) {
        const ord = this.orders[idx];
        const cy = -h / 2 - 26 - idx * (cardH + gap);

        // Tally remaining items by type for compact display
        const counts = {};
        ord.itemsRemaining.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
        const entries = Object.entries(counts);
        const cardW = Math.max(136, 56 + entries.length * 32);

        ctx.fillStyle = ord.isVip ? '#fffbeb' : '#ffffff';
        ctx.strokeStyle = ord.isVip ? '#f59e0b' : '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-cardW / 2, cy - cardH / 2, cardW, cardH, 11);
        ctx.fill();
        ctx.stroke();

        // Draw item icons & counts
        let ix = -cardW / 2 + 20;
        entries.forEach(([itemType, qty]) => {
          drawItemIcon(ctx, ix, cy - 3, itemType, 0.78);
          ctx.fillStyle = '#1e293b';
          ctx.font = '800 10px "Fredoka", "Nunito", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`x${qty}`, ix + 8, cy + 1);
          ix += 32;
        });

        // Payout Pill on right
        ctx.fillStyle = ord.isVip ? '#f59e0b' : '#16a34a';
        ctx.beginPath();
        ctx.roundRect(cardW / 2 - 44, cy - 13, 38, 18, 7);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 10px "Fredoka", "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`+$${ord.payout}`, cardW / 2 - 25, cy - 3.5);

        // Timer Bar along bottom of ticket
        const frac = Math.max(0, Math.min(1, ord.timeLeft / ord.maxTime));
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-cardW / 2 + 8, cy + cardH / 2 - 6, cardW - 16, 3.5);
        ctx.fillStyle = frac > 0.5 ? '#22c55e' : (frac > 0.25 ? '#f59e0b' : '#ef4444');
        ctx.fillRect(-cardW / 2 + 8, cy + cardH / 2 - 6, (cardW - 16) * frac, 3.5);
      }
    }

    ctx.restore();
  }
}

/**
 * PICKUP DELIVERY COURIER WORKER (Automatically packs orders from stocked shelves)
 */
class DeliveryCourier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 155;
    this.carryStack = [];
    this.maxStack = 5;
    this.walkAnim = 0;
    this.state = 'IDLE';
    this.targetShelf = null;
  }

  update(dt, game) {
    this.walkAnim += dt * 11;
    const cLvl = (game && game.courierLevel) ? game.courierLevel : 1;
    this.speed = 155 + (cLvl - 1) * 32;
    this.maxStack = 4 + cLvl;

    const station = game.pickupStation;
    if (!station) return;

    if (this.carryStack.length > 0 && station.needsAnyItem(this.carryStack)) {
      this.moveTowards(station.padX, station.padY, dt);
      if (dist(this.x, this.y, station.padX, station.padY) < 38) {
        station.acceptFrom(this, game);
      }
      return;
    }

    // Grab needed item from any stocked shelf
    const needed = station.getFirstNeededItem(game.shelves);
    if (needed && this.carryStack.length < this.maxStack) {
      this.targetShelf = needed.shelf;
      this.moveTowards(this.targetShelf.x, this.targetShelf.y + 38, dt);
      if (dist(this.x, this.y, this.targetShelf.x, this.targetShelf.y + 38) < 36) {
        if (this.targetShelf.items > 0) {
          this.targetShelf.items--;
          this.carryStack.push(this.targetShelf.type);
          game.spawnFlyingItem(this.targetShelf.x, this.targetShelf.y, this, this.targetShelf.type);
        }
      }
    } else if (this.carryStack.length > 0 && station.orders.length > 0) {
      this.moveTowards(station.padX, station.padY, dt);
    } else {
      // Wait smoothly beside pickup loading bay
      this.moveTowards(station.padX - 18, station.padY + 26, dt);
    }
  }

  moveTowards(tx, ty, dt) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d > 2) {
      this.x += (dx / d) * this.speed * dt;
      this.y += (dy / d) * this.speed * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Teal Delivery Courier Jacket
    ctx.fillStyle = '#0d9488';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-10, -6, 20, 16, 7);
    ctx.fill();
    ctx.stroke();

    // Yellow safety stripe
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-9, 1, 18, 3);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -14, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Courier Visor Cap
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.arc(0, -17, 10, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    if (this.carryStack.length > 0) {
      for (let i = 0; i < this.carryStack.length; i++) {
        drawItemIcon(ctx, 0, -30 - i * 11, this.carryStack[i], 0.9);
      }
    }

    ctx.restore();
  }
}
