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

      // Tool Upgrades
      this.player.hasCopperHoe = false;
      this.player.hasSteelAxe = false;
      this.player.hasSteelPickaxe = false;

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
          { type: 'bakery', title: 'Bakery & Cafe', x: 34, y: 5, w: 6, h: 4 },
          { type: 'blacksmith', title: 'Blacksmith', x: 6, y: 19, w: 6, h: 4 },
          { type: 'town_hall', title: 'City Hall', x: 34, y: 19, w: 6, h: 4 }
        ],
        npcs: [
          { type: 'mayor', name: 'Mayor Clara', x: 31, y: 17 },
          { type: 'baker', name: 'Nora the Baker', x: 37, y: 10 },
          { type: 'blacksmith', name: 'Garth the Blacksmith', x: 9, y: 24 },
          { type: 'fisherman', name: 'Barnaby the Fisherman', x: 26, y: 31 },
          { type: 'penny', name: 'Penny the Florist', x: 38, y: 23 },
          { type: 'dog', name: 'Jasper the Pup', x: 20, y: 18 }
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

      // Positions of Grandma and Key Structures on Farm
      this.cottagePos = { x: 12 * TILE_SIZE, y: 4 * TILE_SIZE };
      this.grandmaPos = { x: 17 * TILE_SIZE + 8, y: 7 * TILE_SIZE };
      this.wellPos = { x: 22 * TILE_SIZE, y: 7 * TILE_SIZE };
      this.shippingBinPos = { x: 26 * TILE_SIZE, y: 7 * TILE_SIZE };
      this.shopCartPos = { x: 36 * TILE_SIZE, y: 41 * TILE_SIZE };

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

          // Avoid cottage area & starting garden
          if (r < 15 && c < 30) continue;

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
      } else {
        if (!this.city.tiles || this.city.tiles.length === 0) {
          this.initCityMap();
        }
        this.mapCols = this.city.cols;
        this.mapRows = this.city.rows;
        this.tiles = this.city.tiles;
        this.crops = {};
        this.objects = this.city.objects;
        this.debrisHealth = {};
      }

      this.worldWidth = this.mapCols * TILE_SIZE;
      this.worldHeight = this.mapRows * TILE_SIZE;

      const locBadge = document.getElementById('hudLocation');
      const travelBtnText = document.getElementById('btnTravelText');
      if (locBadge) {
        locBadge.textContent = loc === 'farm' ? "Grandma's Farm" : "Oakhaven City";
      }
      if (travelBtnText) {
        travelBtnText.textContent = loc === 'farm' ? "Visit City" : "Return to Farm";
      }
    }

    transitionTo(targetLoc, spawnX, spawnY) {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      this.transitionAlpha = 1.0;

      window.soundSystem?.playDialogue();

      setTimeout(() => {
        this.switchLocation(targetLoc);

        if (spawnX !== undefined && spawnY !== undefined) {
          this.player.x = spawnX;
          this.player.y = spawnY;
        } else {
          if (targetLoc === 'city') {
            this.player.x = 23.5 * TILE_SIZE;
            this.player.y = 3 * TILE_SIZE;
            this.player.dir = 0; // facing down
          } else {
            this.player.x = 29 * TILE_SIZE;
            this.player.y = 42 * TILE_SIZE;
            this.player.dir = 1; // facing up
          }
        }

        this.player.targetPos = null;
        this.camera.x = this.player.x + TILE_SIZE / 2 - this.canvas.width / 2;
        this.camera.y = this.player.y + TILE_SIZE / 2 - this.canvas.height / 2;
        this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldWidth - this.canvas.width));
        this.camera.y = Math.max(0, Math.min(this.camera.y, this.worldHeight - this.canvas.height));

        if (targetLoc === 'city') {
          this.showToast('Arrived at Oakhaven City! Explore the plaza, notice board, and shops.');
        } else {
          this.showToast('Returned to Grandma’s Homestead! The crops and fields await.');
        }
      }, 200);
    }

    // --- Input Binding ---
    bindInputs() {
      // Keyboard input
      window.addEventListener('keydown', (e) => {
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
        // Escape closes any active modal
        if (e.key === 'Escape') {
          document.querySelectorAll('.game-modal').forEach(m => m.classList.remove('active'));
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.key.toLowerCase()] = false;
      });

      // Precise Mouse Tracking with resolution scaling
      const updateMouse = (e) => {
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
        if (this.currentLocation === 'farm') {
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
      if (isKeyboardMoving) {
        this.player.targetPos = null; // Keyboard cancels click navigation
      }

      let isMoving = isKeyboardMoving;

      if (!isKeyboardMoving && this.player.targetPos) {
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

      this.player.isMoving = isMoving;

      if (isMoving) {
        const nextX = this.player.x + dx * this.player.speed;
        const nextY = this.player.y + dy * this.player.speed;

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

        this.player.walkFrame += dt * 15;
        // Periodic footstep audio
        if (Math.floor(this.player.walkFrame) % 6 === 0) {
          window.soundSystem?.playFootstep();
        }
      }

      // Tool animation cooldown timer
      if (this.player.toolTimer > 0) {
        this.player.toolTimer -= dt;
        if (this.player.toolTimer <= 0) {
          this.player.toolAction = null;
        }
      }

      // 3. Camera smoothly follows player
      const targetCamX = this.player.x + TILE_SIZE / 2 - this.canvas.width / 2;
      const targetCamY = this.player.y + TILE_SIZE / 2 - this.canvas.height / 2;
      this.camera.x += (targetCamX - this.camera.x) * 0.1;
      this.camera.y += (targetCamY - this.camera.y) * 0.1;

      // Clamp camera within map bounds
      this.camera.x = Math.max(0, Math.min(this.camera.x, this.worldWidth - this.canvas.width));
      this.camera.y = Math.max(0, Math.min(this.camera.y, this.worldHeight - this.canvas.height));

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

        // City Buildings collision
        for (const b of this.city.buildings) {
          const bLeft = b.x * TILE_SIZE;
          const bRight = (b.x + b.w) * TILE_SIZE;
          const bTop = b.y * TILE_SIZE + 16;
          const bBottom = (b.y + b.h) * TILE_SIZE;
          if (box.right > bLeft && box.left < bRight && box.bottom > bTop && box.top < bBottom) {
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
        // Cottage front door entrance triggers sleep modal
        if (box.left >= this.cottagePos.x + 85 && box.right <= this.cottagePos.x + 115 && box.bottom >= this.cottagePos.y + 120) {
          this.openSleepConfirm();
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

        // 5. City Buildings (Doors & Storefronts)
        // General Store (x: 6 to 11, y: 5 to 9)
        if (tileX >= 6 && tileX <= 11 && tileY >= 5 && tileY <= 9) {
          this.openShopModal('buy');
          return;
        }
        // Hazelwood Bakery (x: 34 to 39, y: 5 to 9)
        if (tileX >= 34 && tileX <= 39 && tileY >= 5 && tileY <= 9) {
          this.openBakeryModal();
          return;
        }
        // Garth's Blacksmith (x: 6 to 11, y: 19 to 23)
        if (tileX >= 6 && tileX <= 11 && tileY >= 19 && tileY <= 23) {
          this.openBlacksmithModal();
          return;
        }
        // City Hall (x: 34 to 39, y: 19 to 23)
        if (tileX >= 34 && tileX <= 39 && tileY >= 19 && tileY <= 23) {
          this.talkToCityNPC('mayor');
          return;
        }

        // 6. Park Benches
        if (this.objects[`${tileX},${tileY}`] === 'bench') {
          this.showToast('You rested comfortably on the town plaza bench.');
          return;
        }

        // Farm tools cannot be used in town
        this.showToast('You cannot farm or clear debris in Oakhaven City! Head back north to Grandma’s Farm.');
        return;
      }

      // --- FARM INTERACTIONS ---
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

      // Require active item
      if (!activeItem) return;

      // Check Stamina
      if (this.player.stamina <= 0 && activeItem.type === 'tool') {
        this.showToast('You are completely out of energy! Rest in bed or eat some food.');
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
          this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#4ade80', 8);
          this.showFloatingText('+1 Fiber', tx * TILE_SIZE + 16, ty * TILE_SIZE + 8, '#86efac');
          this.progressQuest('clear_debris');
        } else {
          window.soundSystem?.playNoise(0.1, 1600, 0.15);
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

      this.spawnParticles(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, '#facc15', 12);
      this.showFloatingText(`+1 ${cropName}!`, tx * TILE_SIZE + 16, ty * TILE_SIZE, '#fde047');
      this.showToast(`Harvested juicy ${cropName}! You can sell it at the shop.`);
      this.updateHUD();
    }

    refillWateringCan() {
      this.player.water = this.player.waterCapacity;
      window.soundSystem?.playWater();
      this.spawnParticles(this.player.x + 16, this.player.y + 16, '#38bdf8', 12);
      this.showFloatingText(`Can Refilled! (${this.player.waterCapacity}/${this.player.waterCapacity})`, this.player.x + 16, this.player.y, '#38bdf8');
      this.showToast('Watering can refilled to full capacity!');
      this.updateHUD();
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
      // Check if existing stackable item
      const existing = this.inventory.find(i => i.id === itemId);
      if (existing) {
        existing.count += amount;
      } else {
        // Create new item entry
        let name = itemId.replace(/_/g, ' ');
        name = name.charAt(0).toUpperCase() + name.slice(1);
        let type = 'material';

        if (CROP_DEFS[itemId]) {
          name = CROP_DEFS[itemId].name;
          type = 'crop';
        } else if (itemId.endsWith('_seed')) {
          type = 'seed';
        }

        this.inventory.push({
          id: itemId,
          name: name,
          type: type,
          count: amount,
          crop: itemId.replace('_seed', ''),
          desc: `Farm resource.`
        });
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
          <button class="btn-primary" onclick="document.getElementById('dialogueModal').classList.remove('active')">
            Thank you, Grandma!
          </button>
        `;
      }
      modal.classList.add('active');
    }

    // --- Day Transition & Sleep System ---
    openSleepConfirm() {
      // Tutorial Day 1 Requirement: Must talk to Grandma to sleep!
      if (this.day === 1 && !this.grandmaApprovedSleep) {
        this.showToast('Grandma Hazel is waiting on the porch! Speak with her before your first night’s rest.');
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

      // 1. Advance Day Count
      this.day++;
      this.timeMinutes = 6 * 60; // Reset to 6:00 AM
      this.player.stamina = this.player.maxStamina; // Full energy restore

      // 2. Weather Roll (75% Sunny, 25% Rainy)
      this.weather = Math.random() < 0.25 ? 'rainy' : 'sunny';

      // 3. Process Automatic Sprinklers & Rain Watering
      let wateredCount = 0;
      for (let r = 0; r < this.mapRows; r++) {
        for (let c = 0; c < this.mapCols; c++) {
          const tile = this.tiles[r][c];
          
          if (this.weather === 'rainy') {
            if (tile.isTilled || tile.type === 'soil') {
              tile.isWatered = true;
            }
          } else {
            // Check adjacent sprinklers
            const hasSprinklerNearby = 
              this.objects[`${c+1},${r}`] === 'sprinkler' ||
              this.objects[`${c-1},${r}`] === 'sprinkler' ||
              this.objects[`${c},${r+1}`] === 'sprinkler' ||
              this.objects[`${c},${r-1}`] === 'sprinkler';

            if (hasSprinklerNearby) {
              tile.isWatered = true;
              wateredCount++;
            }
          }
        }
      }

      // 4. Grow Crops that were watered
      let maturedCrops = 0;
      for (const key in this.crops) {
        const crop = this.crops[key];
        const [cx, cy] = key.split(',').map(Number);
        const tile = this.tiles[cy][cx];

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
        const weatherText = this.weather === 'rainy' ? 'Gentle Rain (All crops automatically watered!)' : 'Bright & Sunny';
        
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
          activeQuestIdx: this.activeQuestIdx
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
          if (data.inventory) this.inventory = data.inventory;
          if (data.quests) this.quests = data.quests;
          if (data.activeQuestIdx !== undefined) this.activeQuestIdx = data.activeQuestIdx;

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
          { id: 'blueberry_seed', name: 'Blueberry Seeds', cost: 75, desc: 'City variety. Grows in 4 days. Sells for 190 G.' },
          { id: 'tomato_seed', name: 'Tomato Seeds', cost: 80, desc: 'Grows in 4 days. Sells for 200 G.' },
          { id: 'corn_seed', name: 'Golden Corn Seeds', cost: 120, desc: 'Grows in 5 days. Sells for 310 G.' },
          { id: 'melon_seed', name: 'Sweet Melon Seeds', cost: 140, desc: 'Rich honeydew melon. Grows in 6 days. Sells for 380 G.' },
          { id: 'pumpkin_seed', name: 'Pumpkin Seeds', cost: 150, desc: 'Grows in 6 days. Sells for 420 G.' },
          { id: 'starfruit_seed', name: 'Starfruit Seeds', cost: 250, desc: 'Exotic glowing fruit. Grows in 7 days. Sells for 750 G.' },
          { id: 'fertilizer', name: 'Speed-Gro Fertilizer', cost: 40, desc: 'Speeds up growth by 50%.' },
          { id: 'sprinkler', name: 'Farm Sprinkler', cost: 320, desc: 'Auto-waters adjacent 4 tiles every morning.' },
          { id: 'apple_pie', name: 'Grandma’s Berry Pie', cost: 45, desc: 'Delicious homemade pastry. Restores 60 Stamina.' }
        ];

        html += `<div class="shop-items-grid">`;
        storeItems.forEach(item => {
          html += `
            <div class="shop-card">
              <div class="shop-card-info">
                <div class="shop-card-name">${item.name}</div>
                <div class="shop-card-desc">${item.desc}</div>
                <div class="shop-card-price">${item.cost} Gold</div>
              </div>
              <button class="shop-buy-btn" data-buy="${item.id}" data-cost="${item.cost}">
                Buy
              </button>
            </div>
          `;
        });
        html += `</div>`;
      } else {
        // Sell Tab: show produce and materials in inventory
        const sellableItems = this.inventory.filter(i => 
          i.type === 'crop' || i.type === 'material' || CROP_DEFS[i.id] || i.id === 'wood' || i.id === 'stone'
        );

        if (sellableItems.length === 0) {
          html += `
            <div class="empty-shop-state">
              <p>You don't have any harvestable crops or raw materials to sell yet!</p>
              <p style="color: #64748b; font-size: 0.9rem; margin-top: 6px;">Grow crops with seeds or gather wood/stone with your axe and pickaxe.</p>
            </div>
          `;
        } else {
          html += `
            <div style="margin-bottom: 12px; display: flex; justify-content: flex-end;">
              <button class="shop-sell-all-btn" id="btnSellAll">Sell All Produce</button>
            </div>
            <div class="shop-items-grid">
          `;

          sellableItems.forEach(item => {
            let unitPrice = 10;
            if (CROP_DEFS[item.id]) {
              unitPrice = CROP_DEFS[item.id].sellPrice;
            } else if (item.id === 'wood') {
              unitPrice = 5;
            } else if (item.id === 'stone') {
              unitPrice = 6;
            }

            const totalPrice = unitPrice * item.count;

            html += `
              <div class="shop-card">
                <div class="shop-card-info">
                  <div class="shop-card-name">${item.name} (x${item.count})</div>
                  <div class="shop-card-desc">Sells for ${unitPrice} G each</div>
                  <div class="shop-card-price" style="color: #10b981;">Total: +${totalPrice} Gold</div>
                </div>
                <button class="shop-sell-btn" data-sell="${item.id}" data-unit="${unitPrice}">
                  Sell
                </button>
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
          if (this.player.gold >= cost) {
            this.player.gold -= cost;
            this.addItem(itemId, 1);
            window.soundSystem?.playCoin();
            this.showToast(`Purchased 1x ${itemId.replace(/_/g, ' ')}!`);
            this.updateHUD();
          } else {
            this.showToast('Not enough Gold! Earn more by harvesting and selling crops.');
          }
        });
      });

      // Bind Sell Buttons
      container.querySelectorAll('[data-sell]').forEach(btn => {
        btn.addEventListener('click', () => {
          const itemId = btn.getAttribute('data-sell');
          const unitPrice = parseInt(btn.getAttribute('data-unit'));
          const itemIdx = this.inventory.findIndex(i => i.id === itemId);
          if (itemIdx !== -1) {
            const item = this.inventory[itemIdx];
            const earned = item.count * unitPrice;
            this.player.gold += earned;
            this.inventory.splice(itemIdx, 1);
            window.soundSystem?.playCoin();
            this.showToast(`Sold ${item.name} for +${earned} Gold!`);
            this.updateHUD();
            this.renderShop('sell');
          }
        });
      });

      // Bind Sell All Button
      document.getElementById('btnSellAll')?.addEventListener('click', () => {
        let totalEarned = 0;
        for (let i = this.inventory.length - 1; i >= 0; i--) {
          const item = this.inventory[i];
          let unitPrice = 0;
          if (CROP_DEFS[item.id]) unitPrice = CROP_DEFS[item.id].sellPrice;
          else if (item.id === 'wood') unitPrice = 5;
          else if (item.id === 'stone') unitPrice = 6;

          if (unitPrice > 0) {
            totalEarned += item.count * unitPrice;
            this.inventory.splice(i, 1);
          }
        }
        if (totalEarned > 0) {
          this.player.gold += totalEarned;
          window.soundSystem?.playCoin();
          this.showToast(`Sold all farm produce for +${totalEarned} Gold!`);
          this.updateHUD();
          this.renderShop('sell');
        }
      });
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
        textElem.textContent = `"Hush now lad... the sunfish are biting near the bridge pilings. The water running through Oakhaven canal flows pure from the high peaks. Did you know you can dip your watering can right into the plaza fountain anytime? Never walk with an empty can!"`;
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
      }

      modal.classList.add('active');
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
        else if (item.type === 'food') typeBadgeClass = 'food';
        else if (item.type === 'material') typeBadgeClass = 'material';

        let typeLabel = item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1)) : 'Item';
        if (item.type === 'tool') {
          if (item.id === 'hoe' && this.player.hasCopperHoe) typeLabel = 'Copper Hoe';
          if (item.id === 'axe' && this.player.hasSteelAxe) typeLabel = 'Steel Axe';
          if (item.id === 'pickaxe' && this.player.hasSteelPickaxe) typeLabel = 'Steel Pickaxe';
        }

        gridHtml += `
          <div class="inv-card" style="${isActiveHotbarSlot ? 'border-color: #f59e0b; background: #fffdf5;' : ''}">
            <div class="inv-card-header">
              <div>
                <div class="inv-card-name">${item.name}</div>
                <div style="font-size: 0.72rem; color: #78350f; font-weight: 700; margin-top: 2px;">
                  Quantity: ${item.count} ${isCurrentlyInHotbar ? `<span style="color: #15803d;">(Slot ${originalIdx + 1})</span>` : ''}
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

      const toast = document.createElement('div');
      toast.className = 'game-toast';
      toast.textContent = message;
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
      }, 3500);
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
        weatherElem.textContent = this.weather === 'rainy' ? 'Gentle Rain' : 'Sunny Skies';
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

      ctx.save();
      // Apply Camera Translation
      ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

      const hours = this.timeMinutes / 60;
      const isNight = (hours < 6 || hours >= 19.5);

      if (this.currentLocation === 'city') {
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
            }
          }
        }

        // 3. Central Stone Fountain
        Sprites.drawFountain(ctx, 22 * TILE_SIZE, 16 * TILE_SIZE, currentTime);

        // 4. Draw 4 City Buildings
        this.city.buildings.forEach(b => {
          Sprites.drawCityBuilding(ctx, b.x * TILE_SIZE, b.y * TILE_SIZE, b.w, b.h, b.type, b.title);
        });

        // 5. Draw City NPCs
        this.city.npcs.forEach(npc => {
          Sprites.drawNPC(ctx, npc.x * TILE_SIZE, npc.y * TILE_SIZE, npc.type, currentTime);
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

        // 7. Draw Roadside Market Cart
        this.drawShopCart(ctx, this.shopCartPos.x, this.shopCartPos.y);
      }

      // 8. Draw Player
      Sprites.drawPlayer(
        ctx,
        this.player.x,
        this.player.y,
        this.player.dir,
        this.player.isMoving,
        this.player.toolAction,
        this.player.walkFrame
      );

      // 9. Draw Grid Cursor Highlight
      this.drawCursorHighlight(ctx);

      // 10. Draw Particles
      this.renderParticles(ctx);

      ctx.restore();

      // 11. Ambient Day / Night / Weather Lighting
      this.renderAmbientLighting(ctx);

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

      // Rain animation overlay if raining
      if (this.weather === 'rainy') {
        ctx.strokeStyle = 'rgba(173, 216, 230, 0.45)';
        ctx.lineWidth = 1.5;
        const rainCount = 45;
        const time = performance.now() * 0.4;
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

  // Launch Game once DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
  });

})();
