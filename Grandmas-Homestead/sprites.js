// Procedural 16-Bit SNES Pixel Art Renderer & Tile Cache for Grandma's Homestead
// Renders crisp 2x2-grid pixel sprites, dithered terrain, shingled roofs, and auto-tiled shores/paths.

const Sprites = {
  TILE_SIZE: 32,
  _season: 'Spring',
  _tileCache: {},

  // Color Palette (16-Bit SNES / GBA Harvest Moon & Stardew-inspired saturated ramps)
  colors: {
    outline: '#1d120c',
    grassHi: '#8ed145',
    grassLight: '#6ca832',
    grassMid: '#558e22',
    grassDark: '#3c6e18',
    flowerYellow: '#f9d71c',
    flowerPink: '#f78ca0',
    flowerBlue: '#70a6ff',

    pathLight: '#e7c694',
    pathMid: '#c6995d',
    pathDark: '#996e3b',
    pathOutline: '#6b4924',

    soilDry: '#855326',
    soilDryRidge: '#a16a34',
    soilDryShade: '#5e3816',

    soilWet: '#422811',
    soilWetRidge: '#5b391a',
    soilWetShade: '#291708',
    soilWetGlisten: '#6bb4e8',

    waterLight: '#56b4eb',
    waterMid: '#2678b5',
    waterDark: '#174d7a',
    waterFoam: '#e0f4ff',

    woodHi: '#e6b47a',
    woodLight: '#cf9255',
    woodMid: '#a36731',
    woodDark: '#633914',

    stoneHi: '#cbd5e1',
    stoneLight: '#9aa4b0',
    stoneMid: '#6f7882',
    stoneDark: '#474f57',

    roofRedLight: '#d14c3d',
    roofRed: '#b03a2e',
    roofRedDark: '#732119',
    wallCream: '#fdecc4',
    wallShade: '#e3c794',
    windowGlass: '#7cc5f2',
    windowGlow: '#fef08a'
  },

  setSeason(season = 'Spring') {
    if (this._season !== season) {
      this._season = season;
      this._tileCache = {};
    }
    if (season === 'Summer') {
      this.colors.grassHi = '#7fd43d';
      this.colors.grassLight = '#5ca632';
      this.colors.grassMid = '#46871e';
      this.colors.grassDark = '#2f6110';
      this.colors.flowerYellow = '#facc15';
      this.colors.flowerPink = '#fb7185';
    } else if (season === 'Fall') {
      this.colors.grassHi = '#ebb95b';
      this.colors.grassLight = '#d49a42';
      this.colors.grassMid = '#b87e2d';
      this.colors.grassDark = '#8a5717';
      this.colors.flowerYellow = '#f97316';
      this.colors.flowerPink = '#dc2626';
    } else if (season === 'Winter') {
      this.colors.grassHi = '#ffffff';
      this.colors.grassLight = '#f1f5f9';
      this.colors.grassMid = '#dbeafe';
      this.colors.grassDark = '#94a3b8';
      this.colors.flowerYellow = '#e0f2fe';
      this.colors.flowerPink = '#bfdbfe';
    } else {
      this.colors.grassHi = '#8ed145';
      this.colors.grassLight = '#6ca832';
      this.colors.grassMid = '#558e22';
      this.colors.grassDark = '#3c6e18';
      this.colors.flowerYellow = '#f9d71c';
      this.colors.flowerPink = '#f78ca0';
    }
  },

  // --- 16-Bit Pixel Grid Helpers & Offscreen Tile Cache ---
  px(v) {
    return Math.round(v * 0.5) * 2;
  },

  getCachedTile(key, drawFn) {
    if (this._tileCache[key]) return this._tileCache[key];
    if (typeof document === 'undefined' || !document.createElement) return null;
    try {
      const tile = document.createElement('canvas');
      tile.width = this.TILE_SIZE;
      tile.height = this.TILE_SIZE;
      const tctx = tile.getContext && tile.getContext('2d');
      if (!tctx) return null;
      tctx.imageSmoothingEnabled = false;
      drawFn(tctx, 0, 0);
      this._tileCache[key] = tile;
      return tile;
    } catch (_) {
      return null;
    }
  },

  // Draw stepped 2px pixel circle (16-bit authentic silhouette, zero smooth anti-aliasing)
  drawPixelDisc(ctx, cx, cy, r, fill) {
    ctx.fillStyle = fill;
    const step = 2;
    const r2 = r * r;
    const sx = Math.round(cx);
    const sy = Math.round(cy);
    for (let dy = -r; dy <= r; dy += step) {
      const spanSq = r2 - dy * dy;
      if (spanSq < 0) continue;
      const hw = Math.floor(Math.sqrt(spanSq) / step) * step;
      if (hw > 0) {
        ctx.fillRect(sx - hw, sy + dy, hw * 2, step);
      }
    }
  },

  // Classic 16-bit beveled & outlined sprite block
  drawOutlinedBox(ctx, x, y, w, h, fill, hi, shade, outline = '#1d120c') {
    const px = Math.round(x);
    const py = Math.round(y);
    ctx.fillStyle = outline;
    ctx.fillRect(px - 2, py - 2, w + 4, h + 4);
    ctx.fillStyle = fill;
    ctx.fillRect(px, py, w, h);
    if (hi && w >= 4 && h >= 4) {
      ctx.fillStyle = hi;
      ctx.fillRect(px, py, w, 2);
      ctx.fillRect(px, py, 2, h - 2);
    }
    if (shade && w >= 4 && h >= 4) {
      ctx.fillStyle = shade;
      ctx.fillRect(px + 2, py + h - 2, w - 2, 2);
      ctx.fillRect(px + w - 2, py + 2, 2, h - 2);
    }
  },

  // 16-Bit Stepped Shingle Gable Roof (Zero smooth triangle polygons!)
  drawShingledRoof(ctx, x, y, w, roofH, base, hi, dark, snowCap = false) {
    const rows = Math.max(4, Math.floor(roofH / 4));
    for (let r = 0; r < rows; r++) {
      const t = (r + 1) / rows;
      const inset = Math.round((w * 0.42) * (1 - t) * 0.5) * 2;
      const rw = Math.max(8, w - inset * 2);
      const rx = Math.round(x + inset);
      const ry = Math.round(y + r * 4);

      // Dark pixel outline step
      ctx.fillStyle = this.colors.outline;
      ctx.fillRect(rx - 2, ry - 2, rw + 4, 6);

      // Main roof band
      ctx.fillStyle = snowCap && r < rows - 2 ? '#e2e8f0' : (r === 0 ? hi : base);
      ctx.fillRect(rx, ry, rw, 4);

      // Stepped shingle tile seams every 10px staggered by row
      ctx.fillStyle = snowCap && r < rows - 2 ? '#cbd5e1' : dark;
      ctx.fillRect(rx, ry + 3, rw, 1);
      const offset = (r % 2) * 5;
      for (let sx = rx + 4 + offset; sx < rx + rw - 4; sx += 10) {
        ctx.fillRect(sx, ry, 2, 3);
      }

      // Highlight top ridge
      if (!snowCap && r < rows - 1) {
        ctx.fillStyle = hi;
        ctx.fillRect(rx + 2, ry, rw - 4, 1);
      }
    }
  },

  // Draw Ground Tiles (Pre-baked 16-bit SNES Dithered Atlas)
  drawGrass(ctx, x, y, seed = 0) {
    const variant = Math.abs(seed) % 6;
    const key = `grass_${this._season}_${variant}`;
    const cached = this.getCachedTile(key, (g, ox, oy) => {
      const s = this.TILE_SIZE;
      g.fillStyle = this.colors.grassMid;
      g.fillRect(ox, oy, s, s);

      // Subtle 16-bit checkerboard dither texture on alternating 2x2 pixels
      g.fillStyle = this.colors.grassDark;
      for (let py = 0; py < s; py += 4) {
        for (let px = (py % 8 === 0 ? 0 : 4); px < s; px += 8) {
          if (((px * 7 + py * 13 + variant * 5) % 11) < 3) {
            g.fillRect(ox + px, oy + py, 2, 2);
          }
        }
      }

      // Layered grass blades (V-shaped 2px pixel tufts)
      const oxOff = (variant * 4) % 10;
      g.fillStyle = this.colors.grassLight;
      g.fillRect(ox + 4 + oxOff, oy + 6, 2, 4);
      g.fillRect(ox + 8 + oxOff, oy + 4, 2, 6);
      g.fillRect(ox + 18 - oxOff, oy + 20, 2, 4);
      g.fillRect(ox + 22 - oxOff, oy + 18, 2, 6);

      g.fillStyle = this.colors.grassHi;
      g.fillRect(ox + 8 + oxOff, oy + 4, 2, 2);
      g.fillRect(ox + 22 - oxOff, oy + 18, 2, 2);

      // Tiny clovers or 5-pixel seasonal flowers
      if (variant === 0) {
        g.fillStyle = this.colors.grassDark;
        g.fillRect(ox + 14, oy + 14, 6, 4);
        g.fillStyle = this.colors.flowerPink;
        g.fillRect(ox + 14, oy + 12, 2, 2);
        g.fillRect(ox + 18, oy + 12, 2, 2);
        g.fillRect(ox + 14, oy + 16, 2, 2);
        g.fillRect(ox + 18, oy + 16, 2, 2);
        g.fillStyle = this.colors.flowerYellow;
        g.fillRect(ox + 16, oy + 14, 2, 2);
      } else if (variant === 3) {
        g.fillStyle = this.colors.flowerYellow;
        g.fillRect(ox + 8, oy + 20, 2, 2);
        g.fillRect(ox + 6, oy + 22, 6, 2);
        g.fillStyle = '#ffffff';
        g.fillRect(ox + 8, oy + 22, 2, 2);
      } else if (variant === 5 && this._season === 'Winter') {
        g.fillStyle = '#ffffff';
        g.fillRect(ox + 10, oy + 10, 6, 2);
        g.fillRect(ox + 20, oy + 24, 4, 2);
      }
    });

    if (cached) {
      ctx.drawImage(cached, x, y);
    } else {
      ctx.fillStyle = this.colors.grassMid;
      ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
    }
  },

  drawPath(ctx, x, y, seed = 0) {
    const variant = Math.abs(seed) % 4;
    const key = `path_${variant}`;
    const cached = this.getCachedTile(key, (g, ox, oy) => {
      const s = this.TILE_SIZE;
      g.fillStyle = this.colors.pathMid;
      g.fillRect(ox, oy, s, s);

      // Warm 16-bit dappled earth & pebble clusters
      g.fillStyle = this.colors.pathDark;
      g.fillRect(ox + 2 + variant * 2, oy + 18, 6, 4);
      g.fillRect(ox + 20, oy + 6 + variant * 2, 6, 4);
      g.fillRect(ox + 12, oy + 26, 4, 2);

      g.fillStyle = this.colors.pathLight;
      g.fillRect(ox + 4 + variant * 2, oy + 6, 6, 4);
      g.fillRect(ox + 16, oy + 16 + variant * 2, 8, 4);
      g.fillRect(ox + 24, oy + 24, 4, 2);
      g.fillRect(ox + 8, oy + 12, 2, 2);
    });

    if (cached) {
      ctx.drawImage(cached, x, y);
    } else {
      ctx.fillStyle = this.colors.pathMid;
      ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
    }
  },

  // 16-Bit Auto-Tiled Grass Fringes along Dirt Path Borders
  drawPathEdge(ctx, x, y, grassL, grassR, grassU, grassD) {
    const s = this.TILE_SIZE;
    if (grassU) {
      ctx.fillStyle = this.colors.grassDark;
      ctx.fillRect(x, y, s, 4);
      ctx.fillStyle = this.colors.grassMid;
      for (let px = 0; px < s; px += 8) {
        ctx.fillRect(x + px, y, 4, 4);
      }
      ctx.fillStyle = this.colors.grassLight;
      ctx.fillRect(x + 6, y, 2, 2);
      ctx.fillRect(x + 22, y, 2, 2);
    }
    if (grassD) {
      ctx.fillStyle = this.colors.pathOutline;
      ctx.fillRect(x, y + s - 4, s, 2);
      ctx.fillStyle = this.colors.grassDark;
      ctx.fillRect(x, y + s - 2, s, 2);
    }
    if (grassL) {
      ctx.fillStyle = this.colors.grassDark;
      ctx.fillRect(x, y, 4, s);
      ctx.fillStyle = this.colors.grassMid;
      for (let py = 2; py < s; py += 8) {
        ctx.fillRect(x, y + py, 4, 4);
      }
    }
    if (grassR) {
      ctx.fillStyle = this.colors.grassDark;
      ctx.fillRect(x + s - 4, y, 4, s);
      ctx.fillStyle = this.colors.grassMid;
      for (let py = 4; py < s; py += 8) {
        ctx.fillRect(x + s - 4, y + py, 4, 4);
      }
    }
  },

  drawSoil(ctx, x, y, isWatered = false, isFertilized = false) {
    const key = `soil_${isWatered ? 1 : 0}_${isFertilized ? 1 : 0}`;
    const cached = this.getCachedTile(key, (g, ox, oy) => {
      const s = this.TILE_SIZE;
      const base = isWatered ? this.colors.soilWet : this.colors.soilDry;
      const ridge = isWatered ? this.colors.soilWetRidge : this.colors.soilDryRidge;
      const shade = isWatered ? this.colors.soilWetShade : this.colors.soilDryShade;

      // Stepped soil mound outline
      g.fillStyle = shade;
      g.fillRect(ox, oy, s, s);
      g.fillStyle = base;
      g.fillRect(ox + 2, oy + 2, s - 4, s - 4);

      // Crisp 2px-stepped plowed ridges
      for (let ry = 4; ry < s - 4; ry += 8) {
        g.fillStyle = ridge;
        g.fillRect(ox + 2, oy + ry, s - 4, 4);
        g.fillStyle = shade;
        g.fillRect(ox + 2, oy + ry + 4, s - 4, 2);
      }

      if (isWatered) {
        g.fillStyle = this.colors.soilWetGlisten;
        g.fillRect(ox + 6, oy + 6, 4, 2);
        g.fillRect(ox + 20, oy + 14, 4, 2);
        g.fillRect(ox + 10, oy + 22, 4, 2);
      }
      if (isFertilized) {
        g.fillStyle = '#fef08a';
        g.fillRect(ox + 4, oy + 12, 2, 2);
        g.fillRect(ox + 22, oy + 6, 2, 2);
        g.fillRect(ox + 16, oy + 22, 2, 2);
      }
    });

    if (cached) {
      ctx.drawImage(cached, x, y);
    } else {
      ctx.fillStyle = isWatered ? this.colors.soilWet : this.colors.soilDry;
      ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
    }
  },

  drawWater(ctx, x, y, time = 0) {
    const s = this.TILE_SIZE;
    const frame = Math.floor(time / 320) % 4;
    const waveShift = frame * 4;

    ctx.fillStyle = this.colors.waterMid;
    ctx.fillRect(x, y, s, s);

    // 16-Bit Stepped Depth Bands
    ctx.fillStyle = this.colors.waterDark;
    ctx.fillRect(x + ((4 + waveShift) % 16), y + 2, 8, 2);
    ctx.fillRect(x + ((18 - waveShift + 16) % 20), y + 16, 10, 2);

    // Crisp Pixel Shimmer Crests
    ctx.fillStyle = this.colors.waterLight;
    ctx.fillRect(x + ((2 + waveShift) % 18), y + 8, 10, 2);
    ctx.fillRect(x + ((14 + waveShift) % 18), y + 22, 10, 2);

    ctx.fillStyle = this.colors.waterFoam;
    ctx.fillRect(x + ((6 + waveShift) % 22), y + 8, 4, 2);
    if (frame % 2 === 0) {
      ctx.fillRect(x + 20, y + 22, 2, 2);
    }
  },

  // 16-Bit Auto-Tiled Sandy Bank + Animated Foam Rim around Ponds & Rivers
  drawShoreEdge(ctx, x, y, landL, landR, landU, landD, time = 0) {
    const s = this.TILE_SIZE;
    const foamOn = Math.floor(time / 380) % 2 === 0;
    if (landU) {
      ctx.fillStyle = this.colors.grassDark;
      ctx.fillRect(x, y, s, 4);
      ctx.fillStyle = this.colors.pathLight;
      ctx.fillRect(x, y + 4, s, 4);
      ctx.fillStyle = this.colors.waterDark;
      ctx.fillRect(x, y + 8, s, 2);
      if (foamOn) {
        ctx.fillStyle = this.colors.waterFoam;
        ctx.fillRect(x + 4, y + 10, 8, 2);
        ctx.fillRect(x + 20, y + 10, 6, 2);
      }
    }
    if (landD) {
      ctx.fillStyle = this.colors.pathMid;
      ctx.fillRect(x, y + s - 4, s, 2);
      ctx.fillStyle = this.colors.grassDark;
      ctx.fillRect(x, y + s - 2, s, 2);
    }
    if (landL) {
      ctx.fillStyle = this.colors.pathMid;
      ctx.fillRect(x, y, 4, s);
      ctx.fillStyle = this.colors.waterDark;
      ctx.fillRect(x + 4, y, 2, s);
    }
    if (landR) {
      ctx.fillStyle = this.colors.pathMid;
      ctx.fillRect(x + s - 4, y, 4, s);
      ctx.fillStyle = this.colors.waterDark;
      ctx.fillRect(x + s - 6, y, 2, s);
    }
  },

  drawDock(ctx, x, y) {
    const key = 'dock_16bit';
    const cached = this.getCachedTile(key, (g, ox, oy) => {
      const s = this.TILE_SIZE;
      g.fillStyle = this.colors.waterDark;
      g.fillRect(ox, oy, s, s);

      // Dark wood outline
      g.fillStyle = this.colors.outline;
      g.fillRect(ox, oy + 2, s, s - 4);
      g.fillStyle = this.colors.woodDark;
      g.fillRect(ox, oy + 4, s, s - 8);

      // Individual horizontal stepped planks
      for (let py = 4; py < s - 6; py += 6) {
        g.fillStyle = this.colors.woodMid;
        g.fillRect(ox, oy + py, s, 4);
        g.fillStyle = this.colors.woodHi;
        g.fillRect(ox + 2, oy + py, s - 4, 2);
        g.fillStyle = '#334155';
        g.fillRect(ox + 4, oy + py + 1, 2, 2);
        g.fillRect(ox + s - 6, oy + py + 1, 2, 2);
      }
    });

    if (cached) {
      ctx.drawImage(cached, x, y);
    } else {
      ctx.fillStyle = this.colors.woodMid;
      ctx.fillRect(x, y + 2, this.TILE_SIZE, this.TILE_SIZE - 4);
    }
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

  // Grandma's Cozy Well (16-bit Masonry & Shingle Roof)
  drawWell(ctx, x, y) {
    const s = this.TILE_SIZE;
    // Pixel ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x + 4, y + 30, s * 2 - 8, 4);

    // Masonry stone base with bevel & outline
    this.drawOutlinedBox(ctx, x + 4, y + 14, s * 2 - 8, 16, this.colors.stoneMid, this.colors.stoneLight, this.colors.stoneDark);
    ctx.fillStyle = this.colors.stoneDark;
    ctx.fillRect(x + 18, y + 16, 2, 12);
    ctx.fillRect(x + 36, y + 16, 2, 12);
    ctx.fillRect(x + 6, y + 22, s * 2 - 12, 2);

    // Inner deep water with highlight shimmer
    ctx.fillStyle = this.colors.waterDark;
    ctx.fillRect(x + 10, y + 16, s * 2 - 20, 10);
    ctx.fillStyle = this.colors.waterLight;
    ctx.fillRect(x + 14, y + 18, 10, 2);

    // Wooden roof posts with outline
    this.drawOutlinedBox(ctx, x + 6, y - 4, 4, 20, this.colors.woodMid, this.colors.woodHi, this.colors.woodDark);
    this.drawOutlinedBox(ctx, x + s * 2 - 10, y - 4, 4, 20, this.colors.woodMid, this.colors.woodHi, this.colors.woodDark);

    // 16-bit Stepped Shingled Well Roof
    this.drawShingledRoof(ctx, x, y - 22, s * 2, 18, this.colors.roofRed, this.colors.roofRedLight, this.colors.roofRedDark, this._season === 'Winter');

    // Wooden bucket on rim
    this.drawOutlinedBox(ctx, x + s * 2 - 16, y + 10, 8, 8, this.colors.woodMid, this.colors.woodHi, this.colors.woodDark);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + s * 2 - 14, y + 6, 4, 4);
  },

  // Shipping Bin (16-Bit Iron-Bound Oak Chest)
  drawShippingBin(ctx, x, y) {
    const s = this.TILE_SIZE;
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x + 2, y + 26, s + 10, 6);

    this.drawOutlinedBox(ctx, x + 4, y + 8, s + 6, 20, this.colors.woodMid, this.colors.woodHi, this.colors.woodDark);
    // Plank seam
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(x + 4, y + 15, s + 6, 2);
    // Iron straps with highlight
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 10, y + 8, 4, 20);
    ctx.fillRect(x + 28, y + 8, 4, 20);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x + 10, y + 10, 2, 14);
    ctx.fillRect(x + 28, y + 10, 2, 14);
    // Brass clasp
    this.drawOutlinedBox(ctx, x + 18, y + 14, 6, 6, '#facc15', '#fef08a', '#b45309');
  },

  // 16-Bit Stepped Pixel Oak / Apple Trees (Seasonal Colors & Pixel Outlines)
  drawTree(ctx, x, y, health = 3) {
    // Ground dither shadow
    this.drawPixelDisc(ctx, x + 16, y + 28, 13, 'rgba(0,0,0,0.22)');

    // Ridged Trunk with dark pixel outline
    this.drawOutlinedBox(ctx, x + 11, y + 15, 10, 16, this.colors.woodMid, this.colors.woodHi, this.colors.woodDark);
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(x + 15, y + 17, 2, 12);

    // Seasonal 4-Tone Foliage Palette
    let leafOutline = '#132a0c';
    let leafDark = '#214d12';
    let leafMid = '#367521';
    let leafLight = '#5da834';
    let leafHi = '#8fd44e';
    if (this._season === 'Fall') {
      leafOutline = '#451a03'; leafDark = '#9a3412'; leafMid = '#d97706'; leafLight = '#f59e0b'; leafHi = '#fde047';
    } else if (this._season === 'Winter') {
      leafOutline = '#1e293b'; leafDark = '#475569'; leafMid = '#94a3b8'; leafLight = '#e2e8f0'; leafHi = '#ffffff';
    }

    // Stepped Pixel Canopy Silhouette (zero smooth arcs!)
    this.drawPixelDisc(ctx, x + 16, y + 6, 20, leafOutline);
    this.drawPixelDisc(ctx, x + 16, y + 6, 18, leafDark);
    this.drawPixelDisc(ctx, x + 10, y + 2, 12, leafOutline);
    this.drawPixelDisc(ctx, x + 22, y + 2, 12, leafOutline);
    this.drawPixelDisc(ctx, x + 16, y + 4, 15, leafMid);
    this.drawPixelDisc(ctx, x + 14, y + 1, 11, leafLight);
    this.drawPixelDisc(ctx, x + 12, y - 2, 6, leafHi);

    // Crisp pixel leaf clusters & seasonal fruit
    ctx.fillStyle = leafHi;
    ctx.fillRect(x + 6, y - 2, 4, 2);
    ctx.fillRect(x + 20, y + 2, 4, 2);
    if (this._season !== 'Winter') {
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(x + 8, y + 4, 4, 4);
      ctx.fillRect(x + 20, y + 6, 4, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 8, y + 4, 2, 2);
      ctx.fillRect(x + 20, y + 6, 2, 2);
    }

    if (health < 3) {
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(x + 12, y + 22, 8, 2);
    }
  },

  // 16-Bit Stepped Boulder / Stone (Faceted Pixel Outline)
  drawRock(ctx, x, y, health = 3) {
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x + 4, y + 24, 24, 4);

    ctx.fillStyle = this.colors.outline;
    ctx.fillRect(x + 6, y + 6, 20, 20);
    ctx.fillRect(x + 4, y + 10, 24, 14);

    ctx.fillStyle = this.colors.stoneDark;
    ctx.fillRect(x + 6, y + 10, 20, 14);
    ctx.fillStyle = this.colors.stoneMid;
    ctx.fillRect(x + 8, y + 8, 16, 12);
    ctx.fillStyle = this.colors.stoneLight;
    ctx.fillRect(x + 8, y + 8, 10, 6);
    ctx.fillStyle = this.colors.stoneHi;
    ctx.fillRect(x + 10, y + 10, 4, 2);

    if (health < 3) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 14, y + 10, 2, 8);
      ctx.fillRect(x + 16, y + 16, 4, 2);
    }
  },

  // 16-Bit Outlined Wild Grass / Weed Tuft
  drawWeeds(ctx, x, y) {
    const o = this.colors.outline;
    ctx.fillStyle = o;
    ctx.fillRect(x + 4, y + 14, 24, 14);
    ctx.fillStyle = '#254a10';
    ctx.fillRect(x + 6, y + 14, 4, 12);
    ctx.fillRect(x + 12, y + 8, 4, 18);
    ctx.fillRect(x + 18, y + 10, 4, 16);
    ctx.fillRect(x + 22, y + 16, 4, 10);

    ctx.fillStyle = '#5da834';
    ctx.fillRect(x + 6, y + 14, 2, 8);
    ctx.fillRect(x + 12, y + 10, 2, 10);
    ctx.fillRect(x + 18, y + 12, 2, 10);
    ctx.fillStyle = '#8fd44e';
    ctx.fillRect(x + 12, y + 10, 2, 2);
    ctx.fillRect(x + 18, y + 12, 2, 2);
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

  // Grandma Hazel's Cottage & Porch (16-bit Half-Timbered Manor & Shingled Roof)
  drawCottage(ctx, startX, startY, time = 0) {
    const s = this.TILE_SIZE;
    const w = s * 6; // 192px
    const h = s * 5; // 160px

    // Pixel Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.fillRect(startX + 8, startY + h - 8, w - 16, 16);

    // Stone Foundation Masonry
    this.drawOutlinedBox(ctx, startX + 16, startY + h - 32, w - 32, 28, this.colors.stoneMid, this.colors.stoneLight, this.colors.stoneDark);
    ctx.fillStyle = this.colors.stoneDark;
    for (let bx = startX + 26; bx < startX + w - 26; bx += 16) {
      ctx.fillRect(bx, startY + h - 30, 2, 24);
    }

    // Half-Timbered Cream Plaster Walls
    this.drawOutlinedBox(ctx, startX + 20, startY + 54, w - 40, h - 84, this.colors.wallCream, '#fffbeb', this.colors.wallShade);
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(startX + 20, startY + 54, 8, h - 84);
    ctx.fillRect(startX + w - 28, startY + 54, 8, h - 84);
    ctx.fillRect(startX + 78, startY + 54, 6, h - 84);
    ctx.fillRect(startX + 130, startY + 54, 6, h - 84);
    // Eaves shadow cast by roof
    ctx.fillStyle = 'rgba(29, 18, 12, 0.22)';
    ctx.fillRect(startX + 22, startY + 56, w - 44, 6);

    // Stone Brick Chimney on left roof
    this.drawOutlinedBox(ctx, startX + 30, startY - 14, 20, 50, this.colors.stoneMid, this.colors.stoneLight, this.colors.stoneDark);
    ctx.fillStyle = this.colors.stoneDark;
    ctx.fillRect(startX + 32, startY - 4, 16, 2);
    ctx.fillRect(startX + 32, startY + 8, 16, 2);
    this.drawOutlinedBox(ctx, startX + 28, startY - 18, 24, 6, this.colors.stoneLight, this.colors.stoneHi, this.colors.stoneDark);

    // Stepped Pixel Chimney Smoke Puffs
    const smokeOffset = Math.round((time * 0.04) % 40);
    this.drawPixelDisc(ctx, startX + 40 + Math.sin(time * 0.003) * 6, startY - 24 - smokeOffset * 0.8, 6, 'rgba(241, 245, 249, 0.72)');
    this.drawPixelDisc(ctx, startX + 42 + Math.cos(time * 0.003) * 8, startY - 46 - smokeOffset * 0.6, 8, 'rgba(226, 232, 240, 0.55)');

    // 16-bit Stepped Shingled Gable Roof
    this.drawShingledRoof(ctx, startX + 8, startY, w - 16, 56, this.colors.roofRed, this.colors.roofRedLight, this.colors.roofRedDark, this._season === 'Winter');

    // Attic round pixel window
    this.drawPixelDisc(ctx, startX + w / 2, startY + 32, 11, this.colors.outline);
    this.drawPixelDisc(ctx, startX + w / 2, startY + 32, 9, this.colors.woodMid);
    this.drawPixelDisc(ctx, startX + w / 2, startY + 32, 6, this.colors.windowGlow);
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(startX + w / 2 - 1, startY + 26, 2, 12);
    ctx.fillRect(startX + w / 2 - 6, startY + 31, 12, 2);

    // Wooden Cottage Door
    this.drawOutlinedBox(ctx, startX + 90, startY + 84, 26, 44, this.colors.woodMid, this.colors.woodHi, this.colors.woodDark);
    ctx.fillStyle = this.colors.woodDark;
    ctx.fillRect(startX + 98, startY + 86, 2, 40);
    ctx.fillRect(startX + 106, startY + 86, 2, 40);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(startX + 94, startY + 106, 4, 4);

    // Glowing Windows with flower boxes
    this.drawWindowWithCurtain(ctx, startX + 38, startY + 76);
    this.drawWindowWithCurtain(ctx, startX + 142, startY + 76);

    // Porch Deck & Railing
    this.drawOutlinedBox(ctx, startX + 16, startY + 128, w - 32, 12, this.colors.woodMid, this.colors.woodHi, this.colors.woodDark);

    // Cozy Welcome Mat
    this.drawOutlinedBox(ctx, startX + 86, startY + 128, 34, 10, '#991b1b', '#ef4444', '#450a0a');
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(startX + 90, startY + 132, 26, 2);
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

  // Player Character Rendering (16-Bit SNES RPG Outlined & Shaded Farmer)
  drawPlayer(ctx, x, y, dir = 0, isMoving = false, toolAction = null, walkFrame = 0) {
    const legOffset = isMoving ? Math.round(Math.sin(walkFrame * 0.35) * 2) * 2 : 0;
    const stepBob = isMoving && Math.sin(walkFrame * 0.7) > 0 ? -2 : 0;
    const o = this.colors.outline;
    const py = y + stepBob;

    // Ground pixel shadow
    ctx.fillStyle = 'rgba(0,0,0,0.26)';
    ctx.fillRect(x + 6, y + 25, 20, 5);

    // Boots with dark pixel outline
    ctx.fillStyle = o;
    ctx.fillRect(x + 8, py + 21, 7, 7);
    ctx.fillRect(x + 17, py + 21, 7, 7);
    ctx.fillStyle = '#78350f';
    if (dir === 2 || dir === 3) {
      ctx.fillRect(x + 10 + legOffset, py + 22, 5, 5);
      ctx.fillRect(x + 17 - legOffset, py + 22, 5, 5);
    } else {
      ctx.fillRect(x + 9, py + 22 + (legOffset > 0 ? 2 : 0), 5, 5);
      ctx.fillRect(x + 18, py + 22 + (legOffset < 0 ? 2 : 0), 5, 5);
    }

    // Outlined Overalls & Red Plaid Shirt
    ctx.fillStyle = o;
    ctx.fillRect(x + 6, py + 9, 20, 15);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 8, py + 10, 16, 6);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 10, py + 10, 12, 2);

    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(x + 8, py + 15, 16, 8);
    ctx.fillRect(x + 10, py + 10, 3, 6);
    ctx.fillRect(x + 19, py + 10, 3, 6);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x + 10, py + 16, 12, 2);
    // Brass buckles
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 10, py + 14, 3, 2);
    ctx.fillRect(x + 19, py + 14, 3, 2);

    // Head with dark pixel outline
    this.drawOutlinedBox(ctx, x + 10, py + 1, 12, 10, '#fed7aa', '#ffedd5', '#fdba74', o);

    // Shaded Hair
    ctx.fillStyle = '#713f12';
    ctx.fillRect(x + 9, py, 14, 4);

    // Crisp SNES Eyes & Glints
    if (dir === 0) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 12, py + 4, 2, 4);
      ctx.fillRect(x + 18, py + 4, 2, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 12, py + 4, 1, 2);
      ctx.fillRect(x + 18, py + 4, 1, 2);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(x + 11, py + 8, 2, 1);
      ctx.fillRect(x + 19, py + 8, 2, 1);
    } else if (dir === 1) {
      ctx.fillStyle = '#713f12';
      ctx.fillRect(x + 10, py + 2, 12, 8);
    } else if (dir === 2) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 11, py + 4, 2, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 11, py + 4, 1, 2);
    } else if (dir === 3) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 19, py + 4, 2, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 19, py + 4, 1, 2);
    }

    // 16-Bit Shaded & Outlined Straw Hat
    this.drawOutlinedBox(ctx, x + 5, py - 3, 22, 4, '#eab308', '#fef08a', '#a16207', o);
    this.drawOutlinedBox(ctx, x + 9, py - 8, 14, 6, '#ca8a04', '#facc15', '#854d0e', o);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x + 9, py - 4, 14, 2);

    // Active Tool In Hands
    if (toolAction) {
      this.drawToolInHand(ctx, x, py, dir, toolAction);
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
    const variant = Math.abs(seed) % 3;
    const key = `plaza_${variant}`;
    const cached = this.getCachedTile(key, (g, ox, oy) => {
      const s = this.TILE_SIZE;
      g.fillStyle = '#64748b';
      g.fillRect(ox, oy, s, s);

      // 4 Chamfered 16-Bit Flagstones per 32x32 tile
      const drawStone = (sx, sy, sw, sh, base, hi, shade) => {
        g.fillStyle = shade;
        g.fillRect(ox + sx, oy + sy, sw, sh);
        g.fillStyle = base;
        g.fillRect(ox + sx, oy + sy, sw - 2, sh - 2);
        g.fillStyle = hi;
        g.fillRect(ox + sx, oy + sy, sw - 2, 2);
        g.fillRect(ox + sx, oy + sy, 2, sh - 2);
      };
      drawStone(2, 2, 12, 12, '#cbd5e1', '#e2e8f0', '#475569');
      drawStone(18, 2, 12, 12, '#b8c4d1', '#cbd5e1', '#475569');
      drawStone(2, 18, 12, 12, '#b8c4d1', '#cbd5e1', '#475569');
      drawStone(18, 18, 12, 12, '#cbd5e1', '#e2e8f0', '#475569');

      if (variant === 0) {
        g.fillStyle = '#558e22';
        g.fillRect(ox + 14, oy + 14, 4, 2);
      } else if (variant === 2) {
        g.fillStyle = '#94a3b8';
        g.fillRect(ox + 6, oy + 6, 4, 2);
        g.fillRect(ox + 22, oy + 22, 4, 2);
      }
    });

    if (cached) {
      ctx.drawImage(cached, x, y);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
    }
  },

  drawFountain(ctx, x, y, time = 0) {
    // 16-bit Stepped Pixel Stone Fountain
    this.drawPixelDisc(ctx, x + 48, y + 60, 40, 'rgba(0,0,0,0.22)');
    this.drawPixelDisc(ctx, x + 48, y + 52, 40, this.colors.outline);
    this.drawPixelDisc(ctx, x + 48, y + 52, 38, this.colors.stoneDark);
    this.drawPixelDisc(ctx, x + 48, y + 48, 36, this.colors.stoneLight);
    this.drawPixelDisc(ctx, x + 48, y + 48, 30, this.colors.waterMid);

    // Animated water shimmer rings
    const ring = (Math.floor(time / 280) % 2) * 2;
    this.drawPixelDisc(ctx, x + 48, y + 48, 18 + ring, this.colors.waterLight);
    this.drawPixelDisc(ctx, x + 48, y + 48, 12, this.colors.waterMid);

    // Pillar & Top Bowl
    this.drawOutlinedBox(ctx, x + 42, y + 26, 12, 26, this.colors.stoneMid, this.colors.stoneLight, this.colors.stoneDark);
    this.drawPixelDisc(ctx, x + 48, y + 26, 18, this.colors.outline);
    this.drawPixelDisc(ctx, x + 48, y + 26, 16, this.colors.stoneLight);
    this.drawPixelDisc(ctx, x + 48, y + 24, 12, this.colors.waterLight);

    this.drawOutlinedBox(ctx, x + 46, y + 14, 4, 8, '#facc15', '#fef08a', '#b45309');

    const jetOffset = Math.round(Math.sin(time * 0.008) * 3);
    this.drawPixelDisc(ctx, x + 48, y + 10 + jetOffset, 4, '#e0f2fe');

    const drop1 = Math.round((time * 0.04) % 18);
    const drop2 = Math.round((time * 0.04 + 9) % 18);
    ctx.fillStyle = '#bfdbfe';
    ctx.fillRect(x + 38 - Math.round(drop1 * 0.5), y + 20 + drop1, 2, 2);
    ctx.fillRect(x + 58 + Math.round(drop1 * 0.5), y + 20 + drop1, 2, 2);
    ctx.fillRect(x + 44 - Math.round(drop2 * 0.3), y + 20 + drop2, 2, 2);
    ctx.fillRect(x + 52 + Math.round(drop2 * 0.3), y + 20 + drop2, 2, 2);
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

    // 16-Bit Masonry Wall, Foundation & Stepped Shingle Roof
    this.drawOutlinedBox(ctx, x + 8, y + 38, w - 16, h - 38, wallColor, '#ffffff', trimColor);

    // Subtle stone/brick masonry base course
    ctx.fillStyle = trimColor;
    ctx.fillRect(x + 8, y + h - 14, w - 16, 14);
    ctx.fillStyle = this.colors.outline;
    for (let bx = x + 16; bx < x + w - 16; bx += 14) {
      ctx.fillRect(bx, y + h - 12, 2, 12);
    }

    // Stepped 16-bit Shingled Roof
    this.drawShingledRoof(ctx, x + 2, y, w - 4, 40, roofColor, wallColor, roofDark, this._season === 'Winter');

    const awningY = y + 54;
    const awningW = w - 32;
    const stripeW = 12;
    const numStripes = Math.floor(awningW / stripeW);
    if (type !== 'church') {
      ctx.fillStyle = this.colors.outline;
      ctx.fillRect(x + 14, awningY - 2, numStripes * stripeW + 4, 18);
      for (let i = 0; i < numStripes; i++) {
        ctx.fillStyle = (i % 2 === 0) ? awningColor1 : awningColor2;
        ctx.fillRect(x + 16 + i * stripeW, awningY, stripeW, 14);
      }
      // Scalloped pixel awning bottom edge
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(x + 16, awningY + 12, numStripes * stripeW, 2);
    } else {
      // 16-Bit Stone Chapel Bell Steeple & Stepped Spire
      this.drawOutlinedBox(ctx, x + w / 2 - 16, y - 22, 32, 26, '#e2e8f0', '#ffffff', '#94a3b8');
      this.drawShingledRoof(ctx, x + w / 2 - 20, y - 44, 40, 22, '#475569', '#64748b', '#1e293b', this._season === 'Winter');
      // Brass Bell opening & Golden Cross
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + w / 2 - 6, y - 16, 12, 14);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + w / 2 - 4, y - 12, 8, 8);
      ctx.fillRect(x + w / 2 - 2, y - 54, 4, 12);
      ctx.fillRect(x + w / 2 - 6, y - 50, 12, 2);
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
    const bob = Math.round(Math.sin(time * 0.003) * 1) * 2;
    const o = this.colors.outline;

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 6, y + 24, 20, 6);

    // Common 16-bit dark pixel silhouette backdrop for humanoid villagers
    if (type !== 'dog') {
      ctx.fillStyle = o;
      ctx.fillRect(x + 6, y + 8 + bob, 20, 19);
      ctx.fillRect(x + 8, y + bob, 16, 12);
    }

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

    // Crisp 16-bit SNES pixel eyes for human villagers
    if (type !== 'dog') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 12, y + 5 + bob, 2, 3);
      ctx.fillRect(x + 18, y + 5 + bob, 2, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 12, y + 5 + bob, 1, 1);
      ctx.fillRect(x + 18, y + 5 + bob, 1, 1);
    }
  },

  drawFlowerBed(ctx, x, y, seed = 0) {
    this.drawOutlinedBox(ctx, x + 2, y + 4, 28, 24, '#3f2e21', '#8d6e63', '#2d1a0f');
    ctx.fillStyle = '#3c6e18';
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
    ctx.fillStyle = 'rgba(0,0,0,0.24)';
    ctx.fillRect(x + 6, y + h - 8, w - 12, 12);

    // Classic Red Timber Siding with dark pixel outline
    this.drawOutlinedBox(ctx, x + 8, y + 36, w - 16, h - 36, '#b91c1c', '#ef4444', '#7f1d1d');
    ctx.fillStyle = '#7f1d1d';
    for (let px = x + 16; px < x + w - 14; px += 12) {
      ctx.fillRect(px, y + 38, 2, h - 40);
    }

    // 16-Bit Stepped Shingle Roof
    this.drawShingledRoof(ctx, x, y, w, 38, '#78350f', '#a16207', '#451a03', this._season === 'Winter');

    // Loft Window & White Cross-Braced Barn Doors
    this.drawOutlinedBox(ctx, x + w / 2 - 12, y + 18, 24, 16, '#451a03', '#fef3c7', '#271406', '#fef3c7');

    const doorX = x + w / 2 - 22;
    const doorY = y + h - 42;
    this.drawOutlinedBox(ctx, doorX, doorY, 44, 42, '#f8fafc', '#ffffff', '#cbd5e1');
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(doorX + 4, doorY + 4, 16, 36);
    ctx.fillRect(doorX + 24, doorY + 4, 16, 36);
    ctx.fillStyle = '#ffffff';
    for (let d = 0; d < 14; d += 2) {
      ctx.fillRect(doorX + 4 + d, doorY + 6 + d * 2, 2, 2);
      ctx.fillRect(doorX + 24 + d, doorY + 6 + d * 2, 2, 2);
    }

    // Hay Bale & Banner
    this.drawOutlinedBox(ctx, x + 14, y + h - 22, 24, 16, '#eab308', '#fef08a', '#a16207');
    ctx.fillStyle = '#92400e';
    ctx.fillRect(x + 14, y + h - 16, 24, 2);

    const bob = Math.round(Math.sin(time * 0.004) * 2);
    this.drawOutlinedBox(ctx, x + 26, y - 18 + bob, 108, 16, '#1e293b', '#475569', '#0f172a');
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ANIMAL BARN (E)', x + w / 2, y - 7 + bob);
  },

  drawFarmAnimal(ctx, animal, time = 0) {
    const x = Math.round(animal.x);
    const y = Math.round(animal.y);
    const hop = animal.isWalking
      ? Math.round(Math.abs(Math.sin(time * 0.015 + animal.phase)) * 2) * 2
      : (Math.sin(time * 0.004 + animal.phase) > 0.5 ? 2 : 0);
    const o = this.colors.outline;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(x + 6, y + 24, 20, 4);

    if (animal.species === 'chicken') {
      this.drawPixelDisc(ctx, x + 16, y + 18 - hop, 8, o);
      this.drawPixelDisc(ctx, x + 16, y + 18 - hop, 6, '#ffffff');
      this.drawOutlinedBox(ctx, x + 15, y + 6 - hop, 10, 10, '#ffffff', '#ffffff', '#e2e8f0', o);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 17, y + 3 - hop, 4, 3);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + 25, y + 10 - hop, 4, 4);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 21, y + 8 - hop, 2, 2);
    } else if (animal.species === 'cow') {
      this.drawOutlinedBox(ctx, x + 6, y + 11 - hop, 20, 13, '#ffffff', '#ffffff', '#cbd5e1', o);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 9, y + 12 - hop, 6, 5);
      ctx.fillRect(x + 18, y + 16 - hop, 5, 5);
      ctx.fillRect(x + 8, y + 24 - hop, 4, 4);
      ctx.fillRect(x + 20, y + 24 - hop, 4, 4);
      this.drawOutlinedBox(ctx, x + 21, y + 7 - hop, 10, 9, '#ffffff', '#ffffff', '#e2e8f0', o);
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(x + 24, y + 12 - hop, 6, 4);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 22, y + 5 - hop, 2, 2);
      ctx.fillRect(x + 27, y + 5 - hop, 2, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 24, y + 9 - hop, 2, 2);
    } else {
      // 16-Bit Stepped Pixel Fluffy Sheep
      this.drawPixelDisc(ctx, x + 15, y + 17 - hop, 10, o);
      this.drawPixelDisc(ctx, x + 15, y + 17 - hop, 8, '#f8fafc');
      this.drawPixelDisc(ctx, x + 10, y + 16 - hop, 5, '#e2e8f0');
      this.drawPixelDisc(ctx, x + 19, y + 15 - hop, 5, '#ffffff');
      this.drawOutlinedBox(ctx, x + 20, y + 11 - hop, 8, 8, '#334155', '#475569', '#0f172a', o);
      ctx.fillStyle = o;
      ctx.fillRect(x + 10, y + 24 - hop, 4, 4);
      ctx.fillRect(x + 18, y + 24 - hop, 4, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 24, y + 13 - hop, 2, 2);
    }

    if (animal.hasProduct) {
      const pBob = Math.round(Math.sin(time * 0.007 + animal.phase) * 2);
      this.drawOutlinedBox(ctx, x + 11, y - 9 + pBob, 10, 10, '#facc15', '#fef08a', '#b45309', o);
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+', x + 16, y - 1.5 + pBob);
    }
    ctx.restore();
  },

  drawCaveEntrance(ctx, x, y, time = 0) {
    const w = 96;
    const h = 64;
    ctx.save();
    // 16-Bit Stepped Rocky Hillside Mound
    this.drawPixelDisc(ctx, x + w / 2, y + h - 18, 46, this.colors.outline);
    this.drawPixelDisc(ctx, x + w / 2, y + h - 18, 44, '#475569');
    this.drawPixelDisc(ctx, x + w / 2, y + h - 22, 38, '#64748b');
    this.drawPixelDisc(ctx, x + w / 2 - 6, y + h - 28, 24, '#94a3b8');

    // Outlined Cavern Opening & Timber Supports
    ctx.fillStyle = '#090d16';
    ctx.fillRect(x + 26, y + 20, 44, 44);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 28, y + 16, 40, 6);
    this.drawOutlinedBox(ctx, x + 22, y + 20, 6, 44, this.colors.woodMid, this.colors.woodHi, this.colors.woodDark);
    this.drawOutlinedBox(ctx, x + 68, y + 20, 6, 44, this.colors.woodMid, this.colors.woodHi, this.colors.woodDark);
    this.drawOutlinedBox(ctx, x + 20, y + 16, 56, 6, this.colors.woodMid, this.colors.woodHi, this.colors.woodDark);

    // Warm Miner's Lantern
    const flick = Math.floor(time / 240) % 2 === 0 ? 0.38 : 0.28;
    this.drawPixelDisc(ctx, x + 18, y + 32, 12, `rgba(250, 204, 21, ${flick})`);
    this.drawOutlinedBox(ctx, x + 15, y + 28, 6, 8, '#fde047', '#ffffff', '#ca8a04');

    const bob = Math.round(Math.sin(time * 0.004) * 2);
    this.drawOutlinedBox(ctx, x + 4, y - 6 + bob, 88, 15, '#1e293b', '#334155', '#0f172a');
    ctx.fillStyle = '#7dd3fc';
    ctx.font = 'bold 8px monospace';
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
