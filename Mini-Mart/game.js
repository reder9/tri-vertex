/**
 * PIXEL MINI MART - MAIN GAME ENGINE
 * Store layout, customer spawner, camera follow, input handling, Xbox controller, and save system
 */
class MiniMartGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Viewport & World Dimensions
    this.width = 1200;
    this.height = 800;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Entrance position
    this.entranceX = 600;
    this.entranceY = 740;

    // Game Economy & Progression
    this.money = 20;
    this.totalProfit = 20;
    this.totalCustomersServed = 0;
    this.storeLevel = 1;
    this.state = 'playing'; // 'playing', 'paused'

    // Inputs
    this.input = {
      keys: {},
      gamepadConnected: false,
      gamepadMoveX: 0,
      gamepadMoveY: 0,
      gamepadMoveMagnitude: 0,
      touchActive: false,
      touchStartX: 0,
      touchStartY: 0,
      touchMoveX: 0,
      touchMoveY: 0,
      touchMagnitude: 0
    };
    this.prevGamepadButtons = {};

    // Customer Spawning
    this.customerSpawnTimer = 0;
    this.customerSpawnInterval = 3.6;
    this.maxCustomers = 8;
    this.customers = [];
    this.customerQueue = [];

    // Entities
    this.player = new MiniMartPlayer(580, 560);
    this.plots = [];
    this.shelves = [];
    this.checkout = null;
    this.unlockZones = [];
    this.staffHelper = null;
    this.staffHired = false;
    this.cashierHired = false;

    // Visual FX
    this.flyingItems = [];
    this.particles = [];
    this.floatingTexts = [];

    // UI Cache
    this.ui = {
      hudMoney: document.getElementById('hud-money'),
      hudStack: document.getElementById('hud-stack'),
      hudLevel: document.getElementById('hud-level'),
      turboBtn: document.getElementById('btn-turbo'),
      pauseModal: document.getElementById('pause-modal'),
      upgradeModal: document.getElementById('upgrade-modal'),
      btnUpgrades: document.getElementById('btn-upgrades'),
      btnPause: document.getElementById('btn-pause'),
      btnResume: document.getElementById('btn-resume'),
      btnMusic: document.getElementById('btn-music'),
      btnSfx: document.getElementById('btn-sfx'),
      joystickContainer: document.getElementById('joystick-container'),
      joystickKnob: document.getElementById('joystick-knob')
    };

    this.initStore();
    this.loadSave();
    this.setupInputs();
    this.setupResize();

    this.lastTime = performance.now();
    this.autoSaveTimer = 0;
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initStore() {
    // 1. Production Farm Plots (Left Side of Store)
    this.plots = [
      new ProductionPlot({ id: 'tomato_plot', type: 'tomato', name: 'Tomato Garden', x: 120, y: 160, width: 88, height: 88, unlocked: true, initialStock: 4 }),
      new ProductionPlot({ id: 'egg_coop', type: 'egg', name: 'Chicken Coop', x: 120, y: 310, width: 88, height: 88, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'apple_orchard', type: 'apple', name: 'Apple Tree', x: 120, y: 460, width: 88, height: 88, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'milk_pasture', type: 'milk', name: 'Dairy Cow Pen', x: 120, y: 610, width: 88, height: 88, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'bakery_oven', type: 'bread', name: 'Bakery Oven', x: 270, y: 160, width: 88, height: 88, unlocked: false, initialStock: 0 })
    ];

    // 2. Display Shelves (Center & Right Store Aisles)
    this.shelves = [
      new StoreShelf({ id: 'tomato_shelf', type: 'tomato', name: 'Tomato Rack', x: 490, y: 180, width: 80, height: 68, unlocked: true, initialStock: 4 }),
      new StoreShelf({ id: 'egg_shelf', type: 'egg', name: 'Egg Display', x: 670, y: 180, width: 80, height: 68, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'apple_shelf', type: 'apple', name: 'Apple Crate', x: 850, y: 180, width: 80, height: 68, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'milk_shelf', type: 'milk', name: 'Chilled Milk Fridge', x: 490, y: 340, width: 80, height: 68, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'bread_shelf', type: 'bread', name: 'Bakery Bread Stand', x: 670, y: 340, width: 80, height: 68, unlocked: false, initialStock: 0 })
    ];

    // 3. Central Checkout Register
    this.checkout = new CheckoutCounter(600, 560);

    // 4. Initial Unlock Zones for Store Expansion
    this.unlockZones = [
      new UnlockZone({ id: 'zone_egg', title: 'Unlock Egg Coop & Shelf', targetId: 'egg_coop', cost: 45, x: 670, y: 180 }),
      new UnlockZone({ id: 'zone_milk', title: 'Unlock Dairy Milk', targetId: 'milk_pasture', cost: 95, x: 490, y: 340 }),
      new UnlockZone({ id: 'zone_apple', title: 'Unlock Apple Tree', targetId: 'apple_orchard', cost: 160, x: 850, y: 180 }),
      new UnlockZone({ id: 'zone_bread', title: 'Unlock Bakery Oven', targetId: 'bakery_oven', cost: 240, x: 670, y: 340 }),
      new UnlockZone({ id: 'zone_stocker', title: 'Hire Assistant Stocker', targetId: 'hire_stocker', cost: 130, x: 310, y: 340 }),
      new UnlockZone({ id: 'zone_cashier', title: 'Hire Checkout Cashier', targetId: 'hire_cashier', cost: 210, x: 530, y: 560 })
    ];
  }

  setupResize() {
    const handleResize = () => {
      this.viewportWidth = window.innerWidth;
      this.viewportHeight = window.innerHeight;
      this.canvas.width = this.viewportWidth;
      this.canvas.height = this.viewportHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();
  }

  setupInputs() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.input.keys[e.code] = true;
      if (window.miniMartAudio) window.miniMartAudio.init();

      if (e.code === 'Space') {
        e.preventDefault();
        this.player.triggerTurbo();
      } else if (e.code === 'KeyE') {
        this.openUpgrades();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input.keys[e.code] = false;
    });

    // Turbo Button on Mobile
    if (this.ui.turboBtn) {
      const handleTurbo = (e) => {
        e.preventDefault();
        if (window.miniMartAudio) {
          window.miniMartAudio.init();
          window.miniMartAudio.resume();
        }
        this.player.triggerTurbo();
      };
      this.ui.turboBtn.addEventListener('click', handleTurbo);
      this.ui.turboBtn.addEventListener('touchstart', handleTurbo, { passive: false });
    }

    // Touch Virtual Joystick
    const joyContainer = this.ui.joystickContainer;
    const joyKnob = this.ui.joystickKnob;

    if (joyContainer && joyKnob) {
      window.addEventListener('touchstart', (e) => {
        if (e.target.closest('button, .modal, .hud-card')) return;
        const touch = e.touches[0];
        this.input.touchActive = true;
        this.input.touchStartX = touch.clientX;
        this.input.touchStartY = touch.clientY;

        joyContainer.classList.remove('hidden');
        joyContainer.style.left = `${this.input.touchStartX}px`;
        joyContainer.style.top = `${this.input.touchStartY}px`;
        joyKnob.style.transform = `translate(0px, 0px)`;
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        if (!this.input.touchActive) return;
        const touch = e.touches[0];
        const dx = touch.clientX - this.input.touchStartX;
        const dy = touch.clientY - this.input.touchStartY;
        const dist = Math.hypot(dx, dy);
        const maxDist = 48;

        if (dist > 0) {
          const clamped = Math.min(dist, maxDist);
          this.input.touchMoveX = (dx / dist) * (clamped / maxDist);
          this.input.touchMoveY = (dy / dist) * (clamped / maxDist);
          this.input.touchMagnitude = clamped / maxDist;
          joyKnob.style.transform = `translate(${this.input.touchMoveX * maxDist}px, ${this.input.touchMoveY * maxDist}px)`;
        }
      }, { passive: true });

      const endTouch = () => {
        this.input.touchActive = false;
        this.input.touchMoveX = 0;
        this.input.touchMoveY = 0;
        this.input.touchMagnitude = 0;
        joyContainer.classList.add('hidden');
      };
      window.addEventListener('touchend', endTouch);
      window.addEventListener('touchcancel', endTouch);
    }

    // UI Buttons
    if (this.ui.btnPause) this.ui.btnPause.addEventListener('click', () => this.togglePause());
    if (this.ui.btnResume) this.ui.btnResume.addEventListener('click', () => this.togglePause());
    if (this.ui.btnUpgrades) this.ui.btnUpgrades.addEventListener('click', () => this.openUpgrades());
    if (this.ui.btnMusic) {
      this.ui.btnMusic.addEventListener('click', () => {
        if (window.miniMartAudio) {
          const on = window.miniMartAudio.toggleMusic();
          this.ui.btnMusic.style.opacity = on ? '1.0' : '0.5';
        }
      });
    }
    if (this.ui.btnSfx) {
      this.ui.btnSfx.addEventListener('click', () => {
        if (window.miniMartAudio) {
          const muted = window.miniMartAudio.toggleMute();
          this.ui.btnSfx.style.opacity = muted ? '0.5' : '1.0';
        }
      });
    }

    // Upgrades Modal Buy Handlers
    const btnBuySpeed = document.getElementById('btn-buy-speed');
    const btnBuyStack = document.getElementById('btn-buy-stack');

    if (btnBuySpeed) {
      btnBuySpeed.addEventListener('click', () => {
        const cost = this.player.speedLevel * 50;
        if (this.money >= cost && this.player.speedLevel < 5) {
          this.money -= cost;
          this.player.speedLevel++;
          this.player.speed += 35;
          if (window.miniMartAudio) window.miniMartAudio.playUnlock();
          this.updateUpgradeModal();
        }
      });
    }

    if (btnBuyStack) {
      btnBuyStack.addEventListener('click', () => {
        const cost = this.player.stackLevel * 60;
        if (this.money >= cost && this.player.stackLevel < 5) {
          this.money -= cost;
          this.player.stackLevel++;
          this.player.maxStack += 4;
          if (window.miniMartAudio) window.miniMartAudio.playUnlock();
          this.updateUpgradeModal();
        }
      });
    }

    const btnCloseUpgrades = document.getElementById('btn-close-upgrades');
    if (btnCloseUpgrades) {
      btnCloseUpgrades.addEventListener('click', () => {
        this.ui.upgradeModal.classList.add('hidden');
      });
    }
  }

  // Xbox Gamepad Polling with Radial Deadzone & Haptics
  pollGamepad(dt) {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    let gp = null;
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        gp = gamepads[i];
        break;
      }
    }

    if (!gp) {
      this.input.gamepadConnected = false;
      return;
    }

    this.input.gamepadConnected = true;

    // Helper for debounced button press
    const isJustPressed = (idx) => {
      const down = gp.buttons[idx] && (gp.buttons[idx].pressed || gp.buttons[idx].value > 0.5);
      const was = !!this.prevGamepadButtons[idx];
      return down && !was;
    };

    // Left Analog Stick (Axes 0, 1) + D-Pad with True Radial Deadzone
    let lx = gp.axes[0] || 0;
    let ly = gp.axes[1] || 0;
    if (gp.buttons[12] && gp.buttons[12].pressed) ly = -1;
    if (gp.buttons[13] && gp.buttons[13].pressed) ly = 1;
    if (gp.buttons[14] && gp.buttons[14].pressed) lx = -1;
    if (gp.buttons[15] && gp.buttons[15].pressed) lx = 1;

    const rawMag = Math.hypot(lx, ly);
    const DEADZONE = 0.16;
    if (rawMag > DEADZONE) {
      const normMag = Math.min(1.0, (rawMag - DEADZONE) / (0.94 - DEADZONE));
      this.input.gamepadMoveX = (lx / rawMag) * normMag;
      this.input.gamepadMoveY = (ly / rawMag) * normMag;
      this.input.gamepadMoveMagnitude = normMag;
    } else {
      this.input.gamepadMoveX = 0;
      this.input.gamepadMoveY = 0;
      this.input.gamepadMoveMagnitude = 0;
    }

    // Button A (0): Turbo Sprint
    if (isJustPressed(0)) {
      if (window.miniMartAudio) window.miniMartAudio.resume();
      this.player.triggerTurbo();
    }

    // Button X (2) or Button Y (3): Upgrades Menu
    if (isJustPressed(2) || isJustPressed(3)) {
      this.openUpgrades();
    }

    // Start / Menu (9): Pause toggle
    if (isJustPressed(9)) {
      this.togglePause();
    }

    // Record button states for debounce
    for (let i = 0; i < 17; i++) {
      this.prevGamepadButtons[i] = gp.buttons[i] ? (gp.buttons[i].pressed || gp.buttons[i].value > 0.5) : false;
    }
  }

  rumble(duration = 50, weak = 0.2, strong = 0.3) {
    if (!navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.vibrationActuator && gp.vibrationActuator.playEffect) {
        gp.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: duration,
          weakMagnitude: weak,
          strongMagnitude: strong
        }).catch(() => {});
      }
    }
  }

  togglePause() {
    this.state = this.state === 'playing' ? 'paused' : 'playing';
    if (this.ui.pauseModal) {
      if (this.state === 'paused') {
        this.ui.pauseModal.classList.remove('hidden');
      } else {
        this.ui.pauseModal.classList.add('hidden');
      }
    }
    this.lastTime = performance.now();
  }

  openUpgrades() {
    if (this.ui.upgradeModal) {
      this.ui.upgradeModal.classList.remove('hidden');
      this.updateUpgradeModal();
    }
  }

  updateUpgradeModal() {
    const lblSpeedLvl = document.getElementById('lbl-speed-lvl');
    const lblSpeedCost = document.getElementById('lbl-speed-cost');
    const lblStackLvl = document.getElementById('lbl-stack-lvl');
    const lblStackCost = document.getElementById('lbl-stack-cost');

    if (lblSpeedLvl) lblSpeedLvl.innerText = `Lv. ${this.player.speedLevel}/5`;
    if (lblSpeedCost) lblSpeedCost.innerText = this.player.speedLevel >= 5 ? 'MAX' : `$${this.player.speedLevel * 50}`;
    if (lblStackLvl) lblStackLvl.innerText = `Lv. ${this.player.stackLevel}/5 (${this.player.maxStack} Items)`;
    if (lblStackCost) lblStackCost.innerText = this.player.stackLevel >= 5 ? 'MAX' : `$${this.player.stackLevel * 60}`;
  }

  // Visual FX Helpers
  spawnFlyingItem(fromX, fromY, target, itemType) {
    this.flyingItems.push({
      startX: fromX,
      startY: fromY,
      x: fromX,
      y: fromY,
      target: target,
      itemType: itemType,
      t: 0,
      duration: 0.35,
      arcHeight: 28
    });
  }

  spawnPopEffect(x, y, color) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 120,
        vy: -Math.random() * 90 - 30,
        color: color,
        size: Math.random() * 3 + 2,
        life: 0.35,
        maxLife: 0.35
      });
    }
  }

  spawnHeartEffect(x, y) {
    this.particles.push({
      x: x,
      y: y,
      vx: 0,
      vy: -40,
      color: '#ec4899',
      isHeart: true,
      size: 14,
      life: 0.8,
      maxLife: 0.8
    });
  }

  spawnCashParticles(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 180,
        vy: -Math.random() * 120 - 40,
        color: '#22c55e',
        isBill: true,
        size: 8,
        life: 0.6,
        maxLife: 0.6
      });
    }
  }

  spawnConfetti(x, y) {
    const colors = ['#38bdf8', '#4ade80', '#facc15', '#ec4899', '#a855f7'];
    for (let i = 0; i < 28; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 320,
        vy: -Math.random() * 260 - 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 3,
        life: 1.1,
        maxLife: 1.1
      });
    }
  }

  spawnFloatingText(x, y, text, color, fontSize = 16) {
    this.floatingTexts.push({
      x: x + (Math.random() - 0.5) * 14,
      y: y,
      text: text,
      color: color,
      fontSize: fontSize,
      life: 0.9,
      maxLife: 0.9
    });
  }

  // Main Loop
  gameLoop(currentTime) {
    let dt = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.pollGamepad(dt);

    if (this.state === 'playing') {
      this.update(dt);
    }

    this.render();

    // Auto-save progression every 8 seconds
    this.autoSaveTimer += dt;
    if (this.autoSaveTimer >= 8.0) {
      this.autoSaveTimer = 0;
      this.saveGame();
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    const bounds = { minX: 20, minY: 20, maxX: this.width - 20, maxY: this.height - 20 };

    // 1. Update Player
    this.player.update(dt, this.input, bounds, this);

    // 2. Camera Smooth Follow
    this.camera.targetX = this.player.x - this.viewportWidth / 2;
    this.camera.targetY = this.player.y - this.viewportHeight / 2;
    const camLerp = Math.min(1.0, dt * 7.5);
    this.camera.x += (this.camera.targetX - this.camera.x) * camLerp;
    this.camera.y += (this.camera.targetY - this.camera.y) * camLerp;

    // 3. Update Plots, Shelves, Checkout, and Unlock Zones
    this.plots.forEach(plot => plot.update(dt, this));
    this.shelves.forEach(shelf => shelf.update(dt, this));
    if (this.checkout) this.checkout.update(dt, this);
    this.unlockZones.forEach(zone => zone.update(dt, this));

    // Also activate matching shelf when plot unlocks
    this.plots.forEach(p => {
      if (p.unlocked) {
        const matchingShelf = this.shelves.find(s => s.type === p.type);
        if (matchingShelf && !matchingShelf.unlocked) {
          matchingShelf.unlocked = true;
        }
      }
    });

    // 4. Update Staff Helper if hired
    if (this.staffHelper) {
      this.staffHelper.update(dt, this);
    }

    // 5. Customer Spawner
    this.customerSpawnTimer += dt;
    if (this.customerSpawnTimer >= this.customerSpawnInterval && this.customers.length < this.maxCustomers) {
      this.customerSpawnTimer = 0;
      this.spawnCustomer();
    }

    // 6. Update Customers
    for (let i = this.customers.length - 1; i >= 0; i--) {
      const c = this.customers[i];
      c.update(dt, this);
      if (c.state === 'DONE') {
        const qIdx = this.customerQueue.indexOf(c);
        if (qIdx !== -1) this.customerQueue.splice(qIdx, 1);
        this.customers.splice(i, 1);
      }
    }

    // 7. Update Flying Items Animation
    for (let i = this.flyingItems.length - 1; i >= 0; i--) {
      const fi = this.flyingItems[i];
      fi.t += dt / fi.duration;
      if (fi.t >= 1) {
        this.flyingItems.splice(i, 1);
      } else {
        const targetX = fi.target.x;
        const targetY = fi.target.y;
        fi.x = fi.startX + (targetX - fi.startX) * fi.t;
        fi.y = fi.startY + (targetY - fi.startY) * fi.t - Math.sin(fi.t * Math.PI) * fi.arcHeight;
      }
    }

    // 8. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt; // gravity
      }
    }

    // 9. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      } else {
        ft.y -= 32 * dt;
      }
    }

    // 10. Update DOM HUD
    if (this.ui.hudMoney) this.ui.hudMoney.innerText = `$${this.money}`;
    if (this.ui.hudStack) this.ui.hudStack.innerText = `${this.player.carryStack.length}/${this.player.maxStack}`;
    const level = 1 + this.plots.filter(p => p.unlocked).length + (this.staffHired ? 1 : 0) + (this.cashierHired ? 1 : 0);
    this.storeLevel = level;
    if (this.ui.hudLevel) this.ui.hudLevel.innerText = `MART TIER ${this.storeLevel}`;
  }

  spawnCustomer() {
    // Generate shopping list of 1 to 3 items from unlocked item types
    const unlockedTypes = this.plots.filter(p => p.unlocked).map(p => p.type);
    if (unlockedTypes.length === 0) return;

    const itemCount = Math.min(3, Math.floor(Math.random() * 2) + 1);
    const list = [];
    for (let i = 0; i < itemCount; i++) {
      const randomItem = unlockedTypes[Math.floor(Math.random() * unlockedTypes.length)];
      list.push(randomItem);
    }

    const c = new MartCustomer(this.entranceX, this.entranceY, list);
    this.customers.push(c);
  }

  render() {
    this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    this.ctx.save();
    // Camera translation
    this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // 1. Draw Mart Floor Tiles (Clean checkered supermarket floor + wooden farm patio)
    this.drawStoreFloor();

    // 2. Draw Unlock Zones
    this.unlockZones.forEach(zone => zone.draw(this.ctx));

    // 3. Draw Farm Plots & Display Shelves
    this.plots.forEach(plot => plot.draw(this.ctx));
    this.shelves.forEach(shelf => shelf.draw(this.ctx));

    // 4. Draw Checkout Register
    if (this.checkout) this.checkout.draw(this.ctx);

    // 5. Draw Hired Cashier behind counter (if hired)
    if (this.cashierHired) {
      this.drawCashier(this.ctx, this.checkout.x - 30, this.checkout.y);
    }

    // 6. Draw Staff Helper (if hired)
    if (this.staffHelper) {
      this.staffHelper.draw(this.ctx);
    }

    // 7. Draw Customers
    this.customers.forEach(c => c.draw(this.ctx));

    // 8. Draw Player
    this.player.draw(this.ctx);

    // 9. Draw Flying Items
    this.flyingItems.forEach(fi => {
      drawItemIcon(this.ctx, fi.x, fi.y, fi.itemType, 1.15);
    });

    // 10. Draw Particles
    this.particles.forEach(p => {
      const alpha = Math.max(0, p.life / p.maxLife);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      if (p.isHeart) {
        this.ctx.fillStyle = p.color;
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText('♥', p.x, p.y);
      } else if (p.isBill) {
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x - p.size, p.y - p.size / 2, p.size * 2, p.size);
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });

    // 11. Draw Floating Texts
    this.floatingTexts.forEach(ft => {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = ft.color;
      this.ctx.font = `bold ${ft.fontSize}px "Orbitron", "Rajdhani", sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 6;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    });

    this.ctx.restore();
  }

  drawStoreFloor() {
    // Farm patio floor on left (wooden planks)
    this.ctx.fillStyle = '#451a03';
    this.ctx.fillRect(0, 0, 360, this.height);

    for (let y = 0; y < this.height; y += 40) {
      this.ctx.strokeStyle = '#291002';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(0, y, 360, 40);
    }

    // Supermarket Checkered Tile Floor on Right
    const tileSize = 48;
    for (let x = 360; x < this.width; x += tileSize) {
      for (let y = 0; y < this.height; y += tileSize) {
        const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        this.ctx.fillStyle = isAlt ? '#0f172a' : '#1e293b';
        this.ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    // Store Perimeter Walls (Wood & Glass cyber border)
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 6;
    this.ctx.strokeRect(3, 3, this.width - 6, this.height - 6);

    // Entrance / Exit Carpet Mat at bottom center
    this.ctx.fillStyle = '#10b981';
    this.ctx.fillRect(this.entranceX - 55, this.entranceY, 110, 50);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px "Orbitron", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('STORE ENTRANCE', this.entranceX, this.entranceY + 30);
  }

  drawCashier(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Cashier in uniform
    ctx.fillStyle = '#10b981';
    ctx.fillRect(-7, -4, 14, 14);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -12, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Green visor
    ctx.fillStyle = '#059669';
    ctx.fillRect(-8, -16, 16, 4);

    ctx.restore();
  }

  saveGame() {
    try {
      const data = {
        money: this.money,
        speedLevel: this.player.speedLevel,
        stackLevel: this.player.stackLevel,
        unlockedPlots: this.plots.filter(p => p.unlocked).map(p => p.id),
        unlockedShelves: this.shelves.filter(s => s.unlocked).map(s => s.id),
        staffHired: this.staffHired,
        cashierHired: this.cashierHired
      };
      localStorage.setItem('pixel_mini_mart_save', JSON.stringify(data));
    } catch (_) {}
  }

  loadSave() {
    try {
      const raw = localStorage.getItem('pixel_mini_mart_save');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.money !== undefined) this.money = data.money;
      if (data.speedLevel) {
        this.player.speedLevel = data.speedLevel;
        this.player.speed = 220 + (data.speedLevel - 1) * 35;
      }
      if (data.stackLevel) {
        this.player.stackLevel = data.stackLevel;
        this.player.maxStack = 6 + (data.stackLevel - 1) * 4;
      }
      if (data.unlockedPlots) {
        this.plots.forEach(p => {
          if (data.unlockedPlots.includes(p.id)) p.unlocked = true;
        });
      }
      if (data.unlockedShelves) {
        this.shelves.forEach(s => {
          if (data.unlockedShelves.includes(s.id)) s.unlocked = true;
        });
      }
      if (data.staffHired) {
        this.staffHired = true;
        this.staffHelper = new StaffHelper(310, 340);
        // Remove zone
        const idx = this.unlockZones.findIndex(z => z.targetId === 'hire_stocker');
        if (idx !== -1) this.unlockZones.splice(idx, 1);
      }
      if (data.cashierHired) {
        this.cashierHired = true;
        const idx = this.unlockZones.findIndex(z => z.targetId === 'hire_cashier');
        if (idx !== -1) this.unlockZones.splice(idx, 1);
      }
    } catch (_) {}
  }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
  window.miniMartInstance = new MiniMartGame();
});
