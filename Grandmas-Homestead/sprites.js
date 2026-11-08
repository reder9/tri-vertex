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
    for (let i = 0; i < numStripes; i++) {
      ctx.fillStyle = (i % 2 === 0) ? awningColor1 : awningColor2;
      ctx.fillRect(x + 16 + i * stripeW, awningY, stripeW, 14);
    }

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 18, y + 74, 28, 24);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 20, y + 76, 24, 20);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 31, y + 76, 2, 20);
    ctx.fillRect(x + 20, y + 85, 24, 2);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + w - 46, y + 74, 28, 24);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + w - 44, y + 76, 24, 20);
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
    }
  }
};

window.Sprites = Sprites;
