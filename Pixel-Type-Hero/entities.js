/**
 * PIXEL TYPE HERO - ENTITIES & RENDERING ENGINE
 * Animated pixel hero, companion pets, monsters with word rune banners, spell projectiles, and rewards.
 */

// Math helper
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * 1. PLAYER HERO (WIZARD / KNIGHT)
 */
class TypeHeroPlayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.animTimer = 0;
    this.castTimer = 0;
    this.outfit = 'apprentice'; // 'apprentice', 'cyber_knight', 'champion'
    this.wand = 'apprentice'; // 'apprentice', 'lightning', 'frost', 'cosmic'
  }

  update(dt) {
    this.animTimer += dt;
    if (this.castTimer > 0) {
      this.castTimer -= dt;
    }
  }

  triggerCast() {
    this.castTimer = 0.28;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const bob = Math.sin(this.animTimer * 5) * 3;
    const isCasting = this.castTimer > 0;
    const armAngle = isCasting ? -0.45 : Math.sin(this.animTimer * 3) * 0.1;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cape (Waves in wind behind body)
    const capeWave = Math.sin(this.animTimer * 6) * 4;
    ctx.fillStyle = this.outfit === 'champion' ? '#eab308' : (this.outfit === 'cyber_knight' ? '#06b6d4' : '#7c3aed');
    ctx.beginPath();
    ctx.moveTo(-10, -18 + bob);
    ctx.lineTo(-26 + capeWave, 4 + bob);
    ctx.lineTo(-12, 6 + bob);
    ctx.closePath();
    ctx.fill();

    // Robe / Armor Body
    ctx.fillStyle = this.outfit === 'champion' ? '#ca8a04' : (this.outfit === 'cyber_knight' ? '#0891b2' : '#5b21b6');
    ctx.fillRect(-10, -22 + bob, 20, 26);

    // Belt / Trim
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-10, -10 + bob, 20, 4);

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-8, -36 + bob, 16, 14);

    // Eyes (Big cute pixel eyes)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, -32 + bob, 3, 5);
    ctx.fillRect(4, -32 + bob, 3, 5);
    // Eye shine
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -32 + bob, 1, 2);
    ctx.fillRect(4, -32 + bob, 1, 2);

    // Wizard Hat or Helmet
    if (this.outfit === 'cyber_knight') {
      // Visor
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-9, -38 + bob, 18, 6);
    } else {
      // Pointy Wizard Hat
      ctx.fillStyle = this.outfit === 'champion' ? '#eab308' : '#6d28d9';
      ctx.beginPath();
      ctx.moveTo(-14, -34 + bob);
      ctx.lineTo(14, -34 + bob);
      ctx.lineTo(2, -54 + bob);
      ctx.closePath();
      ctx.fill();

      // Hat Band
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-12, -37 + bob, 24, 3);
    }

    // Magic Staff / Wand
    ctx.save();
    ctx.translate(8, -12 + bob);
    ctx.rotate(armAngle);

    // Staff rod
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, -22, 4, 34);

    // Wand Crystal / Orb
    let orbColor = '#38bdf8';
    if (this.wand === 'lightning') orbColor = '#facc15';
    if (this.wand === 'frost') orbColor = '#a5f3fc';
    if (this.wand === 'cosmic') orbColor = '#f43f5e';

    ctx.fillStyle = orbColor;
    ctx.beginPath();
    ctx.arc(2, -24, isCasting ? 8 : 6, 0, Math.PI * 2);
    ctx.fill();

    // Wand Sparkles
    if (isCasting) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }
}

/**
 * 2. COMPANION PETS
 */
class CompanionPet {
  constructor(species = 'dragon') {
    this.species = species; // 'dragon', 'bunny', 'owl', 'phoenix'
    this.animTimer = Math.random() * 5;
    this.cheerTimer = 0;
  }

  cheer() {
    this.cheerTimer = 0.5;
  }

  update(dt) {
    this.animTimer += dt;
    if (this.cheerTimer > 0) this.cheerTimer -= dt;
  }

  draw(ctx, heroX, heroY) {
    ctx.save();
    // Hover gracefully beside the hero
    const floatY = Math.sin(this.animTimer * 4) * 5 - (this.cheerTimer > 0 ? 12 : 0);
    const px = heroX - 44;
    const py = heroY - 30 + floatY;
    ctx.translate(px, py);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 24 - floatY, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.species === 'dragon') {
      // Sparky the Baby Dragon
      // Little Green Body
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Belly
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-3, 0, 6, 7);

      // Cute Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, -4, 3, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(3, -4, 1, 2);

      // Flapping Wings
      const wingFlap = Math.sin(this.animTimer * 12) * 5;
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(-14, -8 + wingFlap);
      ctx.lineTo(-8, 3);
      ctx.closePath();
      ctx.fill();

      // Tiny Horns
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-4, -13, 2, 4);
      ctx.fillRect(0, -13, 2, 4);

    } else if (this.species === 'bunny') {
      // Robo-Bunny
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Cyber Visor / Eye
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(0, -3, 6, 4);

      // Long Ears with glowing tips
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-5, -18, 3, 10);
      ctx.fillRect(1, -18, 3, 10);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-5, -20, 3, 3);
      ctx.fillRect(1, -20, 3, 3);

    } else if (this.species === 'owl') {
      // Cosmic Owlet
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Big Star Eyes
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(3, -2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(4, -2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Little beak
      ctx.fillStyle = '#f97316';
      ctx.fillRect(6, 1, 3, 3);

    } else {
      // Golden Phoenix
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Golden Crest
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-2, -16, 4, 8);
      ctx.fillRect(2, -14, 3, 6);

      // Fiery Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(2, -3, 3, 3);
    }

    ctx.restore();
  }
}

/**
 * 3. WORD MONSTER
 */
class WordMonster {
  constructor(opts) {
    this.word = opts.word.toUpperCase();
    this.typed = '';
    this.type = opts.type || 'slime'; // 'slime', 'bat', 'golem', 'goblin', 'dragon_boss'
    this.x = opts.x;
    this.y = opts.y;
    this.targetX = opts.targetX || 190; // Castle defense gate position
    this.speed = opts.speed || 18;
    this.isBoss = !!opts.isBoss;
    this.size = this.isBoss ? 48 : 26;
    this.animTimer = Math.random() * 5;
    this.isDead = false;
    this.hitShake = 0;
  }

  update(dt) {
    this.animTimer += dt;
    if (this.hitShake > 0) this.hitShake -= dt * 6;

    // Advance forward towards castle line
    if (!this.isDead) {
      if (this.x > this.targetX) {
        this.x -= this.speed * dt;
      }
    }
  }

  get currentTargetChar() {
    if (this.typed.length < this.word.length) {
      return this.word[this.typed.length];
    }
    return '';
  }

  typeChar(char) {
    const nextNeeded = this.currentTargetChar;
    if (nextNeeded && nextNeeded.toUpperCase() === char.toUpperCase()) {
      this.typed += nextNeeded;
      this.hitShake = 1.0;
      return true;
    }
    return false;
  }

  get isCompleted() {
    return this.typed.length >= this.word.length;
  }

  draw(ctx, isFocused = false) {
    ctx.save();
    const shakeOffset = this.hitShake > 0 ? (Math.random() - 0.5) * 6 * this.hitShake : 0;
    ctx.translate(this.x + shakeOffset, this.y);

    // 1. Draw Monster Body
    this.drawMonsterBody(ctx);

    // 2. Draw Word Rune Balloon
    this.drawWordRune(ctx, isFocused);

    ctx.restore();
  }

  drawMonsterBody(ctx) {
    const bob = Math.sin(this.animTimer * 5) * 3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, this.size * 0.7, this.size * 0.8, this.size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.type === 'slime') {
      // Cute Bouncy Slime
      const squish = Math.sin(this.animTimer * 6) * 3;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(0, bob, 22 + squish, 18 - squish, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slime highlight
      ctx.fillStyle = '#6ee7b7';
      ctx.beginPath();
      ctx.arc(-7, bob - 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-7, bob - 2, 4, 5);
      ctx.fillRect(4, bob - 2, 4, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-7, bob - 2, 2, 2);
      ctx.fillRect(4, bob - 2, 2, 2);

    } else if (this.type === 'bat') {
      // Cute Fluffy Bat
      const flap = Math.sin(this.animTimer * 10) * 8;
      ctx.fillStyle = '#8b5cf6';
      // Body
      ctx.beginPath();
      ctx.arc(0, bob, 14, 0, Math.PI * 2);
      ctx.fill();

      // Wings
      ctx.fillStyle = '#6d28d9';
      ctx.beginPath();
      ctx.moveTo(-10, bob);
      ctx.lineTo(-26, bob - 10 + flap);
      ctx.lineTo(-14, bob + 8);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, bob);
      ctx.lineTo(26, bob - 10 + flap);
      ctx.lineTo(14, bob + 8);
      ctx.closePath();
      ctx.fill();

      // Cute Eyes
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-5, bob - 3, 3, 3);
      ctx.fillRect(2, bob - 3, 3, 3);

    } else if (this.type === 'golem') {
      // Chunky Stone Golem
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-18, -20 + bob, 36, 32);

      // Rock plates
      ctx.fillStyle = '#475569';
      ctx.fillRect(-14, -16 + bob, 28, 8);
      ctx.fillRect(-14, -4 + bob, 28, 12);

      // Glowing crystal eyes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-9, -12 + bob, 5, 3);
      ctx.fillRect(4, -12 + bob, 5, 3);

    } else if (this.type === 'goblin') {
      // Sneaky Word Goblin
      ctx.fillStyle = '#84cc16';
      ctx.beginPath();
      ctx.arc(0, -6 + bob, 14, 0, Math.PI * 2);
      ctx.fill();

      // Big pointy ears
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(-20, -12 + bob, 8, 5);
      ctx.fillRect(12, -12 + bob, 8, 5);

      // Little helmet
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-12, -18 + bob, 24, 7);

      // Eyes
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-5, -6 + bob, 4, 4);
      ctx.fillRect(2, -6 + bob, 4, 4);

    } else if (this.type === 'dragon_boss') {
      // Majestic Vocab Dragon Boss
      ctx.fillStyle = '#dc2626';
      // Big head & body
      ctx.beginPath();
      ctx.ellipse(0, bob, 46, 36, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snout
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(-52, -12 + bob, 28, 22);

      // Golden Horns & Crown
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(-10, -32 + bob);
      ctx.lineTo(-4, -54 + bob);
      ctx.lineTo(8, -32 + bob);
      ctx.closePath();
      ctx.fill();

      // Giant Glowing Eye
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-22, -12 + bob, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-24, -14 + bob, 4, 8);

      // Smoke puff from nostrils
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(-58, -6 + bob, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawWordRune(ctx, isFocused) {
    ctx.save();
    const balloonY = -(this.size + 24);

    ctx.font = 'bold 15px "Press Start 2P", monospace';
    const totalW = ctx.measureText(this.word).width + 24;
    const boxH = 32;

    // Rune Box Background
    ctx.fillStyle = isFocused ? '#0f172a' : 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = isFocused ? '#facc15' : '#38bdf8';
    ctx.lineWidth = isFocused ? 3 : 2;

    ctx.beginPath();
    ctx.roundRect(-totalW / 2, balloonY - boxH / 2, totalW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // Little pointer triangle
    ctx.fillStyle = isFocused ? '#facc15' : '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-5, balloonY + boxH / 2);
    ctx.lineTo(5, balloonY + boxH / 2);
    ctx.lineTo(0, balloonY + boxH / 2 + 6);
    ctx.closePath();
    ctx.fill();

    // Render Letters Character-by-Character
    let cursorX = -totalW / 2 + 12;
    for (let i = 0; i < this.word.length; i++) {
      const char = this.word[i];
      const charW = ctx.measureText(char).width;

      if (i < this.typed.length) {
        // Correctly typed -> Bright emerald green
        ctx.fillStyle = '#4ade80';
      } else if (i === this.typed.length && isFocused) {
        // Next active character -> Flashing glowing gold
        const bounce = Math.sin(this.animTimer * 10) * 2;
        ctx.fillStyle = '#facc15';
        ctx.fillText(char, cursorX, balloonY + 5 - bounce);
        cursorX += charW;
        continue;
      } else {
        // Remaining untyped -> Crisp white
        ctx.fillStyle = '#f8fafc';
      }

      ctx.fillText(char, cursorX, balloonY + 5);
      cursorX += charW;
    }

    ctx.restore();
  }
}

/**
 * 4. SPELL PROJECTILE
 */
class SpellProjectile {
  constructor(startX, startY, targetMonster, spellType = 'star') {
    this.x = startX;
    this.y = startY;
    this.target = targetMonster;
    this.spellType = spellType; // 'star', 'lightning', 'frost', 'fire'
    this.speed = 520;
    this.isDead = false;
    this.life = 1.2;
    this.anim = 0;
  }

  update(dt) {
    this.anim += dt * 10;
    this.life -= dt;
    if (this.life <= 0) {
      this.isDead = true;
      return;
    }

    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 18) {
        this.isDead = true;
      } else {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.spellType === 'lightning') {
      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (this.spellType === 'frost') {
      ctx.fillStyle = '#a5f3fc';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Magic Star Bolt
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Magic Spark Trail
      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
      ctx.beginPath();
      ctx.arc(-8, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * 5. REWARD COIN & FLOATING TEXT
 */
class RewardItem {
  constructor(x, y, type = 'coin') {
    this.x = x;
    this.y = y;
    this.type = type; // 'coin' or 'gem'
    this.vx = (Math.random() - 0.5) * 80;
    this.vy = -120 - Math.random() * 80;
    this.life = 1.0;
  }

  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 220 * dt; // gravity
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const alpha = clamp(this.life * 2, 0, 1);
    ctx.globalAlpha = alpha;

    if (this.type === 'coin') {
      // Golden Coin
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Star Gem
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 7);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

class FloatingTextFX {
  constructor(x, y, text, color = '#facc15', size = 15) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.size = size;
    this.life = 0.9;
  }

  update(dt) {
    this.life -= dt;
    this.y -= 34 * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = clamp(this.life * 2, 0, 1);
    ctx.font = `bold ${this.size}px "Press Start 2P", monospace`;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(this.text, this.x, this.y);
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}
