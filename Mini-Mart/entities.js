/**
 * PIXEL MINI MART - ENTITIES & GAME OBJECTS
 * Player, Customers, Staff Helpers, Production Plots, Shelves, Checkout, and Unlock Zones
 */

// Math helpers
const distSq = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2;
const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

// Item Definitions
const ITEM_TYPES = {
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    color: '#ef4444',
    secondary: '#22c55e',
    price: 6,
    size: 14
  },
  egg: {
    id: 'egg',
    name: 'Egg',
    color: '#fef3c7',
    secondary: '#f59e0b',
    price: 12,
    size: 13
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    color: '#84cc16',
    secondary: '#b91c1c',
    price: 18,
    size: 14
  },
  milk: {
    id: 'milk',
    name: 'Fresh Milk',
    color: '#e0f2fe',
    secondary: '#38bdf8',
    price: 24,
    size: 15
  },
  bread: {
    id: 'bread',
    name: 'Warm Bread',
    color: '#f59e0b',
    secondary: '#92400e',
    price: 35,
    size: 16
  }
};

/**
 * PLAYER CHARACTER
 */
class MiniMartPlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = 220;
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
    // Turbo timers
    if (this.turbo) {
      this.turboTimer -= dt;
      if (this.turboTimer <= 0) {
        this.turbo = false;
      }
    }
    if (this.turboCooldown > 0) {
      this.turboCooldown -= dt;
    }

    // Input Movement
    let mx = 0;
    let my = 0;

    // Keyboard
    if (input.keys['KeyW'] || input.keys['ArrowUp']) my -= 1;
    if (input.keys['KeyS'] || input.keys['ArrowDown']) my += 1;
    if (input.keys['KeyA'] || input.keys['ArrowLeft']) mx -= 1;
    if (input.keys['KeyD'] || input.keys['ArrowRight']) mx += 1;

    // Gamepad Left Stick override / blend
    if (input.gamepadConnected && input.gamepadMoveMagnitude > 0.15) {
      mx = input.gamepadMoveX;
      my = input.gamepadMoveY;
    }

    // Touch Joystick override / blend
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

      // Physics stack tilt (bounces and tilts against acceleration)
      this.targetTilt = -normX * 0.22;
    } else {
      this.isMoving = false;
      this.vx *= 0.7;
      this.vy *= 0.7;
      this.targetTilt = 0;
    }

    // Smooth wobbly stack tilt spring
    this.stackTilt += (this.targetTilt - this.stackTilt) * Math.min(1, dt * 12);

    // Apply motion
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundaries clamp inside the mart
    const pad = 24;
    this.x = Math.max(bounds.minX + pad, Math.min(bounds.maxX - pad, this.x));
    this.y = Math.max(bounds.minY + pad, Math.min(bounds.maxY - pad, this.y));
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Cute shadow under player
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Walking leg animation offset
    const legOffset = this.isMoving ? Math.sin(this.walkAnim) * 5 : 0;

    // Shoes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, 10 + legOffset, 6, 5);
    ctx.fillRect(2, 10 - legOffset, 6, 5);

    // Blue denim overalls
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-9, -2, 18, 14);

    // White / Red striped polo shirt
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-10, -9, 20, 8);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-10, -7, 20, 3);

    // Cute little hands
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(-11, 2 + legOffset, 3.5, 0, Math.PI * 2);
    ctx.arc(11, 2 - legOffset, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(0, -14, 9, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#0f172a';
    if (this.facing === 'left') {
      ctx.fillRect(-6, -15, 2.5, 3.5);
    } else if (this.facing === 'right') {
      ctx.fillRect(4, -15, 2.5, 3.5);
    } else if (this.facing === 'down') {
      ctx.fillRect(-4, -15, 2.5, 3.5);
      ctx.fillRect(2, -15, 2.5, 3.5);
      // Cheerful blush
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(-6, -11, 3, 2);
      ctx.fillRect(3, -11, 3, 2);
    }

    // Mini Mart green cap / visor
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(0, -17, 9.5, Math.PI, 0);
    ctx.fill();
    // Cap brim
    if (this.facing !== 'up') {
      ctx.fillStyle = '#059669';
      ctx.fillRect(-11, -17, 22, 3);
    }

    // Turbo trail effect
    if (this.turbo) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Physics Item Stack on Player's back / head!
    if (this.carryStack.length > 0) {
      const stackCount = this.carryStack.length;
      for (let i = 0; i < stackCount; i++) {
        const itemId = this.carryStack[i];
        const itemDef = ITEM_TYPES[itemId];
        if (!itemDef) continue;

        // Progressive wobble tilt the higher the stack goes!
        const wobbleX = Math.sin(this.walkAnim * 0.8 + i * 0.4) * (this.isMoving ? 2.5 : 0.5);
        const stackHeight = 22 + i * 11;
        const tiltX = this.stackTilt * (i * 12) + wobbleX;

        drawItemIcon(ctx, tiltX, -stackHeight, itemId, 1.0);
      }
    }

    ctx.restore();
  }
}

/**
 * PRODUCTION PLOT (Tomatoes, Chickens/Eggs, Apple Tree, Cow/Milk, Bakery/Bread)
 */
class ProductionPlot {
  constructor(opts) {
    this.id = opts.id;
    this.type = opts.type; // 'tomato', 'egg', 'apple', 'milk', 'bread'
    this.name = opts.name;
    this.x = opts.x;
    this.y = opts.y;
    this.width = opts.width || 80;
    this.height = opts.height || 80;
    this.maxStorage = opts.maxStorage || 8;
    this.storage = opts.initialStock || 0;
    this.growTimer = 0;
    this.growInterval = opts.growInterval || 2.4;
    this.unlocked = opts.unlocked !== undefined ? opts.unlocked : true;
    this.triggerRadius = 52;
    this.animTimer = Math.random() * 10;
  }

  update(dt, game) {
    if (!this.unlocked) return;
    this.animTimer += dt;

    // Produce items over time up to capacity
    if (this.storage < this.maxStorage) {
      this.growTimer += dt;
      if (this.growTimer >= this.growInterval) {
        this.growTimer = 0;
        this.storage++;
        if (game && game.spawnPopEffect) {
          game.spawnPopEffect(this.x, this.y - 12, ITEM_TYPES[this.type].color);
        }
      }
    }

    // Check Player proximity to harvest
    const p = game.player;
    if (p && dist(this.x, this.y, p.x, p.y) < this.triggerRadius) {
      this.harvestTo(p, game);
    }

    // Check Staff Helper proximity to harvest
    if (game.staffHelper && dist(this.x, this.y, game.staffHelper.x, game.staffHelper.y) < this.triggerRadius) {
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
      game.spawnFlyingItem(this.x, this.y, carrier, this.type);
    }
  }

  draw(ctx) {
    if (!this.unlocked) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Ground soil / wooden base
    ctx.fillStyle = this.type === 'tomato' ? '#78350f' : (this.type === 'egg' ? '#fef3c7' : '#ecfdf5');
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 12);
    ctx.fill();
    ctx.stroke();

    // Specific visuals for each plot type
    if (this.type === 'tomato') {
      // 4 Tomato plants on soil
      ctx.fillStyle = '#15803d';
      const pos = [[-18, -18], [18, -18], [-18, 18], [18, 18]];
      pos.forEach(([px, py], idx) => {
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.fill();
        // Red tomato fruit if ripe
        if (idx < this.storage) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(px, py, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#15803d';
        }
      });
    } else if (this.type === 'egg') {
      // Chicken coop hay nest with animated cute pixel chickens
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(-28, -28, 56, 56);

      // Hay texture lines
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-20, -10); ctx.lineTo(-8, -6);
      ctx.moveTo(8, -14); ctx.lineTo(20, -10);
      ctx.moveTo(-14, 16); ctx.lineTo(14, 18);
      ctx.stroke();

      // White chickens with red comb
      const bob = Math.sin(this.animTimer * 5) * 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-14, -8 + bob, 10, 0, Math.PI * 2);
      ctx.arc(14, 4 - bob, 10, 0, Math.PI * 2);
      ctx.fill();

      // Chicken beaks & combs
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-22, -10 + bob, 4, 3);
      ctx.fillRect(22, 2 - bob, 4, 3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-16, -20 + bob, 4, 4);
      ctx.fillRect(12, -8 - bob, 4, 4);
    } else if (this.type === 'apple') {
      // Apple orchard tree trunk and lush leafy canopy
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-8, 6, 16, 26);

      // Tree foliage
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(0, -8, 28, 0, Math.PI * 2);
      ctx.fill();

      // Hanging green/red apples
      for (let i = 0; i < Math.min(6, this.storage); i++) {
        const ang = i * (Math.PI * 2 / 6);
        const ax = Math.cos(ang) * 16;
        const ay = -8 + Math.sin(ang) * 16;
        drawItemIcon(ctx, ax, ay, 'apple', 0.85);
      }
    } else if (this.type === 'milk') {
      // Spotty dairy cow pen with milk churns
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-32, -32, 64, 64);

      // Cute spotty pixel cow body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-22, -16, 44, 28, 8);
      ctx.fill();

      // Black patches
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(-10, -6, 8, 0, Math.PI * 2);
      ctx.arc(8, 2, 7, 0, Math.PI * 2);
      ctx.fill();

      // Pink muzzle
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(-6, 2, 12, 8);
    } else if (this.type === 'bread') {
      // Brick bakery stone oven with warm fire glow
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-26, -26, 52, 52);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, 4, 12, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 4, 6, Math.PI, 0);
      ctx.fill();
    }

    // Storage counter pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-26, this.height / 2 + 4, 52, 18, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 12px "Rajdhani", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.storage}/${this.maxStorage}`, 0, this.height / 2 + 17);

    ctx.restore();
  }
}

/**
 * DISPLAY SHELF / GROCERY FRIDGE
 */
class StoreShelf {
  constructor(opts) {
    this.id = opts.id;
    this.type = opts.type; // item type accepted
    this.name = opts.name;
    this.x = opts.x;
    this.y = opts.y;
    this.width = opts.width || 76;
    this.height = opts.height || 64;
    this.maxCapacity = opts.maxCapacity || 12;
    this.items = opts.initialStock || 4;
    this.unlocked = opts.unlocked !== undefined ? opts.unlocked : true;
    this.triggerRadius = 56;
  }

  update(dt, game) {
    if (!this.unlocked) return;

    // Check Player proximity to restock
    const p = game.player;
    if (p && dist(this.x, this.y, p.x, p.y) < this.triggerRadius) {
      this.restockFrom(p, game);
    }

    // Check Staff Helper proximity to restock
    if (game.staffHelper && dist(this.x, this.y, game.staffHelper.x, game.staffHelper.y) < this.triggerRadius) {
      this.restockFrom(game.staffHelper, game);
    }
  }

  restockFrom(carrier, game) {
    if (this.items < this.maxCapacity && carrier.carryStack.length > 0) {
      // Find matching item in stack
      const idx = carrier.carryStack.indexOf(this.type);
      if (idx !== -1) {
        carrier.carryStack.splice(idx, 1);
        this.items++;
        if (carrier === game.player && window.miniMartAudio) {
          window.miniMartAudio.playRestock();
          if (game.rumble) game.rumble(30, 0.12, 0.1);
        }
        game.spawnFlyingItem(carrier.x, carrier.y, this, this.type);
      }
    }
  }

  draw(ctx) {
    if (!this.unlocked) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Shelf cabinet body
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 10);
    ctx.fill();
    ctx.stroke();

    // Wooden tier planks / fridge glass
    ctx.fillStyle = '#334155';
    ctx.fillRect(-this.width / 2 + 4, -8, this.width - 8, 5);
    ctx.fillRect(-this.width / 2 + 4, 16, this.width - 8, 5);

    // Render stocked items in rows
    const cols = 4;
    for (let i = 0; i < this.items; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ix = -this.width / 2 + 14 + col * 16;
      const iy = -16 + row * 22;
      drawItemIcon(ctx, ix, iy, this.type, 0.9);
    }

    // Shelf capacity badge
    const isLow = this.items <= 2;
    ctx.fillStyle = isLow ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = isLow ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-24, this.height / 2 + 3, 48, 16, 5);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 11px "Rajdhani", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.items}/${this.maxCapacity}`, 0, this.height / 2 + 15);

    ctx.restore();
  }
}

/**
 * CHECKOUT COUNTER & CASH REGISTER
 */
class CheckoutCounter {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 110;
    this.height = 70;
    this.cashStash = 0; // accumulated cash bundles on counter
    this.cashCollectRadius = 45;
    this.staffZoneRadius = 40;
    this.activeCustomer = null;
    this.scanTimer = 0;
    this.scanInterval = 0.55; // seconds per item scanned
  }

  update(dt, game) {
    // Check if player or hired cashier is attending the register
    const playerAttending = game.player && dist(this.x - 30, this.y, game.player.x, game.player.y) < this.staffZoneRadius;
    const cashierAttending = game.cashierHired;

    if (playerAttending || cashierAttending) {
      if (this.activeCustomer && this.activeCustomer.basket.length > 0) {
        this.scanTimer += dt;
        if (this.scanTimer >= this.scanInterval) {
          this.scanTimer = 0;
          const item = this.activeCustomer.basket.shift();
          const itemVal = ITEM_TYPES[item] ? ITEM_TYPES[item].price : 8;
          this.cashStash += itemVal;

          if (window.miniMartAudio) window.miniMartAudio.playScan();
          if (game.rumble) game.rumble(30, 0.1, 0.1);

          game.spawnFloatingText(this.x + 10, this.y - 20, `+$${itemVal}`, '#22c55e', 14);

          // If customer has paid for all items in basket, release them happily!
          if (this.activeCustomer.basket.length === 0) {
            this.activeCustomer.state = 'LEAVING';
            game.totalCustomersServed = (game.totalCustomersServed || 0) + 1;
            game.spawnHeartEffect(this.activeCustomer.x, this.activeCustomer.y - 26);
            this.activeCustomer = null;
          }
        }
      }
    }

    // Collect accumulated cash when player walks over counter
    if (this.cashStash > 0 && game.player && dist(this.x, this.y, game.player.x, game.player.y) < this.cashCollectRadius) {
      const collected = this.cashStash;
      this.cashStash = 0;
      game.money += collected;
      if (window.miniMartAudio) window.miniMartAudio.playCash();
      if (game.rumble) game.rumble(50, 0.2, 0.15);
      game.spawnFloatingText(this.x, this.y - 30, `+$${collected}`, '#4ade80', 20);
      game.spawnCashParticles(this.x, this.y, 10);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Wooden checkout counter base
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 10);
    ctx.fill();
    ctx.stroke();

    // Conveyor belt
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-this.width / 2 + 10, -18, 55, 36);

    // White dashed conveyor roller lines
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-this.width / 2 + 22, -16); ctx.lineTo(-this.width / 2 + 22, 16);
    ctx.moveTo(-this.width / 2 + 38, -16); ctx.lineTo(-this.width / 2 + 38, 16);
    ctx.moveTo(-this.width / 2 + 54, -16); ctx.lineTo(-this.width / 2 + 54, 16);
    ctx.stroke();

    // Cash Register Machine & Green Screen
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(18, -20, 28, 26);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(22, -16, 20, 10);

    // Operator Staff Standing Pad Indicator
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-this.width / 2 - 20, -16, 20, 32);
    ctx.setLineDash([]);

    // Stacks of Green Cash Money Bills on counter
    if (this.cashStash > 0) {
      const stacks = Math.min(8, Math.ceil(this.cashStash / 12));
      for (let s = 0; s < stacks; s++) {
        ctx.fillStyle = '#16a34a';
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 1;
        ctx.fillRect(8, 2 - s * 4, 18, 10);
        ctx.strokeRect(8, 2 - s * 4, 18, 10);
      }

      // Money value tag
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 12px "Orbitron", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`$${this.cashStash}`, 16, 26);
    }

    ctx.restore();
  }
}

/**
 * SHOPPING CUSTOMER
 */
class MartCustomer {
  constructor(x, y, desiredTypes) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.speed = 105;
    this.basket = []; // items picked up
    this.shoppingList = [...desiredTypes]; // items still needed
    this.currentGoalShelf = null;
    this.state = 'SPAWN'; // 'WALKING_TO_SHELF', 'WAITING_FOR_RESTOCK', 'WALKING_TO_CHECKOUT', 'IN_QUEUE', 'LEAVING', 'DONE'
    this.shirtColor = ['#38bdf8', '#fb7185', '#a78bfa', '#facc15', '#4ade80'][Math.floor(Math.random() * 5)];
    this.hairColor = ['#78350f', '#0f172a', '#b45309', '#fef08a'][Math.floor(Math.random() * 4)];
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
        this.targetY = this.currentGoalShelf.y + 40;

        this.moveTowards(this.targetX, this.targetY, dt);

        if (dist(this.x, this.y, this.targetX, this.targetY) < 14) {
          // Arrived at shelf
          if (this.currentGoalShelf.items > 0) {
            this.currentGoalShelf.items--;
            const item = this.currentGoalShelf.type;
            this.basket.push(item);
            this.shoppingList.shift();
            game.spawnFlyingItem(this.currentGoalShelf.x, this.currentGoalShelf.y, this, item);
            this.findNextShelf(game);
          } else {
            // Out of stock! Wait patiently
            this.state = 'WAITING_FOR_RESTOCK';
            this.waitTimer = 0;
          }
        }
      } else {
        this.state = 'WALKING_TO_CHECKOUT';
      }
    } else if (this.state === 'WAITING_FOR_RESTOCK') {
      this.waitTimer += dt;
      // If shelf gets restocked while waiting, grab item!
      if (this.currentGoalShelf && this.currentGoalShelf.items > 0) {
        this.currentGoalShelf.items--;
        const item = this.currentGoalShelf.type;
        this.basket.push(item);
        this.shoppingList.shift();
        game.spawnFlyingItem(this.currentGoalShelf.x, this.currentGoalShelf.y, this, item);
        this.findNextShelf(game);
      } else if (this.waitTimer > 8.0) {
        // Waited too long, give up on this item and head to checkout with whatever is in basket
        this.shoppingList.shift();
        this.findNextShelf(game);
      }
    } else if (this.state === 'WALKING_TO_CHECKOUT') {
      const queueIndex = game.customerQueue.indexOf(this);
      const queueSlotY = game.checkout.y - 10 + (queueIndex * 34);
      const queueSlotX = game.checkout.x + 42;

      this.moveTowards(queueSlotX, queueSlotY, dt);
      if (dist(this.x, this.y, queueSlotX, queueSlotY) < 10) {
        this.state = 'IN_QUEUE';
      }
    } else if (this.state === 'IN_QUEUE') {
      const queueIndex = game.customerQueue.indexOf(this);
      if (queueIndex === 0) {
        game.checkout.activeCustomer = this;
      }
      // Follow queue slot smoothly
      const queueSlotY = game.checkout.y - 10 + (queueIndex * 34);
      const queueSlotX = game.checkout.x + 42;
      this.moveTowards(queueSlotX, queueSlotY, dt);
    } else if (this.state === 'LEAVING') {
      // Walk towards entrance door exit
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
        // Shelf not unlocked yet, skip
        this.shoppingList.shift();
        this.findNextShelf(game);
      }
    } else {
      // Ready to pay! Join checkout queue
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

    // Customer Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Walking legs
    const leg = Math.sin(this.walkAnim) * 4;
    ctx.fillStyle = '#334155';
    ctx.fillRect(-6, 8 + leg, 4, 5);
    ctx.fillRect(2, 8 - leg, 4, 5);

    // Colorful shirt
    ctx.fillStyle = this.shirtColor;
    ctx.fillRect(-8, -4, 16, 13);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -12, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = this.hairColor;
    ctx.beginPath();
    ctx.arc(0, -15, 8.5, Math.PI, 0);
    ctx.fill();

    // Cute Shopping Basket carried at side
    ctx.fillStyle = '#d97706';
    ctx.fillRect(9, -2, 12, 9);
    ctx.strokeStyle = '#b45309';
    ctx.strokeRect(9, -2, 12, 9);
    // Render items in basket
    if (this.basket.length > 0) {
      ctx.fillStyle = ITEM_TYPES[this.basket[0]] ? ITEM_TYPES[this.basket[0]].color : '#ef4444';
      ctx.beginPath();
      ctx.arc(15, -4, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Speech bubble showing item needed or Out of Stock wait
    if (this.shoppingList.length > 0 && this.state !== 'LEAVING') {
      const wanted = this.shoppingList[0];
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-16, -34, 32, 16, 6);
      ctx.fill();
      ctx.stroke();

      if (this.state === 'WAITING_FOR_RESTOCK') {
        // Red question / exclamation mark
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', 0, -22);
      } else {
        // Draw miniature item wanted
        drawItemIcon(ctx, 0, -26, wanted, 0.7);
      }
    }

    ctx.restore();
  }
}

/**
 * AUTOMATED STAFF HELPER (RESTOCKER)
 */
class StaffHelper {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 135;
    this.carryStack = [];
    this.maxStack = 6;
    this.radius = 16;
    this.walkAnim = 0;
    this.state = 'FIND_SUPPLY'; // 'FIND_SUPPLY', 'DELIVERING'
    this.targetPlot = null;
    this.targetShelf = null;
  }

  update(dt, game) {
    this.walkAnim += dt * 10;

    if (this.state === 'FIND_SUPPLY') {
      // Find a plot with ready stock
      if (!this.targetPlot || this.targetPlot.storage === 0) {
        this.targetPlot = game.plots.find(p => p.unlocked && p.storage > 0);
      }

      if (this.targetPlot) {
        this.moveTowards(this.targetPlot.x, this.targetPlot.y, dt);
        if (dist(this.x, this.y, this.targetPlot.x, this.targetPlot.y) < 30) {
          this.targetPlot.harvestTo(this, game);
          if (this.carryStack.length >= this.maxStack || this.targetPlot.storage === 0) {
            this.state = 'DELIVERING';
          }
        }
      }
    } else if (this.state === 'DELIVERING') {
      // Deliver items to shelves needing them
      if (this.carryStack.length > 0) {
        const itemType = this.carryStack[0];
        const shelf = game.shelves.find(s => s.unlocked && s.type === itemType && s.items < s.maxCapacity);
        if (shelf) {
          this.moveTowards(shelf.x, shelf.y + 35, dt);
          if (dist(this.x, this.y, shelf.x, shelf.y + 35) < 30) {
            shelf.restockFrom(this, game);
          }
        } else {
          // Shelves full, return to supply
          this.state = 'FIND_SUPPLY';
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

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 12, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Helper Uniform (Orange apron)
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-7, -4, 14, 14);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -12, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Headband / Visor
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-8, -16, 16, 4);

    // Item stack
    if (this.carryStack.length > 0) {
      for (let i = 0; i < this.carryStack.length; i++) {
        drawItemIcon(ctx, 0, -22 - i * 10, this.carryStack[i], 0.85);
      }
    }

    ctx.restore();
  }
}

/**
 * UNLOCK & EXPANSION ZONE
 */
class UnlockZone {
  constructor(opts) {
    this.id = opts.id;
    this.x = opts.x;
    this.y = opts.y;
    this.width = opts.width || 76;
    this.height = opts.height || 64;
    this.title = opts.title;
    this.targetId = opts.targetId; // id of plot, shelf, or staff to activate
    this.cost = opts.cost;
    this.paid = 0;
    this.triggerRadius = 45;
    this.pulse = 0;
  }

  update(dt, game) {
    this.pulse += dt * 4;

    // Check Player proximity to deposit cash
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
          // UNLOCKED!
          this.activate(game);
        }
      }
    }
  }

  activate(game) {
    if (window.miniMartAudio) window.miniMartAudio.playUnlock();
    if (game.rumble) game.rumble(200, 0.4, 0.6);
    game.spawnConfetti(this.x, this.y);
    game.spawnFloatingText(this.x, this.y - 30, 'UNLOCKED!', '#4ade80', 22);

    // Activate target entity or upgrade
    if (this.targetId === 'hire_stocker') {
      game.staffHelper = new StaffHelper(this.x, this.y);
      game.staffHired = true;
    } else if (this.targetId === 'hire_cashier') {
      game.cashierHired = true;
    } else {
      // Find matching plot or shelf
      const plot = game.plots.find(p => p.id === this.targetId);
      if (plot) plot.unlocked = true;
      const shelf = game.shelves.find(s => s.id === this.targetId);
      if (shelf) shelf.unlocked = true;
    }

    // Remove zone from active unlock zones
    const idx = game.unlockZones.indexOf(this);
    if (idx !== -1) {
      game.unlockZones.splice(idx, 1);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const glow = 0.5 + Math.sin(this.pulse) * 0.25;

    // Glowing dashed boundary pad
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + glow * 0.4})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.setLineDash([]);

    // Progress bar fill
    const progress = this.paid / this.cost;
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, (this.width - 4) * progress, this.height - 4);

    // Title & Remaining Cost
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Rajdhani", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.title, 0, -6);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px "Orbitron", sans-serif';
    ctx.fillText(`$${this.cost - this.paid}`, 0, 14);

    ctx.restore();
  }
}

/**
 * HELPER: DRAW PIXEL ITEM ICON
 */
function drawItemIcon(ctx, x, y, type, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (type === 'tomato') {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(-2, -8, 4, 3);
  } else if (type === 'egg') {
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (type === 'apple') {
    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-1.5, -8.5, 3, 3.5);
  } else if (type === 'milk') {
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(-4, -7, 8, 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-4, -2, 8, 4);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-2.5, -9, 5, 2.5);
  } else if (type === 'bread') {
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-7, -4, 14, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-4, -5, 8, 2);
  }

  ctx.restore();
}
