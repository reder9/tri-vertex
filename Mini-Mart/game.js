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
    this.pickupStation = null;
    this.trashBin = new TrashBin(490, 800);
    this.unlockZones = [];
    this.staffHelpers = [];
    this.deliveryCourier = null;
    this.cashierHired = false;

    // Active mart upgrade levels & away stats
    this.workerLevel = 1;
    this.cashierLevel = 1;
    this.courierHired = false;
    this.courierLevel = 1;
    this.prodLevel = 1;
    this.marketingLevel = 1;
    this.awayProfit = 0;
    this.awaySalesCount = 0;
    this.awayDeliveriesCount = 0;
    this.awayMissedOrders = 0;
    this.toastTimer = 0;
    this.lastToastTime = 0;
    this.martListRefreshTimer = 0;
    this.busTriggerLock = false;

    // Store Rating, Gems, Dynamic Events, Decor/Pets & Gourmet Combos
    this.gems = 0;
    this.starRating = 4.0;
    this.hypeTimer = 0;
    this.rushTimer = 0;
    this.eventCooldown = 26;
    this.spills = [];
    this.raccoon = null;
    this.comboStation = null;
    this.shopDog = null;
    this.shopDogOwned = false;
    this.speakerInstalled = false;
    this.cashVacuumInstalled = false;
    this.playerOutfit = 'classic';
    this.unlockedOutfits = ['classic'];
    this.vanCooldown = 0;
    this.upgradeTab = 'upgrades';
    this.contracts = this.createDefaultContracts();

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
      hudRating: document.getElementById('hud-rating'),
      hudGems: document.getElementById('hud-gems'),
      eventBanner: document.getElementById('event-banner'),
      eventBannerDot: document.getElementById('event-banner-dot'),
      eventBannerTitle: document.getElementById('event-banner-title'),
      eventBannerSub: document.getElementById('event-banner-sub'),
      hudStack: document.getElementById('hud-stack'),
      hudLevel: document.getElementById('hud-level'),
      hudMartTitle: document.getElementById('hud-mart-title'),
      turboBtn: document.getElementById('btn-turbo'),
      pauseModal: document.getElementById('pause-modal'),
      upgradeModal: document.getElementById('upgrade-modal'),
      upgradesList: document.getElementById('upgrades-list'),
      upgradeMartSubtitle: document.getElementById('upgrade-mart-subtitle'),
      remoteToastContainer: document.getElementById('remote-toast-container'),
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

  get staffHired() {
    return this.staffHelpers.length > 0;
  }

  createDefaultMartState(martId) {
    const config = MARTS_CONFIG[martId] || MARTS_CONFIG.mart_farm;
    const plots = config.createPlots();
    const shelves = config.createShelves();
    const zones = config.createUnlockZones();

    const plotStocks = {};
    const plotGrowTimers = {};
    plots.forEach(p => {
      plotStocks[p.id] = p.storage;
      plotGrowTimers[p.id] = 0;
    });

    const shelfStocks = {};
    shelves.forEach(s => {
      shelfStocks[s.id] = s.items;
    });

    return {
      unlockedPlots: plots.filter(p => p.unlocked).map(p => p.id),
      unlockedShelves: shelves.filter(s => s.unlocked).map(s => s.id),
      plotStocks,
      plotGrowTimers,
      shelfStocks,
      cashStash: 0,
      stockersCount: 0,
      workerLevel: 1,
      cashierHired: false,
      cashierLevel: 1,
      courierHired: false,
      courierLevel: 1,
      prodLevel: 1,
      marketingLevel: 1,
      pickupOrders: [],
      pickupSpawnTimer: 3.5,
      bgCustomerTimer: 0,
      bgStockerAcc: 0,
      bgCourierAcc: 0,
      remoteWaitingCustomers: 0,
      awayProfit: 0,
      unseenAwayProfit: 0,
      awaySalesCount: 0,
      awayDeliveriesCount: 0,
      awayMissedOrders: 0,
      unlockZones: zones.map(z => ({ id: z.id, paid: z.paid, cost: z.cost, targetId: z.targetId }))
    };
  }

  initStore(martId) {
    const config = MARTS_CONFIG[martId] || MARTS_CONFIG.mart_farm;
    this.currentMartId = config.id;
    this.entranceX = config.entranceX;
    this.entranceY = config.entranceY;

    this.plots = config.createPlots();
    this.shelves = config.createShelves();
    this.checkout = new CheckoutCounter(780, 670);
    this.pickupStation = new PickupStation(1210, 515);
    this.comboStation = new ComboStation(410, 560, config.id);
    this.trashBin = new TrashBin(490, 800);
    this.spills = [];
    this.raccoon = null;
    this.unlockZones = config.createUnlockZones();
    this.staffHelpers = [];
    this.deliveryCourier = null;
    this.cashierHired = false;
    this.workerLevel = 1;
    this.cashierLevel = 1;
    this.courierHired = false;
    this.courierLevel = 1;
    this.prodLevel = 1;
    this.marketingLevel = 1;
    this.awayProfit = 0;
    this.awaySalesCount = 0;
    this.awayDeliveriesCount = 0;
    this.awayMissedOrders = 0;
  }

  hireStocker(spawnX = 290, spawnY = 410) {
    if (this.staffHelpers.length >= 4) return false;
    const idx = this.staffHelpers.length;
    const offsetX = (idx % 2 === 0 ? 0 : 28);
    const offsetY = (idx < 2 ? 0 : 28);
    this.staffHelpers.push(new StaffHelper(spawnX + offsetX, spawnY + offsetY, idx));

    // Remove floor stocker pad if still present
    this.unlockZones = this.unlockZones.filter(z => z.targetId !== 'hire_stocker');
    return true;
  }

  hireCashier() {
    if (this.cashierHired) return false;
    this.cashierHired = true;
    this.unlockZones = this.unlockZones.filter(z => z.targetId !== 'hire_cashier');
    return true;
  }

  hireCourier() {
    if (this.courierHired) return false;
    this.courierHired = true;
    this.deliveryCourier = new DeliveryCourier(1065, 535);
    return true;
  }

  snapshotActiveMart() {
    const plotStocks = {};
    const plotGrowTimers = {};
    this.plots.forEach(p => {
      plotStocks[p.id] = p.storage;
      plotGrowTimers[p.id] = p.growTimer;
    });

    const shelfStocks = {};
    this.shelves.forEach(s => {
      shelfStocks[s.id] = s.items;
    });

    const prev = this.martsData[this.currentMartId] || {};
    this.martsData[this.currentMartId] = {
      unlockedPlots: this.plots.filter(p => p.unlocked).map(p => p.id),
      unlockedShelves: this.shelves.filter(s => s.unlocked).map(s => s.id),
      plotStocks,
      plotGrowTimers,
      shelfStocks,
      cashStash: this.checkout ? this.checkout.cashStash : 0,
      stockersCount: this.staffHelpers.length,
      workerLevel: this.workerLevel,
      cashierHired: this.cashierHired,
      cashierLevel: this.cashierLevel,
      courierHired: this.courierHired,
      courierLevel: this.courierLevel,
      prodLevel: this.prodLevel,
      marketingLevel: this.marketingLevel,
      pickupOrders: this.pickupStation ? this.pickupStation.orders.map(o => ({ ...o, itemsRemaining: [...o.itemsRemaining] })) : [],
      pickupSpawnTimer: this.pickupStation ? this.pickupStation.spawnTimer : 3.5,
      bgCustomerTimer: prev.bgCustomerTimer || 0,
      bgStockerAcc: prev.bgStockerAcc || 0,
      bgCourierAcc: prev.bgCourierAcc || 0,
      remoteWaitingCustomers: this.customerQueue.length,
      awayProfit: this.awayProfit || 0,
      unseenAwayProfit: 0,
      awaySalesCount: this.awaySalesCount || 0,
      awayDeliveriesCount: this.awayDeliveriesCount || 0,
      awayMissedOrders: this.awayMissedOrders || 0,
      unlockZones: this.unlockZones.map(z => ({ id: z.id, paid: z.paid, cost: z.cost, targetId: z.targetId }))
    };
  }

  restoreMartState(martId) {
    this.initStore(martId);
    const saved = this.martsData[martId];
    if (!saved) return;

    // Normalize legacy staffHired flag to stockersCount
    const stockersCount = saved.stockersCount !== undefined
      ? saved.stockersCount
      : (saved.staffHired ? 1 : 0);

    this.workerLevel = saved.workerLevel || 1;
    this.cashierLevel = saved.cashierLevel || 1;
    this.courierLevel = saved.courierLevel || 1;
    this.prodLevel = saved.prodLevel || 1;
    this.marketingLevel = saved.marketingLevel || 1;
    this.awayProfit = saved.awayProfit || 0;
    this.awaySalesCount = saved.awaySalesCount || 0;
    this.awayDeliveriesCount = saved.awayDeliveriesCount || 0;
    this.awayMissedOrders = saved.awayMissedOrders || 0;

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

    // Apply upgraded storage/capacity & restore live stock counts
    this.plots.forEach(p => {
      p.maxStorage = p.baseMaxStorage + (this.prodLevel - 1) * 2;
      if (saved.plotStocks && saved.plotStocks[p.id] !== undefined) {
        p.storage = Math.min(p.maxStorage, saved.plotStocks[p.id]);
      }
      if (saved.plotGrowTimers && saved.plotGrowTimers[p.id] !== undefined) {
        p.growTimer = saved.plotGrowTimers[p.id];
      }
    });

    this.shelves.forEach(s => {
      s.maxCapacity = s.baseMaxCapacity + (this.prodLevel - 1) * 3;
      if (saved.shelfStocks && saved.shelfStocks[s.id] !== undefined) {
        s.items = Math.min(s.maxCapacity, saved.shelfStocks[s.id]);
      }
    });

    if (this.checkout && saved.cashStash) {
      this.checkout.cashStash = saved.cashStash;
    }

    for (let i = 0; i < Math.min(4, stockersCount); i++) {
      this.hireStocker(290, 410);
    }

    if (saved.cashierHired) {
      this.hireCashier();
    }

    if (saved.courierHired) {
      this.hireCourier();
    }

    // Gourmet Combo Station near main checkout patio
    this.comboStation = new ComboStation(410, 560, martId);
    this.spills = [];
    this.raccoon = null;
    if (this.shopDogOwned && !this.shopDog) {
      this.shopDog = new ShopDog(this.player.x - 36, this.player.y + 18);
    }
    this.player.outfitStyle = this.playerOutfit || 'classic';

    if (this.pickupStation && Array.isArray(saved.pickupOrders)) {
      this.pickupStation.orders = saved.pickupOrders.map(o => ({ ...o, itemsRemaining: [...o.itemsRemaining] }));
      this.pickupStation.spawnTimer = saved.pickupSpawnTimer !== undefined ? saved.pickupSpawnTimer : 3.5;
    }

    if (saved.unlockZones) {
      this.unlockZones = this.unlockZones.filter(z => {
        if (z.targetId === 'hire_stocker' && this.staffHelpers.length > 0) return false;
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

    // Spawn any customers who were waiting at an unattended register while away
    const waitingCount = Math.min(4, saved.remoteWaitingCustomers || 0);
    const unlockedTypes = this.plots.filter(p => p.unlocked).map(p => p.type);
    if (waitingCount > 0 && !this.cashierHired && unlockedTypes.length > 0) {
      for (let i = 0; i < waitingCount; i++) {
        const type = unlockedTypes[i % unlockedTypes.length];
        const c = new MartCustomer(this.checkout.x + 52, this.checkout.y - 10 + i * 36, []);
        c.basket = [type];
        c.state = 'IN_QUEUE';
        this.customers.push(c);
        this.customerQueue.push(c);
      }
    }

    // Report unseen away earnings upon returning
    if (saved.unseenAwayProfit && saved.unseenAwayProfit > 0) {
      this.spawnFloatingText(720, 620, `EARNED +$${saved.unseenAwayProfit} WHILE AWAY!`, '#16a34a', 20);
      saved.unseenAwayProfit = 0;
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
      if (!this.martsData[targetMartId]) {
        this.martsData[targetMartId] = this.createDefaultMartState(targetMartId);
      }

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
      this.viewScale = Math.max(0.58, Math.min(1.0, Math.min(this.viewportWidth / 1180, this.viewportHeight / 760)));
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
        this.toggleUpgrades();
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
        if (e.target.closest('button, a, .modal-card, .modal-overlay, .hud-card, #floating-goal-box')) return;
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

    const btnCloseUpgrades = document.getElementById('btn-close-upgrades');
    if (btnCloseUpgrades) {
      btnCloseUpgrades.addEventListener('click', () => {
        this.ui.upgradeModal.classList.add('hidden');
      });
    }

    // Allow closing modals cleanly by clicking/tapping the backdrop overlay outside the card
    if (this.ui.martsModal) {
      this.ui.martsModal.addEventListener('click', (e) => {
        if (e.target === this.ui.martsModal) this.closeMartsModal();
      });
    }
    if (this.ui.upgradeModal) {
      this.ui.upgradeModal.addEventListener('click', (e) => {
        if (e.target === this.ui.upgradeModal) this.closeUpgrades();
      });
    }
    if (this.ui.tutorialModal) {
      this.ui.tutorialModal.addEventListener('click', (e) => {
        if (e.target === this.ui.tutorialModal) this.closeTutorialModal();
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

    // Check if any overlay modal is open (Upgrades, Franchise Marts, Tutorial, Pause)
    const openModal = [this.ui.martsModal, this.ui.upgradeModal, this.ui.tutorialModal, this.ui.pauseModal]
      .find(m => m && !m.classList.contains('hidden'));

    if (openModal) {
      this.input.gamepadMoveX = 0;
      this.input.gamepadMoveY = 0;
      this.input.gamepadMoveMagnitude = 0;

      const btns = Array.from(openModal.querySelectorAll('button:not([disabled]):not(.icon-only)'))
        .filter(b => b.offsetParent !== null);
      this.modalNavCooldown = Math.max(0, (this.modalNavCooldown || 0) - dt);
      if (this.modalFocusIdx === undefined) this.modalFocusIdx = 0;

      if (btns.length > 0 && this.modalNavCooldown <= 0) {
        let dir = 0;
        if (ly > 0.45 || lx > 0.45 || isJustPressed(13) || isJustPressed(15)) dir = 1;
        else if (ly < -0.45 || lx < -0.45 || isJustPressed(12) || isJustPressed(14)) dir = -1;
        if (dir !== 0) {
          this.modalFocusIdx = (this.modalFocusIdx + dir + btns.length) % btns.length;
          this.modalNavCooldown = 0.18;
          this.rumble(20, 0.15, 0.08);
        }
      }
      btns.forEach((b, i) => {
        if (i === (this.modalFocusIdx % Math.max(1, btns.length))) {
          b.classList.add('gp-focus');
          if (b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } else {
          b.classList.remove('gp-focus');
        }
      });

      if (isJustPressed(0) && btns.length > 0) {
        const target = btns[this.modalFocusIdx % btns.length];
        if (target) {
          target.click();
          this.rumble(35, 0.25, 0.2);
        }
      }

      // LB / RB switch Upgrade Modal tabs with controller
      if (this.ui.upgradeModal && !this.ui.upgradeModal.classList.contains('hidden')) {
        const tabs = ['upgrades', 'decor', 'contracts'];
        if (isJustPressed(4) || isJustPressed(5)) {
          const curIdx = Math.max(0, tabs.indexOf(this.upgradeTab || 'upgrades'));
          const step = isJustPressed(5) ? 1 : -1;
          this.upgradeTab = tabs[(curIdx + step + tabs.length) % tabs.length];
          this.modalFocusIdx = 0;
          this.updateUpgradeModal();
        }
      }
    } else {
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
      if (window.miniMartAudio) window.miniMartAudio.playBlip();
      this.ui.upgradeModal.classList.remove('hidden');
      this.updateUpgradeModal();
    }
  }

  closeUpgrades() {
    if (this.ui.upgradeModal) {
      if (window.miniMartAudio) window.miniMartAudio.playBlip();
      this.ui.upgradeModal.classList.add('hidden');
    }
  }

  toggleUpgrades() {
    if (!this.ui.upgradeModal) return;
    if (this.ui.upgradeModal.classList.contains('hidden')) {
      this.openUpgrades();
    } else {
      this.closeUpgrades();
    }
  }

  getUpgradesCatalog() {
    const martCfg = MARTS_CONFIG[this.currentMartId] || MARTS_CONFIG.mart_farm;
    const martMult = this.currentMartId === 'mart_farm' ? 1 : (this.currentMartId === 'mart_beach' ? 1.5 : 2.1);
    const stockersCount = this.staffHelpers.length;
    const stockerCosts = [130, 220, 340, 480];
    const nextStockerCost = stockersCount < 4 ? Math.round(stockerCosts[stockersCount] * martMult) : 0;

    return {
      global: [
        {
          id: 'player_speed',
          name: 'Player Running Speed',
          sub: `Lv. ${this.player.speedLevel}/6 (${this.player.speed} px/s)`,
          desc: 'Run faster across aisles & patios in all stores.',
          cost: this.player.speedLevel * 50,
          isMax: this.player.speedLevel >= 6,
          btnLabel: 'UPGRADE',
          color: '#0ea5e9',
          icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`
        },
        {
          id: 'player_stack',
          name: 'Carry Stack Capacity',
          sub: `Lv. ${this.player.stackLevel}/6 (${this.player.maxStack} Items)`,
          desc: 'Carry taller stacks of goods & pickup items.',
          cost: this.player.stackLevel * 60,
          isMax: this.player.stackLevel >= 6,
          btnLabel: 'UPGRADE',
          color: '#f59e0b',
          icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/></svg>`
        }
      ],
      mart: [
        {
          id: 'hire_stocker',
          name: 'Hire Stocker Worker',
          sub: `${stockersCount}/4 Hired at ${martCfg.shortTitle}`,
          desc: 'Automatically harvests plots & refills shelves, even while you visit other marts!',
          cost: nextStockerCost,
          isMax: stockersCount >= 4,
          btnLabel: stockersCount === 0 ? 'HIRE' : 'ADD WORKER',
          color: '#f97316',
          icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`
        },
        {
          id: 'worker_speed',
          name: 'Worker Speed & Carry',
          sub: `Lv. ${this.workerLevel}/5 (+${(this.workerLevel - 1) * 32} Spd, ${6 + (this.workerLevel - 1) * 2} Cap)`,
          desc: 'All hired Stockers move faster and haul bigger stacks.',
          cost: Math.round(this.workerLevel * 105 * martMult),
          isMax: this.workerLevel >= 5,
          btnLabel: 'BOOST',
          color: '#8b5cf6',
          icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
        },
        {
          id: 'hire_cashier',
          name: this.cashierHired ? 'Cashier Scan Speed' : 'Hire Store Cashier',
          sub: this.cashierHired ? `Lv. ${this.cashierLevel}/5 (Auto-Sales Away: ON)` : 'Not Hired Yet',
          desc: this.cashierHired
            ? 'Faster register checkouts & stronger remote income!'
            : 'Automatically scans shoppers and earns live passive income while you are away!',
          cost: this.cashierHired ? Math.round(this.cashierLevel * 95 * martMult) : Math.round(210 * martMult),
          isMax: this.cashierHired && this.cashierLevel >= 5,
          btnLabel: this.cashierHired ? 'UPGRADE' : 'HIRE',
          color: '#16a34a',
          icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="6" y1="12" x2="10" y2="12"/><line x1="14" y1="12" x2="18" y2="12"/><line x1="6" y1="16" x2="18" y2="16"/></svg>`
        },
        {
          id: 'hire_courier',
          name: this.courierHired ? 'Pickup Delivery Courier' : 'Hire Delivery Courier',
          sub: this.courierHired ? `Lv. ${this.courierLevel}/4 (+${(this.courierLevel - 1) * 15}% Tips)` : 'Not Hired Yet',
          desc: this.courierHired
            ? 'Faster pickup packing, extra order slots & higher delivery tips (active & away)!'
            : 'Packs Pickup Orders from stocked shelves and dispatches the Delivery Van even while away!',
          cost: this.courierHired ? Math.round(this.courierLevel * 145 * martMult) : Math.round(180 * martMult),
          isMax: this.courierHired && this.courierLevel >= 4,
          btnLabel: this.courierHired ? 'UPGRADE' : 'HIRE',
          color: '#0d9488',
          icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
        },
        {
          id: 'prod_boost',
          name: 'Production & Bin Size',
          sub: `Lv. ${this.prodLevel}/5 (Plot Cap ${8 + (this.prodLevel - 1) * 2}, Shelf ${12 + (this.prodLevel - 1) * 3})`,
          desc: 'Crops, ovens & machines produce faster and store more stock.',
          cost: Math.round(this.prodLevel * 100 * martMult),
          isMax: this.prodLevel >= 5,
          btnLabel: 'UPGRADE',
          color: '#ec4899',
          icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>`
        },
        {
          id: 'marketing_ads',
          name: 'Delivery Ads & Traffic',
          sub: `Lv. ${this.marketingLevel}/5 (+${(this.marketingLevel - 1) * 8}% Order Bonus)`,
          desc: 'Brings more customers, faster Pickup Orders & higher delivery payouts.',
          cost: Math.round(this.marketingLevel * 120 * martMult),
          isMax: this.marketingLevel >= 5,
          btnLabel: 'PROMOTE',
          color: '#0284c7',
          icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`
        }
      ]
    };
  }

  buyUpgrade(upgradeId) {
    const cat = this.getUpgradesCatalog();
    const all = [...cat.global, ...cat.mart];
    const item = all.find(u => u.id === upgradeId);
    if (!item || item.isMax || this.money < item.cost) return;

    this.money -= item.cost;

    switch (upgradeId) {
      case 'player_speed':
        this.player.speedLevel++;
        this.player.speed += 35;
        break;
      case 'player_stack':
        this.player.stackLevel++;
        this.player.maxStack += 4;
        break;
      case 'hire_stocker':
        this.hireStocker(290, 410);
        break;
      case 'worker_speed':
        this.workerLevel++;
        break;
      case 'hire_cashier':
        if (!this.cashierHired) {
          this.hireCashier();
        } else {
          this.cashierLevel++;
        }
        break;
      case 'hire_courier':
        if (!this.courierHired) {
          this.hireCourier();
        } else {
          this.courierLevel++;
        }
        break;
      case 'prod_boost':
        this.prodLevel++;
        break;
      case 'marketing_ads':
        this.marketingLevel++;
        break;
      default:
        return;
    }

    if (window.miniMartAudio) window.miniMartAudio.playUnlock();
    if (this.rumble) this.rumble(140, 0.3, 0.4);
    this.progressTutorial('store_upgrade', 1);
    this.snapshotActiveMart();
    this.saveGame();
    this.updateUpgradeModal();
  }

  createDefaultContracts() {
    return [
      { id: 'c_customers', trackKey: 'customers', title: 'Friendly Service', desc: 'Serve happy customers at checkout.', progress: 0, target: 10, rewardGems: 4, claimed: false },
      { id: 'c_combos',    trackKey: 'combos',    title: 'Gourmet Crafter',  desc: 'Craft Gourmet Combos at the Combo Bar.', progress: 0, target: 3, rewardGems: 5, claimed: false },
      { id: 'c_clean',     trackKey: 'clean',     title: 'Spotless Floor',   desc: 'Clean floor spills or shoo cheeky raccoons.', progress: 0, target: 3, rewardGems: 5, claimed: false },
      { id: 'c_vip',       trackKey: 'vip',       title: 'VIP Hospitality',  desc: 'Serve a VIP Critic & trigger Store Hype.', progress: 0, target: 1, rewardGems: 6, claimed: false },
      { id: 'c_tips',      trackKey: 'tips',      title: 'Tip Magnet',       desc: 'Earn fast-service tips from shoppers.', progress: 0, target: 40, rewardGems: 4, claimed: false }
    ];
  }

  adjustStarRating(delta) {
    this.starRating = Math.max(1.0, Math.min(5.0, +(this.starRating + delta).toFixed(2)));
  }

  advanceContract(trackKey, amount = 1) {
    if (!Array.isArray(this.contracts)) return;
    let newlyReady = false;
    this.contracts.forEach(c => {
      if (c.claimed || c.trackKey !== trackKey) return;
      const wasDone = c.progress >= c.target;
      c.progress = Math.min(c.target, (c.progress || 0) + amount);
      if (!wasDone && c.progress >= c.target) {
        newlyReady = true;
      }
    });
    if (newlyReady) {
      this.showRemoteToast('Contract Ready!', 'Open Upgrades > Contracts to claim Gems!', '#0ea5e9');
    }
  }

  claimContract(contractId) {
    const c = (this.contracts || []).find(item => item.id === contractId);
    if (!c || c.claimed || c.progress < c.target) return;
    c.claimed = true;
    this.gems += c.rewardGems;
    if (window.miniMartAudio) window.miniMartAudio.playQuestComplete();
    if (this.rumble) this.rumble(140, 0.3, 0.35);
    this.spawnFloatingText(this.player.x, this.player.y - 45, `+${c.rewardGems} GEMS!`, '#0284c7', 20);
    // Refresh next repeatable tier for endless contract play
    const nextTarget = Math.max(c.target + 2, Math.round(c.target * 1.6));
    c.target = nextTarget;
    c.progress = 0;
    c.claimed = false;
    c.rewardGems += 1;
    this.saveGame();
    this.updateUpgradeModal();
  }

  getDecorCatalog() {
    return [
      {
        id: 'shop_dog',
        name: 'Sunny Pup Helper',
        sub: this.shopDogOwned ? 'ACTIVE COMPANION' : 'Follows & Protects Store',
        desc: 'Trots alongside you, sweeps floor spills clean & chases away raccoons automatically!',
        gems: 6,
        owned: this.shopDogOwned,
        active: this.shopDogOwned,
        color: '#f59e0b',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/></svg>'
      },
      {
        id: 'music_speaker',
        name: 'Cozy Store Speaker',
        sub: this.speakerInstalled ? 'INSTALLED (-35% Patience Drain)' : 'Store Atmosphere Upgrade',
        desc: 'Lo-fi aisle tunes keep queued & waiting shoppers calm 35% longer for higher tips.',
        gems: 5,
        owned: this.speakerInstalled,
        active: this.speakerInstalled,
        color: '#8b5cf6',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="4"/><line x1="12" y1="6" x2="12.01" y2="6"/></svg>'
      },
      {
        id: 'cash_vacuum',
        name: 'Auto Cash Magnet',
        sub: this.cashVacuumInstalled ? 'INSTALLED (Instant Deposit)' : 'Register Automation',
        desc: 'Automatically vacuums register sales cash directly into your wallet anywhere in the mart.',
        gems: 7,
        owned: this.cashVacuumInstalled,
        active: this.cashVacuumInstalled,
        color: '#10b981',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15"/></svg>'
      },
      {
        id: 'outfit_classic',
        name: 'Classic Mart Uniform',
        sub: 'Sky Shirt & Sunny Green Apron',
        desc: 'Traditional Mini Mart franchise gear.',
        gems: 0,
        owned: true,
        active: this.playerOutfit === 'classic',
        color: '#16a34a',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>'
      },
      {
        id: 'outfit_gold',
        name: 'Golden Tycoon Apron',
        sub: 'Gold Chef Vest & Cap',
        desc: 'Shine across every store with championship gold attire.',
        gems: 4,
        owned: this.unlockedOutfits.includes('gold'),
        active: this.playerOutfit === 'gold',
        color: '#d97706',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>'
      },
      {
        id: 'outfit_arcade',
        name: 'Neon Arcade Jacket',
        sub: 'Cyan & Magenta Retro Look',
        desc: 'Stylish dark arcade uniform built for speedruns.',
        gems: 4,
        owned: this.unlockedOutfits.includes('arcade'),
        active: this.playerOutfit === 'arcade',
        color: '#ec4899',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>'
      },
      {
        id: 'outfit_royal',
        name: 'Royal Violet Manager',
        sub: 'Indigo Coat & Violet Crown Cap',
        desc: 'Signature franchise director uniform.',
        gems: 5,
        owned: this.unlockedOutfits.includes('royal'),
        active: this.playerOutfit === 'royal',
        color: '#7c3aed',
        icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>'
      }
    ];
  }

  buyDecorItem(itemId) {
    const item = this.getDecorCatalog().find(d => d.id === itemId);
    if (!item) return;

    if (item.id.startsWith('outfit_')) {
      const styleKey = item.id.replace('outfit_', '');
      if (!item.owned) {
        if (this.gems < item.gems) return;
        this.gems -= item.gems;
        this.unlockedOutfits.push(styleKey);
      }
      this.playerOutfit = styleKey;
      this.player.outfitStyle = styleKey;
    } else {
      if (item.owned || this.gems < item.gems) return;
      this.gems -= item.gems;
      if (item.id === 'shop_dog') {
        this.shopDogOwned = true;
        this.shopDog = new ShopDog(this.player.x - 36, this.player.y + 18);
      } else if (item.id === 'music_speaker') {
        this.speakerInstalled = true;
      } else if (item.id === 'cash_vacuum') {
        this.cashVacuumInstalled = true;
      }
    }

    if (window.miniMartAudio) window.miniMartAudio.playUnlock();
    if (this.rumble) this.rumble(120, 0.25, 0.35);
    this.saveGame();
    this.updateUpgradeModal();
  }

  updateUpgradeModal() {
    if (!this.ui.upgradesList) return;
    const martCfg = MARTS_CONFIG[this.currentMartId] || MARTS_CONFIG.mart_farm;
    if (this.ui.upgradeMartSubtitle) {
      this.ui.upgradeMartSubtitle.innerText = `Managing: ${martCfg.name} | Cash: $${this.money} | Gems: ${this.gems}`;
    }

    const activeTab = this.upgradeTab || 'upgrades';
    const readyContracts = (this.contracts || []).filter(c => c.progress >= c.target).length;
    const tabsHtml = `
      <div class="up-tabs">
        <button class="up-tab-btn ${activeTab === 'upgrades' ? 'active' : ''}" data-up-tab="upgrades">Staff &amp; Gear</button>
        <button class="up-tab-btn ${activeTab === 'decor' ? 'active' : ''}" data-up-tab="decor">Decor &amp; Pets (${this.gems} Gems)</button>
        <button class="up-tab-btn ${activeTab === 'contracts' ? 'active' : ''}" data-up-tab="contracts">Contracts${readyContracts > 0 ? ` (${readyContracts}!)` : ''}</button>
      </div>
    `;

    let bodyHtml = '';

    if (activeTab === 'upgrades') {
      const cat = this.getUpgradesCatalog();
      const renderRow = (u) => {
        const canAfford = !u.isMax && this.money >= u.cost;
        const btnClass = u.isMax ? 'upgrade-btn maxed' : (canAfford ? 'upgrade-btn' : 'upgrade-btn cannot-afford');
        const costText = u.isMax ? 'MAXED' : `$${u.cost}`;
        const labelText = u.isMax ? 'LEVEL' : u.btnLabel;
        return `
          <div class="upgrade-item">
            <div class="upgrade-item-left">
              <div class="upgrade-icon" style="background: ${u.color};">${u.icon}</div>
              <div class="upgrade-details">
                <div class="upgrade-name">${u.name}</div>
                <div class="upgrade-sub">${u.sub}</div>
                <div class="upgrade-desc">${u.desc}</div>
              </div>
            </div>
            <button class="${btnClass}" data-upgrade-id="${u.id}" ${u.isMax ? 'disabled' : ''}>
              <span>${labelText}</span>
              <span>${costText}</span>
            </button>
          </div>
        `;
      };
      bodyHtml = `
        <div class="upgrade-section-title">GLOBAL OWNER UPGRADES (ALL MARTS)</div>
        ${cat.global.map(renderRow).join('')}
        <div class="upgrade-section-title">STORE STAFF &amp; LOGISTICS (${martCfg.shortTitle})</div>
        ${cat.mart.map(renderRow).join('')}
      `;
    } else if (activeTab === 'decor') {
      const items = this.getDecorCatalog();
      bodyHtml = `<div class="upgrade-section-title">STORE DECOR, PUP COMPANION &amp; UNIFORMS</div>` + items.map(d => {
        const isOutfit = d.id.startsWith('outfit_');
        let btnClass = 'upgrade-btn up-gem-cost';
        let labelText = 'BUY';
        let costText = `${d.gems} GEMS`;
        let disabled = '';
        if (isOutfit && d.active) {
          btnClass = 'upgrade-btn maxed'; labelText = 'EQUIPPED'; costText = 'ON'; disabled = 'disabled';
        } else if (isOutfit && d.owned) {
          btnClass = 'upgrade-btn'; labelText = 'EQUIP'; costText = 'OWNED';
        } else if (d.owned) {
          btnClass = 'upgrade-btn maxed'; labelText = 'ACTIVE'; costText = 'OWNED'; disabled = 'disabled';
        } else if (this.gems < d.gems) {
          btnClass = 'upgrade-btn cannot-afford';
        }
        return `
          <div class="upgrade-item">
            <div class="upgrade-item-left">
              <div class="upgrade-icon" style="background: ${d.color};">${d.icon}</div>
              <div class="upgrade-details">
                <div class="upgrade-name">${d.name}</div>
                <div class="upgrade-sub">${d.sub}</div>
                <div class="upgrade-desc">${d.desc}</div>
              </div>
            </div>
            <button class="${btnClass}" data-decor-id="${d.id}" ${disabled}>
              <span>${labelText}</span>
              <span>${costText}</span>
            </button>
          </div>
        `;
      }).join('');
    } else {
      bodyHtml = `<div class="upgrade-section-title">FRANCHISE CONTRACTS (EARN GEMS FOR DECOR &amp; PETS)</div>` + (this.contracts || []).map(c => {
        const pct = Math.min(100, Math.round(((c.progress || 0) / c.target) * 100));
        const ready = c.progress >= c.target;
        const btnClass = ready ? 'upgrade-btn up-gem-cost' : 'upgrade-btn cannot-afford';
        return `
          <div class="upgrade-item">
            <div class="upgrade-item-left">
              <div class="upgrade-icon" style="background: #0284c7;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 18 3 22 9 12 22 2 9 6 3"/></svg>
              </div>
              <div class="upgrade-details">
                <div class="upgrade-name">${c.title}</div>
                <div class="upgrade-sub">${c.progress}/${c.target} Complete (Reward: +${c.rewardGems} Gems)</div>
                <div class="upgrade-desc">${c.desc}</div>
                <div class="up-progress-bar"><div class="up-progress-fill" style="width:${pct}%;"></div></div>
              </div>
            </div>
            <button class="${btnClass}" data-claim-id="${c.id}" ${ready ? '' : 'disabled'}>
              <span>${ready ? 'CLAIM' : 'ACTIVE'}</span>
              <span>+${c.rewardGems} GEMS</span>
            </button>
          </div>
        `;
      }).join('');
    }

    this.ui.upgradesList.innerHTML = tabsHtml + bodyHtml;

    this.ui.upgradesList.querySelectorAll('button[data-up-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.upgradeTab = btn.getAttribute('data-up-tab');
        this.modalFocusIdx = 0;
        if (window.miniMartAudio) window.miniMartAudio.playBlip();
        this.updateUpgradeModal();
      });
    });

    this.ui.upgradesList.querySelectorAll('button[data-upgrade-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.buyUpgrade(btn.getAttribute('data-upgrade-id'));
      });
    });

    this.ui.upgradesList.querySelectorAll('button[data-decor-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.buyDecorItem(btn.getAttribute('data-decor-id'));
      });
    });

    this.ui.upgradesList.querySelectorAll('button[data-claim-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.claimContract(btn.getAttribute('data-claim-id'));
      });
    });
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
    this.busTriggerLock = true;
  }

  dispatchSupplyVan() {
    if (this.unlockedMarts.length < 2 || this.vanCooldown > 0) return;
    const bonus = 45 * this.unlockedMarts.length + Math.round(this.marketingLevel * 12);
    this.money += bonus;
    this.vanCooldown = 45;
    if (window.miniMartAudio) window.miniMartAudio.playDeliveryHorn();
    if (this.rumble) this.rumble(150, 0.35, 0.45);
    this.spawnFloatingText(this.player.x, this.player.y - 45, `SUPPLY VAN +$${bonus}!`, '#0284c7', 21);
    this.showRemoteToast('Supply Van Dispatched!', `Earned +$${bonus} inter-mart wholesale profit`, '#0284c7');
    this.renderMartsList();
    this.saveGame();
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
    const vanUnlockedCount = this.unlockedMarts.length;
    if (vanUnlockedCount >= 2) {
      const vanReady = this.vanCooldown <= 0;
      const vanPayout = 45 * vanUnlockedCount + Math.round(this.marketingLevel * 12);
      html += `
        <div class="van-dispatch-card">
          <div class="van-dispatch-info">
            <div class="van-dispatch-title">INTER-MART SUPPLY VAN (${vanUnlockedCount} STORES LINKED)</div>
            <div class="van-dispatch-sub">${vanReady ? `Ready to haul wholesale goods across your stores for +$${vanPayout}!` : `Supply Van en route... returns in ${Math.ceil(this.vanCooldown)}s`}</div>
          </div>
          <button class="mart-action-btn ${vanReady ? 'travel-btn' : 'active-btn'}" ${vanReady ? '' : 'disabled'} onclick="window.miniMartInstance.dispatchSupplyVan()">
            <span>${vanReady ? `DISPATCH +$${vanPayout}` : `${Math.ceil(this.vanCooldown)}S`}</span>
          </button>
        </div>
      `;
    }

    const martKeys = ['mart_farm', 'mart_beach', 'mart_candy'];

    martKeys.forEach((key) => {
      const cfg = MARTS_CONFIG[key];
      const isCurrent = this.currentMartId === key;
      const isUnlocked = this.unlockedMarts.includes(key);

      let cardClass = isCurrent ? 'current' : (isUnlocked ? 'unlocked' : 'locked');
      let badgeClass = isCurrent ? 'current' : (isUnlocked ? 'unlocked' : 'locked');
      let badgeLabel = isCurrent ? 'ACTIVE STORE' : (isUnlocked ? 'RUNNING LIVE' : 'LOCKED');

      // Vector Icon per Mart
      let iconSvg = '';
      if (cfg.theme === 'farm') {
        iconSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
      } else if (cfg.theme === 'beach') {
        iconSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      } else {
        iconSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>`;
      }

      // Live Telemetry Summary for Unlocked Marts
      let liveStatsHtml = '';
      if (isUnlocked) {
        let stockCount = 0;
        let maxStockCount = 0;
        let stockersCount = 0;
        let cashierOn = false;
        let courierOn = false;
        let ordersCount = 0;
        let queueWaiting = 0;
        let awayProfit = 0;

        if (isCurrent) {
          this.shelves.forEach(s => {
            if (s.unlocked) {
              stockCount += s.items;
              maxStockCount += s.maxCapacity;
            }
          });
          stockersCount = this.staffHelpers.length;
          cashierOn = this.cashierHired;
          courierOn = this.courierHired;
          ordersCount = this.pickupStation ? this.pickupStation.orders.length : 0;
          queueWaiting = this.customerQueue.length;
        } else {
          const st = this.martsData[key] || this.createDefaultMartState(key);
          const unlockedShelves = st.unlockedShelves || [];
          const shelfCap = 12 + ((st.prodLevel || 1) - 1) * 3;
          unlockedShelves.forEach(sId => {
            stockCount += (st.shelfStocks && st.shelfStocks[sId]) ? st.shelfStocks[sId] : 0;
            maxStockCount += shelfCap;
          });
          stockersCount = st.stockersCount !== undefined ? st.stockersCount : (st.staffHired ? 1 : 0);
          cashierOn = !!st.cashierHired;
          courierOn = !!st.courierHired;
          ordersCount = Array.isArray(st.pickupOrders) ? st.pickupOrders.length : 0;
          queueWaiting = st.remoteWaitingCustomers || 0;
          awayProfit = st.awayProfit || 0;
        }

        const stockClass = stockCount === 0 ? 'alert' : (stockCount < maxStockCount * 0.3 ? 'warn' : 'good');
        const stockersClass = stockersCount > 0 ? 'good' : 'warn';
        const cashierClass = cashierOn ? 'good' : (queueWaiting > 0 ? 'alert' : 'warn');
        const courierClass = courierOn ? 'good' : (ordersCount > 0 ? 'warn' : '');

        liveStatsHtml = `
          <div class="mart-live-stats">
            <span class="mart-stat-pill ${stockClass}">Shelves: ${stockCount}/${maxStockCount}</span>
            <span class="mart-stat-pill ${stockersClass}">Stockers: ${stockersCount}/4</span>
            <span class="mart-stat-pill ${cashierClass}">${cashierOn ? 'Cashier: ON' : (queueWaiting > 0 ? `${queueWaiting} Waiting!` : 'No Cashier')}</span>
            <span class="mart-stat-pill ${courierClass}">Pickups: ${ordersCount} ${courierOn ? '(Courier)' : ''}</span>
            ${!isCurrent && awayProfit > 0 ? `<span class="mart-stat-pill good">Earned: +$${awayProfit}</span>` : ''}
          </div>
        `;
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
              ${liveStatsHtml}
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

    // 2. Camera Smooth Follow (adapts cleanly for phone/tablet/handheld scaling)
    const scale = this.viewScale || 1;
    this.camera.targetX = this.player.x - (this.viewportWidth / scale) / 2;
    this.camera.targetY = this.player.y - (this.viewportHeight / scale) / 2;
    const camLerp = Math.min(1.0, dt * 7.5);
    this.camera.x += (this.camera.targetX - this.camera.x) * camLerp;
    this.camera.y += (this.camera.targetY - this.camera.y) * camLerp;

    // 3. Update Plots, Shelves, Checkout, Pickup Station, Combo Bar, Trash Bin, and Unlock Zones
    this.plots.forEach(plot => plot.update(dt, this));
    this.shelves.forEach(shelf => shelf.update(dt, this));
    if (this.checkout) this.checkout.update(dt, this);
    if (this.pickupStation) this.pickupStation.update(dt, this);
    if (this.comboStation) this.comboStation.update(dt, this);
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

    // 4. Update Staff Helpers, Delivery Courier, and Shop Dog
    for (let i = 0; i < this.staffHelpers.length; i++) {
      this.staffHelpers[i].update(dt, this);
    }
    if (this.deliveryCourier) {
      this.deliveryCourier.update(dt, this);
    }
    if (this.shopDog) {
      this.shopDog.update(dt, this);
    }

    // 4a. Update Dynamic Store Events, Spills, Raccoon & Van Cooldown
    this.updateDynamicEvents(dt);

    // 4b. Simulate Unlocked Remote Marts in Background
    this.updateBackgroundMarts(dt);

    // 5. In-World Travel Bus Trigger Check (edge-triggered so closing doesn't immediately reopen)
    const busDist = Math.hypot(this.player.x - this.busX, this.player.y - this.busY);
    if (busDist > this.busRadius + 24) {
      this.busTriggerLock = false;
    } else if (busDist < this.busRadius && !this.busTriggerLock) {
      this.busTriggerLock = true;
      if (this.ui.martsModal && this.ui.martsModal.classList.contains('hidden')) {
        this.openMartsModal();
      }
    }

    // 6. Customer Spawner (scaled by Marketing & Ads upgrade + Rush Hour)
    const rushFactor = this.rushTimer > 0 ? 0.5 : 1.0;
    const effectiveSpawnInterval = Math.max(0.85, (this.customerSpawnInterval - (this.marketingLevel - 1) * 0.45) * rushFactor);
    const effectiveMaxCustomers = this.maxCustomers + (this.marketingLevel - 1) * 2 + (this.rushTimer > 0 ? 4 : 0);
    this.customerSpawnTimer += dt;
    if (this.customerSpawnTimer >= effectiveSpawnInterval && this.customers.length < effectiveMaxCustomers) {
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

    // 11. Update DOM HUD & Live Modals
    if (this.ui.hudMoney) this.ui.hudMoney.innerText = `$${this.money}`;
    if (this.ui.hudGems) this.ui.hudGems.innerText = `${this.gems}`;
    if (this.ui.hudRating) {
      this.ui.hudRating.innerText = this.starRating.toFixed(1);
      const card = this.ui.hudRating.closest('.rating-card');
      if (card) card.classList.toggle('golden-mart', this.starRating >= 4.5);
    }
    if (this.ui.eventBanner) {
      if (this.hypeTimer > 0) {
        this.ui.eventBanner.classList.remove('hidden');
        this.ui.eventBannerDot.style.background = '#fbbf24';
        this.ui.eventBannerTitle.innerText = 'VIP HYPE ACTIVE';
        this.ui.eventBannerSub.innerText = `+25% Prices (${Math.ceil(this.hypeTimer)}s)`;
      } else if (this.rushTimer > 0) {
        this.ui.eventBanner.classList.remove('hidden');
        this.ui.eventBannerDot.style.background = '#f97316';
        this.ui.eventBannerTitle.innerText = 'RUSH HOUR WAVE';
        this.ui.eventBannerSub.innerText = `+50% Tips (${Math.ceil(this.rushTimer)}s)`;
      } else if (this.raccoon && !this.raccoon.scared) {
        this.ui.eventBanner.classList.remove('hidden');
        this.ui.eventBannerDot.style.background = '#ef4444';
        this.ui.eventBannerTitle.innerText = 'RACCOON ALERT';
        this.ui.eventBannerSub.innerText = 'Walk close to shoo!';
      } else {
        this.ui.eventBanner.classList.add('hidden');
      }
    }
    if (this.ui.hudStack) this.ui.hudStack.innerText = `${this.player.carryStack.length}/${this.player.maxStack}`;
    const level = 1
      + this.plots.filter(p => p.unlocked).length
      + this.staffHelpers.length
      + (this.cashierHired ? 1 : 0)
      + (this.courierHired ? 1 : 0);
    this.storeLevel = level;
    if (this.ui.hudLevel) this.ui.hudLevel.innerText = `MART TIER ${this.storeLevel}`;
    this.updateTutorialUI();

    if (this.ui.martsModal && !this.ui.martsModal.classList.contains('hidden')) {
      this.martListRefreshTimer += dt;
      if (this.martListRefreshTimer >= 0.75) {
        this.martListRefreshTimer = 0;
        this.renderMartsList();
      }
    }
  }

  showRemoteToast(title, sub, color = '#16a34a') {
    if (!this.ui.remoteToastContainer) return;
    const now = performance.now();
    if (now - this.lastToastTime < 2800) return;
    this.lastToastTime = now;

    // Cap visible toasts to 2
    while (this.ui.remoteToastContainer.children.length >= 2) {
      this.ui.remoteToastContainer.removeChild(this.ui.remoteToastContainer.firstChild);
    }

    const toast = document.createElement('div');
    toast.className = 'remote-toast';
    toast.innerHTML = `
      <span class="remote-toast-dot" style="background: ${color};"></span>
      <div class="remote-toast-text">
        <span class="remote-toast-title">${title}</span>
        <span class="remote-toast-sub">${sub}</span>
      </div>
    `;
    this.ui.remoteToastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3600);
  }

  updateBackgroundMarts(dt) {
    for (let i = 0; i < this.unlockedMarts.length; i++) {
      const martId = this.unlockedMarts[i];
      if (martId === this.currentMartId) continue;

      if (!this.martsData[martId]) {
        this.martsData[martId] = this.createDefaultMartState(martId);
      }
      this.simulateMartBackground(martId, this.martsData[martId], dt, true);
    }
  }

  simulateMartBackground(martId, st, dt, emitToast = false) {
    const cfg = MARTS_CONFIG[martId];
    if (!cfg || !st) return;

    const prodLvl = st.prodLevel || 1;
    const workerLvl = st.workerLevel || 1;
    const cashierLvl = st.cashierLevel || 1;
    const courierLvl = st.courierLevel || 1;
    const marketingLvl = st.marketingLevel || 1;
    const stockersCount = st.stockersCount !== undefined ? st.stockersCount : (st.staffHired ? 1 : 0);

    const maxPlotStock = 8 + (prodLvl - 1) * 2;
    const maxShelfCap = 12 + (prodLvl - 1) * 3;
    const growInterval = 2.2 * Math.pow(0.86, prodLvl - 1);

    const plotsMeta = cfg.createPlots();
    const shelvesMeta = cfg.createShelves();
    if (!st.plotStocks) st.plotStocks = {};
    if (!st.plotGrowTimers) st.plotGrowTimers = {};
    if (!st.shelfStocks) st.shelfStocks = {};
    if (!Array.isArray(st.pickupOrders)) st.pickupOrders = [];

    const unlockedPlots = plotsMeta.filter(p => (st.unlockedPlots || []).includes(p.id));
    const unlockedTypes = unlockedPlots.map(p => p.type);
    const unlockedShelves = shelvesMeta.filter(s => (st.unlockedShelves || []).includes(s.id) || unlockedTypes.includes(s.type));

    // A. Grow crops & production goods
    for (let i = 0; i < unlockedPlots.length; i++) {
      const p = unlockedPlots[i];
      const cur = st.plotStocks[p.id] || 0;
      if (cur < maxPlotStock) {
        st.plotGrowTimers[p.id] = (st.plotGrowTimers[p.id] || 0) + dt;
        while (st.plotGrowTimers[p.id] >= growInterval && (st.plotStocks[p.id] || 0) < maxPlotStock) {
          st.plotGrowTimers[p.id] -= growInterval;
          st.plotStocks[p.id] = (st.plotStocks[p.id] || 0) + 1;
        }
      }
    }

    // B. Hired Stockers transfer goods from Plots -> Shelves
    if (stockersCount > 0 && unlockedPlots.length > 0 && unlockedShelves.length > 0) {
      const transferRate = stockersCount * (0.65 + (workerLvl - 1) * 0.35);
      st.bgStockerAcc = (st.bgStockerAcc || 0) + transferRate * dt;
      while (st.bgStockerAcc >= 1) {
        st.bgStockerAcc -= 1;
        // Find plot with stock whose matching shelf has room, favoring lowest shelf stock
        let bestPair = null;
        let lowestFill = 999;
        for (let i = 0; i < unlockedPlots.length; i++) {
          const plot = unlockedPlots[i];
          if ((st.plotStocks[plot.id] || 0) <= 0) continue;
          const shelf = unlockedShelves.find(s => s.type === plot.type);
          if (!shelf) continue;
          const shelfItems = st.shelfStocks[shelf.id] || 0;
          if (shelfItems < maxShelfCap && shelfItems < lowestFill) {
            lowestFill = shelfItems;
            bestPair = { plot, shelf };
          }
        }
        if (bestPair) {
          st.plotStocks[bestPair.plot.id]--;
          st.shelfStocks[bestPair.shelf.id] = (st.shelfStocks[bestPair.shelf.id] || 0) + 1;
        } else {
          break;
        }
      }
    }

    // C. Remote Pickup Orders spawn, auto-pack by Courier, or expire
    const maxOrders = st.courierHired ? Math.min(4, 2 + Math.floor(courierLvl / 2)) : 2;
    const orderInterval = Math.max(5.5, 11.5 - (marketingLvl - 1) * 1.3);
    if (st.pickupOrders.length < maxOrders && unlockedTypes.length > 0) {
      st.pickupSpawnTimer = (st.pickupSpawnTimer !== undefined ? st.pickupSpawnTimer : 4.0) - dt;
      if (st.pickupSpawnTimer <= 0) {
        st.pickupSpawnTimer = orderInterval;
        const ord = PickupStation.prototype.createOrderData(unlockedTypes, courierLvl, marketingLvl, Date.now() + Math.random());
        if (ord) {
          st.pickupOrders.push(ord);
        }
      }
    }

    if (st.courierHired && st.pickupOrders.length > 0) {
      const packRate = 0.45 + (courierLvl - 1) * 0.25;
      st.bgCourierAcc = (st.bgCourierAcc || 0) + packRate * dt;
      while (st.bgCourierAcc >= 1 && st.pickupOrders.length > 0) {
        let packedOne = false;
        for (let i = 0; i < st.pickupOrders.length && !packedOne; i++) {
          const ord = st.pickupOrders[i];
          for (let j = 0; j < ord.itemsRemaining.length; j++) {
            const needType = ord.itemsRemaining[j];
            const shelf = unlockedShelves.find(s => s.type === needType && (st.shelfStocks[s.id] || 0) > 0);
            if (shelf) {
              st.shelfStocks[shelf.id]--;
              ord.itemsRemaining.splice(j, 1);
              packedOne = true;
              st.bgCourierAcc -= 1;

              if (ord.itemsRemaining.length === 0) {
                st.pickupOrders.splice(i, 1);
                this.money += ord.payout;
                this.totalProfit += ord.payout;
                st.awayProfit = (st.awayProfit || 0) + ord.payout;
                st.unseenAwayProfit = (st.unseenAwayProfit || 0) + ord.payout;
                st.awayDeliveriesCount = (st.awayDeliveriesCount || 0) + 1;
                if (emitToast) {
                  this.showRemoteToast(cfg.shortTitle, `Courier Delivered Pickup +$${ord.payout}`, cfg.accentColor);
                }
              }
              break;
            }
          }
        }
        if (!packedOne) break;
      }
    }

    // Tick down pickup timers & record expirations if unattended
    for (let i = st.pickupOrders.length - 1; i >= 0; i--) {
      st.pickupOrders[i].timeLeft -= dt;
      if (st.pickupOrders[i].timeLeft <= 0) {
        st.pickupOrders.splice(i, 1);
        st.awayMissedOrders = (st.awayMissedOrders || 0) + 1;
        if (emitToast) {
          this.showRemoteToast(cfg.shortTitle, st.courierHired ? 'Pickup missed (Shelves empty!)' : 'Pickup expired (Hire Courier!)', '#ef4444');
        }
      }
    }

    // D. Remote In-Store Customer Shopping & Register Checkouts
    const customerInterval = Math.max(1.9, 4.2 - (marketingLvl - 1) * 0.45);
    st.bgCustomerTimer = (st.bgCustomerTimer || 0) + dt;
    while (st.bgCustomerTimer >= customerInterval) {
      st.bgCustomerTimer -= customerInterval;
      const stockedShelves = unlockedShelves.filter(s => (st.shelfStocks[s.id] || 0) > 0);
      if (stockedShelves.length === 0) break;

      if (st.cashierHired) {
        // Cashier rings up 1-2 items per shopper, sped up by cashierLevel
        const basketCount = Math.min(2 + (cashierLvl >= 3 ? 1 : 0), stockedShelves.length);
        let earned = 0;
        for (let b = 0; b < basketCount; b++) {
          const s = stockedShelves[Math.floor(Math.random() * stockedShelves.length)];
          if ((st.shelfStocks[s.id] || 0) > 0) {
            st.shelfStocks[s.id]--;
            const basePrice = ITEM_TYPES[s.type] ? ITEM_TYPES[s.type].price : 8;
            earned += basePrice;
          }
        }
        if (earned > 0) {
          const bonusEarned = Math.round(earned * (1 + (cashierLvl - 1) * 0.05));
          this.money += bonusEarned;
          this.totalProfit += bonusEarned;
          st.awayProfit = (st.awayProfit || 0) + bonusEarned;
          st.unseenAwayProfit = (st.unseenAwayProfit || 0) + bonusEarned;
          st.awaySalesCount = (st.awaySalesCount || 0) + 1;
          if (emitToast && (st.awaySalesCount % 3 === 0)) {
            this.showRemoteToast(cfg.shortTitle, `Register Sale +$${bonusEarned} (Away Earnings: $${st.awayProfit})`, '#16a34a');
          }
        }
      } else {
        // Without a Cashier, shoppers queue up at the register (capped at 4) and wait for you!
        if ((st.remoteWaitingCustomers || 0) < 4) {
          const s = stockedShelves[Math.floor(Math.random() * stockedShelves.length)];
          if ((st.shelfStocks[s.id] || 0) > 0) {
            st.shelfStocks[s.id]--;
            st.remoteWaitingCustomers = (st.remoteWaitingCustomers || 0) + 1;
            if (emitToast && st.remoteWaitingCustomers >= 3) {
              this.showRemoteToast(cfg.shortTitle, `${st.remoteWaitingCustomers} shoppers waiting (Hire Cashier!)`, '#f59e0b');
            }
          }
        }
      }
    }
  }

  updateDynamicEvents(dt) {
    if (this.hypeTimer > 0) this.hypeTimer = Math.max(0, this.hypeTimer - dt);
    if (this.rushTimer > 0) this.rushTimer = Math.max(0, this.rushTimer - dt);
    if (this.vanCooldown > 0) this.vanCooldown = Math.max(0, this.vanCooldown - dt);

    // Player sweeps up floor spills automatically by walking/dashing over them
    for (let i = this.spills.length - 1; i >= 0; i--) {
      const sp = this.spills[i];
      if (Math.hypot(this.player.x - sp.x, this.player.y - sp.y) < sp.radius + 14) {
        this.cleanSpillAt(i, 'CLEAN +$12!');
      }
    }

    // Cheeky Raccoon logic: sneaks toward a stocked shelf unless chased away
    if (this.raccoon) {
      const r = this.raccoon;
      r.anim += dt * 10;
      if (!r.scared) {
        const dPlayer = Math.hypot(this.player.x - r.x, this.player.y - r.y);
        if (dPlayer < 46) {
          this.shooRaccoon('SHOO +$18!');
        } else {
          const target = r.targetShelf;
          if (!target || target.items <= 0) {
            r.scared = true;
          } else {
            const dx = target.x - r.x;
            const dy = (target.y + 38) - r.y;
            const d = Math.hypot(dx, dy);
            if (d > 8) {
              r.facingRight = dx >= 0;
              r.x += (dx / d) * 76 * dt;
              r.y += (dy / d) * 76 * dt;
            } else {
              r.stealTimer += dt;
              if (r.stealTimer >= 2.2) {
                target.items = Math.max(0, target.items - 1);
                r.scared = true;
                this.spawnFloatingText(target.x, target.y - 30, 'STOLE 1 ITEM!', '#ef4444', 15);
              }
            }
          }
        }
      } else {
        const dx = this.entranceX - r.x;
        const dy = (this.entranceY + 40) - r.y;
        const d = Math.hypot(dx, dy);
        r.facingRight = dx >= 0;
        r.x += (dx / Math.max(1, d)) * 220 * dt;
        r.y += (dy / Math.max(1, d)) * 220 * dt;
        if (d < 20) {
          this.raccoon = null;
        }
      }
    }

    // Periodic Dynamic Events (Spill / Cheeky Raccoon / Rush Hour / VIP Critic)
    this.eventCooldown -= dt;
    if (this.eventCooldown <= 0) {
      this.eventCooldown = 28 + Math.random() * 14;
      this.triggerRandomEvent();
    }
  }

  triggerRandomEvent(forcedType = null) {
    const roll = forcedType || (['spill', 'vip', 'rush', 'raccoon'][Math.floor(Math.random() * 4)]);
    if (roll === 'spill') {
      this.spawnSpill();
    } else if (roll === 'vip') {
      this.spawnCustomer(true);
      this.showRemoteToast('VIP Critic Arrived!', 'Serve them fast to trigger Store Hype (+25%)!', '#eab308');
    } else if (roll === 'rush') {
      this.rushTimer = 18;
      for (let i = 0; i < 2; i++) this.spawnCustomer(false);
      if (window.miniMartAudio) window.miniMartAudio.playOrderBell();
      this.showRemoteToast('Rush Hour Wave!', '+50% Tips for the next 18 seconds!', '#f97316');
    } else if (roll === 'raccoon') {
      this.spawnRaccoon();
    }
  }

  spawnSpill(x = null, y = null) {
    if (this.spills.length >= 3) return;
    const sx = x !== null ? x : (480 + Math.random() * 440);
    const sy = y !== null ? y : (380 + Math.random() * 340);
    this.spills.push({ x: sx, y: sy, radius: 24, color: ['#38bdf8', '#facc15', '#fb7185'][Math.floor(Math.random() * 3)] });
    this.showRemoteToast('Floor Spill!', 'Step over it to sweep clean for +$12!', '#0ea5e9');
  }

  cleanSpillAt(index, label = 'CLEAN +$12!') {
    const sp = this.spills[index];
    if (!sp) return;
    this.spills.splice(index, 1);
    this.money += 12;
    this.advanceContract('clean', 1);
    this.adjustStarRating(0.03);
    if (window.miniMartAudio) window.miniMartAudio.playHarvest();
    this.spawnPopEffect(sp.x, sp.y, '#38bdf8');
    this.spawnFloatingText(sp.x, sp.y - 20, label, '#0284c7', 16);
  }

  spawnRaccoon() {
    if (this.raccoon) return;
    const stockedShelves = this.shelves.filter(s => s.unlocked && s.items > 0);
    if (stockedShelves.length === 0) {
      this.spawnSpill();
      return;
    }
    const targetShelf = stockedShelves[Math.floor(Math.random() * stockedShelves.length)];
    this.raccoon = {
      x: this.entranceX - 30,
      y: this.entranceY,
      targetShelf: targetShelf,
      stealTimer: 0,
      scared: false,
      facingRight: true,
      anim: 0
    };
    if (window.miniMartAudio) window.miniMartAudio.playOrderBell();
    this.showRemoteToast('Sneaky Raccoon!', 'Walk close to shoo it away for +$18!', '#ef4444');
  }

  shooRaccoon(label = 'SHOO +$18!') {
    if (!this.raccoon || this.raccoon.scared) return;
    this.raccoon.scared = true;
    this.money += 18;
    this.advanceContract('clean', 1);
    this.adjustStarRating(0.05);
    if (window.miniMartAudio) window.miniMartAudio.playCash();
    this.spawnPopEffect(this.raccoon.x, this.raccoon.y - 10, '#f59e0b');
    this.spawnFloatingText(this.raccoon.x, this.raccoon.y - 32, label, '#16a34a', 17);
  }

  spawnCustomer(forceVip = false) {
    const unlockedTypes = this.plots.filter(p => p.unlocked).map(p => p.type);
    if (unlockedTypes.length === 0) return;

    const isVip = forceVip || (Math.random() < 0.08 && !this.customers.some(c => c.isVip));
    const maxBasket = isVip ? 4 : (this.marketingLevel >= 3 ? 4 : 3);
    const itemCount = isVip
      ? Math.min(maxBasket, Math.max(2, unlockedTypes.length))
      : Math.min(maxBasket, Math.floor(Math.random() * 2) + 1 + (this.marketingLevel >= 4 ? 1 : 0));
    const list = [];
    for (let i = 0; i < itemCount; i++) {
      const randomItem = unlockedTypes[Math.floor(Math.random() * unlockedTypes.length)];
      list.push(randomItem);
    }

    const c = new MartCustomer(this.entranceX, this.entranceY, list, isVip);
    this.customers.push(c);
  }

  render() {
    this.ctx.clearRect(0, 0, this.viewportWidth, this.viewportHeight);

    const scale = this.viewScale || 1;
    this.ctx.save();
    this.ctx.scale(scale, scale);
    this.ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    // 1. Draw Themed Supermarket & Patio Floor
    this.drawStoreFloor();

    // 1b. Draw Floor Spills
    this.spills.forEach(sp => {
      this.ctx.save();
      this.ctx.translate(sp.x, sp.y);
      this.ctx.fillStyle = sp.color || '#38bdf8';
      this.ctx.globalAlpha = 0.72;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, sp.radius, sp.radius * 0.65, 0.2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 0.9;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.ellipse(-6, -3, 6, 3, -0.3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // 2. Draw Unlock Zones
    this.unlockZones.forEach(zone => zone.draw(this.ctx));

    // 3. Draw Farm/Production Plots & Display Shelves
    this.plots.forEach(plot => plot.draw(this.ctx));
    this.shelves.forEach(shelf => shelf.draw(this.ctx));

    // 4. Draw Trash Can & Gourmet Combo Bar
    if (this.trashBin) this.trashBin.draw(this.ctx);
    if (this.comboStation) this.comboStation.draw(this.ctx);

    // 5. Draw Checkout Register & Pickup Delivery Station
    if (this.checkout) this.checkout.draw(this.ctx);
    if (this.pickupStation) this.pickupStation.draw(this.ctx);

    // 6. Draw Hired Cashier behind counter (if hired)
    if (this.cashierHired && this.checkout) {
      this.drawCashier(this.ctx, this.checkout.x - 104, this.checkout.y);
    }

    // 7. Draw Hired Stocker Workers, Delivery Courier & Shop Dog
    for (let i = 0; i < this.staffHelpers.length; i++) {
      this.staffHelpers[i].draw(this.ctx);
    }
    if (this.deliveryCourier) {
      this.deliveryCourier.draw(this.ctx);
    }
    if (this.shopDog) {
      this.shopDog.draw(this.ctx);
    }

    // 7b. Draw Sneaky Raccoon (if active)
    if (this.raccoon) {
      this.drawRaccoon(this.ctx, this.raccoon);
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

  drawRaccoon(ctx, r) {
    ctx.save();
    ctx.translate(r.x, r.y);
    if (!r.facingRight) ctx.scale(-1, 1);

    const bounce = Math.abs(Math.sin(r.anim)) * 3;

    // Shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 11, 13, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Striped Tail
    ctx.fillStyle = '#64748b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-14, -2 - bounce, 7, 3.8, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Body
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(-10, -6 - bounce, 20, 13, 6);
    ctx.fill();
    ctx.stroke();

    // Head & Bandit Eye Mask
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(8, -8 - bounce, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(3, -11 - bounce, 11, 4.5, 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(7, -8.8 - bounce, 1.3, 0, Math.PI * 2);
    ctx.arc(12, -8.8 - bounce, 1.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  saveGame() {
    try {
      this.snapshotActiveMart();
      const data = {
        money: this.money,
        gems: this.gems,
        starRating: this.starRating,
        shopDogOwned: this.shopDogOwned,
        speakerInstalled: this.speakerInstalled,
        cashVacuumInstalled: this.cashVacuumInstalled,
        playerOutfit: this.playerOutfit,
        unlockedOutfits: this.unlockedOutfits,
        contracts: this.contracts,
        totalProfit: this.totalProfit,
        totalCustomersServed: this.totalCustomersServed,
        speedLevel: this.player.speedLevel,
        stackLevel: this.player.stackLevel,
        currentMartId: this.currentMartId,
        unlockedMarts: this.unlockedMarts,
        martsData: this.martsData,
        lastSavedAt: Date.now(),
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
      if (data.gems !== undefined) this.gems = Math.max(0, data.gems);
      if (data.starRating !== undefined) this.starRating = Math.max(1.0, Math.min(5.0, data.starRating));
      if (data.shopDogOwned) this.shopDogOwned = true;
      if (data.speakerInstalled) this.speakerInstalled = true;
      if (data.cashVacuumInstalled) this.cashVacuumInstalled = true;
      if (data.playerOutfit) {
        this.playerOutfit = data.playerOutfit;
        this.player.outfitStyle = data.playerOutfit;
      }
      if (Array.isArray(data.unlockedOutfits)) {
        this.unlockedOutfits = data.unlockedOutfits;
      }
      if (Array.isArray(data.contracts) && data.contracts.length > 0) {
        this.contracts = data.contracts;
      }
      if (data.totalProfit !== undefined) this.totalProfit = data.totalProfit;
      if (data.totalCustomersServed !== undefined) this.totalCustomersServed = data.totalCustomersServed;

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
          stockersCount: data.staffHired ? 1 : 0,
          cashierHired: !!data.cashierHired,
          unlockZones: []
        };
      }

      // Simulate capped offline progress (up to 90s) across unlocked remote marts on return
      if (data.lastSavedAt) {
        const elapsedSec = Math.min(90, Math.max(0, (Date.now() - data.lastSavedAt) / 1000));
        if (elapsedSec >= 3) {
          const steps = Math.floor(elapsedSec);
          for (let i = 0; i < this.unlockedMarts.length; i++) {
            const mId = this.unlockedMarts[i];
            if (mId === (data.currentMartId || 'mart_farm')) continue;
            if (!this.martsData[mId]) this.martsData[mId] = this.createDefaultMartState(mId);
            for (let s = 0; s < steps; s++) {
              this.simulateMartBackground(mId, this.martsData[mId], 1.0, false);
            }
          }
        }
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
