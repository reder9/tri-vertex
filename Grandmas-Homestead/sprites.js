// Procedural Pixel Art Generator & Renderer for Grandma's Farm
// Provides high-performance 2D canvas drawing routines for tiles, crops, player, grandma, and decorations.

const Sprites = {
  TILE_SIZE: 32,

  // Color Palette (Stardew-inspired rich earthy & vibrant tones)
  colors: {
    grassLight: '#6ca832',
    grassMid: '#579124',
    grassDark: '#447519',
    flowerYellow: '#f9d71c',
    flowerPink: '#f78ca0',
    flowerBlue: '#70a6ff',
    
    pathLight: '#dfba87',
    pathMid: '#c69b61',
    pathDark: '#997340',

    soilDry: '#8b5a2b',
    soilDryRidge: '#9d6935',
    soilDryShade: '#6f441c',
    
    soilWet: '#4a2e15',
    soilWetRidge: '#5e3a1d',
    soilWetShade: '#341f0c',
    soilWetGlisten: '#79502c',

    waterLight: '#4ca3e0',
    waterMid: '#2980b9',
    waterDark: '#1b5f8c',
    waterFoam: '#d4efff',

    woodLight: '#d29b63',
    woodMid: '#ad723b',
    woodDark: '#704318',

    stoneLight: '#a6afb8',
    stoneMid: '#7e8890',
    stoneDark: '#565e65',

    roofRed: '#b03a2e',
    roofRedDark: '#78281f',
    wallCream: '#fdedc7',
    windowGlass: '#85c1e9',
    windowGlow: '#fcf3cf'
  },

  setSeason(season = 'Spring') {
    if (season === 'Summer') {
      this.colors.grassLight = '#5ca632';
      this.colors.grassMid = '#488820';
      this.colors.grassDark = '#346914';
      this.colors.flowerYellow = '#facc15';
      this.colors.flowerPink = '#fb7185';
    } else if (season === 'Fall') {
      this.colors.grassLight = '#d49a42';
      this.colors.grassMid = '#b87e2d';
      this.colors.grassDark = '#8f5e1c';
      this.colors.flowerYellow = '#f97316';
      this.colors.flowerPink = '#dc2626';
    } else if (season === 'Winter') {
      this.colors.grassLight = '#f1f5f9';
      this.colors.grassMid = '#dbeafe';
      this.colors.grassDark = '#94a3b8';
      this.colors.flowerYellow = '#e0f2fe';
      this.colors.flowerPink = '#bfdbfe';
    } else {
      // Spring default
      this.colors.grassLight = '#6ca832';
      this.colors.grassMid = '#579124';
      this.colors.grassDark = '#447519';
      this.colors.flowerYellow = '#f9d71c';
      this.colors.flowerPink = '#f78ca0';
    }
  },

  // Draw Ground Tiles
  drawGrass(ctx, x, y, seed = 0) {
    const s = this.TILE_SIZE;
    ctx.fillStyle = this.colors.grassMid;
    ctx.fillRect(x, y, s, s);

    // Subtle grass texture dots
    ctx.fillStyle = this.colors.grassLight;
    const offset = (seed * 17) % 7;
    ctx.fillRect(x + 4 + offset, y + 6, 2, 4);
    ctx.fillRect(x + 18 - offset, y + 20, 2, 4);
    ctx.fillRect(x + 24, y + 10 + offset, 2, 3);

    ctx.fillStyle = this.colors.grassDark;
    ctx.fillRect(x + 10, y + 24, 2, 2);
    ctx.fillRect(x + 22, y + 4, 2, 2);

    // Wildflowers occasionally
    if (seed % 11 === 0) {
      ctx.fillStyle = this.colors.flowerPink;
      ctx.fillRect(x + 14, y + 14, 4, 4);
      ctx.fillStyle = this.colors.flowerYellow;
      ctx.fillRect(x + 15, y + 15, 2, 2);
    } else if (seed % 17 === 0) {
      ctx.fillStyle = this.colors.flowerYellow;
      ctx.fillRect(x + 8, y + 20, 3, 3);
    }
  },

  drawPath(ctx, x, y, seed = 0) {
    const s = this.TILE_SIZE;
    ctx.fillStyle = this.colors.pathMid;
    ctx.fillRect(x, y, s, s);

    ctx.fillStyle = this.colors.pathLight;
    ctx.fillRect(x + 4, y + 6, 6, 4);
    ctx.fillRect(x + 16, y + 18, 8, 5);

    ctx.fillStyle = this.colors.pathDark;
    ctx.fillRect(x + 2, y + 20, 3, 3);
    ctx.fillRect(x + 22, y + 8, 4, 3);
  },

  drawSoil(ctx, x, y, isWatered = false, isFertilized = false) {
    const s = this.TILE_SIZE;
    const base = isWatered ? this.colors.soilWet : this.colors.soilDry;
    const ridge = isWatered ? this.colors.soilWetRidge : this.colors.soilDryRidge;
    const shade = isWatered ? this.colors.soilWetShade : this.colors.soilDryShade;

    ctx.fillStyle = base;
    ctx.fillRect(x, y, s, s);

    // Furrow / Tilled ridges
    ctx.fillStyle = ridge;
    ctx.fillRect(x + 2, y + 4, s - 4, 4);
    ctx.fillRect(x + 2, y + 12, s - 4, 4);
    ctx.fillRect(x + 2, y + 20, s - 4, 4);
    ctx.fillRect(x + 2, y + 28, s - 4, 2);

    ctx.fillStyle = shade;
    ctx.fillRect(x + 2, y + 8, s - 4, 2);
    ctx.fillRect(x + 2, y + 16, s - 4, 2);
    ctx.fillRect(x + 2, y + 24, s - 4, 2);

    if (isWatered) {
      // Glistening wet water highlight spots
      ctx.fillStyle = this.colors.soilWetGlisten;
      ctx.fillRect(x + 6, y + 5, 4, 2);
      ctx.fillRect(x + 20, y + 13, 5, 2);
      ctx.fillRect(x + 10, y + 21, 3, 2);
    }

    if (isFertilized) {
      // Sparkling fertilizer specs
      ctx.fillStyle = '#73c0f4';
      ctx.fillRect(x + 4, y + 10, 2, 2);
      ctx.fillRect(x + 22, y + 6, 2, 2);
      ctx.fillRect(x + 15, y + 22, 2, 2);
    }
  },

  drawWater(ctx, x, y, time = 0) {
    const s = this.TILE_SIZE;
    ctx.fillStyle = this.colors.waterMid;
    ctx.fillRect(x, y, s, s);

    // Subtle wave ripples
    const rippleOffset = Math.sin(time * 0.003 + x + y) * 3;
    ctx.fillStyle = this.colors.waterLight;
    ctx.fillRect(x + 4 + rippleOffset, y + 8, 12, 2);
    ctx.fillRect(x + 14 - rippleOffset, y + 20, 10, 2);

    ctx.fillStyle = this.colors.waterDark;
    ctx.fillRect(x, y, s, 3);
  },

  drawDock(ctx, x, y) {
    const s = this.TILE_SIZE;
    // Water underneath showing at borders
    ctx.fillStyle = this.colors.waterDark;
    ctx.fillRect(x, y, s, s);

    // Wooden deck planks
    ctx.fillStyle = this.colors.woodMid;
    ctx.fillRect(x, y + 2, s, s - 4);

    ctx.fillStyle = this.colors.woodLight;
    ctx.fillRect(x + 2, y + 4, s - 4, 3);
    ctx.fillRect(x + 2, y + 11, s - 4, 3);
    ctx.fillRect(x + 2, y + 18, s - 4, 3);
    ctx.fillRect(x + 2, y + 25, s - 4, 2);

    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(x, y + 1, s, 2);
    ctx.fillRect(x, y + s - 3, s, 2);

    // Pier support post bolts
    ctx.fillStyle = '#374151';
    ctx.fillRect(x + 3, y + 5, 2, 2);
    ctx.fillRect(x + s - 5, y + 5, 2, 2);
  },

  drawFence(ctx, x, y, hasLeft = false, hasRight = false, hasUp = false, hasDown = false) {
    const s = this.TILE_SIZE;
    ctx.fillStyle = this.colors.woodMid;

    // Center post
    ctx.fillRect(x + 12, y + 6, 8, 24);
    ctx.fillStyle = this.colors.woodLight;
    ctx.fillRect(x + 14, y + 6, 4, 24);
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(x + 12, y + 4, 8, 3); // cap

    // Horizontal rails
    if (hasLeft) {
      ctx.fillStyle = this.colors.woodMid;
      ctx.fillRect(x, y + 10, 12, 4);
      ctx.fillRect(x, y + 20, 12, 4);
      ctx.fillStyle = this.colors.woodLight;
      ctx.fillRect(x, y + 11, 12, 2);
    }
    if (hasRight) {
      ctx.fillStyle = this.colors.woodMid;
      ctx.fillRect(x + 20, y + 10, 12, 4);
      ctx.fillRect(x + 20, y + 20, 12, 4);
      ctx.fillStyle = this.colors.woodLight;
      ctx.fillRect(x + 20, y + 11, 12, 2);
    }
    if (hasUp) {
      ctx.fillStyle = this.colors.woodDark;
      ctx.fillRect(x + 14, y, 4, 8);
    }
    if (hasDown) {
      ctx.fillStyle = this.colors.woodDark;
      ctx.fillRect(x + 14, y + 28, 4, 4);
    }
  },

  drawSprinkler(ctx, x, y, time = 0) {
    const s = this.TILE_SIZE;
    // Base pipe
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(x + 13, y + 20, 6, 8);

    // Brass nozzle
    ctx.fillStyle = '#ecc94b';
    ctx.fillRect(x + 11, y + 12, 10, 8);
    ctx.fillStyle = '#d69e2e';
    ctx.fillRect(x + 14, y + 8, 4, 5);

    // Subtle water mist spin
    const angle = (time * 0.005) % (Math.PI * 2);
    const mistX = Math.cos(angle) * 6;
    const mistY = Math.sin(angle) * 3;
    ctx.fillStyle = 'rgba(147, 197, 253, 0.7)';
    ctx.fillRect(x + 16 + mistX, y + 7 + mistY, 3, 3);
  },

  // Grandma's Cozy Well
  drawWell(ctx, x, y) {
    const s = this.TILE_SIZE;
    // Well stone base
    ctx.fillStyle = this.colors.stoneDark;
    ctx.fillRect(x + 2, y + 14, s * 2 - 4, 18);
    ctx.fillStyle = this.colors.stoneMid;
    ctx.fillRect(x + 4, y + 16, s * 2 - 8, 14);

    // Inner water
    ctx.fillStyle = this.colors.waterDark;
    ctx.fillRect(x + 10, y + 18, s * 2 - 20, 10);
    ctx.fillStyle = this.colors.waterLight;
    ctx.fillRect(x + 14, y + 20, 8, 3);

    // Wooden roof posts
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(x + 6, y - 6, 4, 22);
    ctx.fillRect(x + s * 2 - 10, y - 6, 4, 22);

    // Roof
    ctx.fillStyle = this.colors.roofRed;
    ctx.beginPath();
    ctx.moveTo(x + s, y - 22);
    ctx.lineTo(x, y - 4);
    ctx.lineTo(x + s * 2, y - 4);
    ctx.closePath();
    ctx.fill();

    // Wooden bucket on rim
    ctx.fillStyle = this.colors.woodMid;
    ctx.fillRect(x + s * 2 - 16, y + 10, 8, 8);
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(x + s * 2 - 15, y + 7, 6, 3);
  },

  // Shipping Bin (Wooden chest with brass latch)
  drawShippingBin(ctx, x, y) {
    const s = this.TILE_SIZE;
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 2, y + 26, s + 10, 6);

    // Wood chest box
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(x + 2, y + 8, s + 8, 20);
    ctx.fillStyle = this.colors.woodMid;
    ctx.fillRect(x + 4, y + 10, s + 4, 16);

    // Lid & Iron bands
    ctx.fillStyle = '#374151';
    ctx.fillRect(x + 8, y + 8, 4, 18);
    ctx.fillRect(x + 24, y + 8, 4, 18);

    // Golden handle/latch
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 16, y + 15, 6, 5);
  },

  // Trees (Can be chopped for Wood)
  drawTree(ctx, x, y, health = 3) {
    const s = this.TILE_SIZE;
    // Trunk
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(x + 11, y + 16, 10, 16);
    ctx.fillStyle = this.colors.woodMid;
    ctx.fillRect(x + 13, y + 16, 5, 14);

    // Tree Foliage canopy (fluffy 3 layers)
    ctx.fillStyle = '#2d5a1e';
    ctx.beginPath();
    ctx.arc(x + 16, y + 6, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3d7a28';
    ctx.beginPath();
    ctx.arc(x + 14, y + 4, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#559c36';
    ctx.beginPath();
    ctx.arc(x + 12, y + 0, 11, 0, Math.PI * 2);
    ctx.fill();

    // Red apples occasionally
    ctx.fillStyle = '#e53e3e';
    ctx.fillRect(x + 8, y + 2, 4, 4);
    ctx.fillRect(x + 20, y + 6, 4, 4);
    ctx.fillRect(x + 14, y - 8, 4, 4);

    // If damaged, show cut mark
    if (health < 3) {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x + 13, y + 22, 6, 2);
    }
  },

  // Boulder / Stone (Can be mined for Stone)
  drawRock(ctx, x, y, health = 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x + 4, y + 22, 24, 6);

    ctx.fillStyle = this.colors.stoneDark;
    ctx.fillRect(x + 4, y + 10, 24, 16);
    ctx.fillStyle = this.colors.stoneMid;
    ctx.fillRect(x + 6, y + 8, 20, 16);
    ctx.fillStyle = this.colors.stoneLight;
    ctx.fillRect(x + 8, y + 10, 8, 6);

    if (health < 3) {
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(x + 14, y + 12, 2, 8);
      ctx.fillRect(x + 16, y + 16, 4, 2);
    }
  },

  // Weeds / Wild brush (Cleared with Scythe)
  drawWeeds(ctx, x, y) {
    ctx.fillStyle = '#3a661c';
    ctx.fillRect(x + 4, y + 16, 4, 12);
    ctx.fillRect(x + 10, y + 10, 4, 18);
    ctx.fillRect(x + 18, y + 12, 4, 16);
    ctx.fillRect(x + 24, y + 18, 4, 10);

    ctx.fillStyle = '#619c28';
    ctx.fillRect(x + 6, y + 12, 3, 10);
    ctx.fillRect(x + 12, y + 8, 3, 12);
    ctx.fillRect(x + 20, y + 10, 3, 11);
  },

  // Crops System (Draws crop based on type and growth stage 0-4)
  drawCrop(ctx, x, y, cropType, stage, isReady) {
    // Stage 0: Just planted seeds
    if (stage === 0) {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 10, y + 18, 3, 3);
      ctx.fillRect(x + 18, y + 16, 3, 3);
      ctx.fillRect(x + 14, y + 22, 3, 3);
      return;
    }

    // Stage 1: Tiny green sprout
    if (stage === 1) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x + 15, y + 18, 2, 8);
      ctx.fillRect(x + 12, y + 16, 3, 3);
      ctx.fillRect(x + 17, y + 15, 3, 3);
      return;
    }

    // Stage 2: Growing stalk / leaves
    if (stage === 2) {
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(x + 14, y + 14, 4, 12);
      ctx.fillRect(x + 9, y + 12, 5, 4);
      ctx.fillRect(x + 18, y + 13, 5, 4);
      return;
    }

    // Stage 3 & 4: Maturing & Harvestable Ready
    switch (cropType) {
      case 'turnip':
        // Big leafy greens + purple-white round turnip
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 8, y + 8, 6, 8);
        ctx.fillRect(x + 18, y + 8, 6, 8);
        ctx.fillRect(x + 13, y + 4, 6, 10);
        // Turnip body
        ctx.fillStyle = '#a855f7'; // purple top
        ctx.fillRect(x + 10, y + 18, 12, 5);
        ctx.fillStyle = '#f8fafc'; // white root
        ctx.fillRect(x + 11, y + 23, 10, 6);
        ctx.fillRect(x + 14, y + 29, 4, 2);
        break;

      case 'carrot':
        // Frilly feathery green tops + orange carrot
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x + 14, y + 4, 4, 14);
        ctx.fillRect(x + 9, y + 8, 6, 3);
        ctx.fillRect(x + 17, y + 7, 6, 3);
        ctx.fillRect(x + 7, y + 12, 5, 3);
        ctx.fillRect(x + 20, y + 11, 5, 3);
        // Orange carrot crowning
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x + 12, y + 18, 8, 9);
        ctx.fillRect(x + 14, y + 27, 4, 4);
        break;

      case 'strawberry':
        // Bushy dark green leaves + red speckled berries
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 6, y + 12, 20, 14);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 8, y + 8, 16, 6);
        // Ripe red strawberries
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 7, y + 16, 6, 7);
        ctx.fillRect(x + 19, y + 17, 6, 7);
        ctx.fillRect(x + 13, y + 21, 6, 7);
        // Seeds
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 9, y + 18, 2, 2);
        ctx.fillRect(x + 21, y + 19, 2, 2);
        ctx.fillRect(x + 15, y + 23, 2, 2);
        break;

      case 'tomato':
        // Tall vine with support stake
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x + 14, y + 2, 4, 28);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 8, y + 6, 16, 16);
        // Glossy red round tomatoes
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + 7, y + 10, 7, 7);
        ctx.fillRect(x + 18, y + 14, 7, 7);
        ctx.fillStyle = '#f87171';
        ctx.fillRect(x + 8, y + 11, 2, 2);
        break;

      case 'pumpkin':
        // Sprawling vines + huge ribbed orange pumpkin
        ctx.fillStyle = '#166534';
        ctx.fillRect(x + 4, y + 16, 24, 6);
        ctx.fillRect(x + 10, y + 8, 12, 6);
        // Giant Pumpkin
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(x + 6, y + 14, 20, 16);
        ctx.fillStyle = '#f97316';
        ctx.fillRect(x + 8, y + 16, 16, 12);
        // Rib lines
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(x + 12, y + 14, 2, 14);
        ctx.fillRect(x + 18, y + 14, 2, 14);
        // Green stem
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 14, y + 11, 4, 4);
        break;

      case 'corn':
        // Tall golden corn stalks with green husks & golden silks
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 13, y - 4, 6, 32);
        ctx.fillRect(x + 6, y + 6, 8, 4);
        ctx.fillRect(x + 18, y + 12, 8, 4);
        // Golden cobs
        ctx.fillStyle = '#eab308';
        ctx.fillRect(x + 9, y + 12, 6, 12);
        ctx.fillRect(x + 17, y + 16, 6, 10);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(x + 10, y + 10, 4, 3); // silk
        break;

      case 'blueberry':
        // Plump leafy blueberry bush with deep blue clusters
        ctx.fillStyle = '#166534';
        ctx.fillRect(x + 6, y + 10, 20, 16);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 8, y + 8, 16, 6);
        // Blueberries
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x + 8, y + 14, 5, 5);
        ctx.fillRect(x + 18, y + 14, 5, 5);
        ctx.fillRect(x + 13, y + 19, 6, 6);
        ctx.fillStyle = '#93c5fd';
        ctx.fillRect(x + 9, y + 15, 2, 2);
        ctx.fillRect(x + 19, y + 15, 2, 2);
        ctx.fillRect(x + 14, y + 20, 2, 2);
        break;

      case 'melon':
        // Sprawling vines + large round striped green melon
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 4, y + 16, 24, 6);
        // Melon body
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 7, y + 14, 18, 15);
        // Darker green stripes
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 11, y + 14, 2, 15);
        ctx.fillRect(x + 15, y + 14, 2, 15);
        ctx.fillRect(x + 19, y + 14, 2, 15);
        // Stem
        ctx.fillStyle = '#166534';
        ctx.fillRect(x + 15, y + 11, 2, 4);
        break;

      case 'starfruit':
        // Mystical glowing golden starfruit
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + 14, y + 6, 4, 12);
        // Golden starfruit body
        ctx.fillStyle = '#eab308';
        ctx.fillRect(x + 9, y + 14, 14, 14);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 11, y + 12, 10, 18);
        ctx.fillRect(x + 7, y + 16, 18, 10);
        // Celestial sparkle
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 14, y + 17, 4, 4);
        break;

      default:
        // Generic crop
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x + 8, y + 10, 16, 16);
        break;
    }

    // Sparkle shimmer when 100% ready to harvest
    if (isReady) {
      const sparkle = (Date.now() / 250) % 4;
      ctx.fillStyle = '#ffffff';
      if (sparkle < 2) {
        ctx.fillRect(x + 6, y + 6, 3, 3);
        ctx.fillRect(x + 23, y + 12, 3, 3);
      } else {
        ctx.fillRect(x + 20, y + 4, 3, 3);
        ctx.fillRect(x + 8, y + 22, 3, 3);
      }
    }
  },

  // Grandma Hazel's Cottage & Porch (Large 5x4 tile structure)
  drawCottage(ctx, startX, startY, time = 0) {
    const s = this.TILE_SIZE;
    const w = s * 6; // 192px
    const h = s * 5; // 160px

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(startX + 8, startY + h - 8, w - 16, 16);

    // Stone Foundation
    ctx.fillStyle = this.colors.stoneDark;
    ctx.fillRect(startX + 16, startY + h - 32, w - 32, 28);
    ctx.fillStyle = this.colors.stoneMid;
    ctx.fillRect(startX + 20, startY + h - 28, w - 40, 20);

    // Wood / Clay Walls
    ctx.fillStyle = '#e2cba4';
    ctx.fillRect(startX + 20, startY + 54, w - 40, h - 84);
    // Wood timber beams
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(startX + 20, startY + 54, 8, h - 84);
    ctx.fillRect(startX + w - 28, startY + 54, 8, h - 84);
    ctx.fillRect(startX + 78, startY + 54, 6, h - 84);
    ctx.fillRect(startX + 130, startY + 54, 6, h - 84);

    // Stone Chimney on left roof
    ctx.fillStyle = this.colors.stoneDark;
    ctx.fillRect(startX + 30, startY - 14, 20, 50);
    ctx.fillStyle = this.colors.stoneMid;
    ctx.fillRect(startX + 32, startY - 12, 16, 46);
    ctx.fillStyle = this.colors.stoneLight;
    ctx.fillRect(startX + 28, startY - 18, 24, 6); // rim

    // Chimney Smoke puffs (animated)
    const smokeOffset = (time * 0.04) % 40;
    ctx.fillStyle = 'rgba(230, 235, 240, 0.6)';
    ctx.beginPath();
    ctx.arc(startX + 40 + Math.sin(time * 0.003) * 6, startY - 24 - smokeOffset * 0.8, 6 + smokeOffset * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(startX + 42 + Math.cos(time * 0.003) * 8, startY - 48 - smokeOffset * 0.6, 9 + smokeOffset * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Cozy Shingle Roof
    ctx.fillStyle = this.colors.roofRedDark;
    ctx.beginPath();
    ctx.moveTo(startX + w / 2, startY);
    ctx.lineTo(startX + 8, startY + 58);
    ctx.lineTo(startX + w - 8, startY + 58);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.colors.roofRed;
    ctx.beginPath();
    ctx.moveTo(startX + w / 2, startY + 4);
    ctx.lineTo(startX + 16, startY + 54);
    ctx.lineTo(startX + w - 16, startY + 54);
    ctx.closePath();
    ctx.fill();

    // Attic circular window
    ctx.fillStyle = this.colors.woodDark;
    ctx.beginPath();
    ctx.arc(startX + w / 2, startY + 32, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.colors.windowGlow;
    ctx.beginPath();
    ctx.arc(startX + w / 2, startY + 32, 8, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Cottage Door
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(startX + 90, startY + 84, 26, 44);
    ctx.fillStyle = this.colors.woodLight;
    ctx.fillRect(startX + 93, startY + 87, 20, 38);
    // Brass doorknob
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(startX + 95, startY + 106, 4, 4);

    // Glowing Windows with flower boxes
    this.drawWindowWithCurtain(ctx, startX + 38, startY + 76);
    this.drawWindowWithCurtain(ctx, startX + 142, startY + 76);

    // Porch Deck & Railing
    ctx.fillStyle = this.colors.woodMid;
    ctx.fillRect(startX + 16, startY + 128, w - 32, 10);
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(startX + 16, startY + 138, w - 32, 4);

    // Cozy Welcome Mat in front of the door
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(startX + 86, startY + 128, 34, 10);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(startX + 88, startY + 130, 30, 6);
  },

  drawWindowWithCurtain(ctx, x, y) {
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(x, y, 28, 30);
    // Warm interior glow
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 3, y + 3, 22, 24);
    // Curtains (checkered red/white)
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 3, y + 3, 5, 24);
    ctx.fillRect(x + 20, y + 3, 5, 24);
    // Cross frame
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(x + 13, y + 3, 2, 24);
    ctx.fillRect(x + 3, y + 14, 22, 2);
    // Window Flower box
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(x - 2, y + 28, 32, 6);
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(x + 2, y + 26, 6, 4);
    ctx.fillRect(x + 11, y + 25, 6, 4);
    ctx.fillRect(x + 20, y + 26, 6, 4);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 4, y + 27, 2, 2);
  },

  // Grandma Hazel on Porch (Rocking Chair + Teacup)
  drawGrandma(ctx, x, y, time = 0) {
    const rock = Math.sin(time * 0.002) * 2;

    // Rocking Chair Runners
    ctx.fillStyle = '#6f441c';
    ctx.fillRect(x - 6, y + 22 + rock, 28, 4);
    // Chair back & seat
    ctx.fillRect(x + 14, y - 2 + rock, 4, 24);
    ctx.fillRect(x + 2, y + 14 + rock, 16, 4);

    // Grandma's body: cozy pink knit cardigan
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(x + 4, y + 4 + rock, 12, 12);

    // Lavender/Blue floral apron
    ctx.fillStyle = '#c084fc';
    ctx.fillRect(x + 6, y + 8 + rock, 8, 10);

    // Grandma's Face (warm skin tone)
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(x + 5, y - 6 + rock, 10, 10);

    // Glasses
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 6, y - 4 + rock, 3, 3);
    ctx.fillRect(x + 11, y - 4 + rock, 3, 3);
    ctx.fillRect(x + 9, y - 3 + rock, 2, 1);

    // Silver bun hair
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 4, y - 10 + rock, 12, 5);
    ctx.fillRect(x + 8, y - 13 + rock, 6, 5); // top bun

    // Warm teacup in hands
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 3, y + 8 + rock, 5, 5);
    // Tea steam
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(x + 4, y + 2 + rock + Math.sin(time * 0.005) * 2, 2, 3);
  },

  // Player Character Rendering (Direction: 0=Down, 1=Up, 2=Left, 3=Right)
  drawPlayer(ctx, x, y, dir = 0, isMoving = false, toolAction = null, walkFrame = 0) {
    const legOffset = isMoving ? Math.sin(walkFrame * 0.3) * 3 : 0;

    // Player Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x + 6, y + 24, 20, 7);

    // Boots
    ctx.fillStyle = '#78350f';
    if (dir === 2 || dir === 3) {
      ctx.fillRect(x + 10 + legOffset, y + 23, 6, 5);
      ctx.fillRect(x + 16 - legOffset, y + 23, 6, 5);
    } else {
      ctx.fillRect(x + 9, y + 23 + (legOffset > 0 ? legOffset : 0), 5, 5);
      ctx.fillRect(x + 18, y + 23 + (legOffset < 0 ? -legOffset : 0), 5, 5);
    }

    // Overalls (Blue denim pants & bib)
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x + 9, y + 16, 14, 8); // pants

    // Plaid Red Shirt
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 8, y + 10, 16, 7);

    // Overalls straps
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x + 10, y + 10, 3, 7);
    ctx.fillRect(x + 19, y + 10, 3, 7);

    // Brass buckles
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 10, y + 14, 3, 2);
    ctx.fillRect(x + 19, y + 14, 3, 2);

    // Head / Face
    ctx.fillStyle = '#fed7aa'; // skin
    ctx.fillRect(x + 10, y + 2, 12, 10);

    // Brown Hair
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(x + 9, y + 1, 14, 4);

    // Eyes (Direction sensitive)
    if (dir === 0) { // Down
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 12, y + 5, 2, 3);
      ctx.fillRect(x + 18, y + 5, 2, 3);
      // Cheerful blush
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(x + 11, y + 8, 2, 1);
      ctx.fillRect(x + 19, y + 8, 2, 1);
    } else if (dir === 1) { // Up (Back of head)
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(x + 10, y + 2, 12, 9);
    } else if (dir === 2) { // Left
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 11, y + 5, 2, 3);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(x + 10, y + 8, 2, 1);
    } else if (dir === 3) { // Right
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 19, y + 5, 2, 3);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(x + 20, y + 8, 2, 1);
    }

    // Straw Hat (Stardew signature!)
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(x + 5, y - 2, 22, 4); // brim
    ctx.fillRect(x + 9, y - 7, 14, 6); // crown
    // Green hat ribbon
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x + 9, y - 3, 14, 2);

    // Active Tool In Hands
    if (toolAction) {
      this.drawToolInHand(ctx, x, y, dir, toolAction);
    }
  },

  drawToolInHand(ctx, x, y, dir, tool) {
    const toolOffsets = {
      0: { tx: x + 20, ty: y + 14 },
      1: { tx: x + 8, ty: y - 2 },
      2: { tx: x - 4, ty: y + 10 },
      3: { tx: x + 24, ty: y + 10 }
    };
    const { tx, ty } = toolOffsets[dir] || toolOffsets[0];

    if (tool === 'hoe') {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(tx, ty, 3, 16);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(tx - 3, ty + 12, 9, 4);
    } else if (tool === 'watering_can') {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(tx, ty + 2, 10, 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(tx + 6, ty, 4, 3);
      ctx.fillRect(tx - 2, ty + 6, 3, 3); // spout
    } else if (tool === 'scythe') {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(tx, ty, 3, 16);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(tx + 2, ty + 2, 8, Math.PI * 0.8, Math.PI * 1.8);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();
    } else if (tool === 'axe') {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(tx, ty, 3, 16);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(tx - 2, ty, 7, 6);
    } else if (tool === 'pickaxe') {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(tx, ty, 3, 16);
      ctx.fillStyle = '#475569';
      ctx.fillRect(tx - 4, ty + 1, 11, 4);
    } else if (tool === 'fishing_rod') {
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (dir === 2) {
        ctx.moveTo(tx + 4, ty + 8);
        ctx.lineTo(tx - 16, ty - 8);
      } else if (dir === 3) {
        ctx.moveTo(tx - 4, ty + 8);
        ctx.lineTo(tx + 16, ty - 8);
      } else if (dir === 1) {
        ctx.moveTo(tx, ty + 8);
        ctx.lineTo(tx + 6, ty - 14);
      } else {
        ctx.moveTo(tx, ty - 4);
        ctx.lineTo(tx + 8, ty + 16);
      }
      ctx.stroke();
    }
  },

  // --- City & Town Features ---
  drawPlaza(ctx, x, y, seed = 0) {
    const s = this.TILE_SIZE;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x, y, s, s);

    ctx.fillStyle = '#64748b';
    ctx.fillRect(x, y, s, 1);
    ctx.fillRect(x, y, 1, s);
    ctx.fillRect(x + 16, y, 1, s);
    ctx.fillRect(x, y + 16, s, 1);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 2, y + 2, 12, 12);
    ctx.fillRect(x + 18, y + 18, 12, 12);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 4, y + 4, 4, 3);
    ctx.fillRect(x + 20, y + 20, 4, 3);
  },

  drawFountain(ctx, x, y, time = 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 48, y + 60, 44, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.colors.stoneDark;
    ctx.beginPath();
    ctx.ellipse(x + 48, y + 54, 42, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.colors.stoneMid;
    ctx.beginPath();
    ctx.ellipse(x + 48, y + 50, 40, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.colors.waterMid;
    ctx.beginPath();
    ctx.ellipse(x + 48, y + 50, 34, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = this.colors.stoneDark;
    ctx.fillRect(x + 42, y + 26, 12, 26);
    ctx.fillStyle = this.colors.stoneLight;
    ctx.fillRect(x + 44, y + 26, 6, 26);

    ctx.fillStyle = this.colors.stoneMid;
    ctx.beginPath();
    ctx.ellipse(x + 48, y + 26, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.colors.waterLight;
    ctx.beginPath();
    ctx.ellipse(x + 48, y + 25, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + 46, y + 14, 4, 8);

    const jetOffset = Math.sin(time * 0.008) * 4;
    ctx.fillStyle = 'rgba(219, 234, 254, 0.85)';
    ctx.beginPath();
    ctx.arc(x + 48, y + 10 + jetOffset * 0.5, 4, 0, Math.PI * 2);
    ctx.fill();

    const drop1 = (time * 0.04) % 18;
    const drop2 = (time * 0.04 + 9) % 18;
    ctx.fillStyle = 'rgba(147, 197, 253, 0.75)';
    ctx.fillRect(x + 38 - drop1 * 0.6, y + 20 + drop1, 3, 3);
    ctx.fillRect(x + 58 + drop1 * 0.6, y + 20 + drop1, 3, 3);
    ctx.fillRect(x + 44 - drop2 * 0.4, y + 20 + drop2, 2, 2);
    ctx.fillRect(x + 52 + drop2 * 0.4, y + 20 + drop2, 2, 2);
  },

  drawStreetLamp(ctx, x, y, isNight = false) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 14, y + 8, 4, 24);
    ctx.fillRect(x + 12, y + 28, 8, 4);
    ctx.fillRect(x + 10, y + 6, 12, 3);
    ctx.fillRect(x + 11, y + 2, 10, 6);

    if (isNight) {
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 12, y + 3, 8, 5);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
      ctx.beginPath();
      ctx.arc(x + 16, y + 6, 16, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 12, y + 3, 8, 5);
    }
  },

  drawBench(ctx, x, y) {
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x + 4, y + 8, 24, 4);
    ctx.fillRect(x + 4, y + 16, 24, 5);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 6, y + 14, 3, 12);
    ctx.fillRect(x + 23, y + 14, 3, 12);
  },

  drawNoticeBoard(ctx, x, y) {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x + 4, y + 6, 4, 26);
    ctx.fillRect(x + 24, y + 6, 4, 26);

    ctx.fillStyle = '#dfba87';
    ctx.fillRect(x + 2, y + 2, 28, 20);
    ctx.strokeStyle = '#8d6e63';
    ctx.strokeRect(x + 2, y + 2, 28, 20);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 5, y + 5, 8, 7);
    ctx.fillRect(x + 16, y + 6, 10, 8);
    ctx.fillRect(x + 8, y + 13, 9, 7);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 8, y + 4, 2, 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 20, y + 5, 2, 2);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 12, y + 12, 2, 2);
  },

  drawCityBuilding(ctx, x, y, wTiles, hTiles, type, title) {
    const w = wTiles * this.TILE_SIZE;
    const h = hTiles * this.TILE_SIZE;

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 8, y + h - 6, w - 16, 12);

    let wallColor = '#f1f5f9';
    let trimColor = '#64748b';
    let roofColor = '#1e3a8a';
    let roofDark = '#0f172a';
    let awningColor1 = '#dc2626';
    let awningColor2 = '#ffffff';

    if (type === 'general_store') {
      wallColor = '#fef3c7';
      trimColor = '#92400e';
      roofColor = '#15803d';
      roofDark = '#052e16';
      awningColor1 = '#16a34a';
      awningColor2 = '#fef08a';
    } else if (type === 'bakery') {
      wallColor = '#fce7f3';
      trimColor = '#9d174d';
      roofColor = '#db2777';
      roofDark = '#831843';
      awningColor1 = '#ec4899';
      awningColor2 = '#ffffff';
    } else if (type === 'blacksmith') {
      wallColor = '#78716c';
      trimColor = '#292524';
      roofColor = '#44403c';
      roofDark = '#1c1917';
      awningColor1 = '#b45309';
      awningColor2 = '#451a03';
    } else if (type === 'town_hall') {
      wallColor = '#e2e8f0';
      trimColor = '#475569';
      roofColor = '#1e3a8a';
      roofDark = '#0f172a';
      awningColor1 = '#2563eb';
      awningColor2 = '#f8fafc';
    } else if (type === 'church') {
      wallColor = '#f8fafc';
      trimColor = '#94a3b8';
      roofColor = '#475569';
      roofDark = '#1e293b';
      awningColor1 = '#b45309';
      awningColor2 = '#fef3c7';
    } else if (type === 'library') {
      wallColor = '#fde68a';
      trimColor = '#78350f';
      roofColor = '#991b1b';
      roofDark = '#450a0a';
      awningColor1 = '#0f766e';
      awningColor2 = '#ccfbf1';
    }

    ctx.fillStyle = wallColor;
    ctx.fillRect(x + 8, y + 40, w - 16, h - 40);

    ctx.fillStyle = trimColor;
    ctx.fillRect(x + 8, y + h - 12, w - 16, 12);

    ctx.fillStyle = roofDark;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + 2, y + 42);
    ctx.lineTo(x + w - 2, y + 42);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 4);
    ctx.lineTo(x + 8, y + 38);
    ctx.lineTo(x + w - 8, y + 38);
    ctx.closePath();
    ctx.fill();

    const awningY = y + 54;
    const awningW = w - 32;
    const stripeW = 12;
    const numStripes = Math.floor(awningW / stripeW);
    if (type !== 'church') {
      for (let i = 0; i < numStripes; i++) {
        ctx.fillStyle = (i % 2 === 0) ? awningColor1 : awningColor2;
        ctx.fillRect(x + 16 + i * stripeW, awningY, stripeW, 14);
      }
    } else {
      // Stone Chapel Bell Steeple & Stained Glass Trim
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x + w / 2 - 16, y - 22, 32, 26);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y - 42);
      ctx.lineTo(x + w / 2 - 19, y - 20);
      ctx.lineTo(x + w / 2 + 19, y - 20);
      ctx.closePath();
      ctx.fill();
      // Brass Bell opening & Golden Cross
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + w / 2 - 6, y - 15, 12, 12);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + w / 2 - 4, y - 12, 8, 7);
      ctx.fillRect(x + w / 2 - 1.5, y - 52, 3, 12);
      ctx.fillRect(x + w / 2 - 5, y - 49, 10, 2.5);
    }

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 18, y + 74, 28, 24);
    ctx.fillStyle = type === 'church' ? '#38bdf8' : '#fef08a';
    ctx.fillRect(x + 20, y + 76, 24, 20);
    if (type === 'church') {
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + 20, y + 76, 12, 10);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 32, y + 86, 12, 10);
    }
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 31, y + 76, 2, 20);
    ctx.fillRect(x + 20, y + 85, 24, 2);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + w - 46, y + 74, 28, 24);
    ctx.fillStyle = type === 'church' ? '#38bdf8' : '#fef08a';
    ctx.fillRect(x + w - 44, y + 76, 24, 20);
    if (type === 'church') {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + w - 44, y + 76, 12, 10);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + w - 32, y + 86, 12, 10);
    }
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + w - 33, y + 76, 2, 20);
    ctx.fillRect(x + w - 44, y + 85, 24, 2);

    const doorX = x + Math.floor(w / 2) - 14;
    const doorY = y + h - 38;
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(doorX, doorY, 28, 38);
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(doorX + 2, doorY + 2, 24, 36);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(doorX + 10, doorY + 18, 2, 5);
    ctx.fillRect(doorX + 16, doorY + 18, 2, 5);

    ctx.fillStyle = '#3e2723';
    ctx.fillRect(x + 24, y + 42, w - 48, 14);
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, y + 52);

    if (type === 'blacksmith') {
      ctx.fillStyle = '#292524';
      ctx.fillRect(x + w - 24, y + 8, 14, 34);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(x + w - 22, y + 6, 10, 4);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(x + 12, y + h - 14, 12, 10);
      ctx.fillRect(x + 10, y + h - 16, 16, 4);
    }
  },

  drawNPC(ctx, x, y, type, time = 0) {
    const bob = Math.sin(time * 0.003) * 1.5;

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 6, y + 24, 20, 6);

    if (type === 'mayor') {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x + 8, y + 10 + bob, 16, 15);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 10, y + 14 + bob, 12, 3);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(x + 10, y + 2 + bob, 12, 10);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 9, y + bob, 14, 5);
      ctx.fillStyle = '#065f46';
      ctx.fillRect(x + 6, y - 4 + bob, 20, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 20, y - 9 + bob, 3, 6);
    } else if (type === 'baker') {
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + 8, y + 11 + bob, 16, 14);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 10, y + 13 + bob, 12, 12);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(x + 10, y + 3 + bob, 12, 9);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 9, y + 1 + bob, 14, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 8, y - 8 + bob, 16, 10);
      ctx.fillRect(x + 6, y - 5 + bob, 20, 4);
    } else if (type === 'blacksmith') {
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(x + 7, y + 10 + bob, 18, 12);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 10, y + 11 + bob, 12, 14);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 9, y + 23 + bob, 6, 5);
      ctx.fillRect(x + 17, y + 23 + bob, 6, 5);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(x + 10, y + 3 + bob, 12, 9);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 9, y + 7 + bob, 14, 6);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 9, y + 1 + bob, 14, 3);
    } else if (type === 'fisherman') {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(x + 8, y + 10 + bob, 16, 15);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(x + 10, y + 3 + bob, 12, 9);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x + 9, y + 7 + bob, 14, 6);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(x + 6, y - 2 + bob, 20, 4);
      ctx.fillRect(x + 9, y - 6 + bob, 14, 5);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x + 22, y - 8 + bob, 2, 26);
    } else if (type === 'penny') {
      // Penny the Town Botanist / Florist
      ctx.fillStyle = '#60a5fa'; // cornflower blue dress
      ctx.fillRect(x + 8, y + 10 + bob, 16, 15);
      ctx.fillStyle = '#fef08a'; // yellow floral apron
      ctx.fillRect(x + 10, y + 13 + bob, 12, 11);
      ctx.fillStyle = '#fed7aa'; // face
      ctx.fillRect(x + 10, y + 3 + bob, 12, 8);
      ctx.fillStyle = '#d97706'; // ginger hair curls
      ctx.fillRect(x + 8, y + 1 + bob, 16, 4);
      // Straw sunhat with pink flower ribbon
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + 4, y - 2 + bob, 24, 4);
      ctx.fillRect(x + 9, y - 6 + bob, 14, 5);
      ctx.fillStyle = '#ec4899'; // pink ribbon
      ctx.fillRect(x + 9, y - 2 + bob, 14, 2);
    } else if (type === 'dog') {
      // Jasper the Golden Retriever Pup
      const tailWag = Math.sin(time * 0.015) * 4;
      // Body
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 8, y + 14, 16, 10);
      // Head
      ctx.fillRect(x + 18, y + 8, 10, 10);
      // Snout & Nose
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 24, y + 12, 5, 5);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 27, y + 12, 2, 2);
      ctx.fillRect(x + 22, y + 10, 2, 2); // eye
      // Floppy Ears
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x + 17, y + 8, 4, 7);
      // Legs
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 9, y + 23, 3, 5);
      ctx.fillRect(x + 14, y + 23, 3, 5);
      ctx.fillRect(x + 19, y + 23, 3, 5);
      ctx.fillRect(x + 22, y + 23, 3, 5);
      // Wagging Tail
      ctx.fillRect(x + 4, y + 12 + tailWag, 5, 4);
      // Red Collar
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 18, y + 15, 3, 4);
    } else if (type === 'pastor') {
      // Pastor Thomas in Black Robe & White Collar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 8, y + 10 + bob, 16, 16);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + 13, y + 11 + bob, 6, 3); // clerical collar
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 15, y + 15 + bob, 2, 8); // gold stole trim
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(x + 10, y + 2 + bob, 12, 9);
      ctx.fillStyle = '#cbd5e1'; // silver hair
      ctx.fillRect(x + 9, y + bob, 14, 4);
    } else if (type === 'librarian') {
      // Maeve the Librarian in Emerald Cardigan & Glasses
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(x + 8, y + 10 + bob, 16, 15);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(x + 12, y + 11 + bob, 8, 12);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(x + 10, y + 3 + bob, 12, 8);
      ctx.fillStyle = '#1e293b'; // glasses rim
      ctx.fillRect(x + 11, y + 6 + bob, 4, 2);
      ctx.fillRect(x + 17, y + 6 + bob, 4, 2);
      ctx.fillStyle = '#7c2d12'; // chestnut bun
      ctx.fillRect(x + 9, y + bob, 14, 4);
      ctx.fillRect(x + 12, y - 4 + bob, 8, 4);
    } else if (type === 'pip') {
      // Pip the Energetic Farmhand Kid in Overall & Cap
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + 9, y + 12 + bob, 14, 13);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 9, y + 11 + bob, 14, 4);
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(x + 10, y + 4 + bob, 12, 8);
      ctx.fillStyle = '#15803d'; // green cap
      ctx.fillRect(x + 8, y + 1 + bob, 16, 4);
      ctx.fillRect(x + 18, y + 3 + bob, 7, 2);
    }
  },

  drawFlowerBed(ctx, x, y, seed = 0) {
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x + 2, y + 4, 28, 24);
    ctx.fillStyle = '#3f2e21';
    ctx.fillRect(x + 4, y + 6, 24, 20);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 6, y + 8, 20, 16);
    const colors = ['#f43f5e', '#facc15', '#c084fc', '#fb923c', '#38bdf8'];
    for (let i = 0; i < 4; i++) {
      const fx = x + 8 + (i % 2) * 11;
      const fy = y + 10 + Math.floor(i / 2) * 9;
      ctx.fillStyle = colors[(seed + i) % colors.length];
      ctx.beginPath();
      ctx.arc(fx, fy, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(fx - 1, fy - 1, 2, 2);
    }
  },

  // --- Interior Building & Farmhouse Rooms (18x14 tiles = 576x448) ---
  drawInteriorRoom(ctx, locType, time = 0, playerInBed = false) {
    const s = this.TILE_SIZE;
    const cols = 18;
    const rows = 14;
    const roomW = cols * s;
    const roomH = rows * s;

    // Outer dark frame shadow
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-2000, -2000, 5000, 5000);

    // Room Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(8, 12, roomW, roomH);

    // Theme Colors per Building
    let floorBase = '#c88a4b';
    let floorPlank = '#b57638';
    let floorLine = '#8c5319';
    let wallTop = '#451a03';
    let wallFace = '#fde68a';
    let wainscoting = '#92400e';
    let rugMain = '#991b1b';
    let rugInner = '#dc2626';
    let rugTrim = '#fbbf24';
    let roomTitle = "FARMHOUSE COTTAGE";

    if (locType === 'interior_store') {
      floorBase = '#d69e5c';
      floorPlank = '#c08543';
      wallFace = '#dcfce7';
      wainscoting = '#166534';
      rugMain = '#15803d';
      rugInner = '#22c55e';
      rugTrim = '#fef08a';
      roomTitle = "OAKHAVEN GENERAL STORE";
    } else if (locType === 'interior_bakery') {
      floorBase = '#f5d0fe';
      floorPlank = '#f0abfc';
      wallFace = '#fce7f3';
      wainscoting = '#9d174d';
      rugMain = '#be185d';
      rugInner = '#ec4899';
      rugTrim = '#ffffff';
      roomTitle = "HAZELWOOD BAKERY & CAFE";
    } else if (locType === 'interior_blacksmith') {
      floorBase = '#64748b';
      floorPlank = '#475569';
      floorLine = '#334155';
      wallFace = '#78716c';
      wainscoting = '#292524';
      rugMain = '#7c2d12';
      rugInner = '#ea580c';
      rugTrim = '#fdba74';
      roomTitle = "GARTH'S BLACKSMITH FORGE";
    } else if (locType === 'interior_townhall') {
      floorBase = '#cbd5e1';
      floorPlank = '#94a3b8';
      floorLine = '#64748b';
      wallFace = '#e0e7ff';
      wainscoting = '#1e3a8a';
      rugMain = '#1d4ed8';
      rugInner = '#3b82f6';
      rugTrim = '#facc15';
      roomTitle = "OAKHAVEN CITY HALL";
    } else if (locType === 'interior_church') {
      floorBase = '#d6d3d1';
      floorPlank = '#a8a29e';
      floorLine = '#78716c';
      wallFace = '#fef9c3';
      wainscoting = '#57534e';
      rugMain = '#991b1b';
      rugInner = '#dc2626';
      rugTrim = '#facc15';
      roomTitle = "OAKHAVEN CHAPEL";
    } else if (locType === 'interior_library') {
      floorBase = '#b45309';
      floorPlank = '#92400e';
      floorLine = '#451a03';
      wallFace = '#ecfdf5';
      wainscoting = '#065f46';
      rugMain = '#0f766e';
      rugInner = '#14b8a6';
      rugTrim = '#fde68a';
      roomTitle = "OAKHAVEN LIBRARY & ALMANAC";
    } else if (locType === 'interior_cave') {
      floorBase = '#334155';
      floorPlank = '#1e293b';
      floorLine = '#0f172a';
      wallTop = '#020617';
      wallFace = '#475569';
      wainscoting = '#334155';
      roomTitle = "QUARRY GEMSTONE CAVERN";
    }

    // 1. Draw Floor Planks (cols 1..16, rows 3..12)
    for (let r = 3; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const fx = c * s;
        const fy = r * s;
        ctx.fillStyle = ((r + c) % 2 === 0) ? floorBase : floorPlank;
        ctx.fillRect(fx, fy, s, s);
        // Horizontal plank lines
        ctx.fillStyle = floorLine;
        ctx.fillRect(fx, fy + 15, s, 1);
        ctx.fillRect(fx, fy + 31, s, 1);
        ctx.fillRect(fx + ((r % 2) * 16), fy, 1, 15);
      }
    }

    // 2. Draw Back Wall (rows 0..2) & Side/Bottom Perimeter Walls
    // Top wall crown
    ctx.fillStyle = wallTop;
    ctx.fillRect(0, 0, roomW, s);
    // Back wall wallpaper (rows 1..2)
    ctx.fillStyle = wallFace;
    ctx.fillRect(s, s, roomW - s * 2, s * 2);
    // Wainscoting wood trim along bottom of back wall
    ctx.fillStyle = wainscoting;
    ctx.fillRect(s, s * 2 + 14, roomW - s * 2, 18);
    ctx.fillStyle = '#271406';
    ctx.fillRect(s, s * 3 - 2, roomW - s * 2, 2);

    // Side & Bottom Thick Timber Walls
    ctx.fillStyle = wallTop;
    ctx.fillRect(0, 0, s, roomH); // Left wall
    ctx.fillRect(roomW - s, 0, s, roomH); // Right wall
    ctx.fillRect(0, roomH - s, s * 7, s); // Bottom-left wall
    ctx.fillRect(s * 11, roomH - s, s * 7, s); // Bottom-right wall

    // Inner border highlight
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.strokeRect(s, s, roomW - s * 2, roomH - s * 2);

    // 3. South Exit Doorway & Welcome Mat (cols 7..10, row 12..13)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(7 * s, 13 * s, 4 * s, s);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(7 * s + 6, 13 * s + 2, 4 * s - 12, s - 4);
    // Welcome mat inside doorway
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(7.5 * s, 12 * s + 4, 3 * s, 26);
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(7.5 * s + 3, 12 * s + 7, 3 * s - 6, 20);
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT DOOR (v)', 9 * s, 12 * s + 20);

    // Room Header Banner on Top Wall
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(5.5 * s, 5, 7 * s, 22);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(5.5 * s, 5, 7 * s, 22);
    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(roomTitle, 9 * s, 20);

    // 4. Room-Specific Interior Furniture & Details
    if (locType === 'interior_cottage') {
      // --- FARMHOUSE COTTAGE INTERIOR ---
      // Windows on Back Wall
      this.drawWindowWithCurtain(ctx, 4 * s, s + 10);
      this.drawWindowWithCurtain(ctx, 13.5 * s, s + 10);

      // Center Parlor Woven Rug (cols 6..11, rows 6..10)
      ctx.fillStyle = rugTrim;
      ctx.fillRect(6 * s, 6.5 * s, 5.5 * s, 3.8 * s);
      ctx.fillStyle = rugMain;
      ctx.fillRect(6 * s + 4, 6.5 * s + 4, 5.5 * s - 8, 3.8 * s - 8);
      ctx.fillStyle = rugInner;
      ctx.fillRect(6 * s + 14, 6.5 * s + 14, 5.5 * s - 28, 3.8 * s - 28);

      // Stone Hearth & Fireplace (cols 7.5..10.5, rows 1..3)
      const fpX = 7.5 * s;
      const fpY = 1 * s;
      ctx.fillStyle = this.colors.stoneDark;
      ctx.fillRect(fpX, fpY, 3 * s, 2.3 * s);
      ctx.fillStyle = this.colors.stoneMid;
      ctx.fillRect(fpX + 4, fpY + 4, 3 * s - 8, 2.3 * s - 8);
      // Wood Mantelpiece
      ctx.fillStyle = '#451a03';
      ctx.fillRect(fpX - 6, fpY + 26, 3 * s + 12, 8);
      // Firebox opening
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(fpX + 18, fpY + 38, 3 * s - 36, 34);
      // Crackling Animated Fire
      const flicker = Math.sin(time * 0.012) * 3;
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(fpX + 48, fpY + 60, 16 + flicker * 0.4, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(fpX + 48, fpY + 62, 10 - flicker * 0.3, Math.PI, 0);
      ctx.fill();
      // Warm Fire Glow on Floor
      ctx.fillStyle = 'rgba(251, 146, 60, 0.18)';
      ctx.beginPath();
      ctx.ellipse(fpX + 48, fpY + 86, 48, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Left Wall Bookshelf (cols 1.5..3.5, rows 2..3.5)
      ctx.fillStyle = '#5c2d0c';
      ctx.fillRect(1.5 * s, 1.5 * s, 2 * s, 2 * s);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(1.5 * s + 4, 1.5 * s + 4, 2 * s - 8, 2 * s - 8);
      // Colorful book spines
      const bookColors = ['#ef4444', '#3b82f6', '#10b981', '#eab308', '#a855f7', '#ec4899'];
      for (let b = 0; b < 6; b++) {
        ctx.fillStyle = bookColors[b];
        ctx.fillRect(1.5 * s + 8 + b * 8, 1.5 * s + 10, 6, 16);
        ctx.fillRect(1.5 * s + 8 + b * 8, 1.5 * s + 34, 6, 16);
      }

      // Country Kitchen Counter & Dining Table (cols 2..5, rows 6..9)
      const tblX = 2.2 * s;
      const tblY = 6.5 * s;
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(tblX + 4, tblY + 56, 88, 10);
      // Wooden Table
      ctx.fillStyle = '#78350f';
      ctx.fillRect(tblX, tblY, 88, 56);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(tblX + 4, tblY + 4, 80, 48);
      // Checkered Table Runner
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(tblX + 18, tblY + 4, 52, 48);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(tblX + 24, tblY + 10, 40, 36);
      // Grandma's Fresh Berry Pie on Table
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(tblX + 44, tblY + 28, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#be123c';
      ctx.beginPath();
      ctx.arc(tblX + 44, tblY + 28, 8, 0, Math.PI * 2);
      ctx.fill();

      // Potted Houseplants in bottom corners
      ctx.fillStyle = '#b45309';
      ctx.fillRect(1.5 * s + 6, 10.8 * s + 14, 20, 16);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(1.5 * s + 16, 10.8 * s + 10, 14, 0, Math.PI * 2);
      ctx.fill();

      // --- THE PLAYER'S COZY FARMHOUSE BED (cols 13..15.5, rows 3.2..6.5) ---
      const bedX = 13 * s;
      const bedY = 3.2 * s;
      const bedW = 2.6 * s; // 83px
      const bedH = 3.2 * s; // 102px

      // Bed Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(bedX - 4, bedY + 8, bedW + 8, bedH);

      // Bedside Nightstand with Warm Lamp (col 11.8, row 3.3)
      ctx.fillStyle = '#5c2d0c';
      ctx.fillRect(11.7 * s, 3.3 * s, 32, 34);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(11.7 * s + 3, 3.3 * s + 3, 26, 28);
      // Lamp
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(11.7 * s + 12, 3.3 * s + 10, 8, 12);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(11.7 * s + 6, 3.3 * s + 12);
      ctx.lineTo(11.7 * s + 16, 3.3 * s - 2);
      ctx.lineTo(11.7 * s + 26, 3.3 * s + 12);
      ctx.closePath();
      ctx.fill();

      // Wooden Headboard & Frame
      ctx.fillStyle = '#451a03';
      ctx.fillRect(bedX, bedY, bedW, bedH);
      // Carved Oak Headboard Top
      ctx.fillStyle = '#78350f';
      ctx.fillRect(bedX + 4, bedY + 3, bedW - 8, 22);
      // Brass Bedposts
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(bedX, bedY, 7, 7);
      ctx.fillRect(bedX + bedW - 7, bedY, 7, 7);
      ctx.fillRect(bedX, bedY + bedH - 7, 7, 7);
      ctx.fillRect(bedX + bedW - 7, bedY + bedH - 7, 7, 7);

      // Soft Cream Mattress
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(bedX + 6, bedY + 22, bedW - 12, bedH - 28);

      // Fluffy White Pillows
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(bedX + 12, bedY + 25, bedW - 24, 20);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bedX + 14, bedY + 26, bedW - 28, 16);

      // If Player is Lying in Bed: Draw Player's Head on the Pillow before drawing the Quilt over their body!
      if (playerInBed) {
        const px = bedX + Math.floor(bedW / 2) - 16;
        const py = bedY + 26;
        // Brown Hair
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(px + 8, py, 16, 12);
        // Face resting on pillow
        ctx.fillStyle = '#fed7aa';
        ctx.fillRect(px + 10, py + 4, 12, 11);
        // Closed peaceful sleeping eyes
        ctx.fillStyle = '#475569';
        ctx.fillRect(px + 11, py + 9, 3, 1.5);
        ctx.fillRect(px + 18, py + 9, 3, 1.5);
        // Rosy sleeping cheeks
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(px + 10, py + 11, 2, 2);
        ctx.fillRect(px + 20, py + 11, 2, 2);

        // Straw Hat hung neatly on the right bedpost!
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(bedX + bedW - 14, bedY - 4, 18, 10);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(bedX + bedW - 11, bedY - 1, 12, 3);
      }

      // Cozy Patchwork Quilt Blanket (covers lower 60% of bed, and tucks the player in!)
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(bedX + 6, bedY + 44, bedW - 12, bedH - 50);
      // Folded Top Sheet Trim
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(bedX + 6, bedY + 42, bedW - 12, 7);
      // Patchwork Quilt Squares (Gold & Forest Green & Crimson)
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(bedX + 10, bedY + 53, 18, 18);
      ctx.fillRect(bedX + 48, bedY + 53, 18, 18);
      ctx.fillRect(bedX + 29, bedY + 73, 18, 18);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(bedX + 29, bedY + 53, 18, 18);
      ctx.fillRect(bedX + 10, bedY + 73, 18, 18);
      ctx.fillRect(bedX + 48, bedY + 73, 18, 18);

      // Floating "Zzz" or "COZY BED (SLEEP)" Label above Bed
      const bob = Math.sin(time * 0.004) * 3;
      if (playerInBed) {
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Zzz...', bedX + bedW / 2 + 8, bedY - 6 + bob);
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.fillRect(bedX + 2, bedY - 22 + bob, bedW - 4, 18);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bedX + 2, bedY - 22 + bob, bedW - 4, 18);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COZY BED (SLEEP)', bedX + bedW / 2, bedY - 10 + bob);
      }

      // Floating "KITCHEN COOKING (E)" Sign above Country Kitchen Table
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.fillRect(2.1 * s, 5.15 * s + bob, 3.6 * s, 18);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(2.1 * s, 5.15 * s + bob, 3.6 * s, 18);
      ctx.fillStyle = '#fed7aa';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('KITCHEN COOKING (E)', 3.9 * s, 5.15 * s + 12 + bob);

    } else if (locType === 'interior_cave') {
      // --- HILLSIDE QUARRY CAVERN INTERIOR ---
      // Minecart iron rails running across the cavern floor
      ctx.fillStyle = '#334155';
      for (let rx = 2.6 * s; rx <= 14.5 * s; rx += 14) {
        ctx.fillRect(rx, 8.2 * s, 4, 24);
      }
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(2.4 * s, 8.3 * s, 12.6 * s, 3);
      ctx.fillRect(2.4 * s, 8.65 * s, 12.6 * s, 3);

      // Glowing Crystal Lanterns mounted on north cavern wall
      const glow = 0.55 + Math.sin(time * 0.005) * 0.25;
      [4.2, 9.0, 12.2].forEach(lx => {
        ctx.fillStyle = `rgba(56, 189, 248, ${glow * 0.35})`;
        ctx.beginPath();
        ctx.arc(lx * s, 2.35 * s, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(lx * s, 2.0 * s);
        ctx.lineTo(lx * s + 7, 2.35 * s);
        ctx.lineTo(lx * s, 2.7 * s);
        ctx.lineTo(lx * s - 7, 2.35 * s);
        ctx.closePath();
        ctx.fill();
      });

      // Deeper Floor Ladder at cols 14..15, rows 3..4
      const ladX = 14.2 * s;
      const ladY = 3.2 * s;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ladX, ladY, 5, 42);
      ctx.fillRect(ladX + 26, ladY, 5, 42);
      ctx.fillStyle = '#b45309';
      for (let rung = 6; rung <= 36; rung += 10) {
        ctx.fillRect(ladX + 4, ladY + rung, 23, 4);
      }
      const bob = Math.sin(time * 0.004) * 3;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(13.2 * s, 2.4 * s + bob, 3.2 * s, 18);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(13.2 * s, 2.4 * s + bob, 3.2 * s, 18);
      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NEW FLOOR (E)', 14.8 * s, 2.4 * s + 12 + bob);

    } else {
      // --- CITY BUILDING INTERIORS (General Store, Bakery, Blacksmith, Town Hall) ---
      // Center Carpet Runner leading from Door to Counter
      ctx.fillStyle = rugTrim;
      ctx.fillRect(6.5 * s, 5.5 * s, 5 * s, 6 * s);
      ctx.fillStyle = rugMain;
      ctx.fillRect(6.5 * s + 4, 5.5 * s + 4, 5 * s - 8, 6 * s - 8);
      ctx.fillStyle = rugInner;
      ctx.fillRect(6.5 * s + 12, 5.5 * s + 12, 5 * s - 24, 6 * s - 24);

      // Shopkeeper / Civic Counter (cols 5..12, row 4.5)
      const ctrX = 5 * s;
      const ctrY = 4.5 * s;
      const ctrW = 8 * s;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(ctrX + 4, ctrY + 30, ctrW, 8);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(ctrX, ctrY, ctrW, 32);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(ctrX + 4, ctrY + 4, ctrW - 8, 24);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(ctrX - 2, ctrY, ctrW + 4, 7);

      // Draw Resident NPC behind the Counter!
      let npcType = 'penny';
      let actionLabel = 'TALK / SHOP (E)';
      if (locType === 'interior_store') {
        npcType = 'penny';
        actionLabel = 'SEED & GENERAL SHOP (E)';
        // Display crates of produce & seeds on left & right walls
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(1.8 * s, (4.5 + i * 2) * s, 48, 36);
          ctx.fillStyle = i === 0 ? '#ef4444' : (i === 1 ? '#f59e0b' : '#22c55e');
          ctx.fillRect(1.8 * s + 6, (4.5 + i * 2) * s + 6, 36, 24);
        }
      } else if (locType === 'interior_bakery') {
        npcType = 'baker';
        actionLabel = 'FRESH PASTRIES & PIES (E)';
        // Brick Bakery Oven on back-left wall
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(2 * s, 1.5 * s, 2.5 * s, 2.2 * s);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(2.5 * s, 2.4 * s, 1.5 * s, 1 * s);
        // Café Tables on right side
        ctx.fillStyle = '#9d174d';
        ctx.fillRect(13.5 * s, 6.5 * s, 54, 44);
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(13.5 * s + 4, 6.5 * s + 4, 46, 36);
      } else if (locType === 'interior_blacksmith') {
        npcType = 'blacksmith';
        actionLabel = 'FORGE & UPGRADE TOOLS (E)';
        // Glowing Lava Forge & Anvil on left side
        ctx.fillStyle = '#292524';
        ctx.fillRect(1.8 * s, 2 * s, 3 * s, 2.2 * s);
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(2.2 * s, 2.6 * s, 2.2 * s, 1.2 * s);
        // Heavy Iron Anvil
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2.5 * s, 6.5 * s, 48, 28);
        ctx.fillStyle = '#475569';
        ctx.fillRect(2.3 * s, 6.3 * s, 60, 12);
      } else if (locType === 'interior_townhall') {
        npcType = 'mayor';
        actionLabel = 'SPEAK WITH MAYOR CLARA (E)';
        // Bookshelves & Town Banners
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(2.5 * s, 1.3 * s, 28, 48);
        ctx.fillRect(14.5 * s, 1.3 * s, 28, 48);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(2.5 * s + 6, 1.3 * s + 8, 16, 16);
        ctx.fillRect(14.5 * s + 6, 1.3 * s + 8, 16, 16);
      } else if (locType === 'interior_church') {
        npcType = 'pastor';
        actionLabel = 'SERENITY BLESSING & PASTOR (E)';
        // Twin Stained Glass Windows on Back Wall
        for (const wx of [3.2 * s, 12.8 * s]) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(wx, 1.1 * s, 44, 52);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(wx + 4, 1.1 * s + 4, 18, 22);
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(wx + 22, 1.1 * s + 4, 18, 22);
          ctx.fillStyle = '#facc15';
          ctx.fillRect(wx + 4, 1.1 * s + 26, 36, 22);
        }
        // Golden Candlelight & Wooden Chapel Pews (left & right of aisle)
        ctx.fillStyle = '#facc15';
        ctx.fillRect(5.2 * s, 4.0 * s, 8, 14);
        ctx.fillRect(12.5 * s, 4.0 * s, 8, 14);
        for (let pr = 0; pr < 3; pr++) {
          const py = (6.8 + pr * 1.6) * s;
          ctx.fillStyle = '#78350f';
          ctx.fillRect(2.0 * s, py, 3.6 * s, 20);
          ctx.fillRect(12.4 * s, py, 3.6 * s, 20);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(2.0 * s + 3, py + 3, 3.6 * s - 6, 10);
          ctx.fillRect(12.4 * s + 3, py + 3, 3.6 * s - 6, 10);
        }
      } else if (locType === 'interior_library') {
        npcType = 'librarian';
        actionLabel = 'OPEN HOMESTEAD ALMANAC (E)';
        // Tall Bookshelves along Back & Side Walls
        const colors = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea'];
        for (const bx of [2.0 * s, 13.0 * s]) {
          ctx.fillStyle = '#451a03';
          ctx.fillRect(bx, 1.2 * s, 96, 54);
          for (let row = 0; row < 2; row++) {
            for (let b = 0; b < 9; b++) {
              ctx.fillStyle = colors[(row * 3 + b) % colors.length];
              ctx.fillRect(bx + 6 + b * 9.5, 1.2 * s + 6 + row * 24, 7, 18);
            }
          }
        }
        // Reading Globe Table
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2.2 * s, 7.5 * s, 48, 36);
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(2.2 * s + 24, 7.5 * s + 14, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(2.2 * s + 18, 7.5 * s + 10, 9, 6);
      }

      // Draw NPC behind counter
      this.drawNPC(ctx, 8.5 * s, 3.1 * s, npcType, time);

      // Floating Prompt Banner over Counter
      const bob = Math.sin(time * 0.004) * 2.5;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(6.2 * s, 2.1 * s + bob, 5.6 * s, 18);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(6.2 * s, 2.1 * s + bob, 5.6 * s, 18);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(actionLabel, 9 * s, 2.1 * s + 12 + bob);
    }
  },

  drawFarmBarn(ctx, x, y, time = 0) {
    const w = 160;
    const h = 112;
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x + 6, y + h - 8, w - 12, 12);

    // Classic Red Timber Siding
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(x + 8, y + 36, w - 16, h - 36);
    ctx.fillStyle = '#991b1b';
    for (let px = x + 16; px < x + w - 14; px += 12) {
      ctx.fillRect(px, y + 38, 2, h - 40);
    }

    // Gambrel Roof
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x, y + 40);
    ctx.lineTo(x + w, y + 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 5);
    ctx.lineTo(x + 8, y + 37);
    ctx.lineTo(x + w - 8, y + 37);
    ctx.closePath();
    ctx.fill();

    // Loft Window & White Cross-Braced Doors
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(x + w / 2 - 12, y + 18, 24, 16);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(x + w / 2 - 9, y + 21, 18, 10);

    const doorX = x + w / 2 - 22;
    const doorY = y + h - 42;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(doorX, doorY, 44, 42);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(doorX + 3, doorY + 3, 17, 36);
    ctx.fillRect(doorX + 24, doorY + 3, 17, 36);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(doorX + 3, doorY + 3, 17, 36);
    ctx.strokeRect(doorX + 24, doorY + 3, 17, 36);

    // Hay Bale & Banner
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 14, y + h - 22, 24, 16);
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(x + 14, y + h - 16, 24, 3);

    const bob = Math.sin(time * 0.004) * 2;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(x + 26, y - 18 + bob, 108, 16);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ANIMAL BARN (E)', x + w / 2, y - 7 + bob);
  },

  drawFarmAnimal(ctx, animal, time = 0) {
    const x = animal.x;
    const y = animal.y;
    const hop = animal.isWalking ? Math.abs(Math.sin(time * 0.015 + animal.phase)) * 3 : Math.sin(time * 0.004 + animal.phase) * 1;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 26, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (animal.species === 'chicken') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x + 16, y + 18 - hop, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 20, y + 11 - hop, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 18, y + 5 - hop, 4, 3);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 24, y + 11 - hop, 4, 3);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 21, y + 9 - hop, 2, 2);
    } else if (animal.species === 'cow') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6, y + 11 - hop, 20, 13);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 9, y + 12 - hop, 6, 5);
      ctx.fillRect(x + 18, y + 16 - hop, 5, 5);
      ctx.fillRect(x + 8, y + 24 - hop, 3, 4);
      ctx.fillRect(x + 21, y + 24 - hop, 3, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 21, y + 7 - hop, 9, 9);
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(x + 24, y + 12 - hop, 6, 4);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 22, y + 5 - hop, 2, 3);
      ctx.fillRect(x + 27, y + 5 - hop, 2, 3);
    } else {
      // Fluffy Sheep
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(x + 15, y + 17 - hop, 9, 0, Math.PI * 2);
      ctx.arc(x + 10, y + 16 - hop, 6, 0, Math.PI * 2);
      ctx.arc(x + 20, y + 16 - hop, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 20, y + 11 - hop, 8, 8);
      ctx.fillRect(x + 10, y + 24 - hop, 3, 4);
      ctx.fillRect(x + 19, y + 24 - hop, 3, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 24, y + 13 - hop, 2, 2);
    }

    // Floating Ready Badge if carrying Egg / Milk / Wool
    if (animal.hasProduct) {
      const pBob = Math.sin(time * 0.007 + animal.phase) * 2;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(x + 16, y - 4 + pBob, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+', x + 16, y - 1.5 + pBob);
    }
    ctx.restore();
  },

  drawCaveEntrance(ctx, x, y, time = 0) {
    const w = 96;
    const h = 64;
    ctx.save();
    // Rocky Hillside Mound
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 18, w / 2, 28, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x + 4, y + h - 22, w - 8, 22);

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h - 22, w / 2 - 8, 20, 0, Math.PI, 0);
    ctx.fill();

    // Dark Cavern Opening & Timber Supports
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.roundRect(x + 26, y + 20, 44, 44, [18, 18, 0, 0]);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 24, y + 22, 6, 42);
    ctx.fillRect(x + 66, y + 22, 6, 42);
    ctx.fillRect(x + 22, y + 18, 52, 6);

    // Warm Miner's Lantern
    const flick = 0.35 + Math.sin(time * 0.01) * 0.1;
    ctx.fillStyle = `rgba(250, 204, 21, ${flick})`;
    ctx.beginPath();
    ctx.arc(x + 20, y + 32, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(x + 17, y + 28, 6, 8);

    const bob = Math.sin(time * 0.004) * 2;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(x + 4, y - 6 + bob, 88, 15);
    ctx.fillStyle = '#7dd3fc';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QUARRY CAVE (E)', x + w / 2, y + 4 + bob);
    ctx.restore();
  },

  drawCaveNode(ctx, x, y, type, time = 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 26, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'quartz') {
      const shimmer = 0.6 + Math.sin(time * 0.008 + x) * 0.3;
      ctx.fillStyle = `rgba(192, 132, 252, ${shimmer * 0.35})`;
      ctx.beginPath();
      ctx.arc(x + 16, y + 16, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.moveTo(x + 16, y + 4);
      ctx.lineTo(x + 25, y + 22);
      ctx.lineTo(x + 7, y + 22);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e9d5ff';
      ctx.fillRect(x + 14, y + 10, 3, 9);
    } else {
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 9, 22, 17, 6);
      ctx.fill();
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 7, y + 19, 18, 6);
      if (type === 'copper_ore') {
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(x + 10, y + 12, 5, 4);
        ctx.fillRect(x + 18, y + 16, 4, 4);
      } else if (type === 'gold_ore') {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(x + 10, y + 12, 5, 4);
        ctx.fillRect(x + 18, y + 15, 5, 4);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x + 11, y + 13, 2, 2);
      }
    }
    ctx.restore();
  },

  drawForageItem(ctx, x, y, type, time = 0) {
    const bob = Math.sin(time * 0.004 + x * 0.1) * 1.8;
    const cx = x + 16;
    const cy = y + 18 + bob;

    // Ground glow shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(cx, y + 26, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'wildflower') {
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 7);
      ctx.lineTo(cx, cy - 3);
      ctx.stroke();
      const petals = ['#f472b6', '#fb7185', '#f9a8d4', '#f472b6', '#fbcfe8'];
      petals.forEach((col, i) => {
        const ang = (i / 5) * Math.PI * 2;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(ang) * 4.5, cy - 4 + Math.sin(ang) * 4.5, 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'morel') {
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(cx - 3, cy, 6, 8);
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2, 7.5, 6, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(cx - 4, cy - 5, 2, 2);
      ctx.fillRect(cx + 2, cy - 6, 2, 2);
    } else if (type === 'wild_berry') {
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 2, 2.8, 0, Math.PI * 2);
      ctx.arc(cx + 3, cy - 3, 2.8, 0, Math.PI * 2);
      ctx.arc(cx, cy + 2, 2.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'honeycomb') {
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 7, cy - 6, 14, 12, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(cx - 4, cy - 3, 3, 3);
      ctx.fillRect(cx + 1, cy - 2, 3, 3);
      ctx.fillRect(cx - 2, cy + 1, 3, 3);
    }
  },

  drawAmbientCritter(ctx, critter, isNight, time) {
    if (isNight) {
      // Glowing Firefly
      const glow = 0.45 + 0.55 * Math.abs(Math.sin(time * 0.004 + critter.phase));
      ctx.save();
      ctx.globalAlpha = glow;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(critter.x, critter.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.beginPath();
      ctx.arc(critter.x, critter.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Daytime Fluttering Butterfly
      const flap = Math.abs(Math.sin(time * 0.015 + critter.phase));
      const wingW = Math.max(2, flap * 6);
      ctx.save();
      ctx.translate(critter.x, critter.y);
      ctx.fillStyle = critter.color;
      ctx.beginPath();
      ctx.ellipse(-wingW * 0.7, 0, wingW, 3.8, -0.3, 0, Math.PI * 2);
      ctx.ellipse(wingW * 0.7, 0, wingW, 3.8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-1, -3, 2, 6);
      ctx.restore();
    }
  },

  drawFishingBobberAndLine(ctx, playerX, playerY, dir, fishing, time) {
    if (!fishing) return;
    const tipOffsets = {
      0: { ox: 16, oy: 24 },
      1: { ox: 20, oy: 4 },
      2: { ox: -4, oy: 12 },
      3: { ox: 36, oy: 12 }
    };
    const off = tipOffsets[dir] || tipOffsets[0];
    const rodX = playerX + off.ox;
    const rodY = playerY + off.oy;
    const bobX = fishing.waterX;
    const bobY = fishing.waterY + (fishing.phase === 'BITE' ? Math.sin(time * 0.03) * 4.5 : Math.sin(time * 0.006) * 2);

    // Fishing line
    ctx.save();
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(rodX, rodY);
    ctx.quadraticCurveTo((rodX + bobX) / 2, Math.min(rodY, bobY) - 18, bobX, bobY);
    ctx.stroke();

    // Expanding water ripples
    const ring = ((time * 0.04) % 14) + 5;
    ctx.strokeStyle = fishing.phase === 'BITE' ? 'rgba(250, 204, 21, 0.95)' : 'rgba(224, 242, 254, 0.72)';
    ctx.lineWidth = fishing.phase === 'BITE' ? 2.2 : 1.3;
    ctx.beginPath();
    ctx.ellipse(bobX, bobY + 3, ring, ring * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Red & white bobber
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 5, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(bobX, bobY, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Status pill right above bobber so player never wonders what state the line is in
    if (fishing.phase === 'WAITING') {
      const dots = '.'.repeat((Math.floor(time / 420) % 3) + 1);
      const label = (fishing.nudgeHintTimer > 0) ? 'Wait for splash!' : `Waiting${dots}`;
      const pillW = (fishing.nudgeHintTimer > 0) ? 94 : 68;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.strokeStyle = (fishing.nudgeHintTimer > 0) ? '#facc15' : '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(bobX - pillW / 2, bobY - 26, pillW, 16, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = (fishing.nudgeHintTimer > 0) ? '#fde047' : '#e2e8f0';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, bobX, bobY - 15);
    } else if (fishing.phase === 'BITE') {
      const pulse = Math.sin(time * 0.025) * 3;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bobX - 52, bobY - 34 + pulse, 104, 21, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('! BITE ! CLICK / E', bobX, bobY - 20 + pulse);
    }
    ctx.restore();
  },

  drawFishingMinigameBar(ctx, playerX, playerY, fishing) {
    if (!fishing || fishing.phase !== 'REELING') return;
    const barW = 144;
    const barH = 20;
    const canvasW = ctx.canvas ? ctx.canvas.width : 800;
    const bx = Math.max(12, Math.min(canvasW - barW - 12, playerX + 16 - barW / 2));
    const by = Math.max(28, playerY - 40);

    ctx.save();
    // Outer frame
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx - 6, by - 19, barW + 12, barH + 26, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`STOP IN GREEN! (${fishing.attemptsLeft} ${fishing.attemptsLeft === 1 ? 'try' : 'tries'})`, bx + barW / 2, by - 5);

    // Track
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(bx, by, barW, barH, 5);
    ctx.fill();

    // Green Sweet Spot Zone
    const gzX = bx + fishing.targetStart * barW;
    const gzW = fishing.targetWidth * barW;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(gzX, by + 2, gzW, barH - 4, 4);
    ctx.fill();

    // Subtle center highlight inside green zone
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.roundRect(gzX + gzW * 0.35, by + 4, gzW * 0.3, barH - 8, 2);
    ctx.fill();

    // Moving White Needle Cursor
    const curX = bx + fishing.cursorPos * barW;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(curX - 3.5, by - 3, 7, barH + 6, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
};

window.Sprites = Sprites;
