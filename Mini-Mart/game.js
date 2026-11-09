/**
 * SUNNY MINI MART - MAIN GAME ENGINE
 * Multi-Mart Franchise Tycoon with Shared Wallet, Travel Express Shuttle,
 * Cartoon Production Zones, Expressive Shoppers, Trash Can Disposal, and Complete Save System.
 */

// --- STORE TUTORIAL & MILESTONE DEFINITIONS ---
const MART_TUTORIAL = [
  {
    id: 'harvest_crop',
    title: 'Garden Harvester',
    desc: 'Walk up to any production zone on the left to pick ready crops or goods.',
    current: 0,
    target: 4,
    isDone: false,
    rewardGold: 50,
    rewardDesc: '$50 Bonus Cash',
    onComplete: (game) => {
      game.money += 50;
    }
  },
  {
    id: 'stock_shelf',
    title: 'Stock Market Stands',
    desc: 'Walk over to the matching market stand in the aisles to stock goods for shoppers.',
    current: 0,
    target: 4,
    isDone: false,
    rewardGold: 60,
    rewardDesc: '$60 Bonus Cash',
    onComplete: (game) => {
      game.money += 60;
    }
  },
  {
    id: 'serve_customers',
    title: 'Register Cashier',
    desc: 'Stand on the green mat beside the Checkout Register to scan purchases for 2 customers.',
    current: 0,
    target: 2,
    isDone: false,
    rewardGold: 80,
    rewardDesc: '$80 Bonus Cash',
    onComplete: (game) => {
      game.money += 80;
    }
  },
  {
    id: 'store_upgrade',
    title: 'Store Investment',
    desc: 'Press E (or Upgrades button / Xbox X) to purchase a Speed or Carry Capacity upgrade.',
    current: 0,
    target: 1,
    isDone: false,
    rewardGold: 100,
    rewardDesc: '$100 Bonus Cash',
    onComplete: (game) => {
      game.money += 100;
    }
  },
  {
    id: 'unlock_expansion',
    title: 'Franchise Expansion',
    desc: 'Walk onto any dashed expansion pad or unlock a new Franchise Mart with your profits!',
    current: 0,
    target: 1,
    isDone: false,
    rewardGold: 150,
    rewardDesc: '$150 Bonus Cash & Master Merchant Badge',
    onComplete: (game) => {
      game.money += 150;
    }
  }
];

// --- MULTI-MART FRANCHISE CONFIGURATIONS ---
// Spacious 1440 x 920 world dimensions with roomy aisles and generous movement paths
const MARTS_CONFIG = {
  mart_farm: {
    id: 'mart_farm',
    name: 'Sunny Farm Valley',
    shortTitle: 'SUNNY MINI MART',
    subtitle: 'Mart 1: Fresh Produce, Dairy & Bakery',
    theme: 'farm',
    accentColor: '#16a34a',
    unlockCost: 0,
    products: ['tomato', 'egg', 'apple', 'milk', 'bread'],
    productLabels: ['Tomatoes', 'Farm Eggs', 'Apples', 'Fresh Milk', 'Bread'],
    entranceX: 780,
    entranceY: 855,
    createPlots: () => [
      new ProductionPlot({ id: 'tomato_plot', type: 'tomato', name: 'Tomato Garden', x: 130, y: 190, width: 96, height: 92, unlocked: true, initialStock: 4 }),
      new ProductionPlot({ id: 'egg_coop', type: 'egg', name: 'Chicken Coop', x: 130, y: 370, width: 96, height: 92, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'apple_orchard', type: 'apple', name: 'Apple Orchard', x: 130, y: 550, width: 96, height: 92, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'milk_pasture', type: 'milk', name: 'Dairy Cow Pen', x: 130, y: 730, width: 96, height: 92, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'bakery_oven', type: 'bread', name: 'Bakery Oven', x: 290, y: 190, width: 96, height: 92, unlocked: false, initialStock: 0 })
    ],
    createShelves: () => [
      new StoreShelf({ id: 'tomato_shelf', type: 'tomato', name: 'Tomato Stand', x: 600, y: 210, width: 96, height: 74, unlocked: true, initialStock: 4 }),
      new StoreShelf({ id: 'egg_shelf', type: 'egg', name: 'Egg Rack', x: 870, y: 210, width: 96, height: 74, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'apple_shelf', type: 'apple', name: 'Apple Crate', x: 1140, y: 210, width: 96, height: 74, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'milk_shelf', type: 'milk', name: 'Milk Fridge', x: 600, y: 430, width: 96, height: 74, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'bread_shelf', type: 'bread', name: 'Bread Bakery', x: 870, y: 430, width: 96, height: 74, unlocked: false, initialStock: 0 })
    ],
    createUnlockZones: () => [
      new UnlockZone({ id: 'zone_egg', title: 'Unlock Egg Coop', targetId: 'egg_coop', cost: 45, x: 870, y: 210 }),
      new UnlockZone({ id: 'zone_milk', title: 'Unlock Dairy Milk', targetId: 'milk_pasture', cost: 95, x: 600, y: 430 }),
      new UnlockZone({ id: 'zone_apple', title: 'Unlock Apple Tree', targetId: 'apple_orchard', cost: 160, x: 1140, y: 210 }),
      new UnlockZone({ id: 'zone_bread', title: 'Unlock Bakery', targetId: 'bakery_oven', cost: 240, x: 870, y: 430 }),
      new UnlockZone({ id: 'zone_stocker', title: 'Hire Stocker', targetId: 'hire_stocker', cost: 130, x: 290, y: 410 }),
      new UnlockZone({ id: 'zone_cashier', title: 'Hire Cashier', targetId: 'hire_cashier', cost: 210, x: 590, y: 670 })
    ]
  },
  mart_beach: {
    id: 'mart_beach',
    name: 'Tropical Boardwalk Mart',
    shortTitle: 'TROPICAL BOARDWALK',
    subtitle: 'Mart 2: Island Fruits, Smoothies & Gelato',
    theme: 'beach',
    accentColor: '#0ea5e9',
    unlockCost: 350,
    products: ['banana', 'coconut', 'pineapple', 'smoothie', 'icecream'],
    productLabels: ['Bananas', 'Coconuts', 'Pineapples', 'Smoothies', 'Gelato'],
    entranceX: 780,
    entranceY: 855,
    createPlots: () => [
      new ProductionPlot({ id: 'banana_grove', type: 'banana', name: 'Banana Grove', x: 130, y: 190, width: 96, height: 92, unlocked: true, initialStock: 4 }),
      new ProductionPlot({ id: 'coconut_palm', type: 'coconut', name: 'Coconut Palm', x: 130, y: 370, width: 96, height: 92, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'pineapple_field', type: 'pineapple', name: 'Pineapple Field', x: 130, y: 550, width: 96, height: 92, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'smoothie_tiki', type: 'smoothie', name: 'Tiki Blender', x: 130, y: 730, width: 96, height: 92, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'gelato_cart', type: 'icecream', name: 'Gelato Churner', x: 290, y: 190, width: 96, height: 92, unlocked: false, initialStock: 0 })
    ],
    createShelves: () => [
      new StoreShelf({ id: 'banana_shelf', type: 'banana', name: 'Banana Stand', x: 600, y: 210, width: 96, height: 74, unlocked: true, initialStock: 4 }),
      new StoreShelf({ id: 'coconut_shelf', type: 'coconut', name: 'Coconut Crate', x: 870, y: 210, width: 96, height: 74, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'pineapple_shelf', type: 'pineapple', name: 'Pineapple Cart', x: 1140, y: 210, width: 96, height: 74, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'smoothie_shelf', type: 'smoothie', name: 'Smoothie Bar', x: 600, y: 430, width: 96, height: 74, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'icecream_shelf', type: 'icecream', name: 'Ice Cream Bar', x: 870, y: 430, width: 96, height: 74, unlocked: false, initialStock: 0 })
    ],
    createUnlockZones: () => [
      new UnlockZone({ id: 'zone_coconut', title: 'Unlock Coconuts', targetId: 'coconut_palm', cost: 120, x: 870, y: 210 }),
      new UnlockZone({ id: 'zone_pineapple', title: 'Unlock Pineapples', targetId: 'pineapple_field', cost: 220, x: 1140, y: 210 }),
      new UnlockZone({ id: 'zone_smoothie', title: 'Unlock Smoothie Bar', targetId: 'smoothie_tiki', cost: 340, x: 600, y: 430 }),
      new UnlockZone({ id: 'zone_icecream', title: 'Unlock Gelato Cart', targetId: 'gelato_cart', cost: 480, x: 870, y: 430 }),
      new UnlockZone({ id: 'zone_beach_stocker', title: 'Hire Beach Stocker', targetId: 'hire_stocker', cost: 260, x: 290, y: 410 }),
      new UnlockZone({ id: 'zone_beach_cashier', title: 'Hire Beach Cashier', targetId: 'hire_cashier', cost: 360, x: 590, y: 670 })
    ]
  },
  mart_candy: {
    id: 'mart_candy',
    name: 'Sweet Candyland Mart',
    shortTitle: 'SWEET CANDYLAND',
    subtitle: 'Mart 3: Artisan Chocolates, Donuts & Candies',
    theme: 'candy',
    accentColor: '#ec4899',
    unlockCost: 800,
    products: ['strawberry', 'cocoa', 'chocolate', 'donut', 'candy'],
    productLabels: ['Strawberries', 'Cocoa Beans', 'Chocolates', 'Donuts', 'Lollipops'],
    entranceX: 780,
    entranceY: 855,
    createPlots: () => [
      new ProductionPlot({ id: 'strawberry_patch', type: 'strawberry', name: 'Strawberry Patch', x: 130, y: 190, width: 96, height: 92, unlocked: true, initialStock: 4 }),
      new ProductionPlot({ id: 'cocoa_grove', type: 'cocoa', name: 'Cocoa Orchard', x: 130, y: 370, width: 96, height: 92, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'chocolate_kettle', type: 'chocolate', name: 'Chocolate Vat', x: 130, y: 550, width: 96, height: 92, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'donut_station', type: 'donut', name: 'Donut Baker', x: 130, y: 730, width: 96, height: 92, unlocked: false, initialStock: 0 }),
      new ProductionPlot({ id: 'candy_carousel', type: 'candy', name: 'Candy Carousel', x: 290, y: 190, width: 96, height: 92, unlocked: false, initialStock: 0 })
    ],
    createShelves: () => [
      new StoreShelf({ id: 'strawberry_shelf', type: 'strawberry', name: 'Berry Stand', x: 600, y: 210, width: 96, height: 74, unlocked: true, initialStock: 4 }),
      new StoreShelf({ id: 'cocoa_shelf', type: 'cocoa', name: 'Cocoa Sacks', x: 870, y: 210, width: 96, height: 74, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'chocolate_shelf', type: 'chocolate', name: 'Chocolate Case', x: 1140, y: 210, width: 96, height: 74, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'donut_shelf', type: 'donut', name: 'Donut Display', x: 600, y: 430, width: 96, height: 74, unlocked: false, initialStock: 0 }),
      new StoreShelf({ id: 'candy_shelf', type: 'candy', name: 'Candy Tower', x: 870, y: 430, width: 96, height: 74, unlocked: false, initialStock: 0 })
    ],
    createUnlockZones: () => [
      new UnlockZone({ id: 'zone_cocoa', title: 'Unlock Cocoa', targetId: 'cocoa_grove', cost: 280, x: 870, y: 210 }),
      new UnlockZone({ id: 'zone_chocolate', title: 'Unlock Chocolate', targetId: 'chocolate_kettle', cost: 450, x: 1140, y: 210 }),
      new UnlockZone({ id: 'zone_donut', title: 'Unlock Donuts', targetId: 'donut_station', cost: 650, x: 600, y: 430 }),
      new UnlockZone({ id: 'zone_candy', title: 'Unlock Candies', targetId: 'candy_carousel', cost: 900, x: 870, y: 430 }),
      new UnlockZone({ id: 'zone_candy_stocker', title: 'Hire Confectioner', targetId: 'hire_stocker', cost: 480, x: 290, y: 410 }),
      new UnlockZone({ id: 'zone_candy_cashier', title: 'Hire Candy Cashier', targetId: 'hire_cashier', cost: 600, x: 590, y: 670 })
    ]
  }
};

class MiniMartGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // Expanded Viewport & World Dimensions (1440 x 920 for roomy aisles & spacious layouts)
    this.width = 1440;
    this.height = 920;
    this.viewportWidth = window.innerWidth;
    this.viewportHeight = window.innerHeight;
    this.camera = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Entrance position
    this.entranceX = 780;
    this.entranceY = 855;

    // Express Shuttle Bus position (Parked beside entrance)
    this.busX = 1100;
    this.busY = 840;
    this.busRadius = 65;

    // Shared Franchise Tycoon Economy & Progression
    this.money = 150;
    this.totalProfit = 150;
    this.totalCustomersServed = 0;
    this.storeLevel = 1;
    this.state = 'playing'; // 'playing', 'paused'

    // Franchise Marts Multi-Store State
    this.currentMartId = 'mart_farm';
    this.unlockedMarts = ['mart_farm'];
    this.martsData = {
      mart_farm: null,
      mart_beach: null,
      mart_candy: null
    };

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
    this.customerSpawnInterval = 3.5;
    this.maxCustomers = 8;
    this.customers = [];
    this.customerQueue = [];

    // Entities in active mart
    this.player = new MiniMartPlayer(720, 720);
    this.plots = [];
    this.shelves = [];
    this.checkout = null;
    this.trashBin = new TrashBin(490, 800);
    this.unlockZones = [];
    this.staffHelper = null;
    this.staffHired = false;
    this.cashierHired = false;

    // Visual FX
    this.flyingItems = [];
    this.particles = [];
    this.floatingTexts = [];
    this.worldTime = 0;

    // Tutorial & Milestones
    this.tutorialQuests = JSON.parse(JSON.stringify(MART_TUTORIAL));
    this.activeTutorialIdx = 0;

    // UI Cache
    this.ui = {
      hudMoney: document.getElementById('hud-money'),
      hudStack: document.getElementById('hud-stack'),
      hudLevel: document.getElementById('hud-level'),
      hudMartTitle: document.getElementById('hud-mart-title'),
      turboBtn: document.getElementById('btn-turbo'),
      pauseModal: document.getElementById('pause-modal'),
      upgradeModal: document.getElementById('upgrade-modal'),
      btnUpgrades: document.getElementById('btn-upgrades'),
      btnPause: document.getElementById('btn-pause'),
      btnResume: document.getElementById('btn-resume'),
      btnMusic: document.getElementById('btn-music'),
      btnSfx: document.getElementById('btn-sfx'),
      joystickContainer: document.getElementById('joystick-container'),
      joystickKnob: document.getElementById('joystick-knob'),
      floatingGoalBox: document.getElementById('floating-goal-box'),
      activeGoalText: document.getElementById('active-goal-text'),
      goalBadge: document.getElementById('goal-badge'),
      tutorialModal: document.getElementById('tutorial-modal'),
      tutorialList: document.getElementById('tutorial-list'),
      btnTutorial: document.getElementById('btn-tutorial'),
      btnCloseTutorial: document.getElementById('btn-close-tutorial'),
      btnTutorialOk: document.getElementById('btn-tutorial-ok'),
      martsModal: document.getElementById('marts-modal'),
      martsList: document.getElementById('marts-list'),
      btnMarts: document.getElementById('btn-marts'),
      btnCloseMarts: document.getElementById('btn-close-marts')
    };

    this.initStore(this.currentMartId);
    this.loadSave();
    this.setupInputs();
    this.setupResize();
    this.updateTutorialUI();
    this.updateMartHUD();

    this.lastTime = performance.now();
    this.autoSaveTimer = 0;
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  initStore(martId) {
    const config = MARTS_CONFIG[martId] || MARTS_CONFIG.mart_farm;
    this.currentMartId = config.id;
    this.entranceX = config.entranceX;
    this.entranceY = config.entranceY;

    this.plots = config.createPlots();
    this.shelves = config.createShelves();
    this.checkout = new CheckoutCounter(780, 670);
    this.trashBin = new TrashBin(490, 800);
    this.unlockZones = config.createUnlockZones();
    this.staffHelper = null;
    this.staffHired = false;
    this.cashierHired = false;
  }

  snapshotActiveMart() {
    this.martsData[this.currentMartId] = {
      unlockedPlots: this.plots.filter(p => p.unlocked).map(p => p.id),
      unlockedShelves: this.shelves.filter(s => s.unlocked).map(s => s.id),
      staffHired: this.staffHired,
      cashierHired: this.cashierHired,
      unlockZones: this.unlockZones.map(z => ({ id: z.id, paid: z.paid, cost: z.cost, targetId: z.targetId }))
    };
  }

  restoreMartState(martId) {
    this.initStore(martId);
    const saved = this.martsData[martId];
    if (!saved) return;

    if (saved.unlockedPlots) {
      this.plots.forEach(p => {
        if (saved.unlockedPlots.includes(p.id)) p.unlocked = true;
      });
    }

    if (saved.unlockedShelves) {
      this.shelves.forEach(s => {
        if (saved.unlockedShelves.includes(s.id)) s.unlocked = true;
      });
    }

    if (saved.staffHired) {
      this.staffHired = true;
      this.staffHelper = new StaffHelper(290, 410);
    }

    if (saved.cashierHired) {
      this.cashierHired = true;
    }

    if (saved.unlockZones) {
      this.unlockZones = this.unlockZones.filter(z => {
        if (z.targetId === 'hire_stocker' && this.staffHired) return false;
        if (z.targetId === 'hire_cashier' && this.cashierHired) return false;
        const p = this.plots.find(plot => plot.id === z.targetId);
        if (p && p.unlocked) return false;
        const s = this.shelves.find(shelf => shelf.id === z.targetId);
        if (s && s.unlocked) return false;
        return true;
      });

      saved.unlockZones.forEach(sz => {
        const matchingZone = this.unlockZones.find(z => z.id === sz.id);
        if (matchingZone && sz.paid) {
          matchingZone.paid = sz.paid;
        }
      });
    }
  }

  switchMart(targetMartId) {
    if (!this.unlockedMarts.includes(targetMartId)) return;
    if (this.currentMartId === targetMartId) {
      this.closeMartsModal();
      return;
    }

    this.snapshotActiveMart();

    if (window.miniMartAudio) window.miniMartAudio.playTravel();
    if (this.rumble) this.rumble(180, 0.3, 0.4);

    this.customers = [];
    this.customerQueue = [];
    this.flyingItems = [];

    this.restoreMartState(targetMartId);

    // Reposition player near entrance
    this.player.x = 720;
    this.player.y = 720;
    this.player.carryStack = [];

    this.updateMartHUD();
    this.closeMartsModal();
    this.saveGame();

    const config = MARTS_CONFIG[targetMartId];
    this.spawnConfetti(this.player.x, this.player.y);
    this.spawnFloatingText(this.player.x, this.player.y - 45, `ARRIVED AT ${config.name.toUpperCase()}!`, config.accentColor, 20);
  }

  unlockMart(targetMartId) {
    const config = MARTS_CONFIG[targetMartId];
    if (!config) return;
    if (this.unlockedMarts.includes(targetMartId)) {
      this.switchMart(targetMartId);
      return;
    }

    if (this.money >= config.unlockCost) {
      this.money -= config.unlockCost;
      this.unlockedMarts.push(targetMartId);

      if (window.miniMartAudio) window.miniMartAudio.playUnlock();
      if (this.rumble) this.rumble(250, 0.4, 0.6);

      this.progressTutorial('unlock_expansion', 1);
      this.switchMart(targetMartId);
      this.renderMartsList();
    }
  }

  updateMartHUD() {
    const config = MARTS_CONFIG[this.currentMartId] || MARTS_CONFIG.mart_farm;
    if (this.ui.hudMartTitle) {
      this.ui.hudMartTitle.innerText = config.shortTitle;
    }
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
    window.addEventListener('keydown', (e) => {
      this.input.keys[e.code] = true;
      if (window.miniMartAudio) window.miniMartAudio.init();

      if (e.code === 'Space') {
        e.preventDefault();
        this.player.triggerTurbo();
      } else if (e.code === 'KeyE') {
        this.openUpgrades();
      } else if (e.code === 'KeyM') {
        this.toggleMartsModal();
      } else if (e.code === 'KeyT') {
        this.toggleTutorialModal();
      } else if (e.code === 'Escape') {
        if (this.ui.martsModal && !this.ui.martsModal.classList.contains('hidden')) {
          this.closeMartsModal();
        } else if (this.ui.tutorialModal && !this.ui.tutorialModal.classList.contains('hidden')) {
          this.closeTutorialModal();
        } else if (this.ui.upgradeModal && !this.ui.upgradeModal.classList.contains('hidden')) {
          this.ui.upgradeModal.classList.add('hidden');
        } else {
          this.togglePause();
        }
      } else if (e.code === 'KeyP') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.input.keys[e.code] = false;
    });

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

    const joyContainer = this.ui.joystickContainer;
    const joyKnob = this.ui.joystickKnob;

    this.input.joystickTouchId = null;

    if (joyContainer && joyKnob) {
      const onTouchStart = (e) => {
        if (e.target.closest('button, a, .modal-card, .hud-card, #floating-goal-box')) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (this.input.joystickTouchId === null) {
            this.input.joystickTouchId = touch.identifier;
            this.input.touchActive = true;
            this.input.touchStartX = touch.clientX;
            this.input.touchStartY = touch.clientY;
            this.input.touchMoveX = 0;
            this.input.touchMoveY = 0;
            this.input.touchMagnitude = 0;

            joyContainer.classList.remove('hidden');
            joyContainer.style.left = `${this.input.touchStartX}px`;
            joyContainer.style.top = `${this.input.touchStartY}px`;
            joyKnob.style.transform = 'translate(0px, 0px)';
            if (e.cancelable) e.preventDefault();
            break;
          }
        }
      };

      const onTouchMove = (e) => {
        if (!this.input.touchActive || this.input.joystickTouchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.input.joystickTouchId) {
            const dx = touch.clientX - this.input.touchStartX;
            const dy = touch.clientY - this.input.touchStartY;
            const distVal = Math.hypot(dx, dy);
            const maxDist = 52;

            if (distVal > 0) {
              const clamped = Math.min(distVal, maxDist);
              this.input.touchMoveX = (dx / distVal) * (clamped / maxDist);
              this.input.touchMoveY = (dy / distVal) * (clamped / maxDist);
              this.input.touchMagnitude = clamped / maxDist;
              joyKnob.style.transform = `translate(${this.input.touchMoveX * maxDist}px, ${this.input.touchMoveY * maxDist}px)`;
            }
            if (e.cancelable) e.preventDefault();
            break;
          }
        }
      };

      const onTouchEnd = (e) => {
        if (!this.input.touchActive || this.input.joystickTouchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.input.joystickTouchId) {
            this.input.touchActive = false;
            this.input.joystickTouchId = null;
            this.input.touchMoveX = 0;
            this.input.touchMoveY = 0;
            this.input.touchMagnitude = 0;
            joyContainer.classList.add('hidden');
            if (e.cancelable) e.preventDefault();
            break;
          }
        }
      };

      window.addEventListener('touchstart', onTouchStart, { passive: false });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: false });
      window.addEventListener('touchcancel', onTouchEnd, { passive: false });
    }

    if (this.ui.btnPause) this.ui.btnPause.addEventListener('click', () => this.togglePause());
    if (this.ui.btnResume) this.ui.btnResume.addEventListener('click', () => this.togglePause());
    if (this.ui.btnUpgrades) this.ui.btnUpgrades.addEventListener('click', () => this.openUpgrades());
    if (this.ui.btnMarts) this.ui.btnMarts.addEventListener('click', () => this.toggleMartsModal());
    if (this.ui.btnCloseMarts) this.ui.btnCloseMarts.addEventListener('click', () => this.closeMartsModal());

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

    if (this.ui.btnTutorial) this.ui.btnTutorial.addEventListener('click', () => this.toggleTutorialModal());
    if (this.ui.floatingGoalBox) this.ui.floatingGoalBox.addEventListener('click', () => this.openTutorialModal());
    if (this.ui.btnCloseTutorial) this.ui.btnCloseTutorial.addEventListener('click', () => this.closeTutorialModal());
    if (this.ui.btnTutorialOk) this.ui.btnTutorialOk.addEventListener('click', () => this.closeTutorialModal());

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
          this.progressTutorial('store_upgrade', 1);
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
          this.progressTutorial('store_upgrade', 1);
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

    const isJustPressed = (idx) => {
      const down = gp.buttons[idx] && (gp.buttons[idx].pressed || gp.buttons[idx].value > 0.5);
      const was = !!this.prevGamepadButtons[idx];
      return down && !was;
    };

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

    if (isJustPressed(0)) {
      if (window.miniMartAudio) window.miniMartAudio.resume();
      this.player.triggerTurbo();
    }

    if (isJustPressed(2)) {
      this.openUpgrades();
    }

    if (isJustPressed(3)) {
      this.toggleMartsModal();
    }

    if (isJustPressed(1)) {
      if (this.ui.martsModal && !this.ui.martsModal.classList.contains('hidden')) {
        this.closeMartsModal();
      } else if (this.ui.tutorialModal && !this.ui.tutorialModal.classList.contains('hidden')) {
        this.closeTutorialModal();
      } else if (this.ui.upgradeModal && !this.ui.upgradeModal.classList.contains('hidden')) {
        this.ui.upgradeModal.classList.add('hidden');
      } else if (this.state === 'paused') {
        this.togglePause();
      }
    }

    if (isJustPressed(8)) {
      this.toggleTutorialModal();
    }

    if (isJustPressed(9)) {
      this.togglePause();
    }

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

  // --- FRANCHISE MARTS MODAL & NAVIGATION ---
  openMartsModal() {
    if (this.ui.martsModal) {
      if (window.miniMartAudio) window.miniMartAudio.playBlip();
      this.ui.martsModal.classList.remove('hidden');
      this.renderMartsList();
    }
  }

  closeMartsModal() {
    if (this.ui.martsModal) {
      if (window.miniMartAudio) window.miniMartAudio.playBlip();
      this.ui.martsModal.classList.add('hidden');
    }
  }

  toggleMartsModal() {
    if (!this.ui.martsModal) return;
    if (this.ui.martsModal.classList.contains('hidden')) {
      this.openMartsModal();
    } else {
      this.closeMartsModal();
    }
  }

  renderMartsList() {
    if (!this.ui.martsList) return;

    let html = '';
    const martKeys = ['mart_farm', 'mart_beach', 'mart_candy'];

    martKeys.forEach((key) => {
      const cfg = MARTS_CONFIG[key];
      const isCurrent = this.currentMartId === key;
      const isUnlocked = this.unlockedMarts.includes(key);

      let cardClass = isCurrent ? 'current' : (isUnlocked ? 'unlocked' : 'locked');
      let badgeClass = isCurrent ? 'current' : (isUnlocked ? 'unlocked' : 'locked');
      let badgeLabel = isCurrent ? 'ACTIVE STORE' : (isUnlocked ? 'UNLOCKED' : 'LOCKED');

      // Vector Icon per Mart
      let iconSvg = '';
      if (cfg.theme === 'farm') {
        iconSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
      } else if (cfg.theme === 'beach') {
        iconSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      } else {
        iconSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>`;
      }

      // Action Button
      let actionBtnHtml = '';
      if (isCurrent) {
        actionBtnHtml = `<button class="mart-action-btn active-btn" disabled><span>CURRENT MART</span></button>`;
      } else if (isUnlocked) {
        actionBtnHtml = `
          <button class="mart-action-btn travel-btn" onclick="window.miniMartInstance.switchMart('${key}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>TRAVEL NOW</span>
          </button>
        `;
      } else {
        const canAfford = this.money >= cfg.unlockCost;
        actionBtnHtml = `
          <button class="mart-action-btn unlock-btn" ${canAfford ? '' : 'style="opacity:0.6;"'} onclick="window.miniMartInstance.unlockMart('${key}')">
            <span>UNLOCK $${cfg.unlockCost}</span>
          </button>
        `;
      }

      const tagsHtml = cfg.productLabels.map(l => `<span class="mart-tag">${l}</span>`).join('');

      html += `
        <div class="mart-location-card ${cardClass}">
          <div class="mart-card-main">
            <div class="mart-card-icon" style="background: ${cfg.accentColor};">
              ${iconSvg}
            </div>
            <div class="mart-card-details">
              <div class="mart-card-name-row">
                <span class="mart-card-title">${cfg.name}</span>
                <span class="mart-card-badge ${badgeClass}">${badgeLabel}</span>
              </div>
              <div class="mart-card-desc">${cfg.subtitle}</div>
              <div class="mart-product-tags">${tagsHtml}</div>
            </div>
          </div>
          <div class="mart-action-col">
            ${actionBtnHtml}
          </div>
        </div>
      `;
    });

    this.ui.martsList.innerHTML = html;
  }

  // --- TUTORIAL & MILESTONE SYSTEM ---
  progressTutorial(questId, amount = 1) {
    if (this.activeTutorialIdx >= this.tutorialQuests.length) return;
    const q = this.tutorialQuests[this.activeTutorialIdx];
    if (!q || q.id !== questId || q.isDone) return;

    q.current = Math.min(q.target, (q.current || 0) + amount);
    if (q.current >= q.target) {
      this.completeTutorialQuest(q);
    } else {
      this.updateTutorialUI();
    }
  }

  completeTutorialQuest(q) {
    q.isDone = true;
    q.current = q.target;

    if (q.onComplete) {
      q.onComplete(this);
    } else if (q.rewardGold) {
      this.money += q.rewardGold;
    }

    if (window.miniMartAudio) {
      window.miniMartAudio.playQuestComplete();
    }
    this.rumble(250, 0.4, 0.6);

    this.spawnConfetti(this.player.x, this.player.y);
    this.spawnFloatingText(this.player.x, this.player.y - 45, 'TASK COMPLETE!', '#d97706', 22);
    if (q.rewardGold) {
      setTimeout(() => {
        this.spawnFloatingText(this.player.x, this.player.y - 65, `+$${q.rewardGold}`, '#16a34a', 22);
      }, 350);
    }

    this.advanceActiveTutorialIdx();
    this.updateTutorialUI();
    this.renderTutorialList();
    this.saveGame();
  }

  advanceActiveTutorialIdx() {
    while (this.activeTutorialIdx < this.tutorialQuests.length && this.tutorialQuests[this.activeTutorialIdx].isDone) {
      this.activeTutorialIdx++;
    }
  }

  updateTutorialUI() {
    if (!this.ui.activeGoalText || !this.ui.goalBadge) return;
    if (this.activeTutorialIdx >= this.tutorialQuests.length) {
      this.ui.goalBadge.innerText = '5/5 DONE';
      this.ui.goalBadge.style.background = '#16a34a';
      this.ui.activeGoalText.innerText = 'All milestones finished! You are a Master Mart Tycoon!';
      return;
    }

    const q = this.tutorialQuests[this.activeTutorialIdx];
    this.ui.goalBadge.innerText = `${this.activeTutorialIdx + 1}/5`;
    this.ui.goalBadge.style.background = '#0ea5e9';
    if (q.target > 1) {
      this.ui.activeGoalText.innerText = `${q.title}: ${q.desc} (${q.current || 0}/${q.target})`;
    } else {
      this.ui.activeGoalText.innerText = `${q.title}: ${q.desc}`;
    }
  }

  openTutorialModal() {
    if (this.ui.tutorialModal) {
      if (window.miniMartAudio) window.miniMartAudio.playBlip();
      this.ui.tutorialModal.classList.remove('hidden');
      this.renderTutorialList();
    }
  }

  closeTutorialModal() {
    if (this.ui.tutorialModal) {
      if (window.miniMartAudio) window.miniMartAudio.playBlip();
      this.ui.tutorialModal.classList.add('hidden');
    }
  }

  toggleTutorialModal() {
    if (!this.ui.tutorialModal) return;
    if (this.ui.tutorialModal.classList.contains('hidden')) {
      this.openTutorialModal();
    } else {
      this.closeTutorialModal();
    }
  }

  renderTutorialList() {
    if (!this.ui.tutorialList) return;

    let html = '';
    this.tutorialQuests.forEach((q, idx) => {
      let statusClass = 'pending';
      let badgeText = 'LOCKED';
      let iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

      if (q.isDone) {
        statusClass = 'done';
        badgeText = 'COMPLETED';
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
      } else if (idx === this.activeTutorialIdx) {
        statusClass = 'active-step';
        badgeText = q.target > 1 ? `IN PROGRESS (${q.current || 0}/${q.target})` : 'ACTIVE';
        iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>';
      }

      html += `
        <div class="tut-task-card ${statusClass}">
          <div class="tut-task-top">
            <div class="tut-task-title-wrap">
              <div class="tut-status-icon">${iconSvg}</div>
              <div class="tut-task-title">${q.title}</div>
            </div>
            <div class="tut-status-pill ${statusClass}">${badgeText}</div>
          </div>
          <div class="tut-task-desc">${q.desc}</div>
          <div class="tut-task-reward">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v12"/><path d="M15 9.5a2.5 2.5 0 0 0-5 0c0 2.5 5 2.5 5 5a2.5 2.5 0 0 1-5 0"/>
            </svg>
            <span>Reward: ${q.rewardDesc}</span>
          </div>
        </div>
      `;
    });

    this.ui.tutorialList.innerHTML = html;
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
      arcHeight: 32
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
        size: Math.random() * 4 + 2.5,
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
      life: 0.85,
      maxLife: 0.85
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
        size: 9,
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

  spawnFloatingText(x, y, text, color, fontSize = 18) {
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
    this.worldTime += dt;

    this.pollGamepad(dt);

    if (this.state === 'playing') {
      this.update(dt);
    }

    this.render();

    this.autoSaveTimer += dt;
    if (this.autoSaveTimer >= 8.0) {
      this.autoSaveTimer = 0;
      this.saveGame();
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    const bounds = { minX: 24, minY: 45, maxX: this.width - 24, maxY: this.height - 24 };

    // 1. Update Player
    this.player.update(dt, this.input, bounds, this);

    // 2. Camera Smooth Follow
    this.camera.targetX = this.player.x - this.viewportWidth / 2;
    this.camera.targetY = this.player.y - this.viewportHeight / 2;
    const camLerp = Math.min(1.0, dt * 7.5);
    this.camera.x += (this.camera.targetX - this.camera.x) * camLerp;
    this.camera.y += (this.camera.targetY - this.camera.y) * camLerp;

    // 3. Update Plots, Shelves, Checkout, Trash Bin, and Unlock Zones
    this.plots.forEach(plot => plot.update(dt, this));
    this.shelves.forEach(shelf => shelf.update(dt, this));
    if (this.checkout) this.checkout.update(dt, this);
    if (this.trashBin) this.trashBin.update(dt, this);
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

    // 5. In-World Travel Bus Trigger Check
    const busDist = Math.hypot(this.player.x - this.busX, this.player.y - this.busY);
    if (busDist < this.busRadius) {
      if (this.ui.martsModal && this.ui.martsModal.classList.contains('hidden')) {
        this.openMartsModal();
      }
    }

    // 6. Customer Spawner
    this.customerSpawnTimer += dt;
    if (this.customerSpawnTimer >= this.customerSpawnInterval && this.customers.length < this.maxCustomers) {
      this.customerSpawnTimer = 0;
      this.spawnCustomer();
    }

    // 7. Update Customers
    for (let i = this.customers.length - 1; i >= 0; i--) {
      const c = this.customers[i];
      c.update(dt, this);
      if (c.state === 'DONE') {
        const qIdx = this.customerQueue.indexOf(c);
        if (qIdx !== -1) this.customerQueue.splice(qIdx, 1);
        this.customers.splice(i, 1);
      }
    }

    // 8. Update Flying Items Animation
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

    // 9. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt;
      }
    }

    // 10. Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      } else {
        ft.y -= 32 * dt;
      }
    }

    // 11. Update DOM HUD
    if (this.ui.hudMoney) this.ui.hudMoney.innerText = `$${this.money}`;
    if (this.ui.hudStack) this.ui.hudStack.innerText = `${this.player.carryStack.length}/${this.player.maxStack}`;
    const level = 1 + this.plots.filter(p => p.unlocked).length + (this.staffHired ? 1 : 0) + (this.cashierHired ? 1 : 0);
    this.storeLevel = level;
    if (this.ui.hudLevel) this.ui.hudLevel.innerText = `MART TIER ${this.storeLevel}`;
    this.updateTutorialUI();
  }

  spawnCustomer() {
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
    this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // 1. Draw Themed Supermarket & Patio Floor
    this.drawStoreFloor();

    // 2. Draw Unlock Zones
    this.unlockZones.forEach(zone => zone.draw(this.ctx));

    // 3. Draw Farm/Production Plots & Display Shelves
    this.plots.forEach(plot => plot.draw(this.ctx));
    this.shelves.forEach(shelf => shelf.draw(this.ctx));

    // 4. Draw Trash Can / Disposal Bin
    if (this.trashBin) this.trashBin.draw(this.ctx);

    // 5. Draw Checkout Register
    if (this.checkout) this.checkout.draw(this.ctx);

    // 6. Draw Hired Cashier behind counter (if hired)
    if (this.cashierHired && this.checkout) {
      this.drawCashier(this.ctx, this.checkout.x - 104, this.checkout.y);
    }

    // 7. Draw Staff Helper (if hired)
    if (this.staffHelper) {
      this.staffHelper.draw(this.ctx);
    }

    // 8. Draw Customers
    this.customers.forEach(c => c.draw(this.ctx));

    // 9. Draw Player
    this.player.draw(this.ctx);

    // 10. Draw Flying Items
    this.flyingItems.forEach(fi => {
      drawItemIcon(this.ctx, fi.x, fi.y, fi.itemType, 1.15);
    });

    // 11. Draw Particles
    this.particles.forEach(p => {
      const alpha = Math.max(0, p.life / p.maxLife);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      if (p.isHeart) {
        this.ctx.fillStyle = p.color;
        const hx = p.x;
        const hy = p.y;
        this.ctx.beginPath();
        this.ctx.arc(hx - 4, hy - 3, 4.5, 0, Math.PI * 2);
        this.ctx.arc(hx + 4, hy - 3, 4.5, 0, Math.PI * 2);
        this.ctx.moveTo(hx - 8.2, hy - 1);
        this.ctx.lineTo(hx, hy + 8);
        this.ctx.lineTo(hx + 8.2, hy - 1);
        this.ctx.fill();
      } else if (p.isBill) {
        this.ctx.fillStyle = p.color;
        this.ctx.strokeStyle = '#14532d';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.roundRect(p.x - p.size, p.y - p.size / 2, p.size * 2, p.size, 3);
        this.ctx.fill();
        this.ctx.stroke();
      } else {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });

    // 12. Draw Floating Texts
    this.floatingTexts.forEach(ft => {
      const alpha = Math.max(0, ft.life / ft.maxLife);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.font = `700 ${ft.fontSize}px "Fredoka", "Nunito", sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 4;
      this.ctx.strokeText(ft.text, ft.x, ft.y);
      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    });

    this.ctx.restore();
  }

  drawStoreFloor() {
    const ctx = this.ctx;
    const martConfig = MARTS_CONFIG[this.currentMartId] || MARTS_CONFIG.mart_farm;
    const theme = martConfig.theme;

    // --- 1. OUTER SURROUNDING ENVIRONMENT ---
    if (theme === 'farm') {
      ctx.fillStyle = '#4ade80'; // Lush grassy lawn
      ctx.fillRect(-1000, -1000, this.width + 2000, this.height + 2000);
    } else if (theme === 'beach') {
      // Tropical Turquoise Ocean & animated waves
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-1000, -1000, this.width + 2000, this.height + 2000);

      // Surf foam wave stripes
      ctx.fillStyle = '#38bdf8';
      for (let wy = -800; wy < this.height + 800; wy += 90) {
        const waveX = Math.sin(this.worldTime * 2 + wy * 0.02) * 18;
        ctx.fillRect(-1000, wy + waveX, this.width + 2000, 24);
      }
    } else if (theme === 'candy') {
      // Pastel Pink & Lilac Sugar Pasture
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(-1000, -1000, this.width + 2000, this.height + 2000);
      // Candy speckles
      ctx.fillStyle = '#fde047';
      for (let sx = -400; sx < this.width + 400; sx += 80) {
        ctx.fillRect(sx, sx % 300, 8, 4);
      }
    }

    // Store Building Drop Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.beginPath();
    ctx.roundRect(10, 14, this.width, this.height, 28);
    ctx.fill();

    // --- 2. LEFT PRODUCTION PATIO (x: 0..420) ---
    if (theme === 'farm') {
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.roundRect(0, 0, 420, this.height, 24);
      ctx.fill();

      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      for (let y = 48; y < this.height; y += 44) {
        ctx.beginPath();
        ctx.moveTo(8, y); ctx.lineTo(412, y);
        ctx.stroke();
      }
    } else if (theme === 'beach') {
      // Tropical Boardwalk Sand & Bamboo Deck
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.roundRect(0, 0, 420, this.height, 24);
      ctx.fill();

      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2.5;
      for (let y = 48; y < this.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(8, y); ctx.lineTo(412, y);
        ctx.stroke();
      }
    } else if (theme === 'candy') {
      // Waffle Kitchen Floor
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.roundRect(0, 0, 420, this.height, 24);
      ctx.fill();

      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      for (let y = 48; y < this.height; y += 38) {
        ctx.beginPath();
        ctx.moveTo(8, y); ctx.lineTo(412, y);
        ctx.stroke();
      }
    }

    // --- 3. RIGHT SUPERMARKET TILES (x: 420..1440) ---
    const tileSize = 56;
    for (let x = 420; x < this.width; x += tileSize) {
      for (let y = 0; y < this.height; y += tileSize) {
        const isAlt = (Math.floor((x - 420) / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
        if (theme === 'farm') {
          ctx.fillStyle = isAlt ? '#ffffff' : '#f0f9ff';
        } else if (theme === 'beach') {
          ctx.fillStyle = isAlt ? '#ffffff' : '#ccfbf1';
        } else {
          ctx.fillStyle = isAlt ? '#ffffff' : '#fdf2f8';
        }
        const w = Math.min(tileSize, this.width - x);
        const h = Math.min(tileSize, this.height - y);
        ctx.fillRect(x, y, w, h);
      }
    }

    // Divider Strip between Patio & Store Aisles
    ctx.fillStyle = martConfig.accentColor;
    ctx.fillRect(415, 42, 10, this.height - 46);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(415, 42, 10, this.height - 46);

    // --- 4. TOP ROOF AWNING ---
    const stripeW = 48;
    const totalStripes = Math.ceil(this.width / stripeW);
    for (let i = 0; i < totalStripes; i++) {
      ctx.fillStyle = (i % 2 === 0) ? martConfig.accentColor : '#ffffff';
      ctx.beginPath();
      ctx.roundRect(i * stripeW, 0, stripeW, 42, [0, 0, 14, 14]);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Floor Department Banners
    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.beginPath();
    ctx.roundRect(30, 56, 360, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.font = '700 13px "Fredoka", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('1. HARVEST & PRODUCTION', 210, 76);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
    ctx.beginPath();
    ctx.roundRect(520, 56, 700, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`2. ${martConfig.name.toUpperCase()} STANDS`, 870, 76);

    // --- 5. OUTER WALL BORDER ---
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(3, 3, this.width - 6, this.height - 6, 24);
    ctx.stroke();

    // --- 6. WELCOME MAT (ENTRANCE) ---
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(this.entranceX - 80, this.entranceY, 160, 56, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px "Fredoka", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WELCOME - ENTRANCE', this.entranceX, this.entranceY + 33);

    // --- 7. IN-WORLD EXPRESS TRAVEL BUS ---
    this.drawTravelBus(ctx, this.busX, this.busY);
  }

  drawTravelBus(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Bus shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.beginPath();
    ctx.roundRect(-52, 10, 104, 38, 12);
    ctx.fill();

    // Bus Parking Pad
    ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.roundRect(-60, -32, 120, 78, 14);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Yellow Express Shuttle Bus Body
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-46, -26, 92, 52, 12);
    ctx.fill();
    ctx.stroke();

    // White Rooftop Strip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-42, -24, 84, 8, 4);
    ctx.fill();

    // Tinted Blue Windows
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-38, -12, 22, 16, 4);
    ctx.roundRect(-10, -12, 22, 16, 4);
    ctx.roundRect(18, -12, 22, 16, 4);
    ctx.fill();
    ctx.stroke();

    // Chrome Front Grill & Headlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-40, 14, 4, 0, Math.PI * 2);
    ctx.arc(40, 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rubber wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-42, 22, 16, 8, 3);
    ctx.roundRect(26, 22, 16, 8, 3);
    ctx.fill();

    // Overhead Bus Signboard
    drawOverheadSign(ctx, 0, -42, 'TRAVEL SHUTTLE (M)', null, '#0ea5e9');

    ctx.restore();
  }

  drawCashier(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cashier Uniform
    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-10, -6, 20, 16, 7);
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -14, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Green Visor Cap
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(0, -17, 10, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  saveGame() {
    try {
      this.snapshotActiveMart();
      const data = {
        money: this.money,
        speedLevel: this.player.speedLevel,
        stackLevel: this.player.stackLevel,
        currentMartId: this.currentMartId,
        unlockedMarts: this.unlockedMarts,
        martsData: this.martsData,
        tutorialProgress: this.tutorialQuests.map(q => ({
          id: q.id,
          current: q.current || 0,
          isDone: !!q.isDone
        }))
      };
      localStorage.setItem('pixel_mini_mart_save', JSON.stringify(data));
    } catch (_) {}
  }

  loadSave() {
    try {
      const raw = localStorage.getItem('pixel_mini_mart_save');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.money !== undefined) this.money = Math.max(150, data.money);

      if (data.speedLevel) {
        this.player.speedLevel = data.speedLevel;
        this.player.speed = 225 + (data.speedLevel - 1) * 35;
      }
      if (data.stackLevel) {
        this.player.stackLevel = data.stackLevel;
        this.player.maxStack = 6 + (data.stackLevel - 1) * 4;
      }

      if (Array.isArray(data.unlockedMarts)) {
        this.unlockedMarts = data.unlockedMarts;
      }

      if (data.martsData) {
        this.martsData = data.martsData;
      } else if (data.unlockedPlots) {
        this.martsData.mart_farm = {
          unlockedPlots: data.unlockedPlots,
          unlockedShelves: data.unlockedShelves || [],
          staffHired: !!data.staffHired,
          cashierHired: !!data.cashierHired,
          unlockZones: []
        };
      }

      const targetMart = (data.currentMartId && MARTS_CONFIG[data.currentMartId]) ? data.currentMartId : 'mart_farm';
      this.restoreMartState(targetMart);

      if (Array.isArray(data.tutorialProgress)) {
        data.tutorialProgress.forEach(saved => {
          const q = this.tutorialQuests.find(t => t.id === saved.id);
          if (q) {
            q.isDone = !!saved.isDone;
            q.current = saved.current !== undefined ? saved.current : (q.isDone ? q.target : 0);
          }
        });
        this.advanceActiveTutorialIdx();
      }
    } catch (_) {}
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.miniMartInstance = new MiniMartGame();
});
