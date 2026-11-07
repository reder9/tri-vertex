/**
 * TRI-VERTEX // ENTITIES SYSTEM
 * Player Triangle, Geometric Enemies, Bosses, Projectiles, Particles & Pickups
 */

// Math helpers
const distSq = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2;
const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);
const normalizeAngle = (ang) => Math.atan2(Math.sin(ang), Math.cos(ang));

/**
 * PLAYER TRIANGLE FIGHTER
 */
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this.radius = 22; // Base collision radius

    // Vitals
    this.maxHealth = 150;
    this.health = 150;
    this.maxShield = 100;
    this.shield = 100;
    this.shieldRechargeDelay = 2.4; // seconds before shield starts refilling
    this.shieldRechargeTimer = 0;
    this.shieldRechargeRate = 45; // hp per sec

    // Energy System (100 Energy Capacity, Beam requires 15 Energy)
    this.maxEnergy = 100;
    this.energy = 100;
    this.energyRegenRate = 14; // Passive energy recharge per second

    // Mobility
    this.speed = 340;
    this.speedMult = 1.0;
    this.friction = 0.88;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.22;
    this.dashCooldown = 0;
    this.dashCooldownMax = 1.6;
    this.dashSpeed = 820;
    this.dashDirX = 0;
    this.dashDirY = 0;
    this.invulnerable = false;
    this.invulnerableTimer = 0;

    // Loadout
    this.meleeWeapons = ['katana', 'lance', 'hammer', 'glaives'];
    this.rangedWeapons = ['railgun', 'seekers', 'tri_laser', 'flak', 'void_orb'];
    this.activeMeleeIndex = 0;
    this.activeRangedIndex = 0;

    this.meleeCooldown = 0;
    this.rangedCooldown = 0;

    // Attack state animations
    this.meleeAttackAnim = null; // { type, timer, maxTimer, angle, range, arc }
    this.thrusterFlicker = 0;
    this.afterImages = [];

    // Orbiting blades state (for Glaives)
    this.orbitAngle = 0;

    // Progression / Stats
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 180; // Snappy pacing for shorter, exciting stages
    this.magnetRadius = 180;
    this.magnetSpeedBonus = 1.0;
    this.hasMagnetPower = false;
    this.gemSiphonEnergy = false;
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.highestCombo = 1;

    // Combat Synergy Meter (0 to 100)
    // Melee hits build ranged overcharge; Ranged hits build melee vulnerability
    this.synergyMeter = 0;
    this.isOvercharged = false;

    // Ultimate Ability (Super Nova) - Charges +4% per defeated enemy (25 kills to prime)
    this.ultimateCharge = 0;
    this.ultimateMax = 100;

    // Upgrades modifiers
    this.meleeRangeMult = 1;
    this.meleeDamageMult = 1;
    this.hasVorpalWave = false;
    this.vorpalInfinitePierce = false;
    this.meleeExplosiveNova = false;
    this.meleeLifesteal = 0;
    this.deflectAmplified = false;
    this.deflectSpeedMult = 1.35;
    this.deflectDamageBonus = 1;
    this.deflectCounterPulse = false;
    this.deflectExplosions = false;
    this.hasPlasmaTrail = false;
    this.extraProjectiles = 0;
    this.clusterExplosions = false;
    this.bonusPiercing = 0;
    this.projectileSpeedMult = 1;
    this.rangedDamageMult = 1;
    this.rangedEnergyDiscount = 1;
    this.globalEnergyCostMult = 1;
    this.vulnerabilityBonus = 1.6;
    this.vulnerabilityDuration = 4.0;
    this.hasShieldNova = false;
    this.combatShieldRegen = false;
    this.dashSpeedMult = 1;
    this.hasDashDecoy = false;
    this.hasDashPlasmaTrail = false;
    this.hasLightningDash = false;
    this.lightningSpawnTimer = 0;
    this.hasSlipstream = false;
    this.synergyBonus = 1;

    // Xbox Controller Aiming System
    this.game = null;
    this.lockedEnemy = null;
    this.aimReticleActive = false;
    this.aimReticleAlpha = 0;
    this.aimDistance = 260;
    this.reticleX = 0;
    this.reticleY = 0;
  }

  get equippedMelee() {
    return WEAPONS[this.meleeWeapons[this.activeMeleeIndex]];
  }

  get equippedRanged() {
    return WEAPONS[this.rangedWeapons[this.activeRangedIndex]];
  }

  setMeleeIndex(idx) {
    if (idx >= 0 && idx < this.meleeWeapons.length) {
      this.activeMeleeIndex = idx;
    }
  }

  setRangedIndex(idx) {
    if (idx >= 0 && idx < this.rangedWeapons.length) {
      this.activeRangedIndex = idx;
    }
  }

  update(dt, input, arenaWidth, arenaHeight, game) {
    this.game = game;

    // 1. Rotation: Touch auto-aim, drag aim, or Cursor (Xbox Virtual Cursor / PC Mouse Cursor)
    let rawTargetAngle = Math.atan2(input.mouseY - this.y, input.mouseX - this.x);
    const isRangedFiring = input.gamepadRangedHeld || input.gamepadLtHeld || input.touchRangedHeld;

    let targetAngle = rawTargetAngle;

    // Mobile & Tablet Touch Aim Handling (Drag-to-Aim or Smart Auto-Aim)
    if (input.touchControlsActive) {
      if (input.touchDragAiming) {
        rawTargetAngle = input.touchAimAngle;
        targetAngle = input.touchAimAngle;
        input.mouseX = this.x + Math.cos(targetAngle) * 260;
        input.mouseY = this.y + Math.sin(targetAngle) * 260;
      } else if (game && game.enemies && game.enemies.length > 0) {
        // Nearest enemy auto-aim priority
        let bestTarget = null;
        let bestDistSq = 900 * 900;
        for (let i = 0; i < game.enemies.length; i++) {
          const e = game.enemies[i];
          if (!e || e.hp <= 0 || e.isDying) continue;
          const d2 = distSq(this.x, this.y, e.x, e.y);
          if (d2 < bestDistSq) {
            bestDistSq = d2;
            bestTarget = e;
          }
        }
        if (bestTarget) {
          rawTargetAngle = Math.atan2(bestTarget.y - this.y, bestTarget.x - this.x);
          targetAngle = rawTargetAngle;
          input.mouseX = bestTarget.x;
          input.mouseY = bestTarget.y;
        } else if (input.touchMoveMagnitude > 0.1) {
          rawTargetAngle = Math.atan2(input.touchMoveY, input.touchMoveX);
          targetAngle = rawTargetAngle;
          input.mouseX = this.x + Math.cos(targetAngle) * 220;
          input.mouseY = this.y + Math.sin(targetAngle) * 220;
        }
      } else if (input.touchMoveMagnitude > 0.1) {
        rawTargetAngle = Math.atan2(input.touchMoveY, input.touchMoveX);
        targetAngle = rawTargetAngle;
        input.mouseX = this.x + Math.cos(targetAngle) * 220;
        input.mouseY = this.y + Math.sin(targetAngle) * 220;
      }
    }

    // Smart Soft Aim-Assist / Target Magnetism for Xbox Controller Ranged Weapons
    if (input.gamepadConnected && game && game.enemies) {
      this.aimReticleActive = true;
      const maxLockDist = 750;
      const maxConeAngle = 0.46; // ~26.4 degrees cone
      let bestCandidate = null;
      let bestScore = Infinity;

      for (let i = 0; i < game.enemies.length; i++) {
        const enemy = game.enemies[i];
        if (!enemy || enemy.hp <= 0 || enemy.isDying) continue;

        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const distToShip = Math.hypot(dx, dy);
        if (distToShip > maxLockDist || distToShip < 20) continue;

        const angToEnemy = Math.atan2(dy, dx);
        const angDiff = Math.abs(normalizeAngle(angToEnemy - rawTargetAngle));
        const distFromCursor = Math.hypot(enemy.x - input.mouseX, enemy.y - input.mouseY);

        if (angDiff <= maxConeAngle || distFromCursor < 85) {
          const score = angDiff * 2.0 + (distToShip / maxLockDist) * 0.8 + (distFromCursor / 200) * 0.6;
          if (score < bestScore) {
            bestScore = score;
            bestCandidate = enemy;
          }
        }
      }

      if (bestCandidate) {
        // Haptic feedback tick when snapping onto a newly acquired hostile shape
        if (this.lockedEnemy !== bestCandidate) {
          this.lockedEnemy = bestCandidate;
          if (game.rumble) {
            game.rumble(35, 0.22, 0.12);
          }
        }

        // Smart soft magnetism blend: smoothly draw firing arc towards target center
        const enemyAng = Math.atan2(bestCandidate.y - this.y, bestCandidate.x - this.x);
        const isSeekers = this.equippedRanged && this.equippedRanged.id === 'seekers';
        const magnetStrength = isSeekers ? 0.28 : (isRangedFiring ? 0.68 : 0.46);
        const offset = normalizeAngle(enemyAng - rawTargetAngle);
        targetAngle = rawTargetAngle + offset * magnetStrength;
      } else {
        this.lockedEnemy = null;
      }
    } else {
      this.lockedEnemy = null;
      if (!input.gamepadConnected) {
        this.aimReticleActive = false;
      }
    }

    // Always maintain full cursor visibility when gamepad is connected
    if (input.gamepadConnected) {
      this.aimReticleAlpha = 1.0;
      this.aimReticleActive = true;
    } else {
      this.aimReticleAlpha = Math.max(0, this.aimReticleAlpha - dt * 4);
    }

    // Smooth angle interpolation towards cursor
    let diff = normalizeAngle(targetAngle - this.angle);
    const turnSpeed = input.gamepadConnected ? 26 : 22;
    this.angle += diff * Math.min(1, dt * turnSpeed);

    // Reticle coordinates are directly anchored to the Cursor!
    this.reticleX = input.mouseX;
    this.reticleY = input.mouseY;
    this.aimDistance = Math.hypot(this.reticleX - this.x, this.reticleY - this.y);

    // 2. Dash Logic
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
    }

    if (input.dashPressed && this.dashCooldown <= 0 && !this.isDashing) {
      this.triggerDash(input);
    }

    if (this.isDashing) {
      this.dashTimer -= dt;
      this.dashSpeed = 950 * (this.dashSpeedMult || 1);
      this.vx = this.dashDirX * this.dashSpeed;
      this.vy = this.dashDirY * this.dashSpeed;

      // Spawn dash ghost trail
      if (Math.random() < 0.7) {
        this.afterImages.push({
          x: this.x,
          y: this.y,
          angle: this.angle,
          alpha: 0.6,
          color: (this.hasLightningDash || this.hasPlasmaTrail || this.hasDashDecoy || this.hasDashPlasmaTrail) ? '#00f0ff' : '#00f0ff'
        });
      }

      // Electricity & Plasma Trail along dash path
      if (this.hasLightningDash || this.hasDashPlasmaTrail || this.hasDashDecoy) {
        this.lightningSpawnTimer = (this.lightningSpawnTimer || 0) - dt;
        if (this.lightningSpawnTimer <= 0) {
          this.lightningSpawnTimer = this.hasLightningDash ? 0.022 : 0.045;
          game.spawnElectricTrail(this.x, this.y, this.hasLightningDash ? 140 : 75, 2.4);
        }
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.invulnerable = false;
      }
    } else {
      // Normal Thruster Movement (Keyboard WASD / Arrows + Xbox Analog Left Stick)
      let moveX = 0;
      let moveY = 0;
      if (input.keys['KeyW'] || input.keys['ArrowUp']) moveY -= 1;
      if (input.keys['KeyS'] || input.keys['ArrowDown']) moveY += 1;
      if (input.keys['KeyA'] || input.keys['ArrowLeft']) moveX -= 1;
      if (input.keys['KeyD'] || input.keys['ArrowRight']) moveX += 1;

      let len = Math.hypot(moveX, moveY);
      if (len > 0) {
        moveX /= len;
        moveY /= len;
      }

      // Blend / override with Xbox controller analog left stick input
      if (input.gamepadMoveMagnitude > 0.15) {
        moveX = input.gamepadMoveX;
        moveY = input.gamepadMoveY;
        len = input.gamepadMoveMagnitude;
      }

      // Blend / override with Mobile & Tablet Virtual Analog Joystick input
      if (input.touchMoveMagnitude > 0.05) {
        moveX = input.touchMoveX;
        moveY = input.touchMoveY;
        len = input.touchMoveMagnitude;
      }

      if (len > 0.1) {
        // Proportional analog speed factor for silky controller sensitivity
        const speedFactor = Math.min(1, len);
        const accel = this.speed * this.speedMult * 4.2 * speedFactor;
        const normX = len > 0 ? (moveX / len) : 0;
        const normY = len > 0 ? (moveY / len) : 0;
        this.vx += normX * accel * dt;
        this.vy += normY * accel * dt;

        // Thruster sparks
        if (Math.random() < 0.4) {
          const rearX = this.x - Math.cos(this.angle) * 16;
          const rearY = this.y - Math.sin(this.angle) * 16;
          game.spawnParticle(rearX, rearY, 'thruster', {
            vx: -Math.cos(this.angle) * 150 + (Math.random() - 0.5) * 60,
            vy: -Math.sin(this.angle) * 150 + (Math.random() - 0.5) * 60,
            color: '#00f0ff',
            size: Math.random() * 3 + 2,
            life: 0.25
          });
        }
      }

      // Physics damping
      this.vx *= Math.pow(this.friction, dt * 60);
      this.vy *= Math.pow(this.friction, dt * 60);
    }

    // Apply movement
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Arena boundary clamp
    const pad = 24;
    this.x = Math.max(pad, Math.min(arenaWidth - pad, this.x));
    this.y = Math.max(pad, Math.min(arenaHeight - pad, this.y));

    // After-images decay
    for (let i = this.afterImages.length - 1; i >= 0; i--) {
      this.afterImages[i].alpha -= dt * 3.5;
      if (this.afterImages[i].alpha <= 0) {
        this.afterImages.splice(i, 1);
      }
    }

    // Invulnerability decay
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      if (this.invulnerableTimer <= 0 && !this.isDashing) {
        this.invulnerable = false;
      }
    }

    // Shield Regeneration
    if (this.shieldRechargeTimer > 0) {
      this.shieldRechargeTimer -= dt;
      if (this.combatShieldRegen && this.shield < this.maxShield) {
        this.shield = Math.min(this.maxShield, this.shield + this.shieldRechargeRate * 0.5 * dt);
      }
    } else if (this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + this.shieldRechargeRate * dt);
    }

    // Energy Regeneration
    if (this.energy < this.maxEnergy) {
      this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate * dt);
    }

    // Cooldown updates
    if (this.meleeCooldown > 0) this.meleeCooldown -= dt;
    if (this.rangedCooldown > 0) this.rangedCooldown -= dt;

    // Melee attack animation timer
    if (this.meleeAttackAnim) {
      this.meleeAttackAnim.timer -= dt;
      if (this.meleeAttackAnim.timer <= 0) {
        this.meleeAttackAnim = null;
      }
    }

    // Orbiting blades rotation
    this.orbitAngle += dt * 3.2;

    // Passive Glaives contact damage if equipped
    if (this.equippedMelee.id === 'glaives') {
      this.updatePassiveGlaives(game);
    }

    // Combo timer decay
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }

    // Thruster visual flicker
    this.thrusterFlicker = Math.sin(Date.now() * 0.02) * 4;

    // Handle Attacks (Supports Manual Input + Smart Auto-Combat on Mobile)
    let performedManualMelee = false;
    let performedManualRanged = false;

    if (input.leftMouseDown && this.meleeCooldown <= 0) {
      this.performMeleeAttack(game);
      performedManualMelee = true;
    }

    if (input.rightMouseDown && this.rangedCooldown <= 0) {
      this.performRangedAttack(game);
      performedManualRanged = true;
    }

    // Smart Auto-Combat (Active on Touch / Mobile for silky, one-thumb dodging & automatic weapon engagement)
    if (input.touchControlsActive && game && game.enemies && game.enemies.length > 0) {
      let nearestMeleeTarget = null;
      let minMeleeDist = (this.equippedMelee ? this.equippedMelee.range : 115) * 1.35;
      let nearestRangedTarget = null;
      let minRangedDist = 650;

      for (let i = 0; i < game.enemies.length; i++) {
        const e = game.enemies[i];
        if (!e || e.health <= 0 || e.isDying) continue;
        const d = dist(this.x, this.y, e.x, e.y);

        if (d < minMeleeDist) {
          minMeleeDist = d;
          nearestMeleeTarget = e;
        }
        if (d < minRangedDist) {
          minRangedDist = d;
          nearestRangedTarget = e;
        }
      }

      // Auto-Melee strike when enemy breaches close perimeter
      if (!performedManualMelee && this.meleeCooldown <= 0 && nearestMeleeTarget) {
        this.angle = Math.atan2(nearestMeleeTarget.y - this.y, nearestMeleeTarget.x - this.x);
        this.performMeleeAttack(game);
      }

      // Auto-Ranged discharge towards nearest threat
      if (!performedManualRanged && this.rangedCooldown <= 0 && nearestRangedTarget && !input.touchDragAiming) {
        input.mouseX = nearestRangedTarget.x;
        input.mouseY = nearestRangedTarget.y;
        this.performRangedAttack(game);
      }
    }

    // Ultimate trigger
    if (input.keys['KeyF'] && this.ultimateCharge >= this.ultimateMax) {
      this.triggerUltimate(game);
    }
  }

  triggerDash(input) {
    let dx = 0;
    let dy = 0;
    if (input.keys['KeyW'] || input.keys['ArrowUp']) dy -= 1;
    if (input.keys['KeyS'] || input.keys['ArrowDown']) dy += 1;
    if (input.keys['KeyA'] || input.keys['ArrowLeft']) dx -= 1;
    if (input.keys['KeyD'] || input.keys['ArrowRight']) dx += 1;

    // Use analog gamepad movement vector if deflected
    if (input.gamepadMoveMagnitude > 0.2) {
      dx = input.gamepadMoveX;
      dy = input.gamepadMoveY;
    } else if (input.touchMoveMagnitude > 0.15) {
      dx = input.touchMoveX;
      dy = input.touchMoveY;
    }

    if (dx === 0 && dy === 0) {
      // Dash towards pointing angle if stationary
      dx = Math.cos(this.angle);
      dy = Math.sin(this.angle);
    } else {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    this.isDashing = true;
    this.dashTimer = this.dashDuration;
    this.dashCooldown = this.dashCooldownMax;
    this.dashDirX = dx;
    this.dashDirY = dy;
    this.invulnerable = true;

    window.soundEngine.playDash();
    if (window.gameInstance && window.gameInstance.rumble) {
      window.gameInstance.rumble(80, 0.35, 0.2);
    }

    // Legendary Electricity Trail & Decoy detonation
    if (this.hasLightningDash || this.hasDashDecoy || this.hasDashPlasmaTrail || this.hasPlasmaTrail) {
      if (window.soundEngine && window.soundEngine.playElectricZap) {
        window.soundEngine.playElectricZap();
      }
      if (window.gameInstance && window.gameInstance.spawnElectricTrail) {
        window.gameInstance.spawnElectricTrail(this.x, this.y, 160, 2.4);
      }
      const decoyX = this.x;
      const decoyY = this.y;
      setTimeout(() => {
        if (window.gameInstance) {
          window.gameInstance.spawnShockwave(decoyX, decoyY, 130, '#00f0ff', 90);
          window.gameInstance.spawnSparks(decoyX, decoyY, '#00f0ff', 18);
        }
      }, 260);
    }
  }

  performMeleeAttack(game) {
    const weapon = this.equippedMelee;
    this.meleeCooldown = weapon.cooldown;

    // Audio
    if (window.soundEngine[weapon.sound]) {
      window.soundEngine[weapon.sound]();
    }

    // Haptic feedback
    if (game && game.rumble) {
      if (weapon.id === 'hammer') game.rumble(160, 0.5, 0.85);
      else if (weapon.id === 'lance') game.rumble(100, 0.35, 0.5);
      else if (weapon.id === 'glaives') game.rumble(60, 0.2, 0.2);
      else game.rumble(75, 0.25, 0.35); // katana
    }

    const reach = weapon.range * this.meleeRangeMult;
    const arc = weapon.arcAngle;

    this.meleeAttackAnim = {
      type: weapon.id,
      timer: weapon.duration,
      maxTimer: weapon.duration,
      angle: this.angle,
      range: reach,
      arc: arc,
      color: weapon.color,
      trailColor: weapon.trailColor
    };

    // Lance lunges forward
    if (weapon.lungeForce) {
      this.vx += Math.cos(this.angle) * weapon.lungeForce;
      this.vy += Math.sin(this.angle) * weapon.lungeForce;
    }

    // Vorpal Wave upgrade releases projectile
    if (this.hasVorpalWave && (weapon.id === 'katana' || weapon.id === 'lance')) {
      game.projectiles.push(new Projectile({
        x: this.x + Math.cos(this.angle) * 20,
        y: this.y + Math.sin(this.angle) * 20,
        vx: Math.cos(this.angle) * 850,
        vy: Math.sin(this.angle) * 850,
        damage: weapon.damage * 0.55 * (this.meleeDamageMult || 1),
        color: weapon.color,
        isMeleeWave: true,
        pierce: this.vorpalInfinitePierce ? 999 : 3,
        owner: 'player',
        radius: 14
      }));
    }

    // Hammer shockwave
    if (weapon.id === 'hammer') {
      game.spawnShockwave(this.x, this.y, weapon.shockwaveRadius, weapon.color, weapon.damage * (this.meleeDamageMult || 1));
      game.screenShake(7, 0.2);
    }

    // Perform melee collision detection against all active enemies
    let hitCount = 0;
    const attackAngle = this.angle;

    game.enemies.forEach(enemy => {
      const d = dist(this.x, this.y, enemy.x, enemy.y);
      if (d <= reach + enemy.radius) {
        // Angle check
        const enemyAngle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
        const angDiff = Math.abs(normalizeAngle(enemyAngle - attackAngle));

        if (angDiff <= arc / 2 || weapon.id === 'hammer') {
          // HIT!
          hitCount++;
          let dmg = weapon.damage * (this.meleeDamageMult || 1);

          // Tip critical multiplier for lance
          if (weapon.id === 'lance' && d >= reach * 0.7) {
            dmg *= weapon.tipCritMultiplier;
            game.spawnFloatingText(enemy.x, enemy.y, 'CRIT TIP!', '#00ff88');
          }

          // Synergy bonus: Vulnerable enemies take massive extra melee damage
          if (enemy.vulnerableTimer > 0) {
            dmg *= (1.6 * this.synergyBonus);
            game.spawnFloatingText(enemy.x, enemy.y - 12, 'VULNERABLE!', '#ffb700');
          }

          // Apply damage
          const isDead = enemy.takeDamage(dmg, game, 'melee');

          // Knockback
          const kbAngle = Math.atan2(enemy.y - this.y, enemy.x - this.x);
          enemy.vx += Math.cos(kbAngle) * weapon.knockback;
          enemy.vy += Math.sin(kbAngle) * weapon.knockback;

          // Spark particles
          game.spawnSparks(enemy.x, enemy.y, weapon.color, 10);

          // On-kill effects (Explosive Nova & Nanite Siphon)
          if (isDead) {
            if (this.meleeExplosiveNova && game && game.spawnShockwave) {
              game.spawnShockwave(enemy.x, enemy.y, 160, '#ff0055', 60);
              game.spawnSparks(enemy.x, enemy.y, '#ff0055', 14);
            }
            if (this.meleeLifesteal > 0) {
              this.health = Math.min(this.maxHealth, this.health + this.meleeLifesteal);
              this.shield = Math.min(this.maxShield, this.shield + 15);
              game.spawnFloatingText(this.x, this.y, `+${this.meleeLifesteal} HULL`, '#00ff88');
            }
          }
        }
      }
    });

    // Deflect hostile projectiles if weapon supports deflection
    if (weapon.deflectsBullets) {
      this.deflectProjectiles(game, reach, arc);
    }

    // Build Synergy, Energy & Combos on successful melee hits
    if (hitCount > 0) {
      this.addSynergy(18 * hitCount);
      this.addCombo(hitCount);
      // Melee hits siphon kinetic energy back to player
      this.energy = Math.min(this.maxEnergy, this.energy + (12 * hitCount));
    }
  }

  deflectProjectiles(game, reach, arc) {
    for (let i = game.projectiles.length - 1; i >= 0; i--) {
      const p = game.projectiles[i];
      if (p.owner === 'enemy') {
        const d = dist(this.x, this.y, p.x, p.y);
        if (d <= reach + 25) {
          const pAngle = Math.atan2(p.y - this.y, p.x - this.x);
          const angDiff = Math.abs(normalizeAngle(pAngle - this.angle));

          if (angDiff <= arc / 2 + 0.2) {
            // PARRY / DEFLECT!
            p.owner = 'player';
            // Reverse velocity toward cursor / mouse
            const refAngle = Math.atan2(game.input.mouseY - p.y, game.input.mouseX - p.x);
            const spd = Math.hypot(p.vx, p.vy) * (this.deflectSpeedMult || 1.35);
            p.vx = Math.cos(refAngle) * spd;
            p.vy = Math.sin(refAngle) * spd;
            p.color = '#00f0ff';
            p.damage *= (this.deflectAmplified ? 3.5 : (2.0 * (this.deflectDamageBonus || 1)));
            if (this.deflectExplosions) p.cluster = true;

            if (this.deflectCounterPulse && game && game.spawnShockwave) {
              game.spawnShockwave(this.x, this.y, 140, '#00ff88');
            }

            window.soundEngine.playDeflection();
            game.spawnFloatingText(p.x, p.y, 'PARRY!', '#00f0ff');
            game.spawnSparks(p.x, p.y, '#00f0ff', 8);
          }
        }
      }
    }
  }

  updatePassiveGlaives(game) {
    const orbitCount = this.equippedMelee.orbitBladesCount || 3;
    const orbitDist = 65;

    for (let i = 0; i < orbitCount; i++) {
      const ang = this.orbitAngle + (i * (Math.PI * 2 / orbitCount));
      const bx = this.x + Math.cos(ang) * orbitDist;
      const by = this.y + Math.sin(ang) * orbitDist;

      // Check collision with enemies
      game.enemies.forEach(enemy => {
        if (dist(bx, by, enemy.x, enemy.y) < enemy.radius + 12) {
          enemy.takeDamage(this.equippedMelee.damage * 0.12, game, 'melee');
          enemy.vx += Math.cos(ang) * 40;
          enemy.vy += Math.sin(ang) * 40;
        }
      });

      // Deflect near bullets
      game.projectiles.forEach(p => {
        if (p.owner === 'enemy' && dist(bx, by, p.x, p.y) < 18) {
          p.owner = 'player';
          p.vx = -p.vx * 1.2;
          p.vy = -p.vy * 1.2;
          p.color = '#aa33ff';
          window.soundEngine.playDeflection();
        }
      });
    }
  }

  performRangedAttack(game) {
    const weapon = this.equippedRanged;
    const baseEnergy = weapon.energyCost || (weapon.id === 'railgun' ? 15 : 0);
    const energyRequired = Math.round(baseEnergy * (this.globalEnergyCostMult || 1) * (this.rangedEnergyDiscount || 1));

    // Energy requirement check
    if (this.energy < energyRequired) {
      this.rangedCooldown = 0.22;
      game.spawnFloatingText(this.x, this.y - 18, `NEED ${energyRequired} ENERGY!`, '#aa33ff');
      window.soundEngine.playDeflection();
      return;
    }

    // Deduct energy cost
    this.energy = Math.max(0, this.energy - energyRequired);
    this.rangedCooldown = weapon.cooldown;

    // Overcharge bonus: If synergy meter is full, ranged attack deals 2x damage and triggers explosion
    let isOverchargeShot = this.synergyMeter >= 100;
    let dmgMult = (isOverchargeShot ? 2.0 : 1.0) * (this.rangedDamageMult || 1);
    if (isOverchargeShot) {
      this.synergyMeter = 0; // Consume overcharge
      game.spawnFloatingText(this.x, this.y - 18, 'OVERCHARGED DISCHARGE!', '#ffb700');
    }

    if (window.soundEngine[weapon.sound]) {
      window.soundEngine[weapon.sound]();
    }

    if (weapon.shake) {
      game.screenShake(weapon.shake, 0.15);
    }

    // Haptic feedback
    if (game && game.rumble) {
      if (weapon.id === 'railgun') game.rumble(130, 0.35, 0.7);
      else if (weapon.id === 'flak') game.rumble(140, 0.5, 0.6);
      else if (weapon.id === 'void_orb') game.rumble(120, 0.4, 0.5);
      else if (weapon.id === 'seekers') game.rumble(90, 0.3, 0.3);
      else game.rumble(80, 0.25, 0.25);
    }

    const tipX = this.x + Math.cos(this.angle) * 20;
    const tipY = this.y + Math.sin(this.angle) * 20;

    // Weapon specific behaviors
    if (weapon.id === 'railgun') {
      // Instant beam line trace
      const maxBeamDist = weapon.range;
      const endX = tipX + Math.cos(this.angle) * maxBeamDist;
      const endY = tipY + Math.sin(this.angle) * maxBeamDist;

      game.beams.push({
        x1: tipX,
        y1: tipY,
        x2: endX,
        y2: endY,
        color: weapon.color,
        alpha: 1.0,
        decay: 3.5,
        width: isOverchargeShot ? 8 : 4
      });

      // Check beam line vs circles
      let hits = 0;
      game.enemies.forEach(enemy => {
        // Line-point distance
        const lDist = pointToSegmentDist(enemy.x, enemy.y, tipX, tipY, endX, endY);
        if (lDist <= enemy.radius + 12) {
          hits++;
          enemy.takeDamage(weapon.damage * dmgMult, game, 'ranged');
          enemy.applyVulnerability(this.vulnerabilityDuration || 4.0); // Ranged applies melee vulnerability!
          game.spawnSparks(enemy.x, enemy.y, weapon.color, 12);
        }
      });

      if (hits > 0) {
        this.addCombo(hits);
      }

      // Hyper Discharge: spawn electric plasma trail along beam line
      if (this.hasPlasmaTrail && game.spawnElectricTrail) {
        const steps = 14;
        for (let s = 0; s <= steps; s++) {
          const px = tipX + (endX - tipX) * (s / steps);
          const py = tipY + (endY - tipY) * (s / steps);
          game.spawnElectricTrail(px, py, 110, 1.8);
        }
      }
    } else if (weapon.id === 'seekers') {
      const count = (weapon.projectilesPerShot || 3) + this.extraProjectiles;
      for (let i = 0; i < count; i++) {
        const spreadAng = (i - (count - 1) / 2) * (weapon.spread / count);
        const launchAng = this.angle + spreadAng;
        const pSpd = weapon.projectileSpeed * (this.projectileSpeedMult || 1);
        game.projectiles.push(new Projectile({
          x: tipX,
          y: tipY,
          vx: Math.cos(launchAng) * pSpd,
          vy: Math.sin(launchAng) * pSpd,
          damage: weapon.damage * dmgMult,
          color: weapon.color,
          owner: 'player',
          homing: true,
          lifetime: weapon.lifetime,
          radius: 5,
          cluster: this.clusterExplosions
        }));
      }
    } else if (weapon.id === 'tri_laser') {
      const count = (weapon.projectilesPerShot || 3) + this.extraProjectiles;
      for (let i = 0; i < count; i++) {
        const spreadAng = (i - (count - 1) / 2) * weapon.spread;
        const boltAng = this.angle + spreadAng;
        const pSpd = weapon.projectileSpeed * (this.projectileSpeedMult || 1);
        game.projectiles.push(new Projectile({
          x: tipX,
          y: tipY,
          vx: Math.cos(boltAng) * pSpd,
          vy: Math.sin(boltAng) * pSpd,
          damage: weapon.damage * dmgMult,
          color: weapon.color,
          owner: 'player',
          lifetime: weapon.lifetime,
          pierce: this.bonusPiercing,
          radius: 4
        }));
      }
    } else if (weapon.id === 'flak') {
      const count = (weapon.projectilesPerShot || 7) + this.extraProjectiles;
      for (let i = 0; i < count; i++) {
        const spreadAng = (Math.random() - 0.5) * weapon.spread;
        const spd = weapon.projectileSpeed * (0.85 + Math.random() * 0.3) * (this.projectileSpeedMult || 1);
        const flakAng = this.angle + spreadAng;
        game.projectiles.push(new Projectile({
          x: tipX,
          y: tipY,
          vx: Math.cos(flakAng) * spd,
          vy: Math.sin(flakAng) * spd,
          damage: weapon.damage * dmgMult,
          color: weapon.color,
          owner: 'player',
          lifetime: weapon.lifetime,
          radius: 3.5,
          knockback: weapon.knockback
        }));
      }
    } else if (weapon.id === 'void_orb') {
      const pSpd = weapon.projectileSpeed * (this.projectileSpeedMult || 1);
      game.projectiles.push(new Projectile({
        x: tipX,
        y: tipY,
        vx: Math.cos(this.angle) * pSpd,
        vy: Math.sin(this.angle) * pSpd,
        damage: weapon.damage * dmgMult,
        color: weapon.color,
        owner: 'player',
        lifetime: weapon.lifetime,
        isVoidOrb: true,
        pullRadius: weapon.pullRadius,
        pullForce: weapon.pullForce,
        radius: 9
      }));
    }
  }

  triggerUltimate(game) {
    if (this.ultimateCharge < this.ultimateMax) return;
    this.ultimateCharge = 0;
    window.soundEngine.playUltimateBlast();
    game.screenShake(14, 0.45);
    if (game && game.rumble) {
      game.rumble(450, 0.85, 1.0);
    }

    // Super Nova Shockwave wiping bullets and obliterating nearby foes
    game.spawnShockwave(this.x, this.y, 450, '#aa33ff', 350);

    // Deflect/destroy all enemy bullets on screen
    game.projectiles.forEach(p => {
      if (p.owner === 'enemy') {
        p.owner = 'player';
        p.vx = -p.vx * 1.5;
        p.vy = -p.vy * 1.5;
      }
    });

    game.spawnFloatingText(this.x, this.y - 28, 'SUPER NOVA DETONATION!', '#aa33ff');
  }

  triggerVacuumMagnet(game, pulseRadius = 500, vacuumSpeed = 900, label = 'MAGNET PULSE!', color = '#00f0ff', isFullMap = false) {
    if (!game) game = window.gameInstance;
    if (!game) return;

    if (window.soundEngine && window.soundEngine.playLevelUp) {
      window.soundEngine.playLevelUp();
    }
    if (game.rumble) {
      game.rumble(160, 0.35, 0.45);
    }

    // Spawn tier-matched magnetic vacuum shockwave
    game.spawnShockwave(this.x, this.y, pulseRadius, color);
    game.spawnFloatingText(this.x, this.y - 32, label, color, 20);

    // Pull gems within pulse radius (or full map only if isFullMap is true)
    if (game.gems && game.gems.length > 0) {
      game.gems.forEach(gem => {
        const d = dist(this.x, this.y, gem.x, gem.y);
        if (isFullMap || d <= pulseRadius) {
          gem.isVacuumed = true;
          const ang = Math.atan2(this.y - gem.y, this.x - gem.x);
          gem.vx = Math.cos(ang) * vacuumSpeed;
          gem.vy = Math.sin(ang) * vacuumSpeed;
        }
      });
    }
  }

  addSynergy(amount) {
    this.synergyMeter = Math.min(100, this.synergyMeter + amount);
  }

  addCombo(hits = 1) {
    this.combo += hits * 0.2;
    this.comboTimer = 2.8; // seconds before combo drops
    if (this.combo > this.highestCombo) {
      this.highestCombo = Math.floor(this.combo * 10) / 10;
    }
  }

  addUltimate(amount = 4) {
    this.ultimateCharge = Math.min(this.ultimateMax, this.ultimateCharge + amount);
  }

  takeDamage(amount, game) {
    if (this.invulnerable || this.isDashing) return;

    // Reset shield recharge cooldown
    this.shieldRechargeTimer = this.shieldRechargeDelay;

    // Absorb with shield first
    if (this.shield > 0) {
      if (this.shield >= amount) {
        this.shield -= amount;
        amount = 0;
        window.soundEngine.playDeflection();
        game.spawnSparks(this.x, this.y, '#00f0ff', 6);
      } else {
        amount -= this.shield;
        this.shield = 0;
        window.soundEngine.playShieldBreak();
        game.spawnFloatingText(this.x, this.y - 12, 'SHIELD DOWN!', '#00f0ff');
        if (this.hasShieldNova && game && game.spawnShockwave) {
          game.spawnShockwave(this.x, this.y, 220, '#00f0ff', 40);
          game.spawnFloatingText(this.x, this.y - 28, 'KINETIC BARRIER BURST!', '#00f0ff');
        }
      }
    }

    if (amount > 0) {
      this.health -= amount;
      window.soundEngine.playEnemyHit();
      game.screenShake(6, 0.15);
      game.spawnSparks(this.x, this.y, '#ff3366', 12);
    }

    if (game && game.rumble) {
      game.rumble(160, 0.5, 0.8);
    }

    // Always grant brief invulnerability i-frames on any hit (shield or hull)
    // so enemy bullets or contacts don't stick or multi-hit every frame
    this.invulnerable = true;
    this.invulnerableTimer = 0.32;

    if (this.health <= 0) {
      this.health = 0;
      game.gameOver();
    }
  }

  addXP(amount, game) {
    this.xp += amount;
    this.score += Math.round(amount * this.combo * 10);

    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.round(this.xpToNext * 1.55 + 40);
      game.spawnShockwave(this.x, this.y, 160, '#ffb700');
      game.spawnFloatingText(this.x, this.y - 45, `LEVEL UP! [LVL ${this.level}]`, '#ffb700', 30);
      game.triggerLevelUp();
    }
  }

  draw(ctx, game = this.game) {
    // 1. Draw After-Images (dash trail)
    this.afterImages.forEach(img => {
      ctx.save();
      ctx.translate(img.x, img.y);
      ctx.rotate(img.angle);
      ctx.globalAlpha = img.alpha;
      ctx.strokeStyle = img.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-14, -13);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, 13);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Invulnerability blink
    if (this.invulnerable && Math.floor(Date.now() / 60) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // 2. Thruster Plasma Flares (Dual exhaust behind triangle)
    const flameSize = 14 + this.thrusterFlicker;
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 14;

    // Left fin thruster
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(-16 - flameSize, -10);
    ctx.lineTo(-10, -5);
    ctx.closePath();
    ctx.fill();

    // Right fin thruster
    ctx.beginPath();
    ctx.moveTo(-16, 10);
    ctx.lineTo(-16 - flameSize, 10);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();

    // 3. Player Triangle Main Body (Bold, high-visibility cyber profile)
    ctx.shadowColor = this.synergyMeter >= 100 ? '#ffb700' : '#00f0ff';
    ctx.shadowBlur = this.synergyMeter >= 100 ? 22 : 14;
    ctx.strokeStyle = this.synergyMeter >= 100 ? '#ffb700' : '#00f0ff';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#101d32';

    ctx.beginPath();
    // Front Nose apex
    ctx.moveTo(28, 0);
    // Right wingtip
    ctx.lineTo(-18, 18);
    // Rear engine notch
    ctx.lineTo(-10, 0);
    // Left wingtip
    ctx.lineTo(-18, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner glowing power chevron / triangle core
    ctx.fillStyle = this.equippedMelee ? this.equippedMelee.color : '#00f0ff';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-6, 7);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-6, -7);
    ctx.closePath();
    ctx.fill();

    // 4. Melee Weapon Attachment Indicator (Forward energy emitter)
    ctx.strokeStyle = this.equippedMelee ? this.equippedMelee.color : '#00f0ff';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(34, 0);
    ctx.stroke();

    ctx.restore();

    // 5. Draw Melee Slash Arc or Thrust Animation
    if (this.meleeAttackAnim) {
      this.drawMeleeAttack(ctx);
    }

    // 6. Draw Orbiting Glaives (if equipped)
    if (this.equippedMelee.id === 'glaives') {
      this.drawOrbitingGlaives(ctx);
    }

    // 7. Shield Bubble Glow (if shield active)
    if (this.shield > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, 26, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.25 + (this.shield / this.maxShield) * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Magnetic Field Perimeter Ring (when magnet power is active)
    if (this.hasMagnetPower && this.magnetRadius > 180) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.magnetRadius, 0, Math.PI * 2);
      const pulseAlpha = 0.08 + Math.sin(Date.now() * 0.004) * 0.04;
      ctx.strokeStyle = `rgba(0, 240, 255, ${pulseAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 14]);
      ctx.stroke();
      ctx.restore();
    }

    // 9. Ranged Weapon Aiming System (Xbox Controller holographic HUD & Laser Sight)
    this.drawRangedAimingSystem(ctx, game || this.game);
  }

  drawRangedAimingSystem(ctx, game) {
    if (this.aimReticleAlpha <= 0.01) return;

    const weapon = this.equippedRanged;
    if (!weapon) return;

    const color = weapon.color || '#00f0ff';
    const alpha = this.aimReticleAlpha;
    const now = Date.now();
    const pulse = Math.sin(now * 0.007);

    ctx.save();

    // 1. Void Vortex Gravity Horizon Guide (circular AOE boundary around impact point)
    if (weapon.id === 'void_orb') {
      const pullR = weapon.pullRadius || 120;
      ctx.save();
      ctx.globalAlpha = alpha * 0.24;
      ctx.strokeStyle = '#aa33ff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(this.reticleX, this.reticleY, pullR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Floating Cyber Crosshair Reticle (Clean, line-free ring and pip)
    // When gamepad virtual DOM cursor is active, the DOM element renders the cursor.
    // When playing on keyboard/mouse fallback, canvas renders the clean line-free ring and pip.
    const isGamepad = game && game.input && game.input.gamepadConnected;
    if (!isGamepad) {
      const rx = this.reticleX;
      const ry = this.reticleY;
      const ringRadius = 14 + (this.lockedEnemy ? 2 + pulse * 1.5 : 0);

      ctx.save();
      ctx.translate(rx, ry);
      ctx.globalAlpha = alpha * 0.85;

      // Reticle Center Dot
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 2, 0, Math.PI * 2);
      ctx.fill();

      // Clean outer circular ring (zero crosshair or connecting lines)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // 3. Target Lock-On Brackets [  ] (When locked on hostile shape)
    if (this.lockedEnemy && this.lockedEnemy.hp > 0 && !this.lockedEnemy.isDying) {
      const target = this.lockedEnemy;
      const tRadius = target.radius || 20;
      const boxSize = tRadius + 12 + pulse * 2;
      const corner = 8;

      ctx.save();
      ctx.translate(target.x, target.y);
      ctx.globalAlpha = alpha * (0.85 + pulse * 0.15);
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.2;

      // Top-Left Corner
      ctx.beginPath();
      ctx.moveTo(-boxSize, -boxSize + corner);
      ctx.lineTo(-boxSize, -boxSize);
      ctx.lineTo(-boxSize + corner, -boxSize);
      ctx.stroke();

      // Top-Right Corner
      ctx.beginPath();
      ctx.moveTo(boxSize - corner, -boxSize);
      ctx.lineTo(boxSize, -boxSize);
      ctx.lineTo(boxSize, -boxSize + corner);
      ctx.stroke();

      // Bottom-Left Corner
      ctx.beginPath();
      ctx.moveTo(-boxSize, boxSize - corner);
      ctx.lineTo(-boxSize, boxSize);
      ctx.lineTo(-boxSize + corner, boxSize);
      ctx.stroke();

      // Bottom-Right Corner
      ctx.beginPath();
      ctx.moveTo(boxSize - corner, boxSize);
      ctx.lineTo(boxSize, boxSize);
      ctx.lineTo(boxSize, boxSize - corner);
      ctx.stroke();

      // Target Lock Diamond Pip
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -boxSize - 4);
      ctx.lineTo(4, -boxSize);
      ctx.lineTo(0, -boxSize + 4);
      ctx.lineTo(-4, -boxSize);
      ctx.closePath();
      ctx.fill();

      // Cyber Lock Text
      ctx.font = 'bold 9px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.fillText(`LOCK // ${Math.ceil(target.hp)} HP`, 0, -boxSize - 6);

      ctx.restore();
    }

    ctx.restore();
  }

  drawMeleeAttack(ctx) {
    const anim = this.meleeAttackAnim;
    const progress = 1 - (anim.timer / anim.maxTimer);

    ctx.save();
    ctx.translate(this.x, this.y);

    if (anim.type === 'katana') {
      // Arcing sweeping energy slash
      const startA = anim.angle - anim.arc / 2 + (anim.arc * progress);
      const sweepA = anim.arc * 0.55;

      ctx.beginPath();
      ctx.arc(0, 0, anim.range, startA - sweepA, startA);
      ctx.strokeStyle = anim.color;
      ctx.lineWidth = 6 * (1 - progress);
      ctx.shadowColor = anim.color;
      ctx.shadowBlur = 16;
      ctx.stroke();

      // Blade trail wedge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, anim.range, startA - sweepA, startA);
      ctx.closePath();
      ctx.fillStyle = anim.trailColor;
      ctx.globalAlpha = 0.25 * (1 - progress);
      ctx.fill();
    } else if (anim.type === 'lance') {
      // Direct kinetic thrust line
      ctx.rotate(anim.angle);
      const thrustReach = anim.range * Math.sin(progress * Math.PI);

      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(18 + thrustReach, 0);
      ctx.strokeStyle = anim.color;
      ctx.lineWidth = 4;
      ctx.shadowColor = anim.color;
      ctx.shadowBlur = 14;
      ctx.stroke();

      // Sharp arrowhead tip
      ctx.beginPath();
      ctx.moveTo(18 + thrustReach, 0);
      ctx.lineTo(18 + thrustReach - 16, -6);
      ctx.lineTo(18 + thrustReach - 16, 6);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    ctx.restore();
  }

  drawOrbitingGlaives(ctx) {
    const orbitCount = this.equippedMelee.orbitBladesCount || 3;
    const orbitDist = 65;

    for (let i = 0; i < orbitCount; i++) {
      const ang = this.orbitAngle + (i * (Math.PI * 2 / orbitCount));
      const bx = this.x + Math.cos(ang) * orbitDist;
      const by = this.y + Math.sin(ang) * orbitDist;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(this.orbitAngle * 4);

      // Mini spinning razor triangle
      ctx.fillStyle = '#aa33ff';
      ctx.shadowColor = '#aa33ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-6, -6);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }
}

/**
 * ENEMY GEOMETRIC CLASSES
 */
class Enemy {
  constructor(x, y, type = 'scout', wave = 1) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.type = type;
    this.angle = 0;
    this.wave = wave;

    // Vulnerability status (applied by ranged weapons)
    this.vulnerableTimer = 0;

    this.isEliminated = false;

    // Setup by type
    this.setupType();
  }

  setupType() {
    switch (this.type) {
      case 'scout': // Fast Darting Triangle
        this.radius = 14;
        this.maxHealth = 32 + this.wave * 7;
        this.health = this.maxHealth;
        this.speed = 145 + Math.min(65, this.wave * 5);
        this.damage = 14;
        this.color = '#ff3366';
        this.scoreVal = 80;
        this.xpVal = 14;
        this.shootTimer = 3.0 + Math.random() * 2;
        break;

      case 'cube': // Heavy Armored Square (Frontal shield)
        this.radius = 20;
        this.maxHealth = 95 + this.wave * 15;
        this.health = this.maxHealth;
        this.speed = 70;
        this.damage = 20;
        this.color = '#ff9900';
        this.hasFrontalShield = true;
        this.scoreVal = 160;
        this.xpVal = 26;
        this.shootTimer = 3.6;
        break;

      case 'pentagon': // Pulsing Pentagon Shooter
        this.radius = 24;
        this.maxHealth = 130 + this.wave * 25;
        this.health = this.maxHealth;
        this.speed = 100;
        this.damage = 22;
        this.color = '#00ff88';
        this.scoreVal = 220;
        this.xpVal = 35;
        this.shootTimer = 2.0;
        break;

      case 'sniper': // Hexagon Long-range Sniper
        this.radius = 20;
        this.maxHealth = 90 + this.wave * 18;
        this.health = this.maxHealth;
        this.speed = 65;
        this.damage = 45;
        this.color = '#00f0ff';
        this.scoreVal = 260;
        this.xpVal = 40;
        this.shootTimer = 3.5;
        this.telegraphTimer = 0;
        break;

      case 'rhombus': // Kamikaze Explosive Diamond
        this.radius = 16;
        this.maxHealth = 40 + this.wave * 10;
        this.health = this.maxHealth;
        this.speed = 240;
        this.damage = 50;
        this.color = '#ff0055';
        this.scoreVal = 120;
        this.xpVal = 18;
        this.isKamikaze = true;
        break;

      case 'boss_colossus': // The Octagon Colossus (Wave 5) - Tuned for engaging, balanced apex combat
        this.radius = 65;
        this.maxHealth = 1900 + this.wave * 240; // 3100 HP in Wave 5 (tuned up from 2500 HP for a touch more challenge)
        this.health = this.maxHealth;
        this.speed = 42; // Up from 36 to 42 for a touch more engaging pursuit
        this.damage = 26; // Contact damage tuned from 22 to 26
        this.color = '#ffb700';
        this.isBoss = true;
        this.scoreVal = 3500;
        this.xpVal = 380;
        this.bossPhase = 1;
        this.shootTimer = 2.0; // Paced start
        this.halfHealthTriggered = false;
        break;

      case 'boss_omega': // The Dread Omega Triangle (Wave 10)
        this.radius = 55;
        this.maxHealth = 4500 + this.wave * 1000;
        this.health = this.maxHealth;
        this.speed = 130;
        this.damage = 55;
        this.color = '#aa33ff';
        this.isBoss = true;
        this.scoreVal = 7500;
        this.xpVal = 750;
        this.bossPhase = 1;
        this.dashAttackTimer = 4.0;
        this.shootTimer = 0.8;
        break;
    }
  }

  applyVulnerability(duration) {
    this.vulnerableTimer = Math.max(this.vulnerableTimer, duration);
  }

  takeDamage(amount, game, attackSource = 'unknown') {
    this.health -= amount;
    window.soundEngine.playEnemyHit();

    // Damage number popup
    const isCrit = attackSource === 'melee' && this.vulnerableTimer > 0;
    const txtColor = isCrit ? '#ffdd00' : (attackSource === 'melee' ? '#00f0ff' : '#ff3366');
    game.spawnFloatingText(this.x, this.y, Math.round(amount).toString(), txtColor);

    // Colossus (Level 5 Boss) 50% HP Armor Fracture: Drops 3 repair gems and initiates Phase 2 Overcharge
    if (this.type === 'boss_colossus' && this.health <= this.maxHealth * 0.5 && !this.halfHealthTriggered && this.health > 0) {
      this.halfHealthTriggered = true;
      this.bossPhase = 2;
      this.speed = 46; // Phase 2 increased agility
      if (game.spawnFloatingText) {
        game.spawnFloatingText(this.x, this.y - 36, 'ARMOR FRACTURE // OVERCHARGED!', '#ff8800', 20);
      }
      if (game.spawnShockwave) {
        game.spawnShockwave(this.x, this.y, 160, '#ff8800');
      }
      if (game.gems) {
        for (let g = 0; g < 3; g++) {
          game.gems.push(new Gem(
            this.x + (Math.random() - 0.5) * 60,
            this.y + (Math.random() - 0.5) * 60,
            25
          ));
        }
      }
      this.shootTimer = 2.2; // Breather window before Phase 2 barrages resume
    }

    if (this.health <= 0) {
      this.health = 0;
      this.die(game);
      return true; // was eliminated
    }
    return false;
  }

  die(game) {
    if (this.isEliminated) return;
    this.isEliminated = true;

    if (!game) game = window.gameInstance;

    // Charge Player's Ultimate: +4% per defeated enemy (+20% for apex bosses)
    if (game && game.player) {
      game.player.addUltimate(this.isBoss ? 20 : 4);
    }

    window.soundEngine.playExplosion(this.isBoss);

    // Spawn scrap / XP gem drops
    const gemCount = this.isBoss ? 15 : (this.type === 'cube' ? 3 : 1);
    for (let i = 0; i < gemCount; i++) {
      game.gems.push(new Gem(
        this.x + (Math.random() - 0.5) * 30,
        this.y + (Math.random() - 0.5) * 30,
        this.xpVal / gemCount
      ));
    }

    // Debris shards explosion
    game.spawnSparks(this.x, this.y, this.color, this.isBoss ? 50 : 16);

    // Screen shake on boss death
    if (this.isBoss) {
      game.screenShake(16, 0.6);
      game.showToast('BOSS DESTROYED', 'Sector threat neutralized!', '#00ff88');
    }
  }

  update(dt, player, game) {
    if (this.vulnerableTimer > 0) {
      this.vulnerableTimer -= dt;
    }

    const d = dist(this.x, this.y, player.x, player.y);
    const toPlayerAngle = Math.atan2(player.y - this.y, player.x - this.x);
    this.angle = toPlayerAngle;

    // AI movement behavior
    if (this.type === 'sniper') {
      // Keep distance around 350-450px
      if (d < 320) {
        // Back away
        this.vx = -Math.cos(toPlayerAngle) * this.speed;
        this.vy = -Math.sin(toPlayerAngle) * this.speed;
      } else if (d > 500) {
        // Move closer
        this.vx = Math.cos(toPlayerAngle) * this.speed;
        this.vy = Math.sin(toPlayerAngle) * this.speed;
      } else {
        // Strafe
        this.vx = -Math.sin(toPlayerAngle) * this.speed * 0.8;
        this.vy = Math.cos(toPlayerAngle) * this.speed * 0.8;
      }
    } else {
      // Direct pursuit
      this.vx = Math.cos(toPlayerAngle) * this.speed;
      this.vy = Math.sin(toPlayerAngle) * this.speed;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Separation from player (prevent enemies from sticking/clipping onto player)
    const minDist = this.radius + player.radius + 8;
    if (d < minDist && d > 0.001) {
      const overlap = minDist - d;
      const pushX = (this.x - player.x) / d;
      const pushY = (this.y - player.y) / d;
      this.x += pushX * overlap * 0.9;
      this.y += pushY * overlap * 0.9;

      // Contact damage with repulsion bounce so enemy cannot glue to ship
      if (d < this.radius + player.radius) {
        player.takeDamage(this.damage, game);
        if (this.isKamikaze) {
          this.health = 0;
          this.die(game);
          return;
        }
        // Knock enemy back
        this.vx += pushX * 260;
        this.vy += pushY * 260;
      }
    }

    // Shooting behaviors
    this.shootTimer -= dt;
    if (this.shootTimer <= 0) {
      this.fireWeapons(player, game);
    }
  }

  fireWeapons(player, game) {
    const toPlayerAngle = Math.atan2(player.y - this.y, player.x - this.x);

    if (this.type === 'scout') {
      this.shootTimer = 3.2 + Math.random() * 2;
      game.projectiles.push(new Projectile({
        x: this.x,
        y: this.y,
        vx: Math.cos(toPlayerAngle) * 520,
        vy: Math.sin(toPlayerAngle) * 520,
        damage: 14,
        color: this.color,
        owner: 'enemy',
        radius: 4
      }));
    } else if (this.type === 'cube') {
      this.shootTimer = 3.5;
      // Heavy slow slug
      game.projectiles.push(new Projectile({
        x: this.x,
        y: this.y,
        vx: Math.cos(toPlayerAngle) * 420,
        vy: Math.sin(toPlayerAngle) * 420,
        damage: 25,
        color: this.color,
        owner: 'enemy',
        radius: 7
      }));
    } else if (this.type === 'pentagon') {
      this.shootTimer = 2.8;
      // Radial ring of 5 pellets
      for (let i = 0; i < 5; i++) {
        const ang = toPlayerAngle + (i * (Math.PI * 2 / 5));
        game.projectiles.push(new Projectile({
          x: this.x,
          y: this.y,
          vx: Math.cos(ang) * 480,
          vy: Math.sin(ang) * 480,
          damage: 16,
          color: this.color,
          owner: 'enemy',
          radius: 5
        }));
      }
    } else if (this.type === 'sniper') {
      this.shootTimer = 4.0;
      // High-speed sniper dart
      game.projectiles.push(new Projectile({
        x: this.x,
        y: this.y,
        vx: Math.cos(toPlayerAngle) * 780,
        vy: Math.sin(toPlayerAngle) * 780,
        damage: 38,
        color: '#ff007b',
        owner: 'enemy',
        radius: 5
      }));
    } else if (this.type === 'boss_colossus') {
      const isPhase2 = this.bossPhase >= 2;
      this.shootTimer = isPhase2 ? 1.75 : 2.0; // Tuned from 2.4s to 2.0s (Phase 1) and 1.75s (Phase 2)
      // Rotating radial barrage: 8 pellets in Phase 1, 10 pellets in Phase 2
      const count = isPhase2 ? 10 : 8;
      const baseAng = Date.now() * 0.0018;
      const bSpeed = isPhase2 ? 430 : 410; // Tuned from 380 for a touch crisper bullet velocity
      const bDmg = isPhase2 ? 16 : 15;     // Tuned from 14 to 15-16
      for (let i = 0; i < count; i++) {
        const ang = baseAng + (i * (Math.PI * 2 / count));
        game.projectiles.push(new Projectile({
          x: this.x,
          y: this.y,
          vx: Math.cos(ang) * bSpeed,
          vy: Math.sin(ang) * bSpeed,
          damage: bDmg,
          color: isPhase2 ? '#ff7700' : '#ffb700',
          owner: 'enemy',
          radius: 5.5
        }));
      }
    } else if (this.type === 'boss_omega') {
      this.shootTimer = 1.0;
      // Triple spread fire
      for (let i = -1; i <= 1; i++) {
        const ang = toPlayerAngle + i * 0.25;
        game.projectiles.push(new Projectile({
          x: this.x,
          y: this.y,
          vx: Math.cos(ang) * 600,
          vy: Math.sin(ang) * 600,
          damage: 28,
          color: '#aa33ff',
          owner: 'enemy',
          radius: 6
        }));
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Vulnerability glowing aura (if debuffed by ranged fire)
    if (this.vulnerableTimer > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffb700';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = this.color;
    ctx.fillStyle = '#0c101c';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;

    // Draw Shape Geometry
    if (this.type === 'scout') {
      // Sleek hostile triangle
      ctx.beginPath();
      ctx.moveTo(this.radius, 0);
      ctx.lineTo(-this.radius, -this.radius * 0.8);
      ctx.lineTo(-this.radius * 0.5, 0);
      ctx.lineTo(-this.radius, this.radius * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'cube') {
      // Armored square
      ctx.beginPath();
      ctx.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
      ctx.fill();
      ctx.stroke();

      // Frontal shield barrier arc
      if (this.hasFrontalShield) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 5, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
      }
    } else if (this.type === 'pentagon') {
      // 5-sided polygon
      drawPolygon(ctx, 0, 0, this.radius, 5);
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'sniper') {
      // 6-sided hexagon
      drawPolygon(ctx, 0, 0, this.radius, 6);
      ctx.fill();
      ctx.stroke();

      // Inner reticle core
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'rhombus') {
      // Diamond
      ctx.beginPath();
      ctx.moveTo(this.radius, 0);
      ctx.lineTo(0, -this.radius * 0.7);
      ctx.lineTo(-this.radius, 0);
      ctx.lineTo(0, this.radius * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'boss_colossus') {
      // Massive Octagon with rotating plates
      drawPolygon(ctx, 0, 0, this.radius, 8);
      ctx.fill();
      ctx.stroke();

      // Core eye (overcharged in Phase 2)
      ctx.fillStyle = this.bossPhase >= 2 ? '#ff1144' : '#ff3366';
      ctx.shadowColor = this.bossPhase >= 2 ? '#ff1144' : '#ff3366';
      ctx.shadowBlur = this.bossPhase >= 2 ? 18 : 8;
      ctx.beginPath();
      ctx.arc(0, 0, this.bossPhase >= 2 ? 18 : 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'boss_omega') {
      // Massive Dark Apex Triangle
      ctx.beginPath();
      ctx.moveTo(this.radius, 0);
      ctx.lineTo(-this.radius, -this.radius * 0.9);
      ctx.lineTo(-this.radius * 0.4, 0);
      ctx.lineTo(-this.radius, this.radius * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing twin energy blades
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.strokeRect(-this.radius - 10, -8, 8, 16);
    }

    ctx.restore();

    // Health bar for tougher enemies & bosses
    if (this.health < this.maxHealth || this.isBoss) {
      const barW = this.radius * 2;
      const barH = this.isBoss ? 8 : 4;
      const pct = Math.max(0, this.health / this.maxHealth);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(this.x - barW / 2, this.y - this.radius - 12, barW, barH);
      ctx.fillStyle = this.isBoss ? '#aa33ff' : '#ff3366';
      ctx.fillRect(this.x - barW / 2, this.y - this.radius - 12, barW * pct, barH);
    }
  }
}

/**
 * PROJECTILE CLASS
 */
class Projectile {
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.vx = opts.vx;
    this.vy = opts.vy;
    this.damage = opts.damage || 20;
    this.color = opts.color || '#00f0ff';
    this.owner = opts.owner || 'player'; // 'player' or 'enemy'
    this.radius = opts.radius || 4;
    this.pierce = opts.pierce || 0;
    this.homing = opts.homing || false;
    this.isMeleeWave = opts.isMeleeWave || false;
    this.isVoidOrb = opts.isVoidOrb || false;
    this.pullRadius = opts.pullRadius || 180;
    this.pullForce = opts.pullForce || 400;
    this.cluster = opts.cluster || false;
    this.lifetime = opts.lifetime || 3.0;
    this.knockback = opts.knockback || 0;
    this.dead = false;
  }

  update(dt, game) {
    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.destroy(game);
      return;
    }

    // Homing logic (for Swarm Seekers - Balanced forward perception & graceful curve)
    if (this.homing && this.owner === 'player') {
      let nearest = null;
      let minDist = 460;
      const curAngle = Math.atan2(this.vy, this.vx);

      game.enemies.forEach(e => {
        if (!e || e.hp <= 0 || e.isDying) return;
        const d = dist(this.x, this.y, e.x, e.y);
        if (d < minDist) {
          // Forward vision cone: only acquire targets within ~74 degrees of missile flight heading
          const angToEnemy = Math.atan2(e.y - this.y, e.x - this.x);
          const angleDiff = Math.abs(normalizeAngle(angToEnemy - curAngle));
          if (angleDiff < 1.3) {
            minDist = d;
            nearest = e;
          }
        }
      });

      if (nearest) {
        const targetAngle = Math.atan2(nearest.y - this.y, nearest.x - this.x);
        const diff = normalizeAngle(targetAngle - curAngle);
        const newAngle = curAngle + diff * dt * 2.9; // Balanced curving rate (was 4.5) to prevent impossible right-angle turns
        const speed = Math.hypot(this.vx, this.vy);
        this.vx = Math.cos(newAngle) * speed;
        this.vy = Math.sin(newAngle) * speed;

        // Smoke spark
        if (Math.random() < 0.35) {
          game.spawnParticle(this.x, this.y, 'smoke', {
            vx: -this.vx * 0.2,
            vy: -this.vy * 0.2,
            color: '#ff3366',
            size: 2.5,
            life: 0.2
          });
        }
      }
    }

    // Void vortex singularity pulling nearby enemies
    if (this.isVoidOrb) {
      game.enemies.forEach(e => {
        const d = dist(this.x, this.y, e.x, e.y);
        if (d < this.pullRadius && d > 5) {
          const ang = Math.atan2(this.y - e.y, this.x - e.x);
          const force = (1 - (d / this.pullRadius)) * this.pullForce * dt;
          e.x += Math.cos(ang) * force;
          e.y += Math.sin(ang) * force;
        }
      });
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Boundary check
    if (this.x < 0 || this.x > game.width || this.y < 0 || this.y > game.height) {
      this.dead = true;
    }
  }

  destroy(game) {
    this.dead = true;

    // Void orb detonation (balanced damage and shockwave radius)
    if (this.isVoidOrb) {
      game.spawnShockwave(this.x, this.y, 95, '#aa33ff', Math.round(this.damage * 0.65));
      window.soundEngine.playExplosion();
    }

    // Cluster missile split (balanced shard count)
    if (this.cluster) {
      const shardCount = this.isVoidOrb ? 2 : 4;
      for (let i = 0; i < shardCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        game.projectiles.push(new Projectile({
          x: this.x,
          y: this.y,
          vx: Math.cos(ang) * 360,
          vy: Math.sin(ang) * 360,
          damage: this.damage * 0.3,
          color: this.color,
          owner: 'player',
          radius: 3,
          lifetime: 0.6
        }));
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isMeleeWave) {
      // Curved razor wave projectile
      const ang = Math.atan2(this.vy, this.vx);
      ctx.rotate(ang);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 16, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    } else if (this.isVoidOrb) {
      // Swirling gravity orb
      ctx.fillStyle = '#aa33ff';
      ctx.shadowColor = '#aa33ff';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Standard energy pellet / bolt
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

/**
 * GEM / SCRAP PICKUP CLASS
 */
class Gem {
  constructor(x, y, value) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.vx = (Math.random() - 0.5) * 80;
    this.vy = (Math.random() - 0.5) * 80;
    this.radius = 5;
    this.color = '#00ff88';
    this.dead = false;
    this.pulse = Math.random() * Math.PI * 2;
    this.isVacuumed = false;
  }

  update(dt, player) {
    this.pulse += dt * 4;
    this.vx *= 0.95;
    this.vy *= 0.95;

    // Magnetic pull toward player
    const d = dist(this.x, this.y, player.x, player.y);
    const pullRadius = player.magnetRadius || 180;
    const speedMult = player.magnetSpeedBonus || 1.0;

    if (this.isVacuumed || d < pullRadius) {
      const ang = Math.atan2(player.y - this.y, player.x - this.x);
      const accel = this.isVacuumed ? 1500 : (((1 - (d / pullRadius)) * 1000) + 320) * speedMult;
      this.vx += Math.cos(ang) * accel * dt;
      this.vy += Math.sin(ang) * accel * dt;

      // Legendary Magnet Perk: Magnetized gems shred enemies they pass through (balanced kinetic damage)
      if (player.gemKineticDamage && window.gameInstance && window.gameInstance.enemies) {
        const enemies = window.gameInstance.enemies;
        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (dist(this.x, this.y, e.x, e.y) < e.radius + this.radius + 6) {
            e.takeDamage(player.gemKineticDamage * dt * 8, window.gameInstance, 'gem');
            if (Math.random() < 0.2) {
              window.gameInstance.spawnSparks(this.x, this.y, '#00ff88', 2);
            }
            break;
          }
        }
      }
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Pickup collection check
    if (d < player.radius + this.radius + 8) {
      this.dead = true;
      player.addXP(this.value, window.gameInstance);
      if (player.gemSiphonEnergy) {
        const energyGain = player.gemEnergySiphon !== undefined ? player.gemEnergySiphon : (player.gemSiphonAmount || 1.0);
        const shieldGain = player.gemShieldSiphon !== undefined ? player.gemShieldSiphon : (player.gemSiphonAmount ? player.gemSiphonAmount * 0.35 : 0.4);
        player.energy = Math.min(player.maxEnergy, player.energy + energyGain);
        if (player.shield < player.maxShield) {
          player.shield = Math.min(player.maxShield, player.shield + shieldGain);
        }
      }
      window.soundEngine.playGemPickup();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8 + Math.sin(this.pulse) * 4;

    // Tiny glowing rhombus gem
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius, 0);
    ctx.lineTo(0, this.radius);
    ctx.lineTo(-this.radius, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/**
 * PARTICLE & FLOATING TEXT ENGINE
 */
class Particle {
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.vx = opts.vx || 0;
    this.vy = opts.vy || 0;
    this.color = opts.color || '#fff';
    this.size = opts.size || 3;
    this.life = opts.life || 0.4;
    this.maxLife = this.life;
    this.decay = opts.decay || 1.0;
    this.type = opts.type || 'spark';
    this.dead = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.dead = true;
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.96;
    this.vy *= 0.96;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class FloatingText {
  constructor(x, y, text, color, fontSize = 16) {
    this.x = x + (Math.random() - 0.5) * 16;
    this.y = y;
    this.text = text;
    this.color = color;
    this.fontSize = fontSize;
    this.life = fontSize > 20 ? 1.5 : 0.9;
    this.maxLife = this.life;
    this.dead = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.dead = true;
    }
    this.y -= dt * (this.fontSize > 20 ? 28 : 45); // float upwards
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${this.fontSize}px "Orbitron", "Rajdhani", sans-serif`;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.fontSize > 20 ? 14 : 6;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// Helper: Polygon drawing
function drawPolygon(ctx, x, y, radius, sides) {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (i * 2 * Math.PI) / sides;
    const px = x + radius * Math.cos(a);
    const py = y + radius * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// Helper: Point to line segment distance
function pointToSegmentDist(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return dist(px, py, x1, y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist(px, py, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
}