// Grandma's Homestead - Stardew Valley Style Farming Simulator Engine
// Full game loops, tilemap, crops, inventory, shop, tutorial quests, grandma dialogue, and day cycle.

(function() {
  'use strict';

  // --- Game Configuration & Constants ---
  const TILE_SIZE = 32;
  const MAP_COLS = 64;
  const MAP_ROWS = 46;

  const CROP_DEFS = {
    turnip: { id: 'turnip', name: 'Turnip', seedCost: 20, sellPrice: 48, growthDays: 2, energyHeal: 15 },
    carrot: { id: 'carrot', name: 'Carrot', seedCost: 35, sellPrice: 85, growthDays: 3, energyHeal: 25 },
    strawberry: { id: 'strawberry', name: 'Strawberry', seedCost: 60, sellPrice: 150, growthDays: 4, energyHeal: 40 },
    tomato: { id: 'tomato', name: 'Tomato', seedCost: 80, sellPrice: 200, growthDays: 4, energyHeal: 50 },
    corn: { id: 'corn', name: 'Golden Corn', seedCost: 120, sellPrice: 310, growthDays: 5, energyHeal: 65 },
    pumpkin: { id: 'pumpkin', name: 'Pumpkin', seedCost: 150, sellPrice: 420, growthDays: 6, energyHeal: 80 },
    blueberry: { id: 'blueberry', name: 'Blueberries', seedCost: 70, sellPrice: 165, growthDays: 4, energyHeal: 45 },
    melon: { id: 'melon', name: 'Sweet Melon', seedCost: 110, sellPrice: 280, growthDays: 5, energyHeal: 70 },
    starfruit: { id: 'starfruit', name: 'Starfruit', seedCost: 250, sellPrice: 650, growthDays: 6, energyHeal: 100 }
  };

  const FISH_DEFS = {
    sunfish: { id: 'sunfish', name: 'Sunfish', sellPrice: 42, rarity: 'Common', difficulty: 0.7, locations: ['farm', 'city'], desc: 'Golden freshwater sunfish found in calm docks and canals.' },
    bass: { id: 'bass', name: 'Largemouth Bass', sellPrice: 75, rarity: 'Common', difficulty: 0.95, locations: ['farm', 'city'], desc: 'Feisty lake bass that darts across deep eddies.' },
    trout: { id: 'trout', name: 'Brook Trout', sellPrice: 95, rarity: 'Uncommon', difficulty: 1.1, locations: ['city', 'farm'], desc: 'Silver mountain trout thriving in cool canal currents.' },
    catfish: { id: 'catfish', name: 'Whiskered Catfish', sellPrice: 145, rarity: 'Rare', difficulty: 1.3, locations: ['farm'], desc: 'Heavy bottom-dweller that loves rainy lakeside mornings.' },
    koi: { id: 'koi', name: 'Oakhaven Koi', sellPrice: 220, rarity: 'Rare', difficulty: 1.45, locations: ['city', 'farm'], desc: 'Gem-scaled ornamental carp prized by city collectors.' },
    legend_carp: { id: 'legend_carp', name: 'Emperor Hazel Carp', sellPrice: 480, rarity: 'Legendary', difficulty: 1.75, locations: ['farm'], desc: 'Ancient golden giant rumored to guard Lake Hazel.' }
  };

  const FORAGE_DEFS = {
    wildflower: { id: 'wildflower', name: 'Brook Wildflower', sellPrice: 28, desc: 'Fragrant meadow blossom gathered around the homestead.' },
    morel: { id: 'morel', name: 'Forest Morel', sellPrice: 55, desc: 'Earthy woodland mushroom prized in country soups.' },
    wild_berry: { id: 'wild_berry', name: 'Foraged Blackberries', sellPrice: 38, heal: 18, desc: 'Sweet wild bramble berries. Eat for +18 Energy or sell.' },
    honeycomb: { id: 'honeycomb', name: 'Wild Honeycomb', sellPrice: 85, heal: 35, desc: 'Golden comb dripping with clover honey. Restores 35 Energy.' }
  };

  const COOKING_RECIPES = [
    {
      id: 'roasted_root_medley',
      name: 'Roasted Root Medley',
      heal: 55,
      sellPrice: 165,
      ingredients: [{ id: 'turnip', count: 1 }, { id: 'carrot', count: 1 }],
      desc: 'Crisp oven-glazed roots with country herbs. Restores 55 Energy.'
    },
    {
      id: 'crispy_pan_fish',
      name: 'Crispy Skillet Fish',
      heal: 70,
      sellPrice: 120,
      ingredients: [{ id: 'sunfish', count: 1 }, { id: 'wildflower', count: 1 }],
      desc: 'Pan-seared sunfish finished with meadow blossoms. Restores 70 Energy.'
    },
    {
      id: 'woodland_chowder',
      name: 'Woodland Fish Chowder',
      heal: 95,
      sellPrice: 220,
      ingredients: [{ id: 'bass', count: 1 }, { id: 'morel', count: 1 }],
      desc: 'Creamy potage of lake bass and woodland morels. Restores 95 Energy.'
    },
    {
      id: 'honey_berry_tart',
      name: 'Honey Berry Tart',
      heal: 85,
      sellPrice: 240,
      ingredients: [{ id: 'strawberry', count: 1 }, { id: 'wild_berry', count: 1 }],
      desc: 'Flaky glazed farmhouse tart. Restores 85 Energy.'
    },
    {
      id: 'herb_trout_bake',
      name: 'Herb-Crusted Trout',
      heal: 110,
      sellPrice: 290,
      ingredients: [{ id: 'trout', count: 1 }, { id: 'tomato', count: 1 }],
      desc: 'Slow-baked mountain trout over blistered tomatoes. Restores 110 Energy.'
    },
    {
      id: 'harvest_feast',
      name: 'Grandma’s Harvest Feast',
      heal: 140,
      sellPrice: 680,
      ingredients: [{ id: 'pumpkin', count: 1 }, { id: 'honeycomb', count: 1 }],
      desc: 'Honey-glazed spiced pumpkin platter. Restores full energy!'
    },
    {
      id: 'country_omelette',
      name: 'Farmhouse Omelette',
      heal: 75,
      sellPrice: 145,
      ingredients: [{ id: 'egg', count: 1 }, { id: 'tomato', count: 1 }],
      desc: 'Fluffy golden egg omelette with blistered garden tomatoes. Restores 75 Energy.'
    },
    {
      id: 'berry_smoothie',
      name: 'Creamy Berry Smoothie',
      heal: 90,
      sellPrice: 175,
      ingredients: [{ id: 'milk', count: 1 }, { id: 'wild_berry', count: 1 }],
      desc: 'Velvety fresh barn milk blended with sweet berries. Restores 90 Energy.'
    }
  ];

  const EXTRA_ITEM_PRICES = {
    wood: 5,
    stone: 6,
    fiber: 4,
    honey: 30,
    apple_pie: 55,
    egg: 35,
    milk: 75,
    wool: 110,
    copper_ore: 28,
    gold_ore: 65,
    quartz: 120
  };

  const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];

  const NPC_FAVORITE_GIFTS = {
    grandma: ['apple_pie', 'country_omelette', 'strawberry', 'wild_berry'],
    mayor: ['starfruit', 'melon', 'gold_ore', 'wild_berry'],
    baker: ['egg', 'milk', 'berry_smoothie', 'pumpkin'],
    blacksmith: ['copper_ore', 'gold_ore', 'quartz', 'stone'],
    fisherman: ['trout', 'legend_carp', 'bass', 'salmon'],
    penny: ['lavender', 'sunflower', 'quartz', 'wild_berry'],
    pastor: ['honey', 'apple_pie', 'milk'],
    librarian: ['quartz', 'morel', 'berry_smoothie'],
    pip: ['berry_smoothie', 'apple_pie', 'corn', 'carrot'],
    dog: ['egg', 'milk', 'trout']
  };

  function getSellPrice(item) {
    if (!item) return 0;
    if (CROP_DEFS[item.id]) return CROP_DEFS[item.id].sellPrice;
    if (FISH_DEFS[item.id]) return FISH_DEFS[item.id].sellPrice;
    if (FORAGE_DEFS[item.id]) return FORAGE_DEFS[item.id].sellPrice;
    const recipe = COOKING_RECIPES.find(r => r.id === item.id);
    if (recipe) return recipe.sellPrice;
    if (EXTRA_ITEM_PRICES[item.id] !== undefined) return EXTRA_ITEM_PRICES[item.id];
    return 0;
  }

  const TUTORIAL_QUESTS = [
    {
      id: 'talk_grandma',
      title: 'Grandma’s Welcome',
      desc: 'Walk up to Grandma Hazel on the cottage porch and press E (or tap her) to say hello.',
      isDone: false,
      rewardGold: 30,
      rewardDesc: '30 Gold & 5 Turnip Seeds',
      onComplete: (game) => {
        game.addItem('turnip_seed', 5);
      }
    },
    {
      id: 'till_soil',
      title: 'Prepare the Earth',
      desc: 'Select your Hoe (Slot 1) and till 3 dirt patches in the field by clicking or pressing Space.',
      current: 0,
      target: 3,
      isDone: false,
      rewardGold: 40,
      rewardDesc: '40 Gold & 3 Carrot Seeds',
      onComplete: (game) => {
        game.addItem('carrot_seed', 3);
      }
    },
    {
      id: 'plant_seeds',
      title: 'Sow Your First Seeds',
      desc: 'Equip Turnip or Carrot Seeds from your hotbar and plant them on your tilled soil.',
      current: 0,
      target: 3,
      isDone: false,
      rewardGold: 50,
      rewardDesc: '50 Gold & 3 Speed-Gro Fertilizer',
      onComplete: (game) => {
        game.addItem('fertilizer', 3);
      }
    },
    {
      id: 'water_crops',
      title: 'Nourish the Sprouts',
      desc: 'Equip your Watering Can (Slot 2) and water 3 planted crops. (Refill at the pond/well if empty!)',
      current: 0,
      target: 3,
      isDone: false,
      rewardGold: 60,
      rewardDesc: '60 Gold & Grandma’s Warm Apple Pie',
      onComplete: (game) => {
        game.addItem('apple_pie', 1);
      }
    },
    {
      id: 'clear_debris',
      title: 'Farm Beautification',
      desc: 'Use your Scythe (Slot 3) on wild weeds, or Axe/Pickaxe on rocks and wood debris.',
      current: 0,
      target: 2,
      isDone: false,
      rewardGold: 70,
      rewardDesc: '70 Gold & 10 Wood, 10 Stone',
      onComplete: (game) => {
        game.addItem('wood', 10);
        game.addItem('stone', 10);
      }
    },
    {
      id: 'visit_shop',
      title: 'Visit the Countryside Market',
      desc: 'Click the "Village Shop" button or walk up to the market cart by the farm road.',
      isDone: false,
      rewardGold: 100,
      rewardDesc: '100 Gold',
      onComplete: () => {}
    },
    {
      id: 'sleep_grow',
      title: 'Grandma’s Goodnight',
      desc: 'Talk to Grandma Hazel on the porch to wish her goodnight and rest for Day 2.',
      isDone: false,
      rewardGold: 150,
      rewardDesc: '150 Gold & Master Farmer Trophy',
      onComplete: () => {}
    }
  ];

  // --- Main Game Engine ---
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;

      // World dimensions
      this.mapCols = MAP_COLS;
      this.mapRows = MAP_ROWS;
      this.worldWidth = this.mapCols * TILE_SIZE;
      this.worldHeight = this.mapRows * TILE_SIZE;

      // Camera
      this.camera = { x: 0, y: 0 };

      // Player State
      this.grandmaApprovedSleep = false;
      this.player = {
        x: 16 * TILE_SIZE,
        y: 11 * TILE_SIZE,
        speed: 3.4,
        dir: 0, // 0: down, 1: up, 2: left, 3: right
        isMoving: false,
        inBed: false,
        walkFrame: 0,
        toolAction: null,
        toolTimer: 0,
        stamina: 100,
        maxStamina: 100,
        waterCapacity: 20,
        water: 20,
        gold: 150
      };

      // Day & Time
      this.day = 1;
      this.season = 'Spring';
      this.timeMinutes = 6 * 60; // Starts at 6:00 AM (360 mins)
      this.weather = 'sunny'; // 'sunny' or 'rainy'
      this.timeScale = 0.8; // 1 real second = approx 8 in-game minutes

      // Inventory & Hotbar (active slot: 0 to 7)
      this.activeSlot = 0;
      this.inventory = [
        { id: 'hoe', type: 'tool', name: 'Hoe', count: 1, desc: 'Till fertile soil patches.' },
        { id: 'watering_can', type: 'tool', name: 'Watering Can', count: 1, desc: 'Water crops. Refill at well/pond.' },
        { id: 'scythe', type: 'tool', name: 'Scythe', count: 1, desc: 'Cut weeds and harvest mature crops.' },
        { id: 'axe', type: 'tool', name: 'Axe', count: 1, desc: 'Chop logs and fallen trees for wood.' },
        { id: 'pickaxe', type: 'tool', name: 'Pickaxe', count: 1, desc: 'Break rocks and boulders for stone.' },
        { id: 'fishing_rod', type: 'tool', name: 'Fishing Rod', count: 1, desc: 'Cast into Lake Hazel or Oakhaven Canal to catch fish.' },
        { id: 'turnip_seed', type: 'seed', crop: 'turnip', name: 'Turnip Seeds', count: 8, desc: 'Grows crisp turnips in 2 days.' },
        { id: 'carrot_seed', type: 'seed', crop: 'carrot', name: 'Carrot Seeds', count: 4, desc: 'Grows sweet orange carrots in 3 days.' },
        { id: 'fertilizer', type: 'item', name: 'Speed-Gro', count: 4, desc: 'Speeds up crop growth time.' },
        { id: 'wood', type: 'material', name: 'Wood', count: 15, desc: 'Useful building material.' },
        { id: 'stone', type: 'material', name: 'Stone', count: 10, desc: 'Sturdy building material.' },
        { id: 'apple_pie', type: 'food', name: 'Grandma’s Pie', count: 1, heal: 60, desc: 'Grandma’s warm pie. Restores 60 energy.' }
      ];

      // Quests / Tutorial
      this.quests = JSON.parse(JSON.stringify(TUTORIAL_QUESTS));
      this.activeQuestIdx = 0;

      // Location State
      this.currentLocation = 'farm'; // 'farm' or 'city'
      this.activeLocation = null;
      this.isTransitioning = false;
      this.transitionAlpha = 0;

      // Tool Upgrades & Cozy Homestead State
      this.player.hasCopperHoe = false;
      this.player.hasSteelAxe = false;
      this.player.hasSteelPickaxe = false;
      this.player.hasProRod = false;
      this.fishing = null;
      this.fishingLog = {};
      this.dailyTeaClaimed = false;
      this.dailyBlessingClaimed = false;
      this.ambientCritters = [];

      // Town Community Notice Board Tasks
      this.noticeBoardTasks = [
        { id: 'turnips', title: 'Mayor’s Banquet Turnips', desc: 'Deliver 2 crisp Turnips for the City Hall banquet.', itemReq: 'turnip', countReq: 2, rewardGold: 140, isDone: false },
        { id: 'berries', title: 'Bakery Tart Berries', desc: 'Deliver 1 Strawberry or Blueberry for fresh fruit tarts.', itemReq: 'strawberry', altReq: 'blueberry', countReq: 1, rewardGold: 180, isDone: false },
        { id: 'wood', title: 'Plaza Bench Restoration', desc: 'Deliver 10 Wood planks to repair town park benches.', itemReq: 'wood', countReq: 10, rewardGold: 110, isDone: false },
        { id: 'stone', title: 'Fountain Masonry Repairs', desc: 'Deliver 8 Stone to reinforce the central fountain.', itemReq: 'stone', countReq: 8, rewardGold: 120, isDone: false }
      ];

      // Farm World Data
      this.farm = {
        cols: MAP_COLS,
        rows: MAP_ROWS,
        tiles: [],
        crops: {},
        objects: {},
        debrisHealth: {}
      };

      // City World Data
      this.city = {
        cols: 48,
        rows: 34,
        tiles: [],
        objects: {},
        buildings: [
          { type: 'general_store', title: 'General Store', x: 6, y: 5, w: 6, h: 4 },
          { type: 'church', title: 'Oakhaven Chapel', x: 15, y: 4, w: 6, h: 4 },
          { type: 'library', title: 'Town Library', x: 27, y: 4, w: 6, h: 4 },
          { type: 'bakery', title: 'Bakery & Cafe', x: 34, y: 5, w: 6, h: 4 },
          { type: 'blacksmith', title: 'Blacksmith', x: 6, y: 19, w: 6, h: 4 },
          { type: 'town_hall', title: 'City Hall', x: 34, y: 19, w: 6, h: 4 }
        ],
        npcs: [
          {
            type: 'mayor', name: 'Mayor Clara', x: 28, y: 17, isWalking: false, walkPhase: 0, activity: 'Inspecting the town fountain',
            schedule: [
              { startMin: 360, x: 28, y: 17, activity: 'Morning fountain inspection' },
              { startMin: 570, x: 36, y: 24, activity: 'Greeting visitors at City Hall steps' },
              { startMin: 960, x: 21, y: 14, activity: 'Checking the Community Notice Board' },
              { startMin: 1170, x: 36, y: 20, activity: 'Evening stroll on East Street' }
            ]
          },
          {
            type: 'baker', name: 'Nora the Baker', x: 37, y: 10, isWalking: false, walkPhase: 0, activity: 'Selling warm sourdough loaves',
            schedule: [
              { startMin: 360, x: 37, y: 10, activity: 'Tending morning pastries at the Bakery' },
              { startMin: 780, x: 29, y: 15, activity: 'Afternoon tea break in Central Plaza' },
              { startMin: 1020, x: 37, y: 10, activity: 'Preparing evening pie trays' }
            ]
          },
          {
            type: 'blacksmith', name: 'Garth the Blacksmith', x: 9, y: 24, isWalking: false, walkPhase: 0, activity: 'Hammering glowing iron',
            schedule: [
              { startMin: 360, x: 9, y: 24, activity: 'Stoking the Blacksmith Forge' },
              { startMin: 1020, x: 19, y: 23, activity: 'Cooling off in South Plaza' },
              { startMin: 1230, x: 9, y: 24, activity: 'Banking the smithy coals for night' }
            ]
          },
          {
            type: 'fisherman', name: 'Barnaby the Fisherman', x: 26, y: 31, isWalking: false, walkPhase: 0, activity: 'Watching the canal floats',
            schedule: [
              { startMin: 360, x: 26, y: 31, activity: 'Early morning canal casting' },
              { startMin: 720, x: 15, y: 22, activity: 'Picking up bait in South Plaza' },
              { startMin: 870, x: 26, y: 31, activity: 'Evening bridge fishing' }
            ]
          },
          {
            type: 'penny', name: 'Penny the Florist', x: 10, y: 10, isWalking: false, walkPhase: 0, activity: 'Pruning marigold blooms',
            schedule: [
              { startMin: 360, x: 10, y: 10, activity: 'Watering North Blvd flowerbeds' },
              { startMin: 660, x: 30, y: 21, activity: 'Arranging plaza flower bouquets' },
              { startMin: 1020, x: 27, y: 25, activity: 'Walking South Boulevard' }
            ]
          },
          {
            type: 'pastor', name: 'Pastor Thomas', x: 18, y: 9, isWalking: false, walkPhase: 0, activity: 'Welcoming folks outside Oakhaven Chapel',
            schedule: [
              { startMin: 360, x: 18, y: 9, activity: 'Greeting neighbors at Oakhaven Chapel' },
              { startMin: 750, x: 19, y: 17, activity: 'Peaceful afternoon walk by the Fountain' },
              { startMin: 1020, x: 18, y: 9, activity: 'Ringing evening chapel bells' }
            ]
          },
          {
            type: 'librarian', name: 'Maeve the Librarian', x: 30, y: 9, isWalking: false, walkPhase: 0, activity: 'Cataloging almanac volumes',
            schedule: [
              { startMin: 360, x: 30, y: 9, activity: 'Opening Town Library for readers' },
              { startMin: 690, x: 24, y: 13, activity: 'Posting farm notes in North Plaza' },
              { startMin: 990, x: 28, y: 12, activity: 'Evening reading outside the Library' }
            ]
          },
          {
            type: 'pip', name: 'Pip the Farmhand', x: 22, y: 28, isWalking: false, walkPhase: 0, activity: 'Counting splashes by the bridge',
            schedule: [
              { startMin: 360, x: 22, y: 28, activity: 'Watching Barnaby fish at the Canal' },
              { startMin: 660, x: 20, y: 16, activity: 'Playing by the Central Fountain' },
              { startMin: 960, x: 14, y: 10, activity: 'Jogging past Oakhaven Chapel' }
            ]
          },
          {
            type: 'dog', name: 'Jasper the Pup', x: 20, y: 18, isWalking: false, walkPhase: 0, activity: 'Wagging tail happily in town plaza',
            schedule: [
              { startMin: 360, x: 20, y: 18, activity: 'Waiting for belly rubs by the Fountain' },
              { startMin: 600, x: 26, y: 20, activity: 'Chasing butterflies across the Plaza' },
              { startMin: 900, x: 21, y: 24, activity: 'Sniffing treats near South Boulevard' },
              { startMin: 1140, x: 17, y: 12, activity: 'Resting under the warm plaza lamps' }
            ]
          }
        ]
      };

      // Map Grid Active Pointers
      this.tiles = [];
      this.crops = {};
      this.objects = {};
      this.debrisHealth = {};

      // Particles & Floating Text
      this.particles = [];
      this.floatingTexts = [];

      // Mouse & Input
      this.mouse = { x: 0, y: 0, screenX: 0, screenY: 0, worldX: 0, worldY: 0, tileX: 0, tileY: 0, isDown: false };
      this.keys = {};
      this.player.targetPos = null;

      // Xbox Controller State & Live Platform Mode
      this.gamepadConnected = false;
      this.prevGamepadButtons = {};
      this.gamepadMoveX = 0;
      this.gamepadMoveY = 0;
      this.modalNavCooldown = 0;
      this.modalFocusIdx = 0;
      this.touchMoveX = 0;
      this.touchMoveY = 0;
      this.lastInputSource = 'keyboard'; // 'keyboard', 'mouse', 'touch', or 'gamepad'
      const isCoarseTouch = typeof window !== 'undefined' && window.matchMedia &&
        (window.matchMedia('(pointer: coarse)').matches || (navigator && navigator.maxTouchPoints > 0));
      if (isCoarseTouch) {
        this.setInputMode('touch');
      }

      // Positions of Grandma and Key Structures on Farm
      this.cottagePos = { x: 12 * TILE_SIZE, y: 4 * TILE_SIZE };
      this.grandmaPos = { x: 17 * TILE_SIZE + 8, y: 7 * TILE_SIZE };
      this.wellPos = { x: 22 * TILE_SIZE, y: 7 * TILE_SIZE };
      this.shippingBinPos = { x: 26 * TILE_SIZE, y: 7 * TILE_SIZE };
      this.shopCartPos = { x: 36 * TILE_SIZE, y: 41 * TILE_SIZE };
      this.barnPos = { x: 31 * TILE_SIZE, y: 4 * TILE_SIZE };
      this.cavePos = { x: 6 * TILE_SIZE, y: 35 * TILE_SIZE };

      // Barn Animals, Cave Ore Nodes, and Villager Friendships
      this.farmAnimals = [
        {
          id: 'cluckette',
          name: 'Cluckette',
          species: 'chicken',
          x: 31.5 * TILE_SIZE,
          y: 9.2 * TILE_SIZE,
          vx: 14,
          vy: 7,
          phase: 0.4,
          changeTimer: 1.5,
          hasProduct: true,
          pettedToday: false,
          isWalking: false
        }
      ];
      this.caveNodes = {};
      this.friendships = {
        grandma: 1,
        mayor: 0,
        baker: 0,
        blacksmith: 0,
        fisherman: 0,
        penny: 0,
        pastor: 0,
        librarian: 0,
        pip: 0,
        dog: 1
      };
      this.friendshipMilestones = {};
      this.giftedToday = {};

      // Initialize both Farm and City maps
      this.initFarmMap();
      this.initCityMap();

      // Load Saved Game if available
      this.loadGame();

      // Set active location
      this.switchLocation(this.currentLocation || 'farm');

      this.bindInputs();
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());

      // Center initial camera on player
      if (this.canvas.width > 0 && this.canvas.height > 0) {
        this.camera.x = Math.max(0, Math.min(this.player.x + TILE_SIZE / 2 - this.canvas.width / 2, this.worldWidth - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.player.y + TILE_SIZE / 2 - this.canvas.height / 2, this.worldHeight - this.canvas.height));
      }

      this.updateHUD();
      this.showToast('Welcome to Grandma’s Farm! Speak with Grandma Hazel on the porch.');

      // Start Main Loop
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    // --- Map Initialization ---
    initFarmMap() {
      this.farm.tiles = [];
      for (let r = 0; r < this.farm.rows; r++) {
        this.farm.tiles[r] = [];
        for (let c = 0; c < this.farm.cols; c++) {
          let type = 'grass';

          // 1. Perimeter Fences around map border (with open gates at south roads cols 14-18 and cols 26-32)
          if (r === 0 || r === this.farm.rows - 1 || c === 0 || c === this.farm.cols - 1) {
            const isSouthGate = (r === this.farm.rows - 1 && ((c >= 14 && c <= 18) || (c >= 26 && c <= 32)));
            if (!isSouthGate) {
              type = 'fence';
            }
          }
          // 2. Lake Hazel (East: cols 42 to 59, rows 22 to 36)
          const distToLake = Math.hypot((c - 51) / 1.35, (r - 29));
          if (distToLake < 7.2) {
            type = 'water';
          }
          // Wooden fishing dock extending into Lake Hazel
          if (r === 29 && c >= 42 && c <= 48) {
            type = 'dock';
          }

          // 3. Cobblestone Pathways:
          // A. Main North-South road (cols 15 to 17, from Grandma's house r=8 down all the way to south exit r=45)
          if ((c >= 15 && c <= 17) && r >= 8 && r < this.farm.rows) {
            type = 'path';
          }
          // B. Homestead terrace path (row 9, cols 12 to 28)
          else if (r === 9 && c >= 12 && c <= 28) {
            type = 'path';
          }
          // C. Central East-West avenue (row 25, cols 8 to 43 connecting to lake dock)
          else if (r === 25 && c >= 8 && c <= 43) {
            type = 'path';
          }
          // D. Southern Countryside Village Road (row 41 & 42, cols 8 to 58)
          else if ((r === 41 || r === 42) && c >= 8 && c <= 58) {
            type = 'path';
          }
          // Secondary exit road avenue leading south to Oakhaven City (cols 27 to 30, rows 42 to 45)
          else if ((c >= 27 && c <= 30) && r >= 42 && r < this.farm.rows) {
            type = 'path';
          }
          // E. Quarry entrance path (col 8, rows 36 to 41)
          else if (c === 8 && r >= 36 && r <= 41) {
            type = 'path';
          }

          // 4. Wooden Farmland Perimeter Fences
          else if (r === 15 && c >= 8 && c <= 36 && c !== 16) {
            type = 'fence';
          }
          else if (r === 35 && c >= 8 && c <= 36 && c !== 16) {
            type = 'fence';
          }
          else if (c === 8 && r >= 15 && r <= 35 && r !== 25) {
            type = 'fence';
          }
          else if (c === 36 && r >= 15 && r <= 35 && r !== 25) {
            type = 'fence';
          }

          this.farm.tiles[r][c] = {
            type: type,
            isTilled: false,
            isWatered: false,
            seed: (r * 37 + c * 19) % 100
          };
        }
      }

      // Pre-till starting patch in Grandma's garden (cols 13 to 15, rows 11 to 13)
      for (let r = 11; r <= 13; r++) {
        for (let c = 13; c <= 15; c++) {
          this.farm.tiles[r][c].isTilled = true;
          this.farm.tiles[r][c].isWatered = true;
        }
      }

      // Pre-plant 2 ready turnips so the player can harvest right away if curious
      this.farm.crops['13,11'] = { type: 'turnip', stage: 3, daysGrown: 2, totalDays: 2 };
      this.farm.crops['14,11'] = { type: 'turnip', stage: 3, daysGrown: 2, totalDays: 2 };

      // Add a starter Sprinkler in the main field at (20, 20)
      this.farm.objects['20,20'] = 'sprinkler';

      // Road Signposts pointing to Oakhaven City at (16, 44) and (28, 43)
      this.farm.objects['16,44'] = 'sign_city';
      this.farm.objects['28,43'] = 'sign_city';

      // Scatter natural debris (trees, rocks, weeds) across the large farm
      for (let r = 2; r < this.farm.rows - 2; r++) {
        for (let c = 2; c < this.farm.cols - 2; c++) {
          const tile = this.farm.tiles[r][c];
          if (tile.type !== 'grass' || tile.isTilled) continue;

          // Avoid cottage/barn/pasture area & cave entrance
          if (r < 15 && c < 39) continue;
          if (c >= 5 && c <= 10 && r >= 34 && r <= 37) continue;

          const rand = Math.random();
          const key = `${c},${r}`;

          // Forest Grove (cols 40 to 60, rows 4 to 20): dense woods
          if (c >= 40 && c <= 60 && r >= 4 && r <= 20) {
            if (rand < 0.22) {
              this.farm.objects[key] = 'tree';
              this.farm.debrisHealth[key] = 3;
            } else if (rand < 0.35) {
              this.farm.objects[key] = 'weed';
            }
          }
          // Rocky Quarry (cols 6 to 20, rows 37 to 43): rich stone deposit
          else if (c >= 6 && c <= 20 && r >= 37 && r <= 43) {
            if (rand < 0.25) {
              this.farm.objects[key] = 'rock';
              this.farm.debrisHealth[key] = 2;
            } else if (rand < 0.35) {
              this.farm.objects[key] = 'weed';
            }
          }
          // Main Farmland (cols 9 to 35, rows 16 to 34): light starter debris
          else if (c >= 9 && c <= 35 && r >= 16 && r <= 34) {
            if (rand < 0.04) {
              this.farm.objects[key] = 'weed';
            } else if (rand < 0.06) {
              this.farm.objects[key] = 'rock';
              this.farm.debrisHealth[key] = 2;
            } else if (rand < 0.08) {
              this.farm.objects[key] = 'tree';
              this.farm.debrisHealth[key] = 3;
            }
          }
          // General countryside
          else {
            if (rand < 0.05) {
              this.farm.objects[key] = 'weed';
            } else if (rand < 0.08) {
              this.farm.objects[key] = 'rock';
              this.farm.debrisHealth[key] = 2;
            } else if (rand < 0.11) {
              this.farm.objects[key] = 'tree';
              this.farm.debrisHealth[key] = 3;
            }
          }
        }
      }

      // Scatter wild forageables & lively butterflies/fireflies on the farm
      this.spawnDailyForage(6);
      this.initAmbientCritters();
    }

    initCityMap() {
      this.city.tiles = [];
      for (let r = 0; r < this.city.rows; r++) {
        this.city.tiles[r] = [];
        for (let c = 0; c < this.city.cols; c++) {
          let type = 'grass';

          // 1. Perimeter walls / fences
          if (r === 0 || c === 0 || c === this.city.cols - 1 || r === this.city.rows - 1) {
            // Leave north gate open for road to farm
            if (!(r === 0 && c >= 22 && c <= 25)) {
              type = 'fence';
            }
          }

          // 2. Central Cobblestone Plaza (cols 16 to 31, rows 11 to 24)
          if (c >= 16 && c <= 31 && r >= 11 && r <= 24) {
            type = 'plaza';
          }
          // 3. North Entrance Boulevard from Farm (cols 22 to 25, rows 0 to 11)
          else if (c >= 22 && c <= 25 && r >= 0 && r <= 11) {
            type = 'path';
          }
          // 4. North Boulevard (rows 9 & 10, cols 4 to 43)
          else if ((r === 9 || r === 10) && c >= 4 && c <= 43) {
            type = 'path';
          }
          // 5. South Boulevard (rows 24 & 25, cols 4 to 43)
          else if ((r === 24 || r === 25) && c >= 4 && c <= 43) {
            type = 'path';
          }
          // 6. West Street (cols 12 & 13, rows 5 to 25)
          else if ((c === 12 || c === 13) && r >= 5 && r <= 25) {
            type = 'path';
          }
          // 7. East Street (cols 34 & 35, rows 5 to 25)
          else if ((c === 34 || c === 35) && r >= 5 && r <= 25) {
            type = 'path';
          }
          // 8. Southern River / Canal (rows 30 to 33)
          else if (r >= 30 && r <= 33) {
            type = 'water';
          }

          // 9. Stone Arched Bridge over the canal (cols 22 to 25, rows 30 to 33)
          if (c >= 22 && c <= 25 && r >= 30 && r <= 33) {
            type = 'dock';
          }
          // Walkway connecting plaza to canal bridge (cols 22 to 25, rows 25 to 29)
          else if (c >= 22 && c <= 25 && r >= 25 && r <= 29) {
            type = 'path';
          }

          this.city.tiles[r][c] = {
            type: type,
            isTilled: false,
            isWatered: false,
            seed: (r * 31 + c * 17) % 100
          };
        }
      }

      // City interactive objects & decorations
      this.city.objects['22,16'] = 'fountain'; // Central stone fountain (spans 4x4)
      this.city.objects['20,15'] = 'notice_board'; // Community Notice Board
      this.city.objects['24,2'] = 'sign_farm'; // Signpost to Grandma's Farm

      // Street Lamps (warm gas lamps)
      const lampCoords = [
        [17, 12], [30, 12], [17, 23], [30, 23],
        [21, 5], [26, 5], [21, 28], [26, 28],
        [5, 10], [42, 10], [5, 24], [42, 24]
      ];
      lampCoords.forEach(([lx, ly]) => {
        this.city.objects[`${lx},${ly}`] = 'lamp';
      });

      // City Park Benches
      const benchCoords = [
        [18, 18], [29, 18], [18, 14], [29, 14],
        [21, 27], [26, 27]
      ];
      benchCoords.forEach(([bx, by]) => {
        this.city.objects[`${bx},${by}`] = 'bench';
      });

      // Decorative Town Flowerbeds (flanking Chapel, Library & Boulevard gardens)
      const flowerCoords = [
        [15, 8], [20, 8], [27, 8], [32, 8],
        [4, 13], [5, 13], [4, 15], [5, 15],
        [42, 13], [43, 13], [42, 15], [43, 15]
      ];
      flowerCoords.forEach(([fx, fy]) => {
        this.city.objects[`${fx},${fy}`] = 'flower_bed';
      });
    }

    isInteriorLocation(loc) {
      return typeof loc === 'string' && loc.startsWith('interior_');
    }

    createInteriorTiles(cols = 18, rows = 14) {
      const tiles = [];
      for (let r = 0; r < rows; r++) {
        tiles[r] = [];
        for (let c = 0; c < cols; c++) {
          tiles[r][c] = {
            type: 'wood_floor',
            isTilled: false,
            isWatered: false,
            seed: (r * 19 + c * 13) % 100
          };
        }
      }
      return tiles;
    }

    exitCurrentInterior() {
      this.player.inBed = false;
      if (this.currentLocation === 'interior_cottage') {
        this.transitionTo('farm', 15 * TILE_SIZE, 9.2 * TILE_SIZE);
      } else if (this.currentLocation === 'interior_store') {
        this.transitionTo('city', 8.5 * TILE_SIZE, 9.5 * TILE_SIZE);
      } else if (this.currentLocation === 'interior_church') {
        this.transitionTo('city', 17.5 * TILE_SIZE, 9.2 * TILE_SIZE);
      } else if (this.currentLocation === 'interior_library') {
        this.transitionTo('city', 29.5 * TILE_SIZE, 9.2 * TILE_SIZE);
      } else if (this.currentLocation === 'interior_bakery') {
        this.transitionTo('city', 36.5 * TILE_SIZE, 9.5 * TILE_SIZE);
      } else if (this.currentLocation === 'interior_blacksmith') {
        this.transitionTo('city', 8.5 * TILE_SIZE, 23.5 * TILE_SIZE);
      } else if (this.currentLocation === 'interior_townhall') {
        this.transitionTo('city', 36.5 * TILE_SIZE, 23.5 * TILE_SIZE);
      } else if (this.currentLocation === 'interior_cave') {
        this.transitionTo('farm', 7 * TILE_SIZE, 37.5 * TILE_SIZE);
      } else {
        this.transitionTo('farm');
      }
    }

    switchLocation(loc) {
      if (this.activeLocation && this.activeLocation !== loc) {
        if (this.activeLocation === 'farm') {
          this.farm.tiles = this.tiles;
          this.farm.crops = this.crops;
          this.farm.objects = this.objects;
          this.farm.debrisHealth = this.debrisHealth;
        } else if (this.activeLocation === 'city') {
          this.city.tiles = this.tiles;
          this.city.objects = this.objects;
        }
      }

      this.currentLocation = loc;
      this.activeLocation = loc;
      if (loc !== 'interior_cottage') {
        this.player.inBed = false;
      }

      if (loc === 'farm') {
        if (!this.farm.tiles || this.farm.tiles.length === 0) {
          this.initFarmMap();
        }
        this.mapCols = this.farm.cols;
        this.mapRows = this.farm.rows;
        this.tiles = this.farm.tiles;
        this.crops = this.farm.crops;
        this.objects = this.farm.objects;
        this.debrisHealth = this.farm.debrisHealth;
      } else if (loc === 'city') {
        if (!this.city.tiles || this.city.tiles.length === 0) {
          this.initCityMap();
        }
        this.mapCols = this.city.cols;
        this.mapRows = this.city.rows;
        this.tiles = this.city.tiles;
        this.crops = {};
        this.objects = this.city.objects;
        this.debrisHealth = {};
      } else if (this.isInteriorLocation(loc)) {
        this.mapCols = 18;
        this.mapRows = 14;
        this.tiles = this.createInteriorTiles(18, 14);
        this.crops = {};
        this.objects = {};
        this.debrisHealth = {};
        if (loc === 'interior_cave' && (!this.caveNodes || Object.keys(this.caveNodes).length === 0)) {
          this.populateCaveNodes();
        }
      }

      this.worldWidth = this.mapCols * TILE_SIZE;
      this.worldHeight = this.mapRows * TILE_SIZE;

      const locBadge = document.getElementById('hudLocation');
      const travelBtnText = document.getElementById('btnTravelText');
      const locNames = {
        farm: "Grandma's Farm",
        city: "Oakhaven City",
        interior_cottage: "Farmhouse Cottage",
        interior_store: "General Store",
        interior_church: "Oakhaven Chapel",
        interior_library: "Town Library",
        interior_bakery: "Hazelwood Bakery",
        interior_blacksmith: "Blacksmith Forge",
        interior_townhall: "Oakhaven City Hall",
        interior_cave: "Quarry Cavern"
      };
      if (locBadge) {
        locBadge.textContent = locNames[loc] || "Grandma's Farm";
      }
      if (travelBtnText) {
        if (this.isInteriorLocation(loc)) {
          travelBtnText.textContent = "Step Outside";
        } else {
          travelBtnText.textContent = loc === 'farm' ? "Visit City" : "Return to Farm";
        }
      }
    }

    transitionTo(targetLoc, spawnX, spawnY) {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      this.transitionAlpha = 1.0;
      this.player.inBed = false;

      window.soundSystem?.playDialogue();

      setTimeout(() => {
        this.switchLocation(targetLoc);

        if (spawnX !== undefined && spawnY !== undefined) {
          this.player.x = spawnX;
          this.player.y = spawnY;
          if (this.isInteriorLocation(targetLoc)) {
            this.player.dir = 1; // face up into the room when entering
          }
        } else {
          if (targetLoc === 'city') {
            this.player.x = 23.5 * TILE_SIZE;
            this.player.y = 3 * TILE_SIZE;
            this.player.dir = 0; // facing down
          } else if (this.isInteriorLocation(targetLoc)) {
            this.player.x = 8.5 * TILE_SIZE;
            this.player.y = 10.8 * TILE_SIZE;
            this.player.dir = 1; // facing up
          } else {
            this.player.x = 29 * TILE_SIZE;
            this.player.y = 42 * TILE_SIZE;
            this.player.dir = 1; // facing up
          }
        }

        this.player.targetPos = null;
        if (this.worldWidth <= this.canvas.width) {
          this.camera.x = -(this.canvas.width - this.worldWidth) / 2;
        } else {
          this.camera.x = this.player.x + TILE_SIZE / 2 - this.canvas.width / 2;
          this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldWidth - this.canvas.width));
        }

        if (this.worldHeight <= this.canvas.height) {
          this.camera.y = -(this.canvas.height - this.worldHeight) / 2;
        } else {
          this.camera.y = this.player.y + TILE_SIZE / 2 - this.canvas.height / 2;
          this.camera.y = Math.max(0, Math.min(this.camera.y, this.worldHeight - this.canvas.height));
        }

        if (targetLoc === 'city') {
          this.showToast('Arrived at Oakhaven City! Walk up to any shop door to go inside.');
        } else if (targetLoc === 'interior_cottage') {
          this.showToast('Welcome inside your Farmhouse Cottage! Walk to your bed on the right to lie down and sleep.');
        } else if (targetLoc === 'interior_store') {
          this.showToast('Entered Oakhaven General Store! Speak with Penny at the counter.');
        } else if (targetLoc === 'interior_church') {
          this.showToast('Entered Oakhaven Chapel! Speak with Pastor Thomas by the altar.');
        } else if (targetLoc === 'interior_library') {
          this.showToast('Entered Oakhaven Library! Speak with Maeve to view the Almanac.');
        } else if (targetLoc === 'interior_bakery') {
          this.showToast('Entered Hazelwood Bakery & Cafe! Speak with Nora at the counter for warm pastries.');
        } else if (targetLoc === 'interior_blacksmith') {
          this.showToast('Entered Garth’s Blacksmith Forge! Speak with Garth at the counter to upgrade your tools.');
        } else if (targetLoc === 'interior_townhall') {
          this.showToast('Entered Oakhaven City Hall! Speak with Mayor Clara at the front desk.');
        } else {
          this.showToast('Stepped outside onto Grandma’s Homestead!');
        }
      }, 200);
    }

    // --- Input Binding ---
    bindInputs() {
      // Gamepad connection events
      window.addEventListener('gamepadconnected', (e) => {
        this.gamepadConnected = true;
        this.setInputMode('gamepad');
        const gpName = e.gamepad ? (e.gamepad.id || 'Xbox Controller') : 'Xbox Controller';
        this.showToast(`Controller Connected: ${gpName.substring(0, 28)}! Controls active.`);
        this.rumble(60, 0.3, 0.5);
        this.updateGamepadBadge(true);
      });

      window.addEventListener('gamepaddisconnected', () => {
        this.gamepadConnected = false;
        this.showToast('Controller Disconnected.');
        this.updateGamepadBadge(false);
      });

      // Keyboard input
      window.addEventListener('keydown', (e) => {
        this.lastInputSource = 'keyboard';
        this.keys[e.key.toLowerCase()] = true;

        // Number keys 1-8 for hotbar
        if (e.key >= '1' && e.key <= '8') {
          const slot = parseInt(e.key) - 1;
          if (slot < this.inventory.length) {
            this.selectHotbarSlot(slot);
          }
        }

        // 'E' or Space to interact / use tool
        if (e.key.toLowerCase() === 'e' || e.key === ' ') {
          this.interactFacingTile();
        }

        // 'T' for Tutorial
        if (e.key.toLowerCase() === 't') {
          this.openTutorialModal();
        }
        // 'I' for Full Inventory / Backpack
        if (e.key.toLowerCase() === 'i') {
          this.toggleInventoryModal();
        }
        // 'B' or 'P' for Shop (Boutique/Peddler) - NOT 'S' which is reserved for downward movement
        if (e.key.toLowerCase() === 'b' || e.key.toLowerCase() === 'p') {
          this.openShopModal();
        }
        // Escape closes any active modal or pulls in active fishing line
        if (e.key === 'Escape') {
          if (this.fishing) {
            this.fishing = null;
            this.player.toolAction = null;
            this.showToast('Pulled in your fishing line.');
          }
          document.querySelectorAll('.game-modal').forEach(m => m.classList.remove('active'));
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.key.toLowerCase()] = false;
      });

      // Precise Mouse Tracking with resolution scaling
      const updateMouse = (e) => {
        this.lastInputSource = 'mouse';
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width ? (this.canvas.width / rect.width) : 1;
        const scaleY = rect.height ? (this.canvas.height / rect.height) : 1;
        this.mouse.screenX = (e.clientX - rect.left) * scaleX;
        this.mouse.screenY = (e.clientY - rect.top) * scaleY;
        this.updateMouseWorld();
      };

      this.canvas.addEventListener('mousemove', updateMouse);

      this.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // Left click
          this.mouse.isDown = true;
          updateMouse(e);
          this.handleCanvasClick(this.mouse.tileX, this.mouse.tileY);
        }
      });

      this.canvas.addEventListener('mouseup', () => {
        this.mouse.isDown = false;
      });

      // Touch controls for mobile / tablets
      
      // Mobile Virtual Joystick & Use Button
      const joyWrap = document.getElementById('farmJoystick');
      const joyKnob = document.getElementById('farmJoyKnob');
      if (joyWrap && joyKnob) {
        let joyTouchId = null;
        let startX = 0;
        let startY = 0;

        joyWrap.addEventListener('touchstart', (e) => {
          this.setInputMode('touch');
          if (joyTouchId !== null) return;
          const t = e.changedTouches[0];
          joyTouchId = t.identifier;
          const rect = joyWrap.getBoundingClientRect();
          startX = rect.left + rect.width / 2;
          startY = rect.top + rect.height / 2;
          if (e.cancelable) e.preventDefault();
        }, { passive: false });

        const onJoyMove = (e) => {
          if (joyTouchId === null) return;
          for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === joyTouchId) {
              const dx = t.clientX - startX;
              const dy = t.clientY - startY;
              const distVal = Math.hypot(dx, dy);
              const maxR = 36;
              if (distVal > 0) {
                const clamped = Math.min(distVal, maxR);
                this.touchMoveX = (dx / distVal) * (clamped / maxR);
                this.touchMoveY = (dy / distVal) * (clamped / maxR);
                joyKnob.style.transform = `translate(${this.touchMoveX * maxR}px, ${this.touchMoveY * maxR}px)`;
              }
              if (e.cancelable) e.preventDefault();
              break;
            }
          }
        };

        const onJoyEnd = (e) => {
          if (joyTouchId === null) return;
          for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            if (t.identifier === joyTouchId) {
              joyTouchId = null;
              this.touchMoveX = 0;
              this.touchMoveY = 0;
              joyKnob.style.transform = 'translate(0px, 0px)';
              if (e.cancelable) e.preventDefault();
              break;
            }
          }
        };

        window.addEventListener('touchmove', onJoyMove, { passive: false });
        window.addEventListener('touchend', onJoyEnd, { passive: false });
        window.addEventListener('touchcancel', onJoyEnd, { passive: false });
      }

      const btnMobileUse = document.getElementById('btnMobileUse');
      if (btnMobileUse) {
        btnMobileUse.addEventListener('click', (e) => {
          e.preventDefault();
          this.interactFacingTile();
        });
        btnMobileUse.addEventListener('touchstart', (e) => {
          if (e.cancelable) e.preventDefault();
          this.interactFacingTile();
        }, { passive: false });
      }

      this.canvas.addEventListener('touchstart', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = rect.width ? (this.canvas.width / rect.width) : 1;
        const scaleY = rect.height ? (this.canvas.height / rect.height) : 1;
        this.mouse.screenX = (touch.clientX - rect.left) * scaleX;
        this.mouse.screenY = (touch.clientY - rect.top) * scaleY;
        this.updateMouseWorld();
        this.handleCanvasClick(this.mouse.tileX, this.mouse.tileY);
      }, { passive: true });

      // Audio start on first gesture
      const startAudio = () => {
        if (window.soundSystem) {
          window.soundSystem.init();
          if (!window.soundSystem.isMuted) {
            window.soundSystem.startMusic();
          }
        }
      };
      window.addEventListener('click', startAudio, { once: true });
      window.addEventListener('keydown', startAudio, { once: true });

      // HUD Button click handlers
      document.getElementById('btnInventory')?.addEventListener('click', () => this.toggleInventoryModal());
      document.getElementById('btnOpenBackpack')?.addEventListener('click', () => this.toggleInventoryModal());
      document.getElementById('btnShop')?.addEventListener('click', () => this.openShopModal());
      document.getElementById('btnTutorial')?.addEventListener('click', () => this.openTutorialModal());
      document.getElementById('btnGrandma')?.addEventListener('click', () => this.talkToGrandma());
      document.getElementById('btnSleep')?.addEventListener('click', () => this.sleepAndAdvanceDay());
      document.getElementById('btnAudio')?.addEventListener('click', () => this.toggleAudio());
      document.getElementById('btnHelpGuide')?.addEventListener('click', () => this.openHelpGuideModal());
      document.getElementById('btnTravel')?.addEventListener('click', () => {
        if (this.isInteriorLocation(this.currentLocation)) {
          this.exitCurrentInterior();
        } else if (this.currentLocation === 'farm') {
          this.transitionTo('city');
        } else {
          this.transitionTo('farm');
        }
      });

      // Inventory Filter Tabs
      document.querySelectorAll('#invFilterTabs .shop-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tab = btn.getAttribute('data-inv-tab') || 'all';
          this.renderInventory(tab);
        });
      });

      // Modal close handlers
      document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.game-modal').forEach(m => m.classList.remove('active'));
        });
      });

      // Click outside modal backdrop to close
      document.querySelectorAll('.game-modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.classList.remove('active');
          }
        });
      });
      // Auto-resize observer
      if (window.ResizeObserver) {
        const container = document.getElementById('canvasContainer');
        if (container) {
          new ResizeObserver(() => this.resizeCanvas()).observe(container);
        }
      }
    }

    updateMouseWorld() {
      const screenX = this.mouse.screenX !== undefined ? this.mouse.screenX : 0;
      const screenY = this.mouse.screenY !== undefined ? this.mouse.screenY : 0;
      this.mouse.worldX = screenX + this.camera.x;
      this.mouse.worldY = screenY + this.camera.y;
      this.mouse.tileX = Math.floor(this.mouse.worldX / TILE_SIZE);
      this.mouse.tileY = Math.floor(this.mouse.worldY / TILE_SIZE);
    }

    resizeCanvas() {
      const container = document.getElementById('canvasContainer');
      if (container) {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.canvas.width = Math.round(rect.width);
          this.canvas.height = Math.round(rect.height);
          this.ctx.imageSmoothingEnabled = false;
          this.updateMouseWorld();
        }
      }
    }

    setInputMode(mode) {
      this.lastInputSource = mode;
      if (typeof document !== 'undefined' && document.body && document.body.classList) {
        document.body.classList.remove('input-gamepad', 'input-touch', 'input-keyboard');
        document.body.classList.add(`input-${mode}`);
      }
    }

    // --- Xbox Controller & HTML5 Gamepad Polling ---
    pollGamepad(dt) {
      if (!navigator.getGamepads) return;
      let gamepads;
      try {
        gamepads = navigator.getGamepads();
      } catch (e) {
        return;
      }
      if (!gamepads) return;

      let gp = null;
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i] && gamepads[i].connected) {
          gp = gamepads[i];
          break;
        }
      }

      if (!gp) {
        if (this.gamepadConnected) {
          this.gamepadConnected = false;
          this.updateGamepadBadge(false);
        }
        this.gamepadMoveX = 0;
        this.gamepadMoveY = 0;
        return;
      }

      if (!this.gamepadConnected) {
        this.gamepadConnected = true;
        this.setInputMode('gamepad');
        this.updateGamepadBadge(true);
      }

      // Helper for debounced button press
      const isJustPressed = (btnIdx) => {
        const btn = gp.buttons[btnIdx];
        const isDown = btn && (btn.pressed || btn.value > 0.5);
        const wasDown = !!this.prevGamepadButtons[btnIdx];
        return isDown && !wasDown;
      };

      // Left Thumbstick (Axes 0, 1) + D-Pad (12=Up, 13=Down, 14=Left, 15=Right)
      let lx = gp.axes[0] || 0;
      let ly = gp.axes[1] || 0;
      if (gp.buttons[12] && (gp.buttons[12].pressed || gp.buttons[12].value > 0.5)) ly = -1;
      if (gp.buttons[13] && (gp.buttons[13].pressed || gp.buttons[13].value > 0.5)) ly = 1;
      if (gp.buttons[14] && (gp.buttons[14].pressed || gp.buttons[14].value > 0.5)) lx = -1;
      if (gp.buttons[15] && (gp.buttons[15].pressed || gp.buttons[15].value > 0.5)) lx = 1;

      if (Math.hypot(lx, ly) > 0.25 || gp.buttons.some(b => b && (b.pressed || b.value > 0.5))) {
        this.setInputMode('gamepad');
      }

      // Check if any modal is currently visible/active
      const activeModal = document.querySelector('.game-modal.active');

      if (activeModal) {
        // When modal is open: Left Stick or D-Pad navigates interactive buttons inside the modal
        this.gamepadMoveX = 0;
        this.gamepadMoveY = 0;

        const buttons = Array.from(activeModal.querySelectorAll('button:not([disabled]):not(.modal-close-btn)'))
          .filter(b => b.offsetParent !== null);
        if (this.modalNavCooldown > 0) this.modalNavCooldown -= dt;

        if (buttons.length > 0 && this.modalNavCooldown <= 0) {
          let move = 0;
          if (ly > 0.45 || lx > 0.45 || isJustPressed(13) || isJustPressed(15)) move = 1;
          else if (ly < -0.45 || lx < -0.45 || isJustPressed(12) || isJustPressed(14)) move = -1;
          if (move !== 0) {
            this.modalFocusIdx = (this.modalFocusIdx + move + buttons.length) % buttons.length;
            this.modalNavCooldown = 0.18;
            this.rumble(20, 0.15, 0.08);
          }
        }
        buttons.forEach((b, i) => {
          if (i === (this.modalFocusIdx % Math.max(1, buttons.length))) {
            b.classList.add('gp-focus');
            if (b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          } else {
            b.classList.remove('gp-focus');
          }
        });

        const scrollTarget = activeModal.querySelector('.modal-body') ||
                             activeModal.querySelector('#inventoryGrid') ||
                             activeModal.querySelector('#shopContent') ||
                             activeModal.querySelector('.modal-card') ||
                             activeModal;
        if (scrollTarget && buttons.length === 0) {
          if (ly < -0.35) {
            scrollTarget.scrollTop -= 14;
          } else if (ly > 0.35) {
            scrollTarget.scrollTop += 14;
          }
        }

        // LB (4) / RB (5): Switch tabs inside active modal
        if (isJustPressed(4) || isJustPressed(5)) {
          this.setInputMode('gamepad');
          // Check if in Shop modal
          if (activeModal.id === 'shopModal') {
            const btnBuy = document.getElementById('tabBtnBuy');
            const btnSell = document.getElementById('tabBtnSell');
            if (btnBuy && btnSell) {
              if (btnBuy.classList.contains('active')) btnSell.click();
              else btnBuy.click();
              this.rumble(25, 0.2, 0.1);
            }
          }
          // Check if in Inventory modal
          else if (activeModal.id === 'inventoryModal') {
            const tabs = Array.from(document.querySelectorAll('#invFilterTabs .shop-tab-btn'));
            if (tabs.length > 0) {
              const currentActiveIdx = tabs.findIndex(t => t.classList.contains('active'));
              const dir = isJustPressed(5) ? 1 : -1;
              const nextIdx = (currentActiveIdx + dir + tabs.length) % tabs.length;
              tabs[nextIdx].click();
              this.rumble(25, 0.2, 0.1);
            }
          }
        }

        // Button A (0): Confirm focused modal button (or fallback primary action)
        if (isJustPressed(0)) {
          this.setInputMode('gamepad');
          const focusedBtn = buttons[this.modalFocusIdx % Math.max(1, buttons.length)];
          if (focusedBtn) {
            focusedBtn.click();
            this.rumble(30, 0.2, 0.2);
          } else if (activeModal.id === 'sleepModal') {
            this.sleepAndAdvanceDay();
            activeModal.classList.remove('active');
            this.rumble(70, 0.4, 0.6);
          } else if (activeModal.id === 'summaryModal' || activeModal.id === 'dialogueModal' || activeModal.id === 'cityNpcModal') {
            activeModal.classList.remove('active');
            this.rumble(25, 0.2, 0.1);
          } else {
            const primaryBtn = activeModal.querySelector('.btn-primary') ||
                               activeModal.querySelector('.modal-actions button') ||
                               activeModal.querySelector('.modal-close-btn');
            if (primaryBtn) {
              primaryBtn.click();
              this.rumble(30, 0.2, 0.2);
            }
          }
        }

        // Button B (1): Dismiss / Close Modal
        if (isJustPressed(1)) {
          this.setInputMode('gamepad');
          activeModal.querySelectorAll('.gp-focus').forEach(el => el.classList.remove('gp-focus'));
          activeModal.classList.remove('active');
          this.rumble(25, 0.2, 0.1);
        }

      } else {
        // --- Normal In-Game Exploration & Farming ---
        const rawMag = Math.hypot(lx, ly);
        const DEADZONE = 0.16;
        if (rawMag > DEADZONE) {
          this.lastInputSource = 'gamepad';
          const normMag = Math.min(1.0, (rawMag - DEADZONE) / (0.94 - DEADZONE));
          this.gamepadMoveX = (lx / rawMag) * normMag;
          this.gamepadMoveY = (ly / rawMag) * normMag;
        } else {
          this.gamepadMoveX = 0;
          this.gamepadMoveY = 0;
        }

        // Right Thumbstick (Axes 2, 3) for optional aim / facing override
        let rx = gp.axes[2] || 0;
        let ry = gp.axes[3] || 0;
        const rightMag = Math.hypot(rx, ry);
        if (rightMag > 0.45) {
          this.lastInputSource = 'gamepad';
          if (Math.abs(rx) > Math.abs(ry)) {
            this.player.dir = rx > 0 ? 3 : 2;
          } else {
            this.player.dir = ry > 0 ? 0 : 1;
          }
        }

        // Button A (0) & Right Trigger (7): Primary Action / Use Active Tool / Interact
        if (isJustPressed(0) || isJustPressed(7)) {
          this.lastInputSource = 'gamepad';
          if (window.soundSystem) {
            window.soundSystem.init();
            if (!window.soundSystem.isMuted) window.soundSystem.startMusic();
          }
          this.interactFacingTile();
        }

        // Button X (2): Quick Eat Food / Energy Restore
        if (isJustPressed(2)) {
          this.lastInputSource = 'gamepad';
          this.quickEatFood();
        }

        // Button Y (3): Open Full Backpack / Inventory
        if (isJustPressed(3)) {
          this.lastInputSource = 'gamepad';
          this.toggleInventoryModal();
          this.rumble(30, 0.2, 0.2);
        }

        // LB (4): Previous Hotbar Slot
        if (isJustPressed(4)) {
          this.lastInputSource = 'gamepad';
          this.cycleHotbar(-1);
        }

        // RB (5): Next Hotbar Slot
        if (isJustPressed(5)) {
          this.lastInputSource = 'gamepad';
          this.cycleHotbar(1);
        }

        // Button B (1): Quick Cancel or clear navigation target
        if (isJustPressed(1)) {
          this.lastInputSource = 'gamepad';
          this.player.targetPos = null;
        }

        // Left Trigger LT (6): Travel between Farm and City
        if (isJustPressed(6)) {
          this.lastInputSource = 'gamepad';
          if (this.currentLocation === 'farm') {
            this.transitionTo('city');
          } else {
            this.transitionTo('farm');
          }
          this.rumble(50, 0.3, 0.4);
        }

        // Start / Menu (9): Toggle Field Guide & Almanac
        if (isJustPressed(9)) {
          this.lastInputSource = 'gamepad';
          const guideModal = document.getElementById('helpGuideModal');
          if (guideModal && guideModal.classList.contains('active')) {
            guideModal.classList.remove('active');
          } else {
            this.openHelpGuideModal();
          }
          this.rumble(30, 0.2, 0.2);
        }

        // View / Back (8): Toggle Tutorial & Quests Modal
        if (isJustPressed(8)) {
          this.lastInputSource = 'gamepad';
          const tutModal = document.getElementById('tutorialModal');
          if (tutModal && tutModal.classList.contains('active')) {
            tutModal.classList.remove('active');
          } else {
            this.openTutorialModal();
          }
          this.rumble(30, 0.2, 0.2);
        }
      }

      // Record button states for debounce
      for (let i = 0; i < 17; i++) {
        this.prevGamepadButtons[i] = gp.buttons[i] ? (gp.buttons[i].pressed || gp.buttons[i].value > 0.5) : false;
      }
    }

    cycleHotbar(direction) {
      const maxSlots = Math.min(8, Math.max(1, this.inventory.length));
      let nextSlot = (this.activeSlot + direction) % maxSlots;
      if (nextSlot < 0) nextSlot += maxSlots;
      this.selectHotbarSlot(nextSlot);
      window.soundSystem?.playDialogue();
      this.rumble(20, 0.15, 0.1);
    }

    quickEatFood() {
      // 1. Check if current equipped slot is food
      const activeItem = this.inventory[this.activeSlot];
      if (activeItem && activeItem.type === 'food') {
        this.consumeFoodItem(this.activeSlot);
        this.rumble(45, 0.3, 0.4);
        return;
      }

      // 2. Otherwise search entire backpack for any food
      const foodIdx = this.inventory.findIndex(it => it.type === 'food');
      if (foodIdx !== -1) {
        this.consumeFoodItem(foodIdx);
        this.rumble(45, 0.3, 0.4);
      } else {
        this.showToast('No food in backpack! Buy tasty tarts & bread at Hazelwood Bakery.');
        this.rumble(20, 0.15, 0.1);
      }
    }

    rumble(duration = 50, weak = 0.25, strong = 0.35) {
      if (!navigator.getGamepads) return;
      try {
        const gamepads = navigator.getGamepads();
        if (!gamepads) return;
        for (let i = 0; i < gamepads.length; i++) {
          const gp = gamepads[i];
          if (gp && gp.connected && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
            gp.vibrationActuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration: duration,
              weakMagnitude: Math.min(1, Math.max(0, weak)),
              strongMagnitude: Math.min(1, Math.max(0, strong))
            }).catch(() => {});
          }
        }
      } catch (err) {
        // Silently ignore if haptics unsupported
      }
    }

    updateGamepadBadge(isConnected) {
      const badge = document.getElementById('gamepadBadge');
      if (badge) {
        if (isConnected) {
          badge.classList.add('active');
          badge.setAttribute('title', 'Xbox Controller Connected & Ready');
        } else {
          badge.classList.remove('active');
          badge.setAttribute('title', 'Connect an Xbox Controller to play with gamepad');
        }
      }
    }

    // --- Game Loop ---
    loop(currentTime) {
      const dt = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      this.update(dt);
      this.render(currentTime);

      requestAnimationFrame((t) => this.loop(t));
    }

    // --- Update Logic ---
    update(dt) {
      // 1. Advance Time
      this.timeMinutes += dt * 6 * this.timeScale;
      if (this.timeMinutes >= 24 * 60) {
        // Automatically pass out at 2:00 AM if still awake!
        this.showToast('You passed out from exhaustion! Grandma carried you to bed.');
        this.sleepAndAdvanceDay();
      }

      // Poll Xbox / HTML5 Gamepad
      this.pollGamepad(dt);

      // 2. Player Movement
      let dx = 0;
      let dy = 0;
      if (this.keys['w'] || this.keys['arrowup']) { dy -= 1; this.player.dir = 1; }
      if (this.keys['s'] || this.keys['arrowdown']) { dy += 1; this.player.dir = 0; }
      if (this.keys['a'] || this.keys['arrowleft']) { dx -= 1; this.player.dir = 2; }
      if (this.keys['d'] || this.keys['arrowright']) { dx += 1; this.player.dir = 3; }

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const isKeyboardMoving = (dx !== 0 || dy !== 0);
      const isTouchMoving = (this.touchMoveX !== 0 || this.touchMoveY !== 0);
      let isGamepadMoving = false;
      let moveSpeed = this.player.speed;

      if (isKeyboardMoving) {
        this.player.targetPos = null; // Keyboard cancels click navigation
        this.lastInputSource = 'keyboard';
      } else if (this.gamepadMoveX !== 0 || this.gamepadMoveY !== 0) {
        isGamepadMoving = true;
        const mag = Math.hypot(this.gamepadMoveX, this.gamepadMoveY);
        dx = this.gamepadMoveX;
        dy = this.gamepadMoveY;
        moveSpeed = this.player.speed * Math.min(1.0, mag);
        this.player.targetPos = null;
        this.lastInputSource = 'gamepad';

        if (Math.abs(dx) > Math.abs(dy)) {
          this.player.dir = dx > 0 ? 3 : 2;
        } else {
          this.player.dir = dy > 0 ? 0 : 1;
        }

        if (mag > 0.001) {
          dx /= mag;
          dy /= mag;
        }
      } else if (isTouchMoving) {
        const mag = Math.hypot(this.touchMoveX, this.touchMoveY);
        dx = this.touchMoveX;
        dy = this.touchMoveY;
        moveSpeed = this.player.speed * Math.min(1.0, mag);
        this.player.targetPos = null;
        this.lastInputSource = 'touch';

        if (Math.abs(dx) > Math.abs(dy)) {
          this.player.dir = dx > 0 ? 3 : 2;
        } else {
          this.player.dir = dy > 0 ? 0 : 1;
        }

        if (mag > 0.001) {
          dx /= mag;
          dy /= mag;
        }
      }

      let isMoving = isKeyboardMoving || isGamepadMoving || isTouchMoving;

      if (!isKeyboardMoving && !isGamepadMoving && !isTouchMoving && this.player.targetPos) {
        const tdx = this.player.targetPos.x - this.player.x;
        const tdy = this.player.targetPos.y - this.player.y;
        const tdist = Math.hypot(tdx, tdy);
        if (tdist > 4) {
          dx = (tdx / tdist);
          dy = (tdy / tdist);
          if (Math.abs(tdx) > Math.abs(tdy)) {
            this.player.dir = tdx > 0 ? 3 : 2;
          } else {
            this.player.dir = tdy > 0 ? 0 : 1;
          }
          isMoving = true;
        } else {
          this.player.targetPos = null;
        }
      }

      // Moving manually cancels an active fishing cast cleanly
      if (this.fishing && (isKeyboardMoving || isGamepadMoving || isTouchMoving)) {
        this.fishing = null;
        this.player.toolAction = null;
        this.showToast('Pulled in your fishing line.');
      }

      this.player.isMoving = isMoving;

      // If player is tucked in bed and presses movement keys/stick, step out of bed!
      if (this.player.inBed && (isKeyboardMoving || isGamepadMoving || isTouchMoving)) {
        this.player.inBed = false;
        this.player.x = 11.8 * TILE_SIZE;
        this.player.y = 4.8 * TILE_SIZE;
        this.player.dir = 0;
        document.getElementById('sleepModal')?.classList.remove('active');
      }

      if (isMoving && !this.player.inBed) {
        const nextX = this.player.x + dx * moveSpeed;
        const nextY = this.player.y + dy * moveSpeed;

        let moved = false;
        // Collision check
        if (!this.checkCollision(nextX, this.player.y)) {
          this.player.x = nextX;
          moved = true;
        }
        if (!this.checkCollision(this.player.x, nextY)) {
          this.player.y = nextY;
          moved = true;
        }

        if (!moved && this.player.targetPos) {
          this.player.targetPos = null; // Stopped by obstacle
        }

        this.player.walkFrame += dt * 15 * (moveSpeed / this.player.speed);
        // Periodic footstep audio
        if (Math.floor(this.player.walkFrame) % 6 === 0) {
          window.soundSystem?.playFootstep();
        }
      }

      // Tool animation cooldown timer
      if (this.player.toolTimer > 0 && !this.fishing) {
        this.player.toolTimer -= dt;
        if (this.player.toolTimer <= 0) {
          this.player.toolAction = null;
        }
      }

      // Update fishing minigame, ambient butterflies/fireflies, farm animals, and scheduled town NPCs
      this.updateFishing(dt);
      this.updateAmbientCritters(dt);
      this.updateFarmAnimals(dt);
      this.updateCityNPCs(dt);

      // 3. Camera smoothly follows player (or centers interior room if smaller than viewport)
      if (this.worldWidth <= this.canvas.width) {
        this.camera.x = -(this.canvas.width - this.worldWidth) / 2;
      } else {
        const targetCamX = this.player.x + TILE_SIZE / 2 - this.canvas.width / 2;
        this.camera.x += (targetCamX - this.camera.x) * 0.1;
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldWidth - this.canvas.width));
      }

      if (this.worldHeight <= this.canvas.height) {
        this.camera.y = -(this.canvas.height - this.worldHeight) / 2;
      } else {
        const targetCamY = this.player.y + TILE_SIZE / 2 - this.canvas.height / 2;
        this.camera.y += (targetCamY - this.camera.y) * 0.1;
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.worldHeight - this.canvas.height));
      }

      // Keep hovered tile synchronized with live camera
      this.updateMouseWorld();

      // 4. Update Particles & Floating Text
      this.updateParticles(dt);

      // 5. Update HUD time display
      this.updateHUDClock();

      // 6. Fade Out Transition Overlay
      if (this.transitionAlpha > 0) {
        this.transitionAlpha = Math.max(0, this.transitionAlpha - dt * 2.5);
        if (this.transitionAlpha === 0) {
          this.isTransitioning = false;
        }
      }

      // 7. World Travel Boundary Triggers
      if (!this.isTransitioning) {
        if (this.currentLocation === 'farm') {
          // Walking out southern road gates (cols 14 to 34, row 44.5+) into Oakhaven City
          if (this.player.y >= (this.farm.rows - 1.4) * TILE_SIZE && this.player.x >= 14 * TILE_SIZE && this.player.x <= 34 * TILE_SIZE) {
            this.transitionTo('city', 23.5 * TILE_SIZE, 3 * TILE_SIZE);
          }
        } else if (this.currentLocation === 'city') {
          // Walking out northern road gate back to Grandma's Farm
          if (this.player.y <= 1.2 * TILE_SIZE && this.player.x >= 20 * TILE_SIZE && this.player.x <= 27 * TILE_SIZE) {
            this.transitionTo('farm', 16 * TILE_SIZE, 42 * TILE_SIZE);
          }
        } else if (this.isInteriorLocation(this.currentLocation)) {
          // Stepping onto the South Exit Mat (cols 7 to 10.5, row 11.9+) steps outside!
          if (this.player.y >= 11.7 * TILE_SIZE && this.player.x >= 7 * TILE_SIZE && this.player.x <= 10.5 * TILE_SIZE) {
            this.exitCurrentInterior();
          }
        }
      }
    }

    // --- Collision Detection ---
    checkCollision(px, py) {
      // Player bounding box (centered on feet)
      const box = {
        left: px + 8,
        right: px + 24,
        top: py + 16,
        bottom: py + 30
      };

      // --- Interior Room Collision Logic ---
      if (this.isInteriorLocation(this.currentLocation)) {
        // Perimeter walls: top wall (rows 0..2.8), left wall (col 0..1), right wall (col 17), bottom wall (row 13 except exit door cols 7..11)
        if (box.left < 1.1 * TILE_SIZE || box.right > 16.9 * TILE_SIZE || box.top < 2.9 * TILE_SIZE) {
          return true;
        }
        if (box.bottom > 12.9 * TILE_SIZE) {
          if (!(box.left >= 7 * TILE_SIZE && box.right <= 11 * TILE_SIZE)) {
            return true;
          }
        }

        if (this.currentLocation === 'interior_cottage') {
          // Walking into the Farmhouse Bed (cols 12.8..15.8, rows 3.2..6.5) tucks player into bed!
          if (box.right > 12.8 * TILE_SIZE && box.left < 15.8 * TILE_SIZE &&
              box.bottom > 3.2 * TILE_SIZE && box.top < 6.4 * TILE_SIZE) {
            this.lieInBed();
            return true;
          }
          // Kitchen Dining Table collision (cols 2.2..5, rows 6.5..8.3)
          if (box.right > 2.2 * TILE_SIZE && box.left < 5.0 * TILE_SIZE &&
              box.bottom > 6.5 * TILE_SIZE && box.top < 8.3 * TILE_SIZE) {
            return true;
          }
        } else if (this.currentLocation === 'interior_cave') {
          // Cavern Ladder & Ore Node collision
          if (box.right > 14 * TILE_SIZE && box.left < 15.6 * TILE_SIZE &&
              box.bottom > 3.1 * TILE_SIZE && box.top < 4.7 * TILE_SIZE) {
            return true;
          }
          const tL = Math.floor(box.left / TILE_SIZE);
          const tR = Math.floor(box.right / TILE_SIZE);
          const tT = Math.floor(box.top / TILE_SIZE);
          const tB = Math.floor(box.bottom / TILE_SIZE);
          for (let r = tT; r <= tB; r++) {
            for (let c = tL; c <= tR; c++) {
              if (this.caveNodes && this.caveNodes[`${c},${r}`]) {
                return true;
              }
            }
          }
        } else {
          // Shopkeeper / Civic Counter collision (cols 5..13, rows 4.4..5.6)
          if (box.right > 5 * TILE_SIZE && box.left < 13 * TILE_SIZE &&
              box.bottom > 4.2 * TILE_SIZE && box.top < 5.6 * TILE_SIZE) {
            return true;
          }
        }
        return false;
      }

      if (this.currentLocation === 'city') {
        // City Boundaries:
        // Top boundary allows exiting at cols 20 to 27
        if (box.top < TILE_SIZE) {
          if (!(box.left >= 20 * TILE_SIZE && box.right <= 27.5 * TILE_SIZE)) {
            return true;
          }
        }
        if (box.bottom > this.worldHeight - TILE_SIZE || box.left < TILE_SIZE || box.right > this.worldWidth - TILE_SIZE) {
          return true;
        }

        // City Central Fountain collision (cols 22 to 25, rows 16 to 19)
        const fountainBox = {
          left: 22 * TILE_SIZE + 4,
          right: 26 * TILE_SIZE - 4,
          top: 16 * TILE_SIZE + 4,
          bottom: 20 * TILE_SIZE - 4
        };
        if (box.right > fountainBox.left && box.left < fountainBox.right &&
            box.bottom > fountainBox.top && box.top < fountainBox.bottom) {
          return true;
        }

        // City Buildings collision & front doors
        for (const b of this.city.buildings) {
          const bLeft = b.x * TILE_SIZE;
          const bRight = (b.x + b.w) * TILE_SIZE;
          const bTop = b.y * TILE_SIZE + 16;
          const bBottom = (b.y + b.h) * TILE_SIZE;
          if (box.right > bLeft && box.left < bRight && box.bottom > bTop && box.top < bBottom) {
            // Check if player walked into the front door of the building (center of bottom edge)
            const doorCenter = (b.x + b.w / 2) * TILE_SIZE;
            if (box.left >= doorCenter - 26 && box.right <= doorCenter + 26 && box.bottom >= bBottom - 16) {
              const targetMap = {
                general_store: 'interior_store',
                church: 'interior_church',
                library: 'interior_library',
                bakery: 'interior_bakery',
                blacksmith: 'interior_blacksmith',
                town_hall: 'interior_townhall'
              };
              if (targetMap[b.type]) {
                this.transitionTo(targetMap[b.type], 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
              }
            }
            return true;
          }
        }

        // Check City Tiles (water canal, fences)
        const tileLeft = Math.floor(box.left / TILE_SIZE);
        const tileRight = Math.floor(box.right / TILE_SIZE);
        const tileTop = Math.floor(box.top / TILE_SIZE);
        const tileBottom = Math.floor(box.bottom / TILE_SIZE);

        for (let r = tileTop; r <= tileBottom; r++) {
          for (let c = tileLeft; c <= tileRight; c++) {
            if (r < 0 || r >= this.mapRows || c < 0 || c >= this.mapCols) continue;
            const tile = this.tiles[r][c];
            if (tile.type === 'water' || tile.type === 'fence') {
              return true;
            }
            const obj = this.objects[`${c},${r}`];
            if (obj === 'lamp' || obj === 'bench' || obj === 'notice_board') {
              return true;
            }
          }
        }

        return false;
      }

      // --- Farm Collision Logic ---
      // Map boundary bounds
      if (box.left < TILE_SIZE || box.right > this.worldWidth - TILE_SIZE ||
          box.top < TILE_SIZE || box.bottom > this.worldHeight - TILE_SIZE) {
        // Allow exiting through all southern road gates (cols 14 to 34)
        if (!(box.left >= 14 * TILE_SIZE && box.right <= 34 * TILE_SIZE && box.bottom >= this.worldHeight - TILE_SIZE)) {
          return true;
        }
      }

      // Check Cottage bounding box (6x5 tiles)
      if (box.right > this.cottagePos.x + 16 && box.left < this.cottagePos.x + 176 &&
          box.bottom > this.cottagePos.y + 40 && box.top < this.cottagePos.y + 140) {
        // Cottage front door entrance transitions inside the Farmhouse Cottage!
        if (box.left >= this.cottagePos.x + 76 && box.right <= this.cottagePos.x + 126 && box.bottom >= this.cottagePos.y + 116) {
          this.transitionTo('interior_cottage', 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
        }
        return true;
      }

      // Check Grandma on porch
      if (box.right > this.grandmaPos.x && box.left < this.grandmaPos.x + 24 &&
          box.bottom > this.grandmaPos.y && box.top < this.grandmaPos.y + 24) {
        return true;
      }

      // Check Well
      if (box.right > this.wellPos.x && box.left < this.wellPos.x + 56 &&
          box.bottom > this.wellPos.y && box.top < this.wellPos.y + 30) {
        return true;
      }

      // Check Shipping Bin
      if (box.right > this.shippingBinPos.x && box.left < this.shippingBinPos.x + 36 &&
          box.bottom > this.shippingBinPos.y + 8 && box.top < this.shippingBinPos.y + 28) {
        return true;
      }

      // Check Red Barn (5x3 tiles at (31, 4))
      if (this.barnPos && box.right > this.barnPos.x + 8 && box.left < this.barnPos.x + 5 * TILE_SIZE - 8 &&
          box.bottom > this.barnPos.y + 18 && box.top < this.barnPos.y + 3.2 * TILE_SIZE) {
        return true;
      }

      // Check Hillside Quarry Cave Entrance (3x2 tiles at (6, 35))
      if (this.cavePos && box.right > this.cavePos.x + 6 && box.left < this.cavePos.x + 3 * TILE_SIZE - 6 &&
          box.bottom > this.cavePos.y + 12 && box.top < this.cavePos.y + 2.1 * TILE_SIZE) {
        if (box.left >= this.cavePos.x + TILE_SIZE * 0.7 && box.right <= this.cavePos.x + TILE_SIZE * 2.3 &&
            box.bottom >= this.cavePos.y + TILE_SIZE * 1.45) {
          this.transitionTo('interior_cave', 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
        }
        return true;
      }

      // Check Corner tiles
      const tileLeft = Math.floor(box.left / TILE_SIZE);
      const tileRight = Math.floor(box.right / TILE_SIZE);
      const tileTop = Math.floor(box.top / TILE_SIZE);
      const tileBottom = Math.floor(box.bottom / TILE_SIZE);

      for (let r = tileTop; r <= tileBottom; r++) {
        for (let c = tileLeft; c <= tileRight; c++) {
          if (r < 0 || r >= this.mapRows || c < 0 || c >= this.mapCols) continue;
          const tile = this.tiles[r][c];
          if (tile.type === 'water' || tile.type === 'fence') {
            return true;
          }
          const obj = this.objects[`${c},${r}`];
          if (obj === 'rock' || obj === 'tree') {
            return true;
          }
        }
      }

      return false;
    }

    // --- Tile & Object Interaction ---
    handleCanvasClick(tileX, tileY) {
      // Active fishing minigame intercepts taps/clicks anywhere
      if (this.fishing) {
        this.handleFishingAction();
        return;
      }

      if (tileX < 0 || tileX >= this.mapCols || tileY < 0 || tileY >= this.mapRows) return;

      const playerTileX = Math.floor((this.player.x + 16) / TILE_SIZE);
      const playerTileY = Math.floor((this.player.y + 16) / TILE_SIZE);
      const dist = Math.hypot(tileX - playerTileX, tileY - playerTileY);

      // Max reach: 2.8 tiles; if further away, navigate toward destination
      if (dist > 2.8) {
        this.player.targetPos = {
          x: tileX * TILE_SIZE,
          y: tileY * TILE_SIZE
        };
        return;
      }

      // Turn player toward clicked tile
      if (Math.abs(tileX - playerTileX) > Math.abs(tileY - playerTileY)) {
        this.player.dir = (tileX > playerTileX) ? 3 : 2;
      } else {
        this.player.dir = (tileY > playerTileY) ? 0 : 1;
      }

      // --- INTERIOR BUILDING INTERACTIONS ---
      if (this.isInteriorLocation(this.currentLocation)) {
        // 1. South Exit Doorway (cols 7..10, rows 11..13)
        if (tileX >= 7 && tileX <= 10 && tileY >= 11) {
          this.exitCurrentInterior();
          return;
        }

        if (this.currentLocation === 'interior_cottage') {
          // 2. The Player's Cozy Farmhouse Bed (cols 12..16, rows 3..7) -> Lie in bed & open Sleep Modal!
          if (tileX >= 12 && tileX <= 16 && tileY >= 2 && tileY <= 7) {
            this.lieInBed();
            return;
          }
          // 3. Country Kitchen Table & Hearth Cooking (cols 2..5, rows 5..9)
          if (tileX >= 2 && tileX <= 5 && tileY >= 5 && tileY <= 9) {
            if (!this.dailyTeaClaimed) {
              this.dailyTeaClaimed = true;
              this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 10);
              this.showFloatingText('+10 Energy (Warm Tea)', this.player.x + 16, this.player.y - 8, '#4ade80');
              this.updateHUD();
            }
            this.openCookingModal();
            return;
          }
          // 4. Crackling Stone Fireplace (cols 7..10, rows 1..4)
          if (tileX >= 7 && tileX <= 10 && tileY >= 1 && tileY <= 4) {
            this.showToast('The crackling hearth fire fills the cottage with a cozy amber glow.');
            return;
          }
          this.showToast('Walk over to your cozy bed on the right to lie down and sleep!');
          return;
        }

        if (this.currentLocation === 'interior_cave') {
          // Ladder to descend to a fresh Quarry Cavern floor (cols 13..16, rows 2..5)
          if (tileX >= 13 && tileX <= 16 && tileY >= 2 && tileY <= 5) {
            if (this.player.stamina < 10) {
              this.showToast('Too tired to climb deeper (-10 Energy needed).');
              return;
            }
            this.player.stamina -= 10;
            this.populateCaveNodes();
            window.soundSystem?.playHarvest();
            this.spawnParticles(14.8 * TILE_SIZE, 3.8 * TILE_SIZE, '#38bdf8', 14);
            this.showFloatingText('Fresh Cavern Floor!', 13.5 * TILE_SIZE, 2.5 * TILE_SIZE, '#38bdf8');
            this.showToast('Descended deeper into Quarry Cavern! Fresh copper, gold & quartz veins glisten nearby.');
            this.updateHUD();
            return;
          }

          // Mine ore/crystal node at clicked/faced tile or adjacent cavern tile
          const directKey = `${tileX},${tileY}`;
          if (this.caveNodes && this.caveNodes[directKey]) {
            this.mineCaveNode(tileX, tileY);
            return;
          }
          const ptX = Math.floor((this.player.x + 16) / TILE_SIZE);
          const ptY = Math.floor((this.player.y + 16) / TILE_SIZE);
          for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
            if (this.caveNodes && this.caveNodes[`${ptX + dx},${ptY + dy}`]) {
              this.mineCaveNode(ptX + dx, ptY + dy);
              return;
            }
          }
          this.showToast('Click or face a glowing ore rock to mine it, or climb the northeast ladder for a fresh floor.');
          return;
        }

        // City Building Interior Counter / NPC Interactions (cols 4..13, rows 2..6)
        if (tileX >= 4 && tileX <= 13 && tileY >= 2 && tileY <= 6) {
          if (this.currentLocation === 'interior_store') {
            this.openShopModal('buy');
          } else if (this.currentLocation === 'interior_bakery') {
            this.openBakeryModal();
          } else if (this.currentLocation === 'interior_blacksmith') {
            this.openBlacksmithModal();
          } else if (this.currentLocation === 'interior_townhall') {
            this.talkToCityNPC('mayor');
          } else if (this.currentLocation === 'interior_church') {
            this.talkToCityNPC('pastor');
          } else if (this.currentLocation === 'interior_library') {
            this.openLibraryAlmanacModal();
          }
          return;
        }

        this.showToast('Approach the front counter to speak with the shopkeeper, or walk to the south door to step outside.');
        return;
      }

      // --- CITY INTERACTIONS ---
      if (this.currentLocation === 'city') {
        // 1. Central Fountain -> Refill Watering Can
        if (tileX >= 21 && tileX <= 26 && tileY >= 15 && tileY <= 20) {
          this.refillWateringCan();
          return;
        }

        // 2. Community Notice Board
        if (tileX >= 19 && tileX <= 21 && tileY >= 14 && tileY <= 16) {
          this.openNoticeBoardModal();
          return;
        }

        // 3. Road Sign to Grandma's Farm
        if (tileX >= 23 && tileX <= 25 && tileY >= 1 && tileY <= 3) {
          this.transitionTo('farm');
          return;
        }

        // 4. City NPCs
        for (const npc of this.city.npcs) {
          if (Math.hypot(tileX - npc.x, tileY - npc.y) <= 1.8) {
            this.talkToCityNPC(npc.type);
            return;
          }
        }

        // 5. City Buildings (Doors & Storefronts -> Enter the Building!)
        // General Store (x: 6 to 11, y: 5 to 9)
        if (tileX >= 6 && tileX <= 11 && tileY >= 5 && tileY <= 9) {
          this.transitionTo('interior_store', 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
          return;
        }
        // Oakhaven Chapel (x: 15 to 20, y: 4 to 8)
        if (tileX >= 15 && tileX <= 20 && tileY >= 4 && tileY <= 8) {
          this.transitionTo('interior_church', 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
          return;
        }
        // Town Library (x: 27 to 32, y: 4 to 8)
        if (tileX >= 27 && tileX <= 32 && tileY >= 4 && tileY <= 8) {
          this.transitionTo('interior_library', 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
          return;
        }
        // Hazelwood Bakery (x: 34 to 39, y: 5 to 9)
        if (tileX >= 34 && tileX <= 39 && tileY >= 5 && tileY <= 9) {
          this.transitionTo('interior_bakery', 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
          return;
        }
        // Garth's Blacksmith (x: 6 to 11, y: 19 to 23)
        if (tileX >= 6 && tileX <= 11 && tileY >= 19 && tileY <= 23) {
          this.transitionTo('interior_blacksmith', 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
          return;
        }
        // City Hall (x: 34 to 39, y: 19 to 23)
        if (tileX >= 34 && tileX <= 39 && tileY >= 19 && tileY <= 23) {
          this.transitionTo('interior_townhall', 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
          return;
        }

        // 6. Park Benches
        if (this.objects[`${tileX},${tileY}`] === 'bench') {
          this.showToast('You rested comfortably on the town plaza bench.');
          return;
        }

        // City Canal Fishing & Water Refill
        const activeCityItem = this.inventory[this.activeSlot];
        const cityTile = this.tiles[tileY] && this.tiles[tileY][tileX];
        if (activeCityItem && activeCityItem.id === 'fishing_rod' && cityTile && (cityTile.type === 'water' || cityTile.type === 'dock')) {
          const waterTarget = this.findWaterCastTarget(tileX, tileY);
          if (waterTarget) {
            this.castFishingLine(waterTarget.tx, waterTarget.ty);
            return;
          }
        }
        if (activeCityItem && activeCityItem.id === 'watering_can' && cityTile && cityTile.type === 'water') {
          this.refillWateringCan();
          return;
        }

        // Farm tools cannot be used in town
        this.showToast('You cannot farm or clear debris in Oakhaven City! Head back north to Grandma’s Farm.');
        return;
      }

      // --- FARM INTERACTIONS ---
      // Check if clicking Farmhouse Cottage Door / House (cols 12..17, rows 4..8) -> Go Inside Cottage!
      if (tileX >= 12 && tileX <= 17 && tileY >= 4 && tileY <= 8) {
        this.transitionTo('interior_cottage', 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
        return;
      }

      // Check if clicking Red Barn (cols 31..35, rows 4..7) -> Open Barn & Livestock Panel
      if (tileX >= 31 && tileX <= 35 && tileY >= 4 && tileY <= 7) {
        this.openBarnModal();
        return;
      }

      // Check if clicking Hillside Quarry Cave Mouth (cols 6..8, rows 35..37) -> Enter Quarry Cavern
      if (tileX >= 6 && tileX <= 8 && tileY >= 35 && tileY <= 37) {
        this.transitionTo('interior_cave', 8.5 * TILE_SIZE, 10.8 * TILE_SIZE);
        return;
      }

      // Check if clicking or petting a Pasture Animal (Chicken / Cow / Sheep)
      if (this.farmAnimals && this.farmAnimals.length > 0) {
        for (const animal of this.farmAnimals) {
          const ax = (animal.x + 16) / TILE_SIZE;
          const ay = (animal.y + 16) / TILE_SIZE;
          if (Math.hypot(tileX + 0.5 - ax, tileY + 0.5 - ay) <= 1.35) {
            this.interactWithAnimal(animal);
            return;
          }
        }
      }

      // Check if clicking Signpost to City at (16, 44) or (28, 43)
      if (Math.hypot(tileX - 16, tileY - 44) <= 1.8 || Math.hypot(tileX - 28, tileY - 43) <= 1.8) {
        this.transitionTo('city');
        return;
      }

      // Check if clicking Grandma
      const grandmaTileX = Math.floor(this.grandmaPos.x / TILE_SIZE);
      const grandmaTileY = Math.floor(this.grandmaPos.y / TILE_SIZE);
      if (Math.hypot(tileX - grandmaTileX, tileY - grandmaTileY) <= 1.5) {
        this.talkToGrandma();
        return;
      }

      // Check if clicking Well -> Refill Watering Can
      const wellTileX = Math.floor(this.wellPos.x / TILE_SIZE);
      const wellTileY = Math.floor(this.wellPos.y / TILE_SIZE);
      if (Math.abs(tileX - wellTileX) <= 1 && Math.abs(tileY - wellTileY) <= 1) {
        this.refillWateringCan();
        return;
      }

      // Check if clicking Shipping Bin -> Open Sell Screen
      const binTileX = Math.floor(this.shippingBinPos.x / TILE_SIZE);
      const binTileY = Math.floor(this.shippingBinPos.y / TILE_SIZE);
      if (Math.abs(tileX - binTileX) <= 1 && Math.abs(tileY - binTileY) <= 1) {
        this.openShopModal('sell');
        return;
      }

      // Check if clicking Countryside Shop Cart
      const shopTileX = Math.floor(this.shopCartPos.x / TILE_SIZE);
      const shopTileY = Math.floor(this.shopCartPos.y / TILE_SIZE);
      if (Math.abs(tileX - shopTileX) <= 1.5 && Math.abs(tileY - shopTileY) <= 1.5) {
        this.openShopModal('buy');
        return;
      }

      // Perform Active Tool / Seed Action on grid tile
      this.applyToolToTile(tileX, tileY);
    }

    interactFacingTile() {
      const playerTileX = Math.floor((this.player.x + 16) / TILE_SIZE);
      const playerTileY = Math.floor((this.player.y + 16) / TILE_SIZE);

      let targetX = playerTileX;
      let targetY = playerTileY;
      if (this.player.dir === 0) targetY += 1;
      if (this.player.dir === 1) targetY -= 1;
      if (this.player.dir === 2) targetX -= 1;
      if (this.player.dir === 3) targetX += 1;

      this.handleCanvasClick(targetX, targetY);
    }

    applyToolToTile(tx, ty) {
      if (this.currentLocation === 'city') {
        this.showToast('You cannot use farm tools in Oakhaven City! Return to Grandma’s farm.');
        return;
      }

      const activeItem = this.inventory[this.activeSlot];
      const key = `${tx},${ty}`;
      const tile = this.tiles[ty][tx];
      const crop = this.crops[key];
      const obj = this.objects[key];

      // 1. Ready Crop Harvest (can be harvested with hands or scythe!)
      if (crop && crop.stage >= 3) {
        this.harvestCrop(tx, ty);
        return;
      }

      // 1b. Gather Wild Forageables directly by hand!
      if (obj && FORAGE_DEFS[obj]) {
        this.collectForage(tx, ty);
        return;
      }

      // Require active item
      if (!activeItem) return;

      // Check Stamina
      if (this.player.stamina <= 0 && activeItem.type === 'tool') {
        this.showToast('You are completely out of energy! Rest in bed or eat some food.');
        return;
      }

      // 0. Fishing Rod -> Cast line into Lake Hazel water or from dock
      if (activeItem.id === 'fishing_rod') {
        const waterTarget = this.findWaterCastTarget(tx, ty);
        if (waterTarget) {
          this.castFishingLine(waterTarget.tx, waterTarget.ty);
        } else {
          this.showToast('Stand near Lake Hazel or Oakhaven Canal water to cast your rod!');
        }
        return;
      }

      // A. Hoe -> Till dry ground (Only GRASS can be tilled!)
      if (activeItem.id === 'hoe') {
        if (tile.type === 'grass') {
          if (!obj) {
            tile.type = 'soil';
            tile.isTilled = true;
            this.player.toolAction = 'hoe';
            this.player.toolTimer = 0.25;
            const staminaCost = this.player.hasCopperHoe ? 1 : 2;
            this.player.stamina = Math.max(0, this.player.stamina - staminaCost);
            window.soundSystem?.playHoe();
            this.rumble(50, 0.35, 0.5);
            this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#8b5a2b', 6);
            this.progressQuest('till_soil');
            this.updateHUD();
          }
        } else if (tile.type === 'path') {
          this.showToast('You cannot till cobblestone pathways! Only grass soil can be tilled.');
        }
        return;
      }

      // B. Watering Can -> Water tilled soil
      if (activeItem.id === 'watering_can') {
        // Check if clicking water tile to refill
        if (tile.type === 'water') {
          this.refillWateringCan();
          return;
        }

        if (this.player.water <= 0) {
          this.showToast('Your watering can is empty! Refill it at the well, pond, or city fountain.');
          return;
        }

        if (tile.isTilled || tile.type === 'soil') {
          tile.isWatered = true;
          this.player.water--;
          this.player.toolAction = 'watering_can';
          this.player.toolTimer = 0.25;
          this.player.stamina = Math.max(0, this.player.stamina - 1);
          window.soundSystem?.playWater();
          this.rumble(30, 0.2, 0.35);
          this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#38bdf8', 8);
          this.progressQuest('water_crops');
          this.updateHUD();
        }
        return;
      }

      // C. Scythe -> Cut weeds & clear tall grass
      if (activeItem.id === 'scythe') {
        this.player.toolAction = 'scythe';
        this.player.toolTimer = 0.25;
        this.player.stamina = Math.max(0, this.player.stamina - 2);

        if (obj === 'weed') {
          delete this.objects[key];
          window.soundSystem?.playNoise(0.12, 1400, 0.2);
          this.rumble(45, 0.35, 0.45);
          this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#4ade80', 8);
          this.showFloatingText('+1 Fiber', tx * TILE_SIZE + 16, ty * TILE_SIZE + 8, '#86efac');
          this.progressQuest('clear_debris');
        } else {
          window.soundSystem?.playNoise(0.1, 1600, 0.15);
          this.rumble(25, 0.15, 0.2);
        }
        this.updateHUD();
        return;
      }

      // D. Axe -> Chop Trees
      if (activeItem.id === 'axe') {
        this.player.toolAction = 'axe';
        this.player.toolTimer = 0.25;
        this.player.stamina = Math.max(0, this.player.stamina - 3);

        if (obj === 'tree') {
          const chopDmg = this.player.hasSteelAxe ? 2 : 1;
          this.debrisHealth[key] = (this.debrisHealth[key] || 3) - chopDmg;
          window.soundSystem?.playHit();
          this.rumble(60, 0.45, 0.65);
          this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#ad723b', 6);

          if (this.debrisHealth[key] <= 0) {
            delete this.objects[key];
            delete this.debrisHealth[key];
            const woodGained = 4 + Math.floor(Math.random() * 3);
            this.addItem('wood', woodGained);
            this.showFloatingText(`+${woodGained} Wood`, tx * TILE_SIZE + 16, ty * TILE_SIZE + 8, '#fbbf24');
            this.progressQuest('clear_debris');
          }
        }
        this.updateHUD();
        return;
      }

      // E. Pickaxe -> Break Rocks
      if (activeItem.id === 'pickaxe') {
        this.player.toolAction = 'pickaxe';
        this.player.toolTimer = 0.25;
        this.player.stamina = Math.max(0, this.player.stamina - 3);

        if (obj === 'rock') {
          const breakDmg = this.player.hasSteelPickaxe ? 2 : 1;
          this.debrisHealth[key] = (this.debrisHealth[key] || 2) - breakDmg;
          window.soundSystem?.playHit();
          this.rumble(60, 0.5, 0.7);
          this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#94a3b8', 6);

          if (this.debrisHealth[key] <= 0) {
            delete this.objects[key];
            delete this.debrisHealth[key];
            const stoneGained = 3 + Math.floor(Math.random() * 3);
            this.addItem('stone', stoneGained);
            this.showFloatingText(`+${stoneGained} Stone`, tx * TILE_SIZE + 16, ty * TILE_SIZE + 8, '#cbd5e1');
            this.progressQuest('clear_debris');
          }
        }
        this.updateHUD();
        return;
      }

      // F. Plant Seeds (Cannot plant on pathway!)
      if (activeItem.type === 'seed') {
        if (tile.type === 'path') {
          this.showToast('You cannot plant seeds on the cobblestone pathway!');
          return;
        }

        if ((tile.isTilled || tile.type === 'soil') && !crop && !obj) {
          this.plantCrop(tx, ty, activeItem.crop);
          this.useItem(this.activeSlot);
          window.soundSystem?.playPlant();
          this.rumble(35, 0.2, 0.3);
          this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#a16207', 4);
          this.progressQuest('plant_seeds');
          this.updateHUD();
        } else {
          this.showToast('Seeds must be planted on an empty tilled soil patch!');
        }
        return;
      }

      // G. Apply Speed-Gro Fertilizer
      if (activeItem.id === 'fertilizer') {
        if ((tile.isTilled || tile.type === 'soil') && !tile.isFertilized) {
          tile.isFertilized = true;
          this.useItem(this.activeSlot);
          window.soundSystem?.playPlant();
          this.rumble(35, 0.2, 0.3);
          this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#38bdf8', 6);
          this.showToast('Soil enriched with Speed-Gro Fertilizer!');
          this.updateHUD();
        }
        return;
      }

      // H. Eat Food (Pie, Tonics)
      if (activeItem.type === 'food') {
        const heal = activeItem.heal || 40;
        this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + heal);
        this.useItem(this.activeSlot);
        window.soundSystem?.playCoin();
        this.rumble(45, 0.3, 0.4);
        this.showFloatingText(`+${heal} Energy!`, this.player.x + 16, this.player.y, '#4ade80');
        this.showToast(`Yummy! Restored ${heal} Energy.`);
        this.updateHUD();
        return;
      }

      // I. Install Sprinkler
      if (activeItem.id === 'sprinkler') {
        if (!obj && !crop && (tile.type === 'grass' || tile.type === 'soil' || tile.type === 'path')) {
          this.objects[key] = 'sprinkler';
          this.useItem(this.activeSlot);
          window.soundSystem?.playHit();
          this.rumble(45, 0.3, 0.4);
          this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#ecc94b', 8);
          this.showToast('Installed Farm Sprinkler! Adjacent tiles will be auto-watered daily.');
          this.updateHUD();
        }
        return;
      }
    }

    plantCrop(tx, ty, cropType, startingStage = 0) {
      const key = `${tx},${ty}`;
      this.crops[key] = {
        type: cropType,
        stage: startingStage,
        daysGrown: startingStage,
        totalDays: CROP_DEFS[cropType]?.growthDays || 3
      };
    }

    harvestCrop(tx, ty) {
      const key = `${tx},${ty}`;
      const crop = this.crops[key];
      if (!crop) return;

      const def = CROP_DEFS[crop.type];
      const cropName = def ? def.name : 'Crop';

      delete this.crops[key];
      this.addItem(crop.type, 1);
      window.soundSystem?.playHarvest();
      this.rumble(55, 0.4, 0.55);

      this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#facc15', 12);
      this.showFloatingText(`+1 ${cropName}!`, tx * TILE_SIZE + 16, ty * TILE_SIZE, '#fde047');
      this.showToast(`Harvested juicy ${cropName}! You can sell it at the shop.`);
      this.updateHUD();
    }

    refillWateringCan() {
      this.player.water = this.player.waterCapacity;
      window.soundSystem?.playWater();
      this.rumble(50, 0.25, 0.45);
      this.spawnParticles(this.player.x + 16, this.player.y + 16, '#38bdf8', 12);
      this.showFloatingText(`Can Refilled! (${this.player.waterCapacity}/${this.player.waterCapacity})`, this.player.x + 16, this.player.y, '#38bdf8');
      this.showToast('Watering can refilled to full capacity!');
      this.updateHUD();
    }

    // --- Fishing System (Lake Hazel & Oakhaven Canal) ---
    findWaterCastTarget(tx, ty) {
      if (this.tiles[ty] && this.tiles[ty][tx] && this.tiles[ty][tx].type === 'water') {
        return { tx, ty };
      }
      // Also allow casting outward if player faces water from shore or dock
      const px = Math.floor((this.player.x + 16) / TILE_SIZE);
      const py = Math.floor((this.player.y + 16) / TILE_SIZE);
      const dirs = [
        [0, 1], [0, -1], [-1, 0], [1, 0]
      ];
      const primary = dirs[this.player.dir] || [0, 1];
      for (let dist = 1; dist <= 2; dist++) {
        const cx = px + primary[0] * dist;
        const cy = py + primary[1] * dist;
        if (this.tiles[cy] && this.tiles[cy][cx] && this.tiles[cy][cx].type === 'water') {
          return { tx: cx, ty: cy };
        }
      }
      for (const [dx, dy] of dirs) {
        for (let dist = 1; dist <= 2; dist++) {
          const cx = px + dx * dist;
          const cy = py + dy * dist;
          if (this.tiles[cy] && this.tiles[cy][cx] && this.tiles[cy][cx].type === 'water') {
            return { tx: cx, ty: cy };
          }
        }
      }
      return null;
    }

    castFishingLine(tx, ty) {
      if (this.fishing) {
        this.handleFishingAction();
        return;
      }
      if (this.player.stamina <= 1) {
        this.showToast('Too tired to cast your fishing rod! Grab a bite or rest in bed.');
        return;
      }

      const px = Math.floor((this.player.x + 16) / TILE_SIZE);
      const py = Math.floor((this.player.y + 16) / TILE_SIZE);
      if (Math.abs(tx - px) > Math.abs(ty - py)) {
        this.player.dir = tx > px ? 3 : 2;
      } else {
        this.player.dir = ty >= py ? 0 : 1;
      }

      this.player.stamina = Math.max(0, this.player.stamina - 2);
      this.player.targetPos = null;
      this.player.toolAction = 'fishing_rod';
      this.player.toolTimer = 0.4;

      const waitTime = this.player.hasProRod
        ? (1.0 + Math.random() * 1.1)
        : (1.3 + Math.random() * 1.5);
      const targetWidth = this.player.hasProRod ? 0.38 : 0.30;
      const targetStart = 0.22 + Math.random() * (0.56 - targetWidth);

      this.fishing = {
        phase: 'WAITING',
        waterX: tx * TILE_SIZE + 16,
        waterY: ty * TILE_SIZE + 16,
        castAge: 0,
        nudgeHintTimer: 0,
        timer: waitTime,
        biteWindow: this.player.hasProRod ? 3.4 : 2.8,
        cursorPos: 0.5,
        cursorDir: 1,
        targetStart: targetStart,
        targetWidth: targetWidth,
        attemptsLeft: this.player.hasProRod ? 3 : 2,
        fish: this.rollFishCatch(),
        bobTime: 0
      };

      window.soundSystem?.playCast();
      this.rumble(30, 0.15, 0.3);
      this.spawnParticles(this.fishing.waterX, this.fishing.waterY, '#bae6fd', 10);
      this.showToast('Cast! Wait for ! BITE ! on the bobber (move to cancel).');
      this.updateHUD();
    }

    rollFishCatch() {
      const loc = this.currentLocation === 'city' ? 'city' : 'farm';
      const rainBonus = this.weather === 'rainy' ? 1.5 : 1.0;
      const rodBonus = this.player.hasProRod ? 1.45 : 1.0;
      const candidates = Object.values(FISH_DEFS).filter(f => f.locations.includes(loc));

      const weighted = candidates.map(f => {
        let w = 10;
        if (f.rarity === 'Uncommon') w = 5 * rodBonus;
        else if (f.rarity === 'Rare') w = 2.6 * rodBonus * rainBonus;
        else if (f.rarity === 'Legendary') w = 0.85 * rodBonus * rainBonus;
        return { fish: f, weight: w };
      });

      const total = weighted.reduce((acc, entry) => acc + entry.weight, 0);
      let roll = Math.random() * total;
      for (const entry of weighted) {
        roll -= entry.weight;
        if (roll <= 0) return entry.fish;
      }
      return candidates[0] || FISH_DEFS.sunfish;
    }

    handleFishingAction() {
      if (!this.fishing) return;

      if (this.fishing.phase === 'WAITING') {
        // Ignore rapid double-taps right after casting; gently pulse bobber hint instead of wasting the cast
        if (this.fishing.castAge > 0.35) {
          this.fishing.nudgeHintTimer = 1.2;
          this.showToast('Hold steady — watch the bobber and wait for ! BITE ! (or move to cancel).');
        }
        return;
      }

      if (this.fishing.phase === 'BITE') {
        this.fishing.phase = 'REELING';
        this.fishing.cursorPos = 0.08 + Math.random() * 0.12;
        this.fishing.cursorDir = 1;
        window.soundSystem?.playHit();
        this.showToast('Hooked! Click / press E when the white bar enters GREEN!');
        return;
      }

      if (this.fishing.phase === 'REELING') {
        const fish = this.fishing.fish;
        const bx = this.fishing.waterX;
        const by = this.fishing.waterY;
        const inZone = (
          this.fishing.cursorPos >= this.fishing.targetStart - 0.025 &&
          this.fishing.cursorPos <= this.fishing.targetStart + this.fishing.targetWidth + 0.025
        );

        if (inZone) {
          this.fishing = null;
          this.player.toolAction = null;
          this.addItem(fish.id, 1);
          this.fishingLog[fish.id] = (this.fishingLog[fish.id] || 0) + 1;
          window.soundSystem?.playCatch();
          this.rumble(70, 0.45, 0.65);
          this.spawnParticles(bx, by, '#38bdf8', 16);
          this.showFloatingText(`Caught ${fish.name}!`, this.player.x + 16, this.player.y - 8, '#fde047');
          this.showToast(`Caught ${fish.name} (${fish.rarity}, worth ${fish.sellPrice} G)!`);
          this.saveGame();
        } else {
          this.fishing.attemptsLeft--;
          if (this.fishing.attemptsLeft > 0) {
            window.soundSystem?.playNoise(0.1, 480, 0.12);
            this.spawnParticles(bx, by, '#fde047', 6);
            this.showToast(`Almost! Stop inside GREEN (${this.fishing.attemptsLeft} try left).`);
          } else {
            this.fishing = null;
            this.player.toolAction = null;
            window.soundSystem?.playNoise(0.14, 420, 0.16);
            this.spawnParticles(bx, by, '#94a3b8', 8);
            this.showToast(`The ${fish.name} slipped away! Cast again to retry.`);
          }
        }
      }
    }

    updateFishing(dt) {
      if (!this.fishing) return;
      this.fishing.bobTime += dt;
      this.fishing.castAge += dt;
      if (this.fishing.nudgeHintTimer > 0) {
        this.fishing.nudgeHintTimer = Math.max(0, this.fishing.nudgeHintTimer - dt);
      }
      this.player.toolAction = 'fishing_rod';

      if (this.fishing.phase === 'WAITING') {
        this.fishing.timer -= dt;
        if (this.fishing.timer <= 0) {
          this.fishing.phase = 'BITE';
          this.fishing.timer = this.fishing.biteWindow;
          window.soundSystem?.playBite();
          this.rumble(85, 0.3, 0.7);
          this.spawnParticles(this.fishing.waterX, this.fishing.waterY, '#ffffff', 12);
          this.showFloatingText('! BITE !', this.fishing.waterX, this.fishing.waterY - 12, '#facc15');
        }
      } else if (this.fishing.phase === 'BITE') {
        this.fishing.timer -= dt;
        if (this.fishing.timer <= 0) {
          this.fishing = null;
          this.player.toolAction = null;
          this.showToast('The fish nibbled away before you could hook it!');
        }
      } else if (this.fishing.phase === 'REELING') {
        const diffSpeed = (this.fishing.fish ? this.fishing.fish.difficulty : 1.0) * (this.player.hasProRod ? 0.72 : 0.88);
        this.fishing.cursorPos += this.fishing.cursorDir * dt * 0.82 * diffSpeed;
        if (this.fishing.cursorPos >= 1) {
          this.fishing.cursorPos = 1;
          this.fishing.cursorDir = -1;
        } else if (this.fishing.cursorPos <= 0) {
          this.fishing.cursorPos = 0;
          this.fishing.cursorDir = 1;
        }
      }
    }

    // --- Wild Foraging & Farm Butterflies/Fireflies ---
    spawnDailyForage(targetCount = 5) {
      if (!this.farm || !this.farm.tiles || this.farm.tiles.length === 0) return;

      const forageTypes = ['wildflower', 'morel', 'wild_berry', 'honeycomb'];
      let currentForageCount = 0;
      for (const k of Object.keys(this.farm.objects)) {
        if (FORAGE_DEFS[this.farm.objects[k]]) currentForageCount++;
      }

      let attempts = 0;
      while (currentForageCount < 10 && attempts < 140 && targetCount > 0) {
        attempts++;
        const c = 4 + Math.floor(Math.random() * (this.farm.cols - 8));
        const r = 4 + Math.floor(Math.random() * (this.farm.rows - 8));
        // Skip fenced cottage yard & main garden plots
        if (c >= 9 && c <= 28 && r >= 3 && r <= 24) continue;
        const tile = this.farm.tiles[r] && this.farm.tiles[r][c];
        const key = `${c},${r}`;
        if (!tile || tile.type !== 'grass' || this.farm.objects[key] || this.farm.crops[key]) continue;

        const pick = forageTypes[Math.floor(Math.random() * forageTypes.length)];
        this.farm.objects[key] = pick;
        currentForageCount++;
        targetCount--;
      }
    }

    collectForage(tx, ty) {
      const key = `${tx},${ty}`;
      const forageId = this.objects[key];
      const def = FORAGE_DEFS[forageId];
      if (!def) return;

      delete this.objects[key];
      this.addItem(forageId, 1);
      window.soundSystem?.playHarvest();
      this.rumble(40, 0.2, 0.35);
      this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#f472b6', 10);
      this.showFloatingText(`+1 ${def.name}`, tx * TILE_SIZE + 16, ty * TILE_SIZE, '#fde047');
      this.showToast(`Foraged ${def.name}! Cook with it at Grandma’s table or sell it.`);
      this.updateHUD();
    }

    initAmbientCritters() {
      const colors = ['#facc15', '#f472b6', '#38bdf8', '#fef08a'];
      this.ambientCritters = [];
      for (let i = 0; i < 14; i++) {
        this.ambientCritters.push({
          x: (8 + Math.random() * 48) * TILE_SIZE,
          y: (8 + Math.random() * 32) * TILE_SIZE,
          vx: (Math.random() - 0.5) * 28,
          vy: (Math.random() - 0.5) * 22,
          phase: Math.random() * Math.PI * 2,
          color: colors[i % colors.length],
          changeTimer: 1 + Math.random() * 3
        });
      }
    }

    updateAmbientCritters(dt) {
      if (this.currentLocation !== 'farm' || !this.ambientCritters) return;
      for (const critter of this.ambientCritters) {
        critter.phase += dt * 9;
        critter.changeTimer -= dt;
        if (critter.changeTimer <= 0) {
          critter.vx = (Math.random() - 0.5) * 30;
          critter.vy = (Math.random() - 0.5) * 24;
          critter.changeTimer = 1.5 + Math.random() * 3;
        }
        critter.x += critter.vx * dt;
        critter.y += critter.vy * dt;

        // Keep gently within homestead meadows
        if (critter.x < 4 * TILE_SIZE) critter.vx = Math.abs(critter.vx);
        if (critter.x > (this.farm.cols - 4) * TILE_SIZE) critter.vx = -Math.abs(critter.vx);
        if (critter.y < 6 * TILE_SIZE) critter.vy = Math.abs(critter.vy);
        if (critter.y > (this.farm.rows - 4) * TILE_SIZE) critter.vy = -Math.abs(critter.vy);
      }
    }

    // --- Inventory Management ---
    getItemCount(itemId) {
      const item = this.inventory.find(i => i.id === itemId);
      return item ? item.count : 0;
    }

    removeItem(itemId, amount = 1) {
      const idx = this.inventory.findIndex(i => i.id === itemId);
      if (idx !== -1) {
        this.inventory[idx].count -= amount;
        if (this.inventory[idx].count <= 0) {
          this.inventory.splice(idx, 1);
          if (this.activeSlot >= this.inventory.length) {
            this.activeSlot = Math.max(0, this.inventory.length - 1);
          }
        }
        this.updateHUD();
      }
    }

    addItem(itemId, amount = 1) {
      if (itemId === 'pro_rod') {
        this.player.hasProRod = true;
        const rod = this.inventory.find(i => i.id === 'fishing_rod');
        if (rod) {
          rod.name = 'Pro Fiberglass Rod';
          rod.desc = 'Upgraded rod: faster bites, steadier reel gauge, higher rare-fish odds!';
        }
        this.updateHUD();
        return;
      }

      // Check if existing stackable item
      const existing = this.inventory.find(i => i.id === itemId);
      if (existing) {
        existing.count += amount;
      } else {
        // Create new item entry
        let name = itemId.replace(/_/g, ' ');
        name = name.charAt(0).toUpperCase() + name.slice(1);
        let type = 'material';
        let heal = 0;
        let desc = 'Homestead resource.';

        if (CROP_DEFS[itemId]) {
          name = CROP_DEFS[itemId].name;
          type = 'crop';
          desc = `Freshly harvested produce. Sells for ${CROP_DEFS[itemId].sellPrice} G.`;
        } else if (FISH_DEFS[itemId]) {
          name = FISH_DEFS[itemId].name;
          type = 'fish';
          desc = FISH_DEFS[itemId].desc;
        } else if (FORAGE_DEFS[itemId]) {
          name = FORAGE_DEFS[itemId].name;
          type = FORAGE_DEFS[itemId].heal ? 'food' : 'forage';
          heal = FORAGE_DEFS[itemId].heal || 0;
          desc = FORAGE_DEFS[itemId].desc;
        } else if (itemId.endsWith('_seed')) {
          type = 'seed';
          desc = 'Plant in tilled soil and water daily.';
        } else {
          const recipe = COOKING_RECIPES.find(r => r.id === itemId);
          if (recipe) {
            name = recipe.name;
            type = 'food';
            heal = recipe.heal;
            desc = recipe.desc;
          } else if (itemId === 'apple_pie') {
            name = 'Grandma’s Berry Pie';
            type = 'food';
            heal = 60;
            desc = 'Delicious homemade pastry. Restores 60 Stamina.';
          } else if (itemId === 'honey') {
            name = 'Wildflower Honey';
            type = 'food';
            heal = 45;
            desc = 'Golden wildflower honey. Restores 45 Stamina.';
          } else if (itemId === 'egg') {
            name = 'Fresh Farm Egg';
            type = 'animal';
            desc = 'Warm farm-fresh egg laid in the barn. Cook or sell for 35 G.';
          } else if (itemId === 'milk') {
            name = 'Rich Barn Milk';
            type = 'food';
            heal = 30;
            desc = 'Creamy fresh dairy milk. Drink for +30 Energy or sell for 75 G.';
          } else if (itemId === 'wool') {
            name = 'Soft Cloud Wool';
            type = 'animal';
            desc = 'Fluffy sheared sheep wool. Sells for 110 G.';
          } else if (itemId === 'copper_ore') {
            name = 'Copper Ore';
            type = 'material';
            desc = 'Gleaming cavern copper ore. Sells for 28 G.';
          } else if (itemId === 'gold_ore') {
            name = 'Gold Ore';
            type = 'material';
            desc = 'Heavy golden cavern ore. Sells for 65 G.';
          } else if (itemId === 'quartz') {
            name = 'Cavern Quartz';
            type = 'material';
            desc = 'Luminous earth crystal from Quarry Cavern. Sells for 120 G.';
          }
        }

        const entry = {
          id: itemId,
          name: name,
          type: type,
          count: amount,
          crop: itemId.replace('_seed', ''),
          desc: desc
        };
        if (heal > 0) entry.heal = heal;
        this.inventory.push(entry);
      }
      this.updateHUD();
    }

    useItem(slotIndex) {
      const item = this.inventory[slotIndex];
      if (!item) return;
      if (item.type === 'tool') return; // Tools are not consumed

      item.count--;
      if (item.count <= 0) {
        this.inventory.splice(slotIndex, 1);
        if (this.activeSlot >= this.inventory.length) {
          this.activeSlot = Math.max(0, this.inventory.length - 1);
        }
      }
      this.updateHUD();
    }

    selectHotbarSlot(idx) {
      if (idx >= 0 && idx < this.inventory.length) {
        this.activeSlot = idx;
        this.updateHUD();
      }
    }

    // --- Quest & Tutorial System ---
    progressQuest(questId) {
      const quest = this.quests.find(q => q.id === questId && !q.isDone);
      if (!quest) return;

      if (quest.target) {
        quest.current = (quest.current || 0) + 1;
        if (quest.current >= quest.target) {
          this.completeQuest(quest);
        }
      } else {
        this.completeQuest(quest);
      }
      this.updateHUD();
    }

    completeQuest(quest) {
      quest.isDone = true;
      this.player.gold += quest.rewardGold;
      window.soundSystem?.playCoin();

      if (quest.onComplete) {
        quest.onComplete(this);
      }

      this.showToast(`Quest Completed: "${quest.title}"! (+${quest.rewardGold} Gold)`);
      this.showFloatingText(`+${quest.rewardGold} G`, this.player.x + 16, this.player.y - 10, '#facc15');

      // Advance active quest index to next incomplete
      const nextIdx = this.quests.findIndex(q => !q.isDone);
      if (nextIdx !== -1) {
        this.activeQuestIdx = nextIdx;
      }
      this.updateHUD();
    }

    // --- Grandma Hazel's Heartfelt Dialogue ---
    talkToGrandma(isBedtimePrompt = false) {
      window.soundSystem?.playDialogue();
      this.progressQuest('talk_grandma');

      const modal = document.getElementById('dialogueModal');
      const textElem = document.getElementById('dialogueText');
      const actionsElem = document.getElementById('dialogueActions');
      if (!modal || !textElem) return;

      // Special Bedtime Requirement on Tutorial Day 1:
      if (this.day === 1) {
        textElem.textContent = `"Oh sweetheart, what an industrious first day on the farm! The soil is tilled, the seedlings are tucked in, and your grandfather's homestead is smiling once again. You must be tuckered out from all your hard work. Are you ready to head inside and get a good night's rest?"`;

        if (actionsElem) {
          actionsElem.innerHTML = `
            <button class="btn-secondary" id="btnGrandmaStayUp">Not yet Grandma, I'll explore more</button>
            <button class="btn-primary" id="btnGrandmaSleep">Yes Grandma, tuck me in! (Sleep until 6 AM)</button>
          `;
          document.getElementById('btnGrandmaStayUp')?.addEventListener('click', () => {
            modal.classList.remove('active');
          });
          document.getElementById('btnGrandmaSleep')?.addEventListener('click', () => {
            modal.classList.remove('active');
            this.grandmaApprovedSleep = true;
            this.sleepAndAdvanceDay();
          });
        }
        modal.classList.add('active');
        return;
      }

      // Normal dialogue from Day 2 onwards:
      const dialogues = [
        "Welcome home, my sweet child! The morning dew looks so sparkling on your grandfather's old farm.",
        "Remember to water your seedlings every morning, sweetheart. If you hear thunder and gentle rain, you can rest your arms—nature will do the watering for you!",
        "When I was your age, my prize strawberries took home first blue ribbon at the county fair. With some love and fertilizer, your harvest will be legendary!",
        "If you ever run low on energy, don't overwork yourself dear. Have a bite of freshly baked berry pie or sit here with me on the porch.",
        "Old Pete sets up his seed cart just down the southern road. Sell your mature crops at our wooden shipping bin, and your wallet will grow just as fast as your corn!",
        "You've brought so much warmth back to this old homestead. I'm so proud of you, darling."
      ];

      const line = dialogues[Math.floor(Math.random() * dialogues.length)];
      textElem.textContent = `"${line}"`;
      if (actionsElem) {
        actionsElem.innerHTML = `
          ${this.getFriendshipBarHtml('grandma')}
          ${this.getGiftButtonHtml('grandma')}
          <button class="btn-primary" onclick="document.getElementById('dialogueModal').classList.remove('active')">
            Thank you, Grandma!
          </button>
        `;
        this.bindGiftButton('grandma', 'Grandma Hazel', () => this.talkToGrandma(false));
      }
      modal.classList.add('active');
    }

    // --- Day Transition & Sleep System ---
    lieInBed() {
      if (this.player.inBed) {
        this.openSleepConfirm();
        return;
      }
      this.player.inBed = true;
      this.player.isMoving = false;
      this.player.targetPos = null;
      this.player.x = 13.8 * TILE_SIZE;
      this.player.y = 4.2 * TILE_SIZE;
      this.player.dir = 0;
      this.grandmaApprovedSleep = true;
      window.soundSystem?.playDialogue();
      this.showToast('You lie down under the warm patchwork quilt in your bed...');
      this.openSleepConfirm();
    }

    openSleepConfirm() {
      // If player is already inside their house or lying in bed, allow sleeping right away!
      if (this.day === 1 && !this.grandmaApprovedSleep && this.currentLocation !== 'interior_cottage') {
        this.showToast('Grandma Hazel is waiting on the porch! Speak with her or head inside to your bed.');
        this.talkToGrandma(true);
        return;
      }

      const modal = document.getElementById('sleepModal');
      if (modal) {
        modal.classList.add('active');
      }
    }

    sleepAndAdvanceDay() {
      // Close sleep confirm modal if open
      document.getElementById('sleepModal')?.classList.remove('active');
      this.rumble(80, 0.4, 0.6);

      // Sync active farm tiles if currently on farm
      if (this.currentLocation === 'farm') {
        this.farm.tiles = this.tiles;
        this.farm.crops = this.crops;
        this.farm.objects = this.objects;
        this.farm.debrisHealth = this.debrisHealth;
      }

      // 1. Advance Day Count & Seasonal Cycle (14 days per season)
      this.day++;
      const prevSeason = this.season;
      this.season = SEASONS[Math.floor((this.day - 1) / 14) % SEASONS.length];
      this.timeMinutes = 6 * 60; // Reset to 6:00 AM
      this.player.stamina = this.player.maxStamina; // Full energy restore
      this.player.inBed = false;
      this.dailyTeaClaimed = false;
      this.dailyBlessingClaimed = false;
      this.giftedToday = {};
      this.fishing = null;
      this.spawnDailyForage(5);
      this.populateCaveNodes();
      if (this.farmAnimals) {
        this.farmAnimals.forEach(a => {
          a.hasProduct = true;
          a.pettedToday = false;
        });
      }
      if (prevSeason !== this.season) {
        this.showToast(`A new season has arrived: ${this.season}! Enjoy the changing homestead scenery.`);
      }

      // Wake up refreshed beside the bed inside your Farmhouse Cottage!
      if (this.currentLocation === 'interior_cottage') {
        this.player.x = 11.8 * TILE_SIZE;
        this.player.y = 4.8 * TILE_SIZE;
        this.player.dir = 0;
      }

      // 2. Weather Roll (75% Sunny, 25% Rainy)
      this.weather = Math.random() < 0.25 ? 'rainy' : 'sunny';

      // 3. Process Automatic Sprinklers & Rain Watering on the Farm
      let wateredCount = 0;
      const farmTiles = this.farm.tiles;
      const farmObjects = this.farm.objects;
      const farmCrops = this.farm.crops;

      for (let r = 0; r < this.farm.rows; r++) {
        for (let c = 0; c < this.farm.cols; c++) {
          const tile = farmTiles[r][c];
          
          if (this.weather === 'rainy') {
            if (tile.isTilled || tile.type === 'soil') {
              tile.isWatered = true;
            }
          } else {
            // Check adjacent sprinklers
            const hasSprinklerNearby = 
              farmObjects[`${c+1},${r}`] === 'sprinkler' ||
              farmObjects[`${c-1},${r}`] === 'sprinkler' ||
              farmObjects[`${c},${r+1}`] === 'sprinkler' ||
              farmObjects[`${c},${r-1}`] === 'sprinkler';

            if (hasSprinklerNearby) {
              tile.isWatered = true;
              wateredCount++;
            }
          }
        }
      }

      // 4. Grow Crops that were watered
      let maturedCrops = 0;
      for (const key in farmCrops) {
        const crop = farmCrops[key];
        const [cx, cy] = key.split(',').map(Number);
        const tile = farmTiles[cy][cx];

        if (tile.isWatered) {
          crop.daysGrown++;
          const boost = tile.isFertilized ? 1.5 : 1.0;
          const stageRatio = (crop.daysGrown * boost) / crop.totalDays;

          if (stageRatio >= 1.0) {
            crop.stage = 3; // Ready to harvest!
            maturedCrops++;
          } else if (stageRatio >= 0.6) {
            crop.stage = 2;
          } else {
            crop.stage = 1;
          }
        }

        // Reset soil watering for the new day
        tile.isWatered = false;
      }

      // Complete sleep quest
      this.progressQuest('sleep_grow');

      // Auto-save day progress
      this.saveGame();

      // Sound
      window.soundSystem?.playMorning();

      // Show Day Summary Modal
      this.showDaySummaryModal(maturedCrops);
      this.updateHUD();
    }

    showDaySummaryModal(maturedCount) {
      const modal = document.getElementById('summaryModal');
      const dayTitle = document.getElementById('summaryDayTitle');
      const detailsElem = document.getElementById('summaryDetails');

      if (modal && dayTitle && detailsElem) {
        dayTitle.textContent = `Day ${this.day} - ${this.season}`;
        const weatherText = this.weather === 'rainy'
          ? (this.season === 'Winter' ? 'Snowy Flurries (All crops automatically watered!)' : 'Gentle Rain (All crops automatically watered!)')
          : 'Bright & Sunny';
        
        detailsElem.innerHTML = `
          <div class="summary-row">
            <span class="summary-label">Weather Forecast:</span>
            <span class="summary-val">${weatherText}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Energy Restored:</span>
            <span class="summary-val">100% (Well Rested)</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Crops Ready to Harvest:</span>
            <span class="summary-val" style="color: #10b981; font-weight: bold;">${maturedCount} crops glowing in the field!</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Current Savings:</span>
            <span class="summary-val" style="color: #f59e0b; font-weight: bold;">${this.player.gold} Gold</span>
          </div>
        `;
        modal.classList.add('active');
      }
    }

    saveGame() {
      try {
        if (this.currentLocation === 'farm') {
          this.farm.tiles = this.tiles;
          this.farm.crops = this.crops;
          this.farm.objects = this.objects;
          this.farm.debrisHealth = this.debrisHealth;
        } else if (this.currentLocation === 'city') {
          this.city.tiles = this.tiles;
          this.city.objects = this.objects;
        }

        const data = {
          gold: this.player.gold,
          day: this.day,
          season: this.season,
          grandmaApprovedSleep: this.grandmaApprovedSleep,
          hasProRod: this.player.hasProRod,
          hasCopperHoe: this.player.hasCopperHoe,
          hasSteelAxe: this.player.hasSteelAxe,
          hasSteelPickaxe: this.player.hasSteelPickaxe,
          fishingLog: this.fishingLog,
          inventory: this.inventory,
          currentLocation: this.currentLocation,
          farm: {
            tiles: this.farm.tiles,
            crops: this.farm.crops,
            objects: this.farm.objects,
            debrisHealth: this.farm.debrisHealth
          },
          tiles: this.farm.tiles,
          crops: this.farm.crops,
          objects: this.farm.objects,
          debrisHealth: this.debrisHealth,
          quests: this.quests,
          activeQuestIdx: this.activeQuestIdx,
          farmAnimals: this.farmAnimals,
          friendships: this.friendships,
          friendshipMilestones: this.friendshipMilestones,
          giftedToday: this.giftedToday,
          caveNodes: this.caveNodes
        };
        localStorage.setItem('grandmas_homestead_save', JSON.stringify(data));
      } catch (e) {
        console.warn('Auto-save error', e);
      }
    }

    loadGame() {
      try {
        const saved = localStorage.getItem('grandmas_homestead_save');
        if (saved) {
          const data = JSON.parse(saved);
          if (data.gold !== undefined) this.player.gold = data.gold;
          if (data.day !== undefined) this.day = data.day;
          if (data.season !== undefined) this.season = data.season;
          if (data.grandmaApprovedSleep !== undefined) this.grandmaApprovedSleep = data.grandmaApprovedSleep;
          if (data.hasProRod !== undefined) this.player.hasProRod = data.hasProRod;
          if (data.hasCopperHoe !== undefined) this.player.hasCopperHoe = data.hasCopperHoe;
          if (data.hasSteelAxe !== undefined) this.player.hasSteelAxe = data.hasSteelAxe;
          if (data.hasSteelPickaxe !== undefined) this.player.hasSteelPickaxe = data.hasSteelPickaxe;
          if (data.fishingLog) this.fishingLog = data.fishingLog;
          if (data.inventory) {
            this.inventory = data.inventory;
            if (!this.inventory.some(i => i.id === 'fishing_rod')) {
              this.inventory.push({
                id: 'fishing_rod',
                type: 'tool',
                name: 'Fishing Rod',
                count: 1,
                desc: 'Cast into Lake Hazel or Oakhaven Canal to catch fish.'
              });
            }
          }
          if (data.quests) this.quests = data.quests;
          if (data.activeQuestIdx !== undefined) this.activeQuestIdx = data.activeQuestIdx;
          if (Array.isArray(data.farmAnimals) && data.farmAnimals.length > 0) this.farmAnimals = data.farmAnimals;
          if (data.friendships) this.friendships = Object.assign(this.friendships || {}, data.friendships);
          if (data.friendshipMilestones) this.friendshipMilestones = data.friendshipMilestones;
          if (data.giftedToday) this.giftedToday = data.giftedToday;
          if (data.caveNodes) this.caveNodes = data.caveNodes;

          // Only restore tiles and objects if dimensions match new expanded map and tiles are valid!
          const candidateTiles = (data.farm && data.farm.tiles) || data.tiles;
          if (candidateTiles && Array.isArray(candidateTiles) && candidateTiles.length === this.farm.rows &&
              candidateTiles[0] && candidateTiles[0].length === this.farm.cols && candidateTiles[0][0] && typeof candidateTiles[0][0] === 'object') {
            this.farm.tiles = candidateTiles;
            const candidateCrops = (data.farm && data.farm.crops) || data.crops;
            if (candidateCrops) this.farm.crops = candidateCrops;
            const candidateObjects = (data.farm && data.farm.objects) || data.objects;
            if (candidateObjects) this.farm.objects = candidateObjects;
            const candidateDebris = (data.farm && data.farm.debrisHealth) || data.debrisHealth;
            if (candidateDebris) this.farm.debrisHealth = candidateDebris;

            // Ensure southern road gates are open & paved without old perimeter fences
            for (let r = 43; r < this.farm.rows; r++) {
              for (let c = 14; c <= 18; c++) {
                this.farm.tiles[r][c] = { type: 'path', isTilled: false, isWatered: false, seed: (r * 37 + c * 19) % 100 };
              }
              for (let c = 26; c <= 32; c++) {
                this.farm.tiles[r][c] = { type: 'path', isTilled: false, isWatered: false, seed: (r * 37 + c * 19) % 100 };
              }
            }
            this.farm.objects['16,44'] = 'sign_city';
            this.farm.objects['28,43'] = 'sign_city';
          }
        }
      } catch (e) {
        console.warn('Auto-load error', e);
      }
    }

    // --- Countryside Shop System ---
    openShopModal(tab = 'buy') {
      this.progressQuest('visit_shop');
      const modal = document.getElementById('shopModal');
      if (!modal) return;

      this.renderShop(tab);
      modal.classList.add('active');
    }

    renderShop(activeTab = 'buy') {
      const container = document.getElementById('shopContent');
      if (!container) return;

      let html = `
        <div class="shop-tabs">
          <button class="shop-tab-btn ${activeTab === 'buy' ? 'active' : ''}" id="tabBtnBuy">
            Buy Seeds & Upgrades
          </button>
          <button class="shop-tab-btn ${activeTab === 'sell' ? 'active' : ''}" id="tabBtnSell">
            Sell Farm Produce
          </button>
        </div>
      `;

      if (activeTab === 'buy') {
        const storeItems = [
          { id: 'turnip_seed', name: 'Turnip Seeds', cost: 20, desc: 'Grows in 2 days. Sells for 48 G.' },
          { id: 'carrot_seed', name: 'Carrot Seeds', cost: 35, desc: 'Grows in 3 days. Sells for 85 G.' },
          { id: 'strawberry_seed', name: 'Strawberry Seeds', cost: 60, desc: 'Grows in 4 days. Sells for 150 G.' },
          { id: 'blueberry_seed', name: 'Blueberry Seeds', cost: 75, desc: 'City variety. Grows in 4 days. Sells for 165 G.' },
          { id: 'tomato_seed', name: 'Tomato Seeds', cost: 80, desc: 'Grows in 4 days. Sells for 200 G.' },
          { id: 'corn_seed', name: 'Golden Corn Seeds', cost: 120, desc: 'Grows in 5 days. Sells for 310 G.' },
          { id: 'melon_seed', name: 'Sweet Melon Seeds', cost: 140, desc: 'Rich honeydew melon. Grows in 5 days. Sells for 280 G.' },
          { id: 'pumpkin_seed', name: 'Pumpkin Seeds', cost: 150, desc: 'Grows in 6 days. Sells for 420 G.' },
          { id: 'starfruit_seed', name: 'Starfruit Seeds', cost: 250, desc: 'Exotic glowing fruit. Grows in 6 days. Sells for 650 G.' },
          { id: 'fertilizer', name: 'Speed-Gro Fertilizer', cost: 40, desc: 'Speeds up growth by 50%.' },
          { id: 'sprinkler', name: 'Farm Sprinkler', cost: 320, desc: 'Auto-waters adjacent 4 tiles every morning.' },
          { id: 'apple_pie', name: 'Grandma’s Berry Pie', cost: 45, desc: 'Delicious homemade pastry. Restores 60 Stamina.' }
        ];
        if (!this.player.hasProRod) {
          storeItems.push({
            id: 'pro_rod',
            name: 'Pro Fiberglass Rod',
            cost: 240,
            desc: 'Wider catch zone, quicker bites & better odds for rare lake fish!'
          });
        }

        html += `<div class="shop-items-grid">`;
        storeItems.forEach(item => {
          html += `
            <div class="shop-card">
              <div class="shop-card-left">
                <div class="shop-item-icon">${this.getItemIconSvg(item)}</div>
                <div class="shop-card-info">
                  <div class="shop-card-name">${item.name}</div>
                  <div class="shop-card-desc">${item.desc}</div>
                  <div class="shop-card-price">${item.cost} Gold</div>
                </div>
              </div>
              <button class="shop-buy-btn" data-buy="${item.id}" data-cost="${item.cost}">
                Buy
              </button>
            </div>
          `;
        });
        html += `</div>`;
      } else {
        // Sell Tab: show individual items (crops, fish, forage, materials, cooked dishes)
        const sellableItems = this.inventory.filter(i => getSellPrice(i) > 0);

        if (sellableItems.length === 0) {
          html += `
            <div class="empty-shop-state">
              <p>You don't have any produce, fish, forageables, or materials to sell yet!</p>
              <p style="color: #64748b; font-size: 0.9rem; margin-top: 6px;">Harvest crops, cast your Fishing Rod at Lake Hazel, or gather wildflowers & wood.</p>
            </div>
          `;
        } else {
          html += `
            <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span style="font-size: 0.84rem; color: #64748b; font-weight: 600;">Sell 1 item at a time, 5 at once, or clear an entire stack.</span>
              <button class="shop-sell-all-btn" id="btnSellAll">Sell All Produce</button>
            </div>
            <div class="shop-items-grid">
          `;

          sellableItems.forEach(item => {
            const unitPrice = getSellPrice(item);
            const totalPrice = unitPrice * item.count;

            html += `
              <div class="shop-card">
                <div class="shop-card-left">
                  <div class="shop-item-icon">${this.getItemIconSvg(item)}</div>
                  <div class="shop-card-info">
                    <div class="shop-card-name">${item.name} (x${item.count})</div>
                    <div class="shop-card-desc">${unitPrice} G each</div>
                    <div class="shop-card-price" style="color: #10b981;">Stack: +${totalPrice} Gold</div>
                  </div>
                </div>
                <div class="shop-sell-actions">
                  <button class="shop-sell-btn qty-one" data-sell="${item.id}" data-qty="1">
                    Sell 1 (+${unitPrice}G)
                  </button>
                  ${item.count >= 5 ? `
                    <button class="shop-sell-btn qty-five" data-sell="${item.id}" data-qty="5">
                      Sell 5 (+${unitPrice * 5}G)
                    </button>
                  ` : ''}
                  ${item.count > 1 ? `
                    <button class="shop-sell-btn qty-stack" data-sell="${item.id}" data-qty="${item.count}">
                      All x${item.count}
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          });
          html += `</div>`;
        }
      }

      container.innerHTML = html;

      // Bind Tab Buttons
      document.getElementById('tabBtnBuy')?.addEventListener('click', () => this.renderShop('buy'));
      document.getElementById('tabBtnSell')?.addEventListener('click', () => this.renderShop('sell'));

      // Bind Buy Buttons
      container.querySelectorAll('[data-buy]').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemId = btn.getAttribute('data-buy');
          const cost = parseInt(btn.getAttribute('data-cost'));
          if (itemId === 'pro_rod' && this.player.hasProRod) {
            this.showToast('You already own the Pro Fiberglass Rod!');
            return;
          }
          if (this.player.gold >= cost) {
            this.player.gold -= cost;
            this.addItem(itemId, 1);
            window.soundSystem?.playCoin();
            this.showToast(`Purchased 1x ${itemId.replace(/_/g, ' ')}!`);
            this.updateHUD();
            if (itemId === 'pro_rod') this.renderShop('buy');
          } else {
            this.showToast('Not enough Gold! Earn more by harvesting crops or fishing.');
          }
        });
      });

      // Bind Individual / Stack Sell Buttons
      container.querySelectorAll('[data-sell]').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemId = btn.getAttribute('data-sell');
          const reqQty = parseInt(btn.getAttribute('data-qty')) || 1;
          this.sellItemQuantity(itemId, reqQty);
        });
      });

      // Bind Sell All Button
      document.getElementById('btnSellAll')?.addEventListener('click', () => {
        let totalEarned = 0;
        for (let i = this.inventory.length - 1; i >= 0; i--) {
          const item = this.inventory[i];
          const unitPrice = getSellPrice(item);
          if (unitPrice > 0) {
            totalEarned += item.count * unitPrice;
            this.inventory.splice(i, 1);
          }
        }
        if (totalEarned > 0) {
          this.player.gold += totalEarned;
          if (this.activeSlot >= this.inventory.length) {
            this.activeSlot = Math.max(0, this.inventory.length - 1);
          }
          window.soundSystem?.playCoin();
          this.showToast(`Sold all produce & catches for +${totalEarned} Gold!`);
          this.updateHUD();
          this.renderShop('sell');
        }
      });
    }

    sellItemQuantity(itemId, requestedQty = 1) {
      const item = this.inventory.find(i => i.id === itemId);
      if (!item) return 0;

      const unitPrice = getSellPrice(item);
      if (unitPrice <= 0) return 0;

      const qty = Math.min(item.count, Math.max(1, requestedQty));
      const earned = qty * unitPrice;
      const itemName = item.name;

      this.player.gold += earned;
      this.removeItem(itemId, qty);
      window.soundSystem?.playCoin();
      this.showToast(`Sold ${qty}x ${itemName} for +${earned} Gold!`);
      this.updateHUD();
      this.renderShop('sell');
      return earned;
    }

    openCookingModal() {
      const modal = document.getElementById('cookingModal');
      const container = document.getElementById('cookingContent');
      if (!modal || !container) return;

      const titleSpan = modal.querySelector('.modal-title-wrap span');
      if (titleSpan) titleSpan.textContent = "Grandma's Country Kitchen & Log";

      const caughtCount = Object.keys(this.fishingLog || {}).length;
      const totalFish = Object.keys(FISH_DEFS).length;

      let html = `
        <p style="font-size: 0.92rem; color: #475569; margin-bottom: 12px;">
          Combine farm crops, fresh catches, and wild forage at Grandma Hazel’s country table. Cooked dishes restore plenty of energy or sell for higher profit!
        </p>
        <div class="shop-items-grid">
      `;

      COOKING_RECIPES.forEach(recipe => {
        const canCook = recipe.ingredients.every(ing => this.getItemCount(ing.id) >= ing.count);
        const ingText = recipe.ingredients.map(ing => {
          const have = this.getItemCount(ing.id);
          const defMap = { egg: { name: 'Fresh Farm Egg' }, milk: { name: 'Rich Barn Milk' }, wool: { name: 'Soft Cloud Wool' } };
          const defName = (CROP_DEFS[ing.id] || FISH_DEFS[ing.id] || FORAGE_DEFS[ing.id] || defMap[ing.id] || { name: ing.id }).name;
          return `<span style="color: ${have >= ing.count ? '#15803d' : '#b91c1c'}; font-weight: 700;">${defName} (${have}/${ing.count})</span>`;
        }).join(' + ');

        html += `
          <div class="shop-card">
            <div class="shop-card-left">
              <div class="shop-item-icon">${this.getItemIconSvg({ id: recipe.id, type: 'food' })}</div>
              <div class="shop-card-info">
                <div class="shop-card-name">${recipe.name}</div>
                <div class="shop-card-desc">${ingText}</div>
                <div class="shop-card-price">+${recipe.heal} Energy | Sells ${recipe.sellPrice} G</div>
              </div>
            </div>
            <button class="shop-buy-btn" data-cook="${recipe.id}" ${canCook ? '' : 'disabled style="opacity:0.45;cursor:not-allowed;"'}>
              Cook
            </button>
          </div>
        `;
      });

      html += `
        </div>
        <div style="margin-top: 16px; padding-top: 12px; border-top: 2px solid #e2e8f0;">
          <div style="font-weight: 800; color: #1e293b; font-size: 0.92rem; margin-bottom: 8px;">
            Homestead Angler Catch Log (${caughtCount} / ${totalFish} Species Caught)
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${Object.values(FISH_DEFS).map(f => {
              const qty = (this.fishingLog && this.fishingLog[f.id]) || 0;
              return `
                <div style="padding: 6px 10px; border-radius: 8px; border: 1.5px solid ${qty > 0 ? '#38bdf8' : '#cbd5e1'}; background: ${qty > 0 ? '#f0f9ff' : '#f8fafc'}; font-size: 0.78rem; font-weight: 700; color: ${qty > 0 ? '#0369a1' : '#94a3b8'};">
                  ${qty > 0 ? `${f.name} (x${qty})` : `??? (${f.rarity})`}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      container.innerHTML = html;
      container.querySelectorAll('[data-cook]').forEach(btn => {
        btn.addEventListener('click', () => {
          const recipeId = btn.getAttribute('data-cook');
          const recipe = COOKING_RECIPES.find(r => r.id === recipeId);
          if (!recipe) return;
          const canCook = recipe.ingredients.every(ing => this.getItemCount(ing.id) >= ing.count);
          if (!canCook) {
            this.showToast('You do not have all the ingredients for this recipe yet!');
            return;
          }
          recipe.ingredients.forEach(ing => this.removeItem(ing.id, ing.count));
          this.addItem(recipe.id, 1);
          window.soundSystem?.playCook();
          this.spawnParticles(this.player.x + 16, this.player.y + 8, '#fb923c', 12);
          this.showToast(`Cooked ${recipe.name}! Eat it for +${recipe.heal} Energy or sell it for ${recipe.sellPrice} G.`);
          this.openCookingModal();
        });
      });

      modal.classList.add('active');
    }

    // --- City Modals & Systems ---
    openNoticeBoardModal() {
      const modal = document.getElementById('bulletinModal');
      const container = document.getElementById('bulletinContent');
      if (!modal || !container) return;

      let html = `
        <p style="font-size: 0.92rem; color: #475569; margin-bottom: 12px; line-height: 1.5;">
          Help the citizens and businesses of Oakhaven with fresh farm produce and materials to earn Gold and build community goodwill!
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
      `;

      this.noticeBoardTasks.forEach(task => {
        const countInInventory = this.getItemCount(task.itemReq) + (task.altReq ? this.getItemCount(task.altReq) : 0);
        const hasEnough = countInInventory >= task.countReq;

        html += `
          <div class="tutorial-item ${task.isDone ? 'done' : (hasEnough ? 'active-step' : 'pending')}" style="padding: 10px 14px;">
            <div class="tutorial-item-header">
              <span class="tutorial-title">${task.title}</span>
              <span class="tutorial-badge ${task.isDone ? 'done' : (hasEnough ? 'active-step' : 'pending')}">
                ${task.isDone ? 'Completed' : (hasEnough ? 'Ready to Deliver' : `${countInInventory}/${task.countReq} Gathered`)}
              </span>
            </div>
            <div class="tutorial-desc">${task.desc}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
              <span class="tutorial-reward" style="font-weight: bold; color: #b45309;">Reward: +${task.rewardGold} Gold</span>
              ${!task.isDone ? `
                <button class="btn-primary" style="padding: 5px 12px; font-size: 0.82rem;" ${!hasEnough ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} data-task-id="${task.id}">
                  Deliver Goods
                </button>
              ` : '<span style="color: #10b981; font-weight: bold; font-size: 0.85rem;">Reward Claimed</span>'}
            </div>
          </div>
        `;
      });

      html += `</div>`;
      container.innerHTML = html;

      container.querySelectorAll('[data-task-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const taskId = btn.getAttribute('data-task-id');
          const task = this.noticeBoardTasks.find(t => t.id === taskId);
          if (task && !task.isDone) {
            let needed = task.countReq;
            const mainCount = this.getItemCount(task.itemReq);
            const takeMain = Math.min(mainCount, needed);
            if (takeMain > 0) this.removeItem(task.itemReq, takeMain);
            needed -= takeMain;
            if (needed > 0 && task.altReq) {
              this.removeItem(task.altReq, needed);
            }

            task.isDone = true;
            this.player.gold += task.rewardGold;
            window.soundSystem?.playCoin();
            this.showToast(`Completed "${task.title}"! (+${task.rewardGold} Gold)`);
            this.showFloatingText(`+${task.rewardGold} G`, this.player.x + 16, this.player.y - 12, '#facc15');
            this.updateHUD();
            this.openNoticeBoardModal();
          }
        });
      });

      modal.classList.add('active');
    }

    openBakeryModal() {
      const modal = document.getElementById('bakeryModal');
      const container = document.getElementById('bakeryContent');
      if (!modal || !container) return;

      const bakeryItems = [
        { id: 'baguette', name: 'Fresh French Baguette', cost: 18, energy: 30, desc: 'Warm crusty bread baked in Nora’s stone oven. Restores 30 Energy.' },
        { id: 'cinnamon_bun', name: 'Cinnamon Roll', cost: 32, energy: 55, desc: 'Swirled with fragrant cinnamon and honey glaze. Restores 55 Energy.' },
        { id: 'berry_tart', name: 'Hazelberry Fruit Tart', cost: 50, energy: 85, desc: 'Packed with sweet wild strawberries & blueberries. Restores 85 Energy.' },
        { id: 'hot_cocoa', name: 'Steaming Hot Cocoa', cost: 25, energy: 45, desc: 'Rich chocolate topped with vanilla foam. Restores 45 Energy.' }
      ];

      let html = `
        <p style="font-size: 0.9rem; color: #475569; margin-bottom: 12px; line-height: 1.5;">
          Welcome to Hazelwood Bakery &amp; Café! Fresh oven goods restore stamina immediately to keep you energized.
        </p>
        <div class="shop-items-grid">
      `;

      bakeryItems.forEach(item => {
        html += `
          <div class="shop-card">
            <div class="shop-card-info">
              <div class="shop-card-name">${item.name}</div>
              <div class="shop-card-desc">${item.desc}</div>
              <div class="shop-card-price" style="color: #ea580c;">${item.cost} Gold (+${item.energy} Stamina)</div>
            </div>
            <button class="shop-buy-btn" data-bakery-id="${item.id}" data-cost="${item.cost}" data-energy="${item.energy}">
              Eat (${item.cost} G)
            </button>
          </div>
        `;
      });

      html += `</div>`;
      container.innerHTML = html;

      container.querySelectorAll('[data-bakery-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const cost = parseInt(btn.getAttribute('data-cost'));
          const energy = parseInt(btn.getAttribute('data-energy'));
          const name = btn.getAttribute('data-bakery-id').replace(/_/g, ' ');

          if (this.player.gold >= cost) {
            this.player.gold -= cost;
            this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + energy);
            window.soundSystem?.playCoin();
            this.spawnParticles(this.player.x + 16, this.player.y + 16, '#f97316', 8);
            this.showFloatingText(`+${energy} Energy`, this.player.x + 16, this.player.y - 10, '#22c55e');
            this.showToast(`Ate a warm ${name}! Restored +${energy} Energy.`);
            this.updateHUD();
          } else {
            this.showToast('You do not have enough Gold for this pastry!');
          }
        });
      });

      modal.classList.add('active');
    }

    openBlacksmithModal() {
      const modal = document.getElementById('blacksmithModal');
      const container = document.getElementById('blacksmithContent');
      if (!modal || !container) return;

      const upgrades = [
        {
          id: 'copper_hoe',
          title: 'Copper Hoe Reinforcement',
          costGold: 140,
          reqStone: 8,
          desc: 'Reinforces your farming hoe with tempered copper plating. Cuts stamina cost from 2 to 1 per till.',
          isUnlocked: this.player.hasCopperHoe
        },
        {
          id: 'steel_axe',
          title: 'Steel Forester Axe',
          costGold: 220,
          reqStone: 12,
          desc: 'Forged high-carbon steel blade. Chops sturdy trees down in 2 hits instead of 3.',
          isUnlocked: this.player.hasSteelAxe
        },
        {
          id: 'steel_pickaxe',
          title: 'Steel Prospector Pickaxe',
          costGold: 220,
          reqStone: 12,
          desc: 'Heavy reinforced pickaxe beak. Shatters granite boulders in a single strike!',
          isUnlocked: this.player.hasSteelPickaxe
        },
        {
          id: 'deluxe_can',
          title: 'Deluxe Brass Watering Can',
          costGold: 180,
          reqStone: 6,
          desc: 'Double-capacity chamber holding 40 water units before needing a refill at the well.',
          isUnlocked: this.player.waterCapacity >= 40
        }
      ];

      const stoneCount = this.getItemCount('stone');

      let html = `
        <p style="font-size: 0.9rem; color: #475569; margin-bottom: 12px; line-height: 1.5;">
          Garth’s anvil is glowing! Upgrade your farming tools with Gold and Stone mined from the homestead quarry. (You have <strong>${stoneCount} Stone</strong>).
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
      `;

      upgrades.forEach(up => {
        const canAfford = this.player.gold >= up.costGold && stoneCount >= up.reqStone;
        html += `
          <div class="tutorial-item ${up.isUnlocked ? 'done' : (canAfford ? 'active-step' : 'pending')}" style="padding: 12px 16px;">
            <div class="tutorial-item-header">
              <span class="tutorial-title">${up.title}</span>
              <span class="tutorial-badge ${up.isUnlocked ? 'done' : (canAfford ? 'active-step' : 'pending')}">
                ${up.isUnlocked ? 'Forged & Active' : (canAfford ? 'Ready to Forge' : 'Missing Materials')}
              </span>
            </div>
            <div class="tutorial-desc">${up.desc}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <span style="font-size: 0.86rem; color: #b45309; font-weight: bold;">
                Cost: ${up.costGold} Gold + ${up.reqStone} Stone
              </span>
              ${!up.isUnlocked ? `
                <button class="btn-primary" style="padding: 6px 14px; font-size: 0.84rem;" ${!canAfford ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''} data-upgrade-id="${up.id}">
                  Forge Upgrade
                </button>
              ` : '<span style="color: #10b981; font-weight: bold; font-size: 0.85rem;">Equipped</span>'}
            </div>
          </div>
        `;
      });

      html += `</div>`;
      container.innerHTML = html;

      container.querySelectorAll('[data-upgrade-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-upgrade-id');
          const up = upgrades.find(u => u.id === id);
          if (up && !up.isUnlocked && this.player.gold >= up.costGold && this.getItemCount('stone') >= up.reqStone) {
            this.player.gold -= up.costGold;
            this.removeItem('stone', up.reqStone);

            if (id === 'copper_hoe') this.player.hasCopperHoe = true;
            if (id === 'steel_axe') this.player.hasSteelAxe = true;
            if (id === 'steel_pickaxe') this.player.hasSteelPickaxe = true;
            if (id === 'deluxe_can') {
              this.player.waterCapacity = 40;
              this.player.water = 40;
            }

            window.soundSystem?.playHit();
            this.spawnParticles(this.player.x + 16, this.player.y + 16, '#94a3b8', 12);
            this.showToast(`Forged ${up.title}! Your tool has been upgraded.`);
            this.updateHUD();
            this.openBlacksmithModal();
          }
        });
      });

      modal.classList.add('active');
    }

    talkToCityNPC(npcType) {
      window.soundSystem?.playDialogue();

      const modal = document.getElementById('cityNpcModal');
      const nameElem = document.getElementById('cityNpcName');
      const titleElem = document.getElementById('cityNpcTitle');
      const subElem = document.getElementById('cityNpcSubtitle');
      const textElem = document.getElementById('cityNpcText');
      const actionsElem = document.getElementById('cityNpcActions');
      const portraitElem = document.getElementById('cityNpcPortrait');
      if (!modal || !nameElem || !textElem) return;

      if (npcType === 'mayor') {
        nameElem.textContent = 'Mayor Clara';
        titleElem.textContent = 'Mayor Clara';
        subElem.textContent = 'Oakhaven Town Mayor';
        portraitElem.style.background = '#dcfce7';
        portraitElem.innerHTML = `
          <svg class="ui-icon" style="width: 32px; height: 32px; color: #15803d;" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="5"/>
            <path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
        `;
        textElem.textContent = `"Welcome to Oakhaven, dear friend! I remember when your grandfather tended the homestead to the north. With Grandma Hazel’s guidance, I have no doubt your farm will feed our entire community. Make sure to check our Notice Board for town requests!"`;
        actionsElem.innerHTML = `
          <button class="btn-secondary" onclick="document.getElementById('cityNpcModal').classList.remove('active'); window.game.openNoticeBoardModal();">
            View Community Requests
          </button>
          <button class="btn-primary" onclick="document.getElementById('cityNpcModal').classList.remove('active')">
            Thank you, Mayor Clara!
          </button>
        `;
      } else if (npcType === 'baker') {
        nameElem.textContent = 'Nora the Baker';
        titleElem.textContent = 'Nora the Baker';
        subElem.textContent = 'Proprietor of Hazelwood Café';
        portraitElem.style.background = '#ffedd5';
        portraitElem.innerHTML = `
          <svg class="ui-icon" style="width: 32px; height: 32px; color: #c2410c;" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="5"/>
            <path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
        `;
        textElem.textContent = `"Ah, hello there! That delightful smell in the air is my fresh sourdough batch! If Grandma Hazel ever sends over some of her famous wild berries, I would bake the town's most heavenly tarts. If you're tired from fieldwork, stop in for a cinnamon bun!"`;
        actionsElem.innerHTML = `
          <button class="btn-secondary" onclick="document.getElementById('cityNpcModal').classList.remove('active'); window.game.openBakeryModal();">
            Browse Bakery Menu
          </button>
          <button class="btn-primary" onclick="document.getElementById('cityNpcModal').classList.remove('active')">
            See you soon, Nora!
          </button>
        `;
      } else if (npcType === 'blacksmith') {
        nameElem.textContent = 'Garth the Blacksmith';
        titleElem.textContent = 'Garth Ironhand';
        subElem.textContent = 'Master Town Blacksmith';
        portraitElem.style.background = '#f1f5f9';
        portraitElem.innerHTML = `
          <svg class="ui-icon" style="width: 32px; height: 32px; color: #334155;" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="5"/>
            <path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
        `;
        textElem.textContent = `"[CLANG! CLANG!] Greeting, farmer! Rusty old starter tools will only wear your back out. Bring me Stone from the homestead quarry along with some Gold coins, and I will forge you high-temper copper and steel tools that cut your work in half!"`;
        actionsElem.innerHTML = `
          <button class="btn-secondary" onclick="document.getElementById('cityNpcModal').classList.remove('active'); window.game.openBlacksmithModal();">
            Forge Tool Upgrades
          </button>
          <button class="btn-primary" onclick="document.getElementById('cityNpcModal').classList.remove('active')">
            Keep up the good work!
          </button>
        `;
      } else if (npcType === 'fisherman') {
        nameElem.textContent = 'Barnaby the Fisherman';
        titleElem.textContent = 'Old Barnaby';
        subElem.textContent = 'Canal Angler & Harbor Veteran';
        portraitElem.style.background = '#e0f2fe';
        portraitElem.innerHTML = `
          <svg class="ui-icon" style="width: 32px; height: 32px; color: #0369a1;" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="5"/>
            <path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
        `;
        const speciesCaught = Object.keys(this.fishingLog || {}).length;
        const totalSpecies = Object.keys(FISH_DEFS).length;
        textElem.textContent = `"Hush now... the canal trout and Lake Hazel carp are biting strong! Equip your Fishing Rod, face the water, and press E or USE. When the float flashes (!), strike fast and tap inside the green bar! So far you've landed ${speciesCaught} of ${totalSpecies} local species."`;
        actionsElem.innerHTML = `
          <button class="btn-primary" onclick="document.getElementById('cityNpcModal').classList.remove('active')">
            Good luck with the catch, Barnaby!
          </button>
        `;
      } else if (npcType === 'penny') {
        nameElem.textContent = 'Penny the Florist';
        titleElem.textContent = 'Penny Greenfield';
        subElem.textContent = 'Botanist & Flower Specialist';
        portraitElem.style.background = '#fef08a';
        portraitElem.innerHTML = `
          <svg class="ui-icon" style="width: 32px; height: 32px; color: #ca8a04;" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/><path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/><path d="M20 12h2"/>
          </svg>
        `;
        textElem.textContent = `"Hello there! Aren't the Oakhaven plaza blooms radiant today? Bees from my honey hives love visiting the wildflowers along Grandma Hazel's brook. If you'd like a jar of pure wildflower honey to keep your stamina topped up, I've got plenty!"`;
        actionsElem.innerHTML = `
          <button class="btn-secondary" id="btnBuyHoney">
            Buy Wild Honey (25 G, +45 Energy)
          </button>
          <button class="btn-primary" onclick="document.getElementById('cityNpcModal').classList.remove('active')">
            Have a lovely day, Penny!
          </button>
        `;
        setTimeout(() => {
          document.getElementById('btnBuyHoney')?.addEventListener('click', () => {
            if (this.player.gold >= 25) {
              this.player.gold -= 25;
              this.addItem('honey', 1);
              window.soundSystem?.playCoin();
              this.showToast('Purchased 1x Jar of Wild Honey! Restores 45 Energy.');
              this.updateHUD();
              modal.classList.remove('active');
            } else {
              this.showToast('Not enough Gold for honey!');
            }
          });
        }, 50);
      } else if (npcType === 'dog') {
        nameElem.textContent = 'Jasper the Pup';
        titleElem.textContent = 'Jasper';
        subElem.textContent = 'Oakhaven Town Mascot';
        portraitElem.style.background = '#fed7aa';
        portraitElem.innerHTML = `
          <svg class="ui-icon" style="width: 32px; height: 32px; color: #ea580c;" viewBox="0 0 24 24">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        `;
        textElem.textContent = `"[Yip! Yip! Woof!] Jasper wags his fluffy golden tail excitedly, leans against your legs, and nudges your hand for gentle head pats. His cheerful countryside spirit fills you with fresh vigor!"`;
        this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 5);
        this.spawnParticles(this.player.x + 16, this.player.y + 16, '#f472b6', 10);
        this.showFloatingText('+5 Energy (Joy!)', this.player.x + 16, this.player.y - 10, '#ec4899');
        this.updateHUD();
        actionsElem.innerHTML = `
          <button class="btn-primary" onclick="document.getElementById('cityNpcModal').classList.remove('active')">
            Good boy, Jasper!
          </button>
        `;
      } else if (npcType === 'pastor') {
        nameElem.textContent = 'Pastor Thomas';
        titleElem.textContent = 'Pastor Thomas';
        subElem.textContent = 'Keeper of Oakhaven Chapel';
        portraitElem.style.background = '#fef3c7';
        portraitElem.innerHTML = `
          <svg class="ui-icon" style="width: 32px; height: 32px; color: #b45309;" viewBox="0 0 24 24">
            <path d="M12 2v20"/><path d="M5 9h14"/>
          </svg>
        `;
        textElem.textContent = `"Peace be with you, young farmer! Our chapel bell rings clear from sunrise across Lake Hazel. Whenever your spirit feels weary from long harvests, step inside Oakhaven Chapel for a daily Serenity Blessing to restore your vigor."`;
        actionsElem.innerHTML = `
          <button class="btn-secondary" id="btnChapelBlessing" ${this.dailyBlessingClaimed ? 'disabled style="opacity:0.55;cursor:not-allowed;"' : ''}>
            ${this.dailyBlessingClaimed ? 'Daily Blessing Received' : 'Receive Daily Blessing (+25 Energy)'}
          </button>
          <button class="btn-primary" onclick="document.getElementById('cityNpcModal').classList.remove('active')">
            Peace to you, Pastor!
          </button>
        `;
        setTimeout(() => {
          document.getElementById('btnChapelBlessing')?.addEventListener('click', () => {
            this.receiveChapelBlessing();
            modal.classList.remove('active');
          });
        }, 50);
      } else if (npcType === 'librarian') {
        nameElem.textContent = 'Maeve the Librarian';
        titleElem.textContent = 'Maeve Bellamy';
        subElem.textContent = 'Curator of Oakhaven Library';
        portraitElem.style.background = '#ccfbf1';
        portraitElem.innerHTML = `
          <svg class="ui-icon" style="width: 32px; height: 32px; color: #0f766e;" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        `;
        textElem.textContent = `"Welcome! I keep Oakhaven's agricultural ledgers and fish field notes cataloged on these shelves. Check our Town Almanac anytime to track every crop variety, fish species, and recipe discovered across the valley!"`;
        actionsElem.innerHTML = `
          <button class="btn-secondary" onclick="document.getElementById('cityNpcModal').classList.remove('active'); window.game.openLibraryAlmanacModal();">
            Open Oakhaven Almanac
          </button>
          <button class="btn-primary" onclick="document.getElementById('cityNpcModal').classList.remove('active')">
            Happy reading, Maeve!
          </button>
        `;
      } else if (npcType === 'pip') {
        nameElem.textContent = 'Pip the Farmhand';
        titleElem.textContent = 'Pip Oakwood';
        subElem.textContent = 'Apprentice Angler & Messenger';
        portraitElem.style.background = '#dcfce7';
        portraitElem.innerHTML = `
          <svg class="ui-icon" style="width: 32px; height: 32px; color: #15803d;" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
        `;
        textElem.textContent = `"Whoa, look at your farm boots! Everybody in Oakhaven keeps a daily schedule—if you visit at noon versus sunset, you'll catch Barnaby grabbing bait in the Plaza or Pastor Thomas strolling by the fountain! Wait till rainy days for rare Emperor Carp in Lake Hazel!"`;
        actionsElem.innerHTML = `
          <button class="btn-primary" onclick="document.getElementById('cityNpcModal').classList.remove('active')">
            See you around town, Pip!
          </button>
        `;
      }

      // Append live resident schedule status to subtitle when chatting outdoors
      const npcObj = this.city.npcs.find(n => n.type === npcType);
      if (npcObj && npcObj.activity && subElem && this.currentLocation === 'city') {
        subElem.textContent = `${subElem.textContent} — ${npcObj.activity}`;
      }

      if (actionsElem) {
        const displayName = titleElem.textContent || npcType;
        actionsElem.insertAdjacentHTML('afterbegin', `${this.getFriendshipBarHtml(npcType)}${this.getGiftButtonHtml(npcType)}`);
        this.bindGiftButton(npcType, displayName, () => this.talkToCityNPC(npcType));
      }

      modal.classList.add('active');
    }

    getFriendshipBarHtml(npcId) {
      const hearts = Math.max(0, Math.min(5, (this.friendships && this.friendships[npcId]) || 0));
      let icons = '';
      for (let i = 0; i < 5; i++) {
        const filled = i < hearts;
        icons += `<svg viewBox="0 0 24 24" width="16" height="16" fill="${filled ? '#e11d48' : 'none'}" stroke="${filled ? '#be123c' : '#94a3b8'}" stroke-width="2" style="vertical-align:middle;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
      }
      return `<div style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 10px;background:#fff1f2;border:1px solid #fecdd3;border-radius:10px;margin-bottom:4px;font-size:0.84rem;color:#9f1239;font-weight:700;">
        <span>Friendship (${hearts}/5):</span>
        <span style="display:inline-flex;gap:3px;align-items:center;">${icons}</span>
      </div>`;
    }

    getGiftButtonHtml(npcId) {
      if (this.giftedToday && this.giftedToday[npcId]) {
        return `<button class="btn-secondary" disabled style="opacity:0.6;cursor:not-allowed;">Gifted Today</button>`;
      }
      const activeItem = this.inventory[this.activeSlot];
      if (!activeItem || activeItem.type === 'tool') {
        return `<button class="btn-secondary" disabled style="opacity:0.6;cursor:not-allowed;" title="Select a crop, fish, food, flower, or ore in your hotbar">Select Item to Gift</button>`;
      }
      return `<button class="btn-secondary" id="btnGiveNpcGift">Give Gift (1x ${activeItem.name})</button>`;
    }

    bindGiftButton(npcId, displayName, refreshCb) {
      setTimeout(() => {
        document.getElementById('btnGiveNpcGift')?.addEventListener('click', () => {
          this.giveGiftToNPC(npcId, displayName, refreshCb);
        });
      }, 25);
    }

    giveGiftToNPC(npcId, displayName, refreshCb) {
      if (!this.friendships) this.friendships = {};
      if (!this.giftedToday) this.giftedToday = {};
      if (!this.friendshipMilestones) this.friendshipMilestones = {};

      if (this.giftedToday[npcId]) {
        this.showToast(`You already gave ${displayName} a gift today!`);
        return;
      }
      const item = this.inventory[this.activeSlot];
      if (!item || item.type === 'tool') {
        this.showToast('Hold a non-tool item in your hotbar to give as a gift!');
        return;
      }

      const itemId = item.id;
      const itemName = item.name;
      const favs = NPC_FAVORITE_GIFTS[npcId] || [];
      const isFav = favs.includes(itemId);
      const gain = isFav ? 2 : 1;

      this.useItem(this.activeSlot);
      this.giftedToday[npcId] = true;
      const prevHearts = this.friendships[npcId] || 0;
      const nextHearts = Math.min(5, prevHearts + gain);
      this.friendships[npcId] = nextHearts;

      window.soundSystem?.playHarvest();
      this.spawnParticles(this.player.x + 16, this.player.y + 8, '#f43f5e', 12);

      let msg = isFav
        ? `${displayName} loved your ${itemName}! (+${gain} Friendship Hearts)`
        : `${displayName} happily accepted your ${itemName}! (+1 Friendship Heart)`;

      if (nextHearts >= 3 && !this.friendshipMilestones[npcId]) {
        this.friendshipMilestones[npcId] = true;
        this.player.gold += 100;
        window.soundSystem?.playCoin();
        msg += ' Milestone Reward: +100 Gold!';
      }

      this.showToast(msg);
      this.updateHUD();
      this.saveGame();
      if (typeof refreshCb === 'function') refreshCb();
    }

    populateCaveNodes() {
      this.caveNodes = {};
      const nodeTypes = ['rock', 'rock', 'copper_ore', 'copper_ore', 'gold_ore', 'quartz'];
      let placed = 0;
      let attempts = 0;
      while (placed < 16 && attempts < 140) {
        attempts++;
        const c = 2 + Math.floor(Math.random() * 14); // cols 2..15
        const r = 4 + Math.floor(Math.random() * 7);  // rows 4..10
        // Keep south doorway, ladder, and player spawn clear
        if (c >= 7 && c <= 10 && r >= 9) continue;
        if (c >= 13 && c <= 16 && r <= 5) continue;
        const key = `${c},${r}`;
        if (!this.caveNodes[key]) {
          this.caveNodes[key] = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
          placed++;
        }
      }
    }

    mineCaveNode(tx, ty) {
      const key = `${tx},${ty}`;
      const nodeType = this.caveNodes && this.caveNodes[key];
      if (!nodeType) return;

      const cost = this.player.hasSteelPickaxe ? 1 : 2;
      if (this.player.stamina < cost) {
        this.showToast('You are too exhausted to swing your pickaxe!');
        return;
      }

      this.player.stamina -= cost;
      this.player.toolAction = 'pickaxe';
      this.player.toolTimer = 0.25;
      window.soundSystem?.playHit();

      delete this.caveNodes[key];
      let dropId = 'stone';
      let dropQty = this.player.hasSteelPickaxe ? 2 : 1;
      let label = 'Stone';
      let color = '#94a3b8';

      if (nodeType === 'copper_ore') {
        dropId = 'copper_ore';
        label = 'Copper Ore';
        color = '#ea580c';
      } else if (nodeType === 'gold_ore') {
        dropId = 'gold_ore';
        label = 'Gold Ore';
        color = '#facc15';
      } else if (nodeType === 'quartz') {
        dropId = 'quartz';
        dropQty = 1;
        label = 'Cavern Quartz';
        color = '#38bdf8';
      }

      this.addItem(dropId, dropQty);
      this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, color, 10);
      this.showFloatingText(`+${dropQty} ${label}`, tx * TILE_SIZE + 8, ty * TILE_SIZE, color);
      this.updateHUD();
    }

    updateFarmAnimals(dt) {
      if (this.currentLocation !== 'farm' || !this.farmAnimals || this.farmAnimals.length === 0) return;
      const minX = 29.2 * TILE_SIZE;
      const maxX = 37.2 * TILE_SIZE;
      const minY = 8.0 * TILE_SIZE;
      const maxY = 12.2 * TILE_SIZE;

      this.farmAnimals.forEach(a => {
        a.phase = (a.phase || 0) + dt * 5;
        a.changeTimer = (a.changeTimer || 0) - dt;
        if (a.changeTimer <= 0) {
          a.changeTimer = 1.6 + Math.random() * 2.4;
          if (Math.random() < 0.35) {
            a.vx = 0;
            a.vy = 0;
            a.isWalking = false;
          } else {
            const angle = Math.random() * Math.PI * 2;
            const speed = a.species === 'chicken' ? 18 : 13;
            a.vx = Math.cos(angle) * speed;
            a.vy = Math.sin(angle) * speed;
            a.isWalking = true;
          }
        }

        if (a.vx || a.vy) {
          let nx = a.x + a.vx * dt;
          let ny = a.y + a.vy * dt;
          if (nx < minX || nx > maxX) {
            a.vx = -a.vx;
            nx = Math.max(minX, Math.min(maxX, nx));
          }
          if (ny < minY || ny > maxY) {
            a.vy = -a.vy;
            ny = Math.max(minY, Math.min(maxY, ny));
          }
          a.x = nx;
          a.y = ny;
        }
      });
    }

    interactWithAnimal(animal) {
      if (!animal) return;
      if (animal.hasProduct) {
        animal.hasProduct = false;
        const map = {
          chicken: { id: 'egg', label: 'Fresh Farm Egg', color: '#fef08a' },
          cow: { id: 'milk', label: 'Rich Barn Milk', color: '#f8fafc' },
          sheep: { id: 'wool', label: 'Soft Cloud Wool', color: '#e2e8f0' }
        };
        const drop = map[animal.species] || map.chicken;
        this.addItem(drop.id, 1);
        window.soundSystem?.playHarvest();
        this.spawnParticles(animal.x + 16, animal.y + 8, drop.color, 10);
        this.showFloatingText(`+1 ${drop.label}`, animal.x, animal.y - 6, '#fbbf24');
        this.showToast(`Collected ${drop.label} from ${animal.name}!`);
        this.updateHUD();
        this.saveGame();
        return;
      }

      if (!animal.pettedToday) {
        animal.pettedToday = true;
        this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 2);
        window.soundSystem?.playDialogue();
        this.spawnParticles(animal.x + 16, animal.y + 8, '#f43f5e', 8);
        this.showFloatingText('Happy!', animal.x + 4, animal.y - 8, '#fb7185');
        this.showToast(`${animal.name} feels loved and cozy! Check back tomorrow morning for fresh produce.`);
        this.updateHUD();
      } else {
        this.showToast(`${animal.name} is happily grazing in the warm pasture.`);
      }
    }

    openBarnModal() {
      const modal = document.getElementById('cookingModal');
      const container = document.getElementById('cookingContent');
      if (!modal || !container) return;

      const titleSpan = modal.querySelector('.modal-title-wrap span');
      if (titleSpan) titleSpan.textContent = "Homestead Red Barn & Livestock";

      const readyCount = (this.farmAnimals || []).filter(a => a.hasProduct).length;
      const catalog = [
        { species: 'chicken', name: 'Cozy Farm Chicken', cost: 120, desc: 'Lays a Fresh Farm Egg (35 G) every morning.' },
        { species: 'sheep', name: 'Fluffy Pasture Sheep', cost: 220, desc: 'Yields Soft Cloud Wool (110 G) every morning.' },
        { species: 'cow', name: 'Gentle Dairy Cow', cost: 260, desc: 'Produces Rich Barn Milk (75 G / +30 Energy) every morning.' }
      ];

      let html = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
          <span style="font-size:0.9rem;color:#475569;">Housed Animals: <strong>${(this.farmAnimals || []).length} / 10</strong></span>
          <button class="btn-primary" id="btnCollectAllBarn" ${readyCount === 0 ? 'disabled style="opacity:0.55;cursor:not-allowed;"' : ''}>
            Collect All Ready Products (${readyCount})
          </button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
          ${(this.farmAnimals || []).map(a => `
            <span style="padding:4px 9px;border-radius:999px;font-size:0.8rem;font-weight:700;background:${a.hasProduct ? '#dcfce7' : '#f1f5f9'};color:${a.hasProduct ? '#15803d' : '#475569'};">
              ${a.name} (${a.species}${a.hasProduct ? ' — Ready!' : ''})
            </span>
          `).join('')}
        </div>
        <div class="shop-items-grid">
          ${catalog.map(c => `
            <div class="shop-card">
              <div class="shop-card-left">
                <div class="shop-item-icon">${this.getItemIconSvg({ id: c.species === 'chicken' ? 'egg' : (c.species === 'cow' ? 'milk' : 'wool'), type: 'animal' })}</div>
                <div class="shop-card-info">
                  <div class="shop-card-name">${c.name}</div>
                  <div class="shop-card-desc">${c.desc}</div>
                  <div class="shop-card-price">${c.cost} Gold</div>
                </div>
              </div>
              <button class="shop-buy-btn barn-buy-btn" data-species="${c.species}" data-cost="${c.cost}">Adopt</button>
            </div>
          `).join('')}
        </div>
      `;

      container.innerHTML = html;

      document.getElementById('btnCollectAllBarn')?.addEventListener('click', () => {
        let collected = 0;
        (this.farmAnimals || []).forEach(a => {
          if (a.hasProduct) {
            this.interactWithAnimal(a);
            collected++;
          }
        });
        if (collected > 0) this.openBarnModal();
      });

      container.querySelectorAll('.barn-buy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const species = btn.getAttribute('data-species');
          const cost = parseInt(btn.getAttribute('data-cost'), 10);
          this.buyBarnAnimal(species, cost);
        });
      });

      modal.classList.add('active');
    }

    buyBarnAnimal(species, cost) {
      if (!this.farmAnimals) this.farmAnimals = [];
      if (this.farmAnimals.length >= 10) {
        this.showToast('Your Red Barn is cozy and full (max 10 animals)!');
        return;
      }
      if (this.player.gold < cost) {
        this.showToast('You do not have enough Gold for this animal yet.');
        return;
      }

      const namePools = {
        chicken: ['Sunny', 'Nugget', 'Henrietta', 'Pippa'],
        cow: ['Buttercup', 'Daisy', 'Clover', 'Bella'],
        sheep: ['Nimbus', 'Flossy', 'Bramble', 'Woolly']
      };
      const pool = namePools[species] || namePools.chicken;
      const name = pool[this.farmAnimals.length % pool.length];

      this.player.gold -= cost;
      this.farmAnimals.push({
        id: `${species}_${Date.now()}_${this.farmAnimals.length}`,
        name: name,
        species: species,
        x: (30 + Math.random() * 6) * TILE_SIZE,
        y: (8.5 + Math.random() * 3) * TILE_SIZE,
        vx: 10,
        vy: 6,
        phase: Math.random() * 6,
        changeTimer: 1.4,
        hasProduct: true,
        pettedToday: false,
        isWalking: false
      });

      window.soundSystem?.playCoin();
      this.showToast(`Welcomed ${name} the ${species} to the Red Barn pasture!`);
      this.updateHUD();
      this.saveGame();
      this.openBarnModal();
    }

    receiveChapelBlessing() {
      if (this.dailyBlessingClaimed) {
        this.showToast('You already received today’s Chapel blessing!');
        return;
      }
      this.dailyBlessingClaimed = true;
      this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 25);
      window.soundSystem?.playCatch();
      this.spawnParticles(this.player.x + 16, this.player.y + 8, '#fde047', 16);
      this.showFloatingText('+25 Energy (Serenity!)', this.player.x + 16, this.player.y - 10, '#facc15');
      this.showToast('Pastor Thomas’s blessing fills your heart with calm! (+25 Energy)');
      this.updateHUD();
    }

    openLibraryAlmanacModal() {
      const modal = document.getElementById('cookingModal');
      const container = document.getElementById('cookingContent');
      if (!modal || !container) return;

      const titleSpan = modal.querySelector('.modal-title-wrap span');
      if (titleSpan) titleSpan.textContent = 'Oakhaven Library & Museum Almanac';

      const caughtCount = Object.keys(this.fishingLog || {}).length;
      const totalFish = Object.keys(FISH_DEFS).length;
      const cropsOwnedOrHeld = Object.values(CROP_DEFS).filter(c => this.getItemCount(c.id) > 0).length;

      let html = `
        <p style="font-size: 0.9rem; color: #475569; margin-bottom: 12px;">
          Cataloged knowledge of Oakhaven Valley! Caught <strong>${caughtCount}/${totalFish}</strong> fish species. Residents follow live schedules around town from morning to night.
        </p>
        <div style="font-weight: 800; color: #0f766e; font-size: 0.9rem; margin-bottom: 8px;">Today’s Town Resident Schedules</div>
        <div class="shop-items-grid" style="margin-bottom: 14px;">
          ${this.city.npcs.map(npc => `
            <div class="shop-card" style="padding: 8px 12px;">
              <div class="shop-card-info">
                <div class="shop-card-name">${npc.name}</div>
                <div class="shop-card-desc">${npc.activity || 'Out for a stroll in Oakhaven'}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="font-weight: 800; color: #1e3a8a; font-size: 0.9rem; margin-bottom: 8px;">Valley Fish Encylopedia (${caughtCount}/${totalFish} Discovered)</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
          ${Object.values(FISH_DEFS).map(f => {
            const count = (this.fishingLog && this.fishingLog[f.id]) || 0;
            return `
              <div style="padding: 7px 10px; border-radius: 8px; border: 1.5px solid ${count > 0 ? '#0284c7' : '#cbd5e1'}; background: ${count > 0 ? '#e0f2fe' : '#f8fafc'}; font-size: 0.8rem; color: ${count > 0 ? '#0c4a6e' : '#64748b'};">
                <strong>${count > 0 ? f.name : '???'}</strong> — ${f.rarity} (${f.locations.join('/')}) ${count > 0 ? `| Caught x${count}` : ''}
              </div>
            `;
          }).join('')}
        </div>
        <div style="font-size: 0.82rem; color: #64748b;">
          Tip: Visit <strong>Oakhaven Chapel</strong> for a free +25 Energy daily blessing, and watch town streets shift morning through evening. (${cropsOwnedOrHeld} crop types in bag.)
        </div>
      `;

      container.innerHTML = html;
      modal.classList.add('active');
    }

    getNPCScheduleStop(npc) {
      if (!npc.schedule || npc.schedule.length === 0) return null;
      let active = npc.schedule[0];
      for (const stop of npc.schedule) {
        if (this.timeMinutes >= stop.startMin) {
          active = stop;
        }
      }
      return active;
    }

    updateCityNPCs(dt) {
      if (!this.city || !this.city.npcs) return;
      const speed = 1.6; // tiles per second along town streets
      for (const npc of this.city.npcs) {
        const stop = this.getNPCScheduleStop(npc);
        if (!stop) continue;
        npc.activity = stop.activity;

        const dx = stop.x - npc.x;
        const dy = stop.y - npc.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0.05) {
          npc.isWalking = true;
          npc.walkPhase = (npc.walkPhase || 0) + dt * 10;
          const step = Math.min(dist, speed * dt);
          // Steer cleanly along street corridor axes (X first onto avenues, then Y, avoiding central fountain 22..25,16..19)
          if (Math.abs(dx) > 0.08) {
            npc.x += Math.sign(dx) * step;
          } else if (Math.abs(dy) > 0.08) {
            npc.y += Math.sign(dy) * step;
          }
          // Gentle fountain nudge so wandering villagers skirt neatly around plaza fountain
          if (npc.x > 21.3 && npc.x < 26.2 && npc.y > 15.3 && npc.y < 20.2) {
            npc.x = (npc.x < 23.8) ? 21.2 : 26.3;
          }
        } else {
          npc.x = stop.x;
          npc.y = stop.y;
          npc.isWalking = false;
        }
      }
    }

    // --- Full Player Inventory & Backpack System ---
    toggleInventoryModal() {
      const modal = document.getElementById('inventoryModal');
      if (!modal) return;
      if (modal.classList.contains('active')) {
        modal.classList.remove('active');
      } else {
        this.openInventoryModal('all');
      }
    }

    getItemIconSvg(item) {
      if (!item) return '';
      const id = item.id || '';
      const type = item.type || '';
      if (id === 'hoe') {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="#92400e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 16 8"/><path d="m14 6 5 1-2 4-4-2Z" fill="#64748b" stroke="#475569"/></svg>`;
      }
      if (id === 'watering_can') {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><rect x="7" y="9" width="10" height="10" rx="2" fill="#38bdf8"/><path d="M7 11c-3 0-4-2-4-2"/><path d="M17 12l4-3"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>`;
      }
      if (id === 'scythe') {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"><path d="M6 20 16 6"/><path d="M16 6c4 0 5 3 3 6-2-2-4-2-6-2" fill="#cbd5e1" stroke="#475569"/></svg>`;
      }
      if (id === 'axe') {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"><path d="M6 20 17 7"/><path d="M13 5c3 0 6 2 6 5l-4 2-3-4Z" fill="#94a3b8" stroke="#475569"/></svg>`;
      }
      if (id === 'pickaxe') {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="#78350f" stroke-width="2.2" stroke-linecap="round"><path d="M6 20 16 8"/><path d="M10 5c4-1 8 1 10 5l-3 1c-2-2-4-3-7-3Z" fill="#94a3b8" stroke="#475569"/></svg>`;
      }
      if (id === 'fishing_rod' || id === 'pro_rod') {
        const stroke = (id === 'pro_rod' || (this.player && this.player.hasProRod)) ? '#0284c7' : '#a16207';
        return `<svg viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"><path d="M4 20Q10 7 18 4"/><path d="M18 4v9" stroke="#e2e8f0" stroke-width="1.4"/><circle cx="18" cy="15" r="2.2" fill="#ef4444" stroke="#ffffff" stroke-width="1"/></svg>`;
      }
      if (id.endsWith('_seed') || type === 'seed') {
        return `<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="12" height="16" rx="2.5" fill="#fef3c7" stroke="#b45309" stroke-width="1.8"/><circle cx="12" cy="11" r="3" fill="#4ade80"/><path d="M12 11v4" stroke="#15803d" stroke-width="1.6"/></svg>`;
      }
      if (FISH_DEFS[id] || type === 'fish') {
        const fill = id === 'legend_carp' ? '#f59e0b' : (id === 'koi' ? '#fb7185' : '#38bdf8');
        return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 12s3-5 9-5 7 5 7 5-2 5-7 5-9-5-9-5Z" fill="${fill}" stroke="#0c4a6e" stroke-width="1.6"/><path d="M4 12 2 8v8l2-4Z" fill="${fill}" stroke="#0c4a6e" stroke-width="1.5"/><circle cx="15" cy="11" r="1.2" fill="#0f172a"/></svg>`;
      }
      if (FORAGE_DEFS[id] || type === 'forage') {
        const c = id === 'morel' ? '#b45309' : (id === 'honeycomb' ? '#facc15' : '#f472b6');
        return `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="5" fill="${c}" stroke="#78350f" stroke-width="1.5"/><path d="M12 15v5" stroke="#15803d" stroke-width="2.2" stroke-linecap="round"/></svg>`;
      }
      if (type === 'crop' || CROP_DEFS[id]) {
        const c = (id === 'carrot' || id === 'pumpkin') ? '#f97316' : (id === 'strawberry' || id === 'tomato') ? '#ef4444' : (id === 'starfruit' || id === 'corn') ? '#facc15' : '#a855f7';
        return `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="13" r="6" fill="${c}" stroke="#78350f" stroke-width="1.5"/><path d="M12 7c-2-2-4-2-4-2s1 3 4 3 4-3 4-3-2 0-4 2Z" fill="#22c55e"/></svg>`;
      }
      if (id === 'wood') {
        return `<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="8" rx="3" fill="#92400e" stroke="#451a03" stroke-width="1.6"/><circle cx="18" cy="12" r="2.5" fill="#fde68a"/></svg>`;
      }
      if (id === 'stone') {
        return `<svg viewBox="0 0 24 24" fill="none"><path d="M5 17 7 8l6-2 6 4-1 7H5Z" fill="#94a3b8" stroke="#475569" stroke-width="1.7"/></svg>`;
      }
      if (id === 'egg') {
        return `<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="13" rx="6" ry="7.5" fill="#fef3c7" stroke="#b45309" stroke-width="1.6"/></svg>`;
      }
      if (id === 'milk') {
        return `<svg viewBox="0 0 24 24" fill="none"><rect x="7" y="7" width="10" height="13" rx="2" fill="#f8fafc" stroke="#0284c7" stroke-width="1.6"/><rect x="8.5" y="4" width="7" height="3" rx="1" fill="#38bdf8"/></svg>`;
      }
      if (id === 'wool') {
        return `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/><circle cx="8" cy="12" r="3.5" fill="#f8fafc"/><circle cx="16" cy="12" r="3.5" fill="#f8fafc"/><circle cx="12" cy="8" r="3.5" fill="#f8fafc"/></svg>`;
      }
      if (id === 'copper_ore') {
        return `<svg viewBox="0 0 24 24" fill="none"><path d="M5 17 7 8l6-2 6 4-1 7H5Z" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/><circle cx="10" cy="12" r="2.2" fill="#ea580c"/><circle cx="15" cy="14" r="1.8" fill="#fb923c"/></svg>`;
      }
      if (id === 'gold_ore') {
        return `<svg viewBox="0 0 24 24" fill="none"><path d="M5 17 7 8l6-2 6 4-1 7H5Z" fill="#64748b" stroke="#334155" stroke-width="1.5"/><circle cx="10" cy="12" r="2.2" fill="#facc15"/><circle cx="15" cy="14" r="2" fill="#fde047"/></svg>`;
      }
      if (id === 'quartz') {
        return `<svg viewBox="0 0 24 24" fill="none"><path d="M12 4 17 12l-5 8-5-8 5-8Z" fill="#38bdf8" stroke="#0369a1" stroke-width="1.6"/></svg>`;
      }
      if (id === 'sprinkler') {
        return `<svg viewBox="0 0 24 24" fill="none"><rect x="9" y="10" width="6" height="9" rx="1.5" fill="#eab308" stroke="#713f12" stroke-width="1.5"/><path d="M5 8h14" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/></svg>`;
      }
      if (type === 'food') {
        return `<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="14" rx="8" ry="5" fill="#fbbf24" stroke="#92400e" stroke-width="1.6"/><path d="M6 12c2-3 10-3 12 0" fill="#fb7185"/></svg>`;
      }
      return `<svg viewBox="0 0 24 24" fill="none"><rect x="6" y="6" width="12" height="12" rx="3" fill="#fde047" stroke="#b45309" stroke-width="1.6"/></svg>`;
    }

    openInventoryModal(filter = 'all') {
      window.soundSystem?.playDialogue();
      const modal = document.getElementById('inventoryModal');
      if (!modal) return;

      this.currentInvFilter = filter;
      this.renderInventory(filter);
      modal.classList.add('active');
    }

    renderInventory(filter = 'all') {
      const grid = document.getElementById('inventoryGrid');
      const preview = document.getElementById('invHotbarPreview');
      const countBadge = document.getElementById('invItemCountBadge');
      if (!grid) return;

      if (countBadge) {
        countBadge.textContent = `${this.inventory.length} Items`;
      }

      // 1. Render Hotbar Preview Slots (1 to 8)
      if (preview) {
        let previewHtml = '';
        for (let i = 0; i < 8; i++) {
          const item = this.inventory[i];
          const isActive = (i === this.activeSlot);
          previewHtml += `
            <div class="inv-slot-mini ${isActive ? 'active' : ''}" data-hotbar-slot="${i}" title="Slot ${i + 1}: ${item ? item.name : 'Empty'}">
              <span style="position: absolute; top: 2px; left: 4px; font-size: 0.6rem; color: #cbd5e1;">${i + 1}</span>
              ${item ? `
                <span style="font-size: 0.68rem; font-weight: bold; text-align: center; max-width: 44px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</span>
                ${item.count > 1 ? `<span style="position: absolute; bottom: 2px; right: 4px; font-size: 0.62rem; color: #fef08a; font-weight: bold;">x${item.count}</span>` : ''}
              ` : '<span style="color: #64748b; font-size: 0.65rem;">Empty</span>'}
            </div>
          `;
        }
        preview.innerHTML = previewHtml;

        preview.querySelectorAll('[data-hotbar-slot]').forEach(slotEl => {
          slotEl.addEventListener('click', () => {
            const slotIdx = parseInt(slotEl.getAttribute('data-hotbar-slot'));
            this.selectHotbarSlot(slotIdx);
            this.renderInventory(this.currentInvFilter || 'all');
          });
        });
      }

      // 2. Filter tabs active class
      document.querySelectorAll('#invFilterTabs .shop-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-inv-tab') === filter);
      });

      // 3. Filter Items
      const filtered = this.inventory.map((item, originalIdx) => ({ item, originalIdx })).filter(({ item }) => {
        if (filter === 'all') return true;
        if (filter === 'tool') return item.type === 'tool';
        if (filter === 'seed') return item.type === 'seed' || item.type === 'crop';
        if (filter === 'fish') return item.type === 'fish' || item.type === 'forage' || FISH_DEFS[item.id] || FORAGE_DEFS[item.id];
        if (filter === 'food') return item.type === 'food';
        if (filter === 'material') return item.type === 'material' || item.type === 'item';
        return true;
      });

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: #64748b; font-size: 0.9rem;">
            No items in this category.
          </div>
        `;
        return;
      }

      let gridHtml = '';
      filtered.forEach(({ item, originalIdx }) => {
        const isCurrentlyInHotbar = (originalIdx < 8);
        const isActiveHotbarSlot = (originalIdx === this.activeSlot);

        let typeBadgeClass = 'item';
        if (item.type === 'tool') typeBadgeClass = 'tool';
        else if (item.type === 'seed') typeBadgeClass = 'seed';
        else if (item.type === 'crop') typeBadgeClass = 'crop';
        else if (item.type === 'fish' || FISH_DEFS[item.id]) typeBadgeClass = 'fish';
        else if (item.type === 'forage' || FORAGE_DEFS[item.id]) typeBadgeClass = 'forage';
        else if (item.type === 'food') typeBadgeClass = 'food';
        else if (item.type === 'material') typeBadgeClass = 'material';

        let typeLabel = item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1)) : 'Item';
        if (item.type === 'tool') {
          if (item.id === 'hoe' && this.player.hasCopperHoe) typeLabel = 'Copper Hoe';
          if (item.id === 'axe' && this.player.hasSteelAxe) typeLabel = 'Steel Axe';
          if (item.id === 'pickaxe' && this.player.hasSteelPickaxe) typeLabel = 'Steel Pickaxe';
          if (item.id === 'fishing_rod' && this.player.hasProRod) typeLabel = 'Pro Rod';
        }

        gridHtml += `
          <div class="inv-card" style="${isActiveHotbarSlot ? 'border-color: #f59e0b; background: #fffdf5;' : ''}">
            <div class="inv-card-header">
              <div style="display:flex; align-items:center; gap:8px;">
                <div class="shop-item-icon" style="width:32px;height:32px;padding:3px;">${this.getItemIconSvg(item)}</div>
                <div>
                  <div class="inv-card-name">${item.name}</div>
                  <div style="font-size: 0.72rem; color: #78350f; font-weight: 700; margin-top: 2px;">
                    Quantity: ${item.count} ${isCurrentlyInHotbar ? `<span style="color: #15803d;">(Slot ${originalIdx + 1})</span>` : ''}
                  </div>
                </div>
              </div>
              <span class="inv-card-badge ${typeBadgeClass}">${typeLabel}</span>
            </div>
            <div class="inv-card-desc">${item.desc || 'Homestead resource.'}</div>
            <div class="inv-card-actions">
              <button class="inv-btn-equip" data-assign-idx="${originalIdx}">
                ${isActiveHotbarSlot ? 'Active (Equipped)' : 'Equip to Slot ' + (this.activeSlot + 1)}
              </button>
              ${item.type === 'food' ? `
                <button class="inv-btn-eat" data-eat-idx="${originalIdx}">
                  Eat
                </button>
              ` : ''}
            </div>
          </div>
        `;
      });

      grid.innerHTML = gridHtml;

      // Bind Equip buttons
      grid.querySelectorAll('[data-assign-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemIdx = parseInt(btn.getAttribute('data-assign-idx'));
          this.swapToHotbar(itemIdx, this.activeSlot);
        });
      });

      // Bind Eat buttons
      grid.querySelectorAll('[data-eat-idx]').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemIdx = parseInt(btn.getAttribute('data-eat-idx'));
          this.consumeFoodItem(itemIdx);
        });
      });
    }

    swapToHotbar(fromIdx, targetHotbarSlot) {
      if (fromIdx < 0 || fromIdx >= this.inventory.length) return;
      if (targetHotbarSlot < 0 || targetHotbarSlot >= 8) return;

      if (fromIdx === targetHotbarSlot) {
        this.selectHotbarSlot(targetHotbarSlot);
        this.showToast(`Selected ${this.inventory[fromIdx].name} as active tool.`);
      } else {
        const temp = this.inventory[targetHotbarSlot];
        this.inventory[targetHotbarSlot] = this.inventory[fromIdx];
        this.inventory[fromIdx] = temp;
        this.selectHotbarSlot(targetHotbarSlot);
        window.soundSystem?.playDialogue();
        this.showToast(`Assigned ${this.inventory[targetHotbarSlot].name} to Hotbar Slot ${targetHotbarSlot + 1}!`);
      }

      this.updateHUD();
      this.renderInventory(this.currentInvFilter || 'all');
    }

    consumeFoodItem(itemIdx) {
      const item = this.inventory[itemIdx];
      if (!item || item.type !== 'food') return;

      const healAmt = item.heal || 45;
      this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + healAmt);
      window.soundSystem?.playCoin();
      this.spawnParticles(this.player.x + 16, this.player.y + 16, '#22c55e', 8);
      this.showFloatingText(`+${healAmt} Energy`, this.player.x + 16, this.player.y - 10, '#16a34a');
      this.showToast(`Ate ${item.name}! Restored +${healAmt} Energy.`);

      item.count--;
      if (item.count <= 0) {
        this.inventory.splice(itemIdx, 1);
        if (this.activeSlot >= this.inventory.length) {
          this.activeSlot = Math.max(0, this.inventory.length - 1);
        }
      }

      this.updateHUD();
      this.renderInventory(this.currentInvFilter || 'all');
    }

    // --- Interactive Tutorial & Quests Modal ---
    openTutorialModal() {
      const modal = document.getElementById('tutorialModal');
      const listContainer = document.getElementById('tutorialList');
      if (!modal || !listContainer) return;

      let html = '';
      this.quests.forEach((q, idx) => {
        const isCurrent = (idx === this.activeQuestIdx && !q.isDone);
        const statusClass = q.isDone ? 'done' : (isCurrent ? 'active-step' : 'pending');
        const badge = q.isDone ? 'Completed' : (isCurrent ? 'In Progress' : 'Upcoming');

        let progressIndicator = '';
        if (q.target && !q.isDone) {
          progressIndicator = ` (${q.current || 0}/${q.target})`;
        }

        html += `
          <div class="tutorial-item ${statusClass}">
            <div class="tutorial-item-header">
              <span class="tutorial-title">${idx + 1}. ${q.title}${progressIndicator}</span>
              <span class="tutorial-badge ${statusClass}">${badge}</span>
            </div>
            <div class="tutorial-desc">${q.desc}</div>
            <div class="tutorial-reward">Reward: ${q.rewardDesc}</div>
          </div>
        `;
      });

      listContainer.innerHTML = html;
      modal.classList.add('active');
    }

    openHelpGuideModal() {
      const modal = document.getElementById('helpGuideModal');
      if (modal) {
        modal.classList.add('active');
      }
    }

    // --- Visual Particles & Floating Feedback ---
    spawnParticles(x, y, color, count = 6) {
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 60,
          vy: -Math.random() * 50 - 20,
          color: color,
          size: Math.random() * 3 + 2,
          life: 0.5,
          maxLife: 0.5
        });
      }
    }

    showFloatingText(text, x, y, color = '#ffffff') {
      this.floatingTexts.push({
        text: text,
        x: x,
        y: y,
        vy: -30,
        color: color,
        life: 1.2
      });
    }

    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 120 * dt; // gravity
        p.life -= dt;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const t = this.floatingTexts[i];
        t.y += t.vy * dt;
        t.life -= dt;
        if (t.life <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }
    }

    // --- Toast Notification System ---
    showToast(message) {
      const container = document.getElementById('toastContainer');
      if (!container) return;

      // Replace duplicate message or cap stacked toasts so the viewport stays clear
      if (container.children) {
        const existing = Array.from(container.children);
        const dup = existing.find(el => el.textContent === message);
        if (dup) dup.remove();
        while (container.children.length >= 2) {
          container.children[0].remove();
        }
      }

      const toast = document.createElement('div');
      toast.className = 'game-toast';
      toast.textContent = message;
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 250);
      }, 2400);
    }

    // --- Audio Control ---
    toggleAudio() {
      const isMuted = window.soundSystem.toggleMute();
      const btn = document.getElementById('btnAudio');
      if (btn) {
        btn.classList.toggle('muted', isMuted);
      }
      this.showToast(isMuted ? 'Sound muted.' : 'Sound & Cozy Music enabled!');
    }

    // --- HUD Updates ---
    updateHUDClock() {
      const totalMinutes = Math.floor(this.timeMinutes);
      let hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 === 0 ? 12 : hours % 12;
      const displayMins = minutes < 10 ? '0' + minutes : minutes;

      const clockElem = document.getElementById('hudTime');
      if (clockElem) {
        clockElem.textContent = `${displayHours}:${displayMins} ${ampm}`;
      }

      const dayElem = document.getElementById('hudDay');
      if (dayElem) {
        dayElem.textContent = `Day ${this.day} (${this.season})`;
      }

      const weatherElem = document.getElementById('hudWeather');
      if (weatherElem) {
        weatherElem.textContent = this.weather === 'rainy'
          ? (this.season === 'Winter' ? 'Snowy Flurries' : 'Gentle Rain')
          : 'Sunny Skies';
      }
    }

    updateHUD() {
      // 1. Gold
      const goldElem = document.getElementById('hudGold');
      if (goldElem) {
        goldElem.textContent = `${this.player.gold} G`;
      }

      // 2. Stamina Bar
      const staminaFill = document.getElementById('staminaFill');
      const staminaText = document.getElementById('staminaText');
      if (staminaFill && staminaText) {
        const pct = Math.max(0, Math.min(100, (this.player.stamina / this.player.maxStamina) * 100));
        staminaFill.style.width = `${pct}%`;
        staminaText.textContent = `${Math.round(this.player.stamina)} / ${this.player.maxStamina}`;
      }

      // 3. Water Bar
      const waterFill = document.getElementById('waterFill');
      const waterText = document.getElementById('waterText');
      if (waterFill && waterText) {
        const pct = (this.player.water / this.player.waterCapacity) * 100;
        waterFill.style.width = `${pct}%`;
        waterText.textContent = `${this.player.water} / ${this.player.waterCapacity}`;
      }

      // 4. Hotbar Slots
      const hotbarContainer = document.getElementById('hotbarSlots');
      if (hotbarContainer) {
        let hotbarHtml = '';
        for (let i = 0; i < 8; i++) {
          const item = this.inventory[i];
          const isSelected = (i === this.activeSlot);
          hotbarHtml += `
            <div class="hotbar-slot ${isSelected ? 'active' : ''}" data-slot="${i}">
              <div class="slot-number">${i + 1}</div>
              ${item ? `
                <div class="hotbar-icon-wrap">${this.getItemIconSvg(item)}</div>
                <div class="slot-item-name">${item.name}</div>
                ${item.count > 1 ? `<div class="slot-count">${item.count}</div>` : ''}
              ` : ''}
            </div>
          `;
        }
        hotbarContainer.innerHTML = hotbarHtml;

        // Bind hotbar slot clicks
        hotbarContainer.querySelectorAll('.hotbar-slot').forEach(slot => {
          slot.addEventListener('click', () => {
            const slotIdx = parseInt(slot.getAttribute('data-slot'));
            this.selectHotbarSlot(slotIdx);
          });
        });
      }

      // 5. Active Quest Tracker HUD
      const activeQuestElem = document.getElementById('activeQuestText');
      if (activeQuestElem) {
        const activeQuest = this.quests.find(q => !q.isDone);
        if (activeQuest) {
          let progress = '';
          if (activeQuest.target) {
            progress = ` (${activeQuest.current || 0}/${activeQuest.target})`;
          }
          activeQuestElem.textContent = `${activeQuest.title}${progress}: ${activeQuest.desc}`;
        } else {
          activeQuestElem.textContent = 'All homestead milestones completed! Enjoy your bountiful farm.';
        }
      }
    }

    // --- Render Pipeline ---
    render(currentTime) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (Sprites && typeof Sprites.setSeason === 'function') {
        Sprites.setSeason(this.season);
      }

      ctx.save();
      // Apply Camera Translation
      ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

      const hours = this.timeMinutes / 60;
      const isNight = (hours < 6 || hours >= 19.5);

      if (this.isInteriorLocation(this.currentLocation)) {
        // --- Building & Farmhouse Interior Rendering ---
        Sprites.drawInteriorRoom(ctx, this.currentLocation, currentTime, this.player.inBed);
        if (this.currentLocation === 'interior_cave' && this.caveNodes) {
          for (const key in this.caveNodes) {
            const [nc, nr] = key.split(',').map(Number);
            Sprites.drawCaveNode(ctx, nc * TILE_SIZE, nr * TILE_SIZE, this.caveNodes[key], currentTime);
          }
        }
      } else if (this.currentLocation === 'city') {
        // --- City Rendering ---
        // 1. Draw Map Tiles
        for (let r = 0; r < this.mapRows; r++) {
          for (let c = 0; c < this.mapCols; c++) {
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;
            const tile = this.tiles[r][c];

            if (tile.type === 'plaza') {
              Sprites.drawPlaza(ctx, x, y, tile.seed);
            } else if (tile.type === 'path') {
              Sprites.drawPath(ctx, x, y, tile.seed);
            } else if (tile.type === 'water') {
              Sprites.drawWater(ctx, x, y, currentTime);
            } else if (tile.type === 'dock') {
              Sprites.drawDock(ctx, x, y);
            } else if (tile.type === 'grass') {
              Sprites.drawGrass(ctx, x, y, tile.seed);
            }

            if (tile.type === 'fence') {
              Sprites.drawGrass(ctx, x, y, tile.seed);
              const hasLeft = c > 0 && this.tiles[r][c-1].type === 'fence';
              const hasRight = c < this.mapCols - 1 && this.tiles[r][c+1].type === 'fence';
              const hasUp = r > 0 && this.tiles[r-1][c].type === 'fence';
              const hasDown = r < this.mapRows - 1 && this.tiles[r+1][c].type === 'fence';
              Sprites.drawFence(ctx, x, y, hasLeft, hasRight, hasUp, hasDown);
            }
          }
        }

        // 2. Draw City Objects (Lamps, Benches, Notice Board, Farm Signpost)
        for (let r = 0; r < this.mapRows; r++) {
          for (let c = 0; c < this.mapCols; c++) {
            const key = `${c},${r}`;
            const obj = this.objects[key];
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;

            if (obj === 'lamp') {
              Sprites.drawStreetLamp(ctx, x, y, isNight);
            } else if (obj === 'bench') {
              Sprites.drawBench(ctx, x, y);
            } else if (obj === 'notice_board') {
              Sprites.drawNoticeBoard(ctx, x, y);
            } else if (obj === 'sign_farm') {
              this.drawRoadSign(ctx, x, y, 'TO FARM', 'north');
            } else if (obj === 'flower_bed') {
              Sprites.drawFlowerBed(ctx, x, y, c + r);
            }
          }
        }

        // 3. Central Stone Fountain
        Sprites.drawFountain(ctx, 22 * TILE_SIZE, 16 * TILE_SIZE, currentTime);

        // 4. Draw City Buildings
        this.city.buildings.forEach(b => {
          Sprites.drawCityBuilding(ctx, b.x * TILE_SIZE, b.y * TILE_SIZE, b.w, b.h, b.type, b.title);
        });

        // 5. Draw Scheduled City NPCs (+ subtle walking bob & nearby nameplate)
        const ptx = (this.player.x + 16) / TILE_SIZE;
        const pty = (this.player.y + 16) / TILE_SIZE;
        this.city.npcs.forEach(npc => {
          const walkOffset = npc.isWalking ? Math.abs(Math.sin((npc.walkPhase || 0))) * 2.5 : 0;
          const nx = npc.x * TILE_SIZE;
          const ny = npc.y * TILE_SIZE - walkOffset;
          Sprites.drawNPC(ctx, nx, ny, npc.type, currentTime);

          if (Math.hypot(ptx - npc.x, pty - npc.y) <= 3.2) {
            ctx.save();
            ctx.font = 'bold 9px sans-serif';
            const tw = Math.max(44, ctx.measureText(npc.name).width + 12);
            ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
            ctx.beginPath();
            ctx.roundRect(nx + 16 - tw / 2, ny - 22, tw, 14, 4);
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            ctx.fillText(npc.name, nx + 16, ny - 12);
            ctx.restore();
          }
        });

      } else {
        // --- Farm Rendering ---
        // 1. Draw Map Tiles
        for (let r = 0; r < this.mapRows; r++) {
          for (let c = 0; c < this.mapCols; c++) {
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;
            const tile = this.tiles[r][c];

            if (tile.type === 'grass') {
              Sprites.drawGrass(ctx, x, y, tile.seed);
            } else if (tile.type === 'path') {
              Sprites.drawPath(ctx, x, y, tile.seed);
            } else if (tile.type === 'water') {
              Sprites.drawWater(ctx, x, y, currentTime);
            } else if (tile.type === 'dock') {
              Sprites.drawDock(ctx, x, y);
            } else if (tile.type === 'soil' || tile.isTilled) {
              Sprites.drawSoil(ctx, x, y, tile.isWatered, tile.isFertilized);
            }

            if (tile.type === 'fence') {
              Sprites.drawGrass(ctx, x, y, tile.seed);
              const hasLeft = c > 0 && this.tiles[r][c-1].type === 'fence';
              const hasRight = c < this.mapCols - 1 && this.tiles[r][c+1].type === 'fence';
              const hasUp = r > 0 && this.tiles[r-1][c].type === 'fence';
              const hasDown = r < this.mapRows - 1 && this.tiles[r+1][c].type === 'fence';
              Sprites.drawFence(ctx, x, y, hasLeft, hasRight, hasUp, hasDown);
            }

            if (this.objects[`${c},${r}`] === 'sprinkler') {
              Sprites.drawSprinkler(ctx, x, y, currentTime);
            }
          }
        }

        // 2. Draw Growing Crops
        for (const key in this.crops) {
          const crop = this.crops[key];
          const [cx, cy] = key.split(',').map(Number);
          Sprites.drawCrop(ctx, cx * TILE_SIZE, cy * TILE_SIZE, crop.type, crop.stage, crop.stage >= 3);
        }

        // 3. Draw Natural Debris (Weeds, Rocks, Trees, City Road Sign)
        for (let r = 0; r < this.mapRows; r++) {
          for (let c = 0; c < this.mapCols; c++) {
            const key = `${c},${r}`;
            const obj = this.objects[key];
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;

            if (obj === 'weed') {
              Sprites.drawWeeds(ctx, x, y);
            } else if (obj === 'rock') {
              Sprites.drawRock(ctx, x, y, this.debrisHealth[key] || 2);
            } else if (obj === 'tree') {
              Sprites.drawTree(ctx, x, y, this.debrisHealth[key] || 3);
            } else if (obj === 'sign_city') {
              this.drawRoadSign(ctx, x, y, 'TO CITY', 'south');
            } else if (FORAGE_DEFS[obj]) {
              Sprites.drawForageItem(ctx, x, y, obj, currentTime);
            }
          }
        }

        // 4. Draw Grandma's Cottage & Porch
        Sprites.drawCottage(ctx, this.cottagePos.x, this.cottagePos.y, currentTime);

        // 5. Draw Grandma Hazel rocking in chair
        Sprites.drawGrandma(ctx, this.grandmaPos.x, this.grandmaPos.y, currentTime);

        // 6. Draw Well & Shipping Bin
        Sprites.drawWell(ctx, this.wellPos.x, this.wellPos.y);
        Sprites.drawShippingBin(ctx, this.shippingBinPos.x, this.shippingBinPos.y);

        // 6b. Draw Red Barn, Pasture Animals & Hillside Cave Mouth
        if (this.barnPos) {
          Sprites.drawFarmBarn(ctx, this.barnPos.x, this.barnPos.y, currentTime);
        }
        if (this.cavePos) {
          Sprites.drawCaveEntrance(ctx, this.cavePos.x, this.cavePos.y, currentTime);
        }
        if (this.farmAnimals && this.farmAnimals.length > 0) {
          this.farmAnimals.forEach(a => Sprites.drawFarmAnimal(ctx, a, currentTime));
        }

        // 7. Draw Roadside Market Cart
        this.drawShopCart(ctx, this.shopCartPos.x, this.shopCartPos.y);
      }

      // 8. Draw Player (when standing/walking; if tucked in bed, drawInteriorRoom draws them under the quilt!)
      if (!this.player.inBed) {
        Sprites.drawPlayer(
          ctx,
          this.player.x,
          this.player.y,
          this.player.dir,
          this.player.isMoving,
          this.player.toolAction,
          this.player.walkFrame
        );
      }

      // 9. Ambient Butterflies / Fireflies & Fishing Bobber/Line
      if (this.currentLocation === 'farm' && this.ambientCritters) {
        for (const critter of this.ambientCritters) {
          Sprites.drawAmbientCritter(ctx, critter.x, critter.y, critter.phase, isNight, critter.color);
        }
      }

      if (this.fishing) {
        Sprites.drawFishingBobberAndLine(
          ctx,
          this.player.x,
          this.player.y,
          this.player.dir,
          this.fishing,
          currentTime
        );
      }

      // 10. Draw Grid Cursor Highlight
      this.drawCursorHighlight(ctx);

      // 11. Draw Particles
      this.renderParticles(ctx);

      ctx.restore();

      // 12. Ambient Day / Night / Weather Lighting (only outdoors)
      if (!this.isInteriorLocation(this.currentLocation)) {
        this.renderAmbientLighting(ctx);
      }

      // 12b. Fishing Reeling Minigame Overlay (drawn sharp over lighting!)
      if (this.fishing && this.fishing.phase === 'REELING') {
        const screenPx = this.player.x - Math.floor(this.camera.x);
        const screenPy = this.player.y - Math.floor(this.camera.y);
        Sprites.drawFishingMinigameBar(ctx, screenPx, screenPy, this.fishing);
      }

      // 12. Floating Texts
      this.renderFloatingTexts(ctx);

      // 13. Screen Transition Fade Overlay
      if (this.transitionAlpha > 0) {
        ctx.fillStyle = `rgba(15, 23, 42, ${this.transitionAlpha})`;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }

    drawRoadSign(ctx, x, y, text, direction) {
      // Wooden Double Post
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(x + 6, y + 10, 4, 22);
      ctx.fillRect(x + 22, y + 10, 4, 22);

      // Wooden Signboard Plaque
      ctx.fillStyle = '#795548';
      ctx.fillRect(x, y, 32, 16);
      ctx.fillStyle = '#bcaaa4';
      ctx.fillRect(x + 2, y + 2, 28, 12);

      // Sign text with clean directional indicator
      ctx.fillStyle = '#271406';
      ctx.font = 'bold 6.5px sans-serif';
      ctx.textAlign = 'center';
      if (direction === 'south') {
        ctx.fillText(text, x + 16, y + 8);
        ctx.fillText('v  v', x + 16, y + 13);
      } else {
        ctx.fillText('^  ^', x + 16, y + 7);
        ctx.fillText(text, x + 16, y + 12);
      }
    }

    drawShopCart(ctx, x, y) {
      // Wood Cart Stall
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y + 10, 48, 22);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 2, y + 12, 44, 18);

      // Striped Awning (Forest green & cream)
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x - 4, y - 10, 56, 16);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(x + 6, y - 10, 8, 16);
      ctx.fillRect(x + 22, y - 10, 8, 16);
      ctx.fillRect(x + 38, y - 10, 8, 16);

      // Cart Wheel
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(x + 12, y + 32, 7, 0, Math.PI * 2);
      ctx.arc(x + 36, y + 32, 7, 0, Math.PI * 2);
      ctx.fill();

      // Signboard
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(x + 14, y + 2, 20, 8);
      ctx.fillStyle = '#78350f';
      ctx.font = '7px sans-serif';
      ctx.fillText('SHOP', x + 16, y + 8);
    }

    drawCursorHighlight(ctx) {
      // 1. Mouse / Touch Hover Cursor (when mouse was used)
      if (this.lastInputSource !== 'gamepad') {
        const tx = this.mouse.tileX;
        const ty = this.mouse.tileY;

        if (tx >= 0 && tx < this.mapCols && ty >= 0 && ty < this.mapRows) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(tx * TILE_SIZE + 0.5, ty * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        }
      }

      // 2. Controller Target Reticle (when gamepad is connected or active)
      if (this.gamepadConnected || this.lastInputSource === 'gamepad') {
        const playerTileX = Math.floor((this.player.x + 16) / TILE_SIZE);
        const playerTileY = Math.floor((this.player.y + 16) / TILE_SIZE);

        let targetX = playerTileX;
        let targetY = playerTileY;
        if (this.player.dir === 0) targetY += 1;
        if (this.player.dir === 1) targetY -= 1;
        if (this.player.dir === 2) targetX -= 1;
        if (this.player.dir === 3) targetX += 1;

        if (targetX >= 0 && targetX < this.mapCols && targetY >= 0 && targetY < this.mapRows) {
          const gx = targetX * TILE_SIZE;
          const gy = targetY * TILE_SIZE;

          // Gentle animated golden pulse
          const pulse = (Math.sin(performance.now() / 220) + 1) * 0.5;
          const alpha = 0.16 + pulse * 0.14;

          ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`;
          ctx.fillRect(gx, gy, TILE_SIZE, TILE_SIZE);

          // Stylized Corner Brackets
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2.5;
          const cornerLen = 7;

          // Top-Left corner
          ctx.beginPath();
          ctx.moveTo(gx + 1, gy + 1 + cornerLen);
          ctx.lineTo(gx + 1, gy + 1);
          ctx.lineTo(gx + 1 + cornerLen, gy + 1);
          ctx.stroke();

          // Top-Right corner
          ctx.beginPath();
          ctx.moveTo(gx + TILE_SIZE - 1 - cornerLen, gy + 1);
          ctx.lineTo(gx + TILE_SIZE - 1, gy + 1);
          ctx.lineTo(gx + TILE_SIZE - 1, gy + 1 + cornerLen);
          ctx.stroke();

          // Bottom-Left corner
          ctx.beginPath();
          ctx.moveTo(gx + 1, gy + TILE_SIZE - 1 - cornerLen);
          ctx.lineTo(gx + 1, gy + TILE_SIZE - 1);
          ctx.lineTo(gx + 1 + cornerLen, gy + TILE_SIZE - 1);
          ctx.stroke();

          // Bottom-Right corner
          ctx.beginPath();
          ctx.moveTo(gx + TILE_SIZE - 1 - cornerLen, gy + TILE_SIZE - 1);
          ctx.lineTo(gx + TILE_SIZE - 1, gy + TILE_SIZE - 1);
          ctx.lineTo(gx + TILE_SIZE - 1, gy + TILE_SIZE - 1 - cornerLen);
          ctx.stroke();

          // Subtle (A) button prompt icon above tile
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.beginPath();
          ctx.arc(gx + TILE_SIZE / 2, gy - 6, 7.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#4ade80';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('A', gx + TILE_SIZE / 2, gy - 6);
          ctx.restore();
        }
      }
    }

    renderParticles(ctx) {
      this.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    }

    renderFloatingTexts(ctx) {
      ctx.save();
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';

      this.floatingTexts.forEach(t => {
        const screenX = t.x - this.camera.x;
        const screenY = t.y - this.camera.y;
        // Text shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillText(t.text, screenX + 1, screenY + 1);
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, screenX, screenY);
      });
      ctx.restore();
    }

    // --- Dynamic Time of Day & Weather Ambient Overlay ---
    renderAmbientLighting(ctx) {
      const hours = this.timeMinutes / 60;
      let alpha = 0;
      let color = '0, 0, 30'; // night blue

      if (hours < 6) {
        // Night (0 to 6 AM)
        alpha = 0.55;
      } else if (hours >= 6 && hours < 8) {
        // Sunrise golden orange
        const ratio = (hours - 6) / 2;
        alpha = 0.25 * (1 - ratio);
        color = '255, 140, 0';
      } else if (hours >= 8 && hours < 17) {
        // Bright Daytime
        alpha = 0;
      } else if (hours >= 17 && hours < 20) {
        // Sunset orange / dusk
        const ratio = (hours - 17) / 3;
        alpha = 0.3 * ratio;
        color = '220, 80, 20';
      } else {
        // Night falls (20 to 24)
        const ratio = Math.min(1, (hours - 20) / 3);
        alpha = 0.2 + 0.45 * ratio;
      }

      if (alpha > 0) {
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }

      // Rain / Winter Snow animation overlay if inclement weather
      if (this.weather === 'rainy') {
        const time = performance.now() * 0.4;
        if (this.season === 'Winter') {
          ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
          const flakeCount = 55;
          for (let i = 0; i < flakeCount; i++) {
            const sx = ((i * 41 + Math.sin(time * 0.02 + i) * 18 + time * 0.45) % this.canvas.width);
            const sy = ((i * 59 + time * 1.4) % this.canvas.height);
            const radius = (i % 2 === 0) ? 2.2 : 1.5;
            ctx.beginPath();
            ctx.arc(sx, sy, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.strokeStyle = 'rgba(173, 216, 230, 0.45)';
          ctx.lineWidth = 1.5;
          const rainCount = 45;
          for (let i = 0; i < rainCount; i++) {
            const rx = ((i * 37 + time * 2) % this.canvas.width);
            const ry = ((i * 53 + time * 4) % this.canvas.height);
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 4, ry + 16);
            ctx.stroke();
          }
        }
      }
    }
  }

  // Launch Game once DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
  });

})();
