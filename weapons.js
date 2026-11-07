/**
 * TRI-VERTEX // WEAPONS & COMBAT SYSTEM
 * Detailed data structures and combat handlers for Melee & Far-Range weapons.
 */

const WEAPONS = {
  // ===================================================================
  // MELEE WEAPONS
  // ===================================================================
  katana: {
    id: 'katana',
    name: 'Cyber Katana',
    type: 'melee',
    icon: 'icon-sword',
    color: '#00f0ff',
    trailColor: 'rgba(0, 240, 255, 0.6)',
    damage: 65,
    cooldown: 0.28, // seconds
    range: 110,
    arcAngle: Math.PI * 0.85, // ~150 degrees slash
    duration: 0.16,
    deflectsBullets: true,
    knockback: 140,
    description: 'Rapid wide-arc energy slash. Deflects incoming enemy fire back at attackers as critical shards.',
    sound: 'playSwordSlash'
  },
  lance: {
    id: 'lance',
    name: 'Hyper Lance',
    type: 'melee',
    icon: 'icon-sword',
    color: '#00ff88',
    trailColor: 'rgba(0, 255, 136, 0.6)',
    damage: 130,
    cooldown: 0.52,
    range: 165,
    arcAngle: Math.PI * 0.22, // Focused thrust forward
    duration: 0.18,
    deflectsBullets: false,
    knockback: 280,
    lungeForce: 240, // Thrusts triangle forward
    tipCritMultiplier: 2.2, // Bonus for tip precision
    description: 'Long-range kinetic impale. Lunges forward on strike; deals 2.2x critical damage at the apex tip.',
    sound: 'playSpearThrust'
  },
  hammer: {
    id: 'hammer',
    name: 'Titan Smasher',
    type: 'melee',
    icon: 'icon-sword',
    color: '#ffb700',
    trailColor: 'rgba(255, 183, 0, 0.7)',
    damage: 195,
    cooldown: 0.95,
    range: 135,
    arcAngle: Math.PI * 2, // Full 360 circle cleave shockwave
    duration: 0.26,
    deflectsBullets: true,
    knockback: 450,
    shockwaveRadius: 140,
    description: 'Heavy seismic cleave. Creates a 360-degree crushing shockwave with massive knockback.',
    sound: 'playHammerSmash'
  },
  glaives: {
    id: 'glaives',
    name: 'Orbiting Glaives',
    type: 'melee',
    icon: 'icon-sword',
    color: '#aa33ff',
    trailColor: 'rgba(170, 51, 255, 0.6)',
    damage: 48,
    cooldown: 0.35,
    range: 95,
    arcAngle: Math.PI * 1.2,
    duration: 0.2,
    deflectsBullets: true,
    knockback: 90,
    orbitBladesCount: 3,
    description: 'Three passive spinning razor blades orbit the ship. Clicking unleashes an overclocked radial sweep.',
    sound: 'playGlaiveSpin'
  },

  // ===================================================================
  // FAR-RANGE WEAPONS
  // ===================================================================
  railgun: {
    id: 'railgun',
    name: 'Pulse Beam',
    type: 'ranged',
    icon: 'icon-crosshair',
    color: '#00f0ff',
    damage: 180,
    cooldown: 0.9,
    energyCost: 15,
    projectileSpeed: 2200,
    piercing: true,
    pierceCount: 999, // Infinite penetration through all targets in line
    range: 1500,
    shake: 8,
    description: 'Fires an instantaneous hyper-velocity particle beam that pierces through every enemy in its path. Consumes 15 Energy.',
    sound: 'playRailgunFire'
  },
  seekers: {
    id: 'seekers',
    name: 'Swarm Seekers',
    type: 'ranged',
    icon: 'icon-crosshair',
    color: '#ff3366',
    damage: 17,
    cooldown: 0.90,
    energyCost: 14,
    projectilesPerShot: 3,
    spread: 0.65,
    homing: true,
    projectileSpeed: 430,
    lifetime: 1.6,
    description: 'Launches a trio of agile micro-missiles from rear stabilizers that curve towards targets within their forward cone. Consumes 14 Energy.',
    sound: 'playMissileLaunch'
  },
  tri_laser: {
    id: 'tri_laser',
    name: 'Tri-Repeater',
    type: 'ranged',
    icon: 'icon-crosshair',
    color: '#00ff88',
    damage: 32,
    cooldown: 0.14,
    energyCost: 3,
    projectilesPerShot: 3,
    spread: 0.16,
    projectileSpeed: 950,
    lifetime: 1.8,
    description: 'High-frequency rotary laser discharging a continuous spray of rapid coherent plasma bolts. Consumes 3 Energy.',
    sound: 'playLaserShot'
  },
  flak: {
    id: 'flak',
    name: 'Scatter Flak',
    type: 'ranged',
    icon: 'icon-crosshair',
    color: '#ffb700',
    damage: 16,
    cooldown: 0.82,
    energyCost: 12,
    projectilesPerShot: 7,
    spread: 0.58,
    projectileSpeed: 720,
    lifetime: 0.55,
    knockback: 140,
    description: 'Kinetic shotgun blast spraying a spread of shrapnel at close-to-medium range. Consumes 12 Energy.',
    sound: 'playFlakShot'
  },
  void_orb: {
    id: 'void_orb',
    name: 'Void Vortex',
    type: 'ranged',
    icon: 'icon-crosshair',
    color: '#aa33ff',
    damage: 36,
    cooldown: 1.85,
    energyCost: 22,
    projectileSpeed: 340,
    lifetime: 1.8,
    pullRadius: 120,
    pullForce: 190,
    description: 'Launches a tactical gravity orb that creates a localized vortex to group nearby enemies before detonating. Consumes 22 Energy.',
    sound: 'playVoidShot'
  }
};

/**
 * UPGRADE AUGMENTS (Tiered Roguelike Card Draft Trees)
 * Each power-up line progresses sequentially: Tier 1 -> Tier 2 -> Tier 3 -> Tier 4 -> Tier 5.
 * Higher tiers only unlock after acquiring the previous tier.
 * Acquired tiers are NEVER reshown in that round.
 */
const UPGRADE_TREES = {
  // 1. MAGNETIC HARVESTER MATRIX (5 TIERS)
  magnet: {
    id: 'magnet',
    name: 'Magnetic Harvester',
    category: 'magnet',
    iconSvg: '#icon-magnet',
    tiers: [
      {
        treeId: 'magnet',
        tier: 1,
        maxTier: 5,
        id: 'magnet_t1',
        title: 'Ferrite Magnet Core',
        category: 'magnet',
        iconSvg: '#icon-magnet',
        rarity: 'common',
        desc: 'Emits a 360px vacuum pulse pulling nearby gems. Permanently expands magnet radius by +45px and pull speed by +15%.',
        apply: (player, game) => {
          player.magnetRadius = Math.min(480, (player.magnetRadius || 180) + 45);
          player.magnetSpeedBonus = Math.min(2.2, (player.magnetSpeedBonus || 1.0) * 1.15);
          player.hasMagnetPower = true;
          if (player.triggerVacuumMagnet) {
            player.triggerVacuumMagnet(game || window.gameInstance, 360, 750, 'COMMON MAGNET PULSE!', '#b0c4de', false);
          }
        }
      },
      {
        treeId: 'magnet',
        tier: 2,
        maxTier: 5,
        id: 'magnet_t2',
        title: 'Neodymium Flux Pulser',
        category: 'magnet',
        iconSvg: '#icon-magnet',
        rarity: 'uncommon',
        desc: 'Discharges a 500px magnetic wave pulling local gems. Expands magnet radius by +70px and accelerates gem homing speed by +25%.',
        apply: (player, game) => {
          player.magnetRadius = Math.min(480, (player.magnetRadius || 180) + 70);
          player.magnetSpeedBonus = Math.min(2.2, (player.magnetSpeedBonus || 1.0) * 1.25);
          player.hasMagnetPower = true;
          if (player.triggerVacuumMagnet) {
            player.triggerVacuumMagnet(game || window.gameInstance, 500, 900, 'UNCOMMON MAGNET WAVE!', '#00ff88', false);
          }
        }
      },
      {
        treeId: 'magnet',
        tier: 3,
        maxTier: 5,
        id: 'magnet_t3',
        title: 'Quantum Magnet Field',
        category: 'magnet',
        iconSvg: '#icon-magnet',
        rarity: 'rare',
        desc: 'Fires a wide 680px quantum sweep pulling combat gems. Adds +100px magnet radius and +40% pull speed.',
        apply: (player, game) => {
          player.magnetRadius = Math.min(480, (player.magnetRadius || 180) + 100);
          player.magnetSpeedBonus = Math.min(2.2, (player.magnetSpeedBonus || 1.0) * 1.40);
          player.hasMagnetPower = true;
          if (player.triggerVacuumMagnet) {
            player.triggerVacuumMagnet(game || window.gameInstance, 680, 1100, 'RARE QUANTUM SWEEP!', '#00f0ff', false);
          }
        }
      },
      {
        treeId: 'magnet',
        tier: 4,
        maxTier: 5,
        id: 'magnet_t4',
        title: 'Vortex Siphon Matrix',
        category: 'magnet',
        iconSvg: '#icon-magnet',
        rarity: 'epic',
        desc: 'Fires an 850px sector vacuum pulse. Adds +130px magnet radius, +60% pull speed, and collected gems restore +0.75 Energy & +0.4 Shield.',
        apply: (player, game) => {
          player.magnetRadius = Math.min(480, (player.magnetRadius || 180) + 130);
          player.magnetSpeedBonus = Math.min(2.2, (player.magnetSpeedBonus || 1.0) * 1.60);
          player.gemSiphonEnergy = true;
          player.gemEnergySiphon = Math.max(player.gemEnergySiphon || 0, 0.75);
          player.gemShieldSiphon = Math.max(player.gemShieldSiphon || 0, 0.4);
          player.hasMagnetPower = true;
          if (player.triggerVacuumMagnet) {
            player.triggerVacuumMagnet(game || window.gameInstance, 850, 1250, 'EPIC VORTEX SIPHON!', '#aa33ff', false);
          }
        }
      },
      {
        treeId: 'magnet',
        tier: 5,
        maxTier: 5,
        id: 'magnet_t5',
        title: 'Singularity Apex Harvester',
        category: 'magnet',
        iconSvg: '#icon-magnet',
        rarity: 'legendary',
        desc: 'Summons an immense full-arena gravitational singularity. Adds +170px radius, +85% speed, restores +1.5 Energy & +0.8 Shield per gem, and incoming gems deal 12 kinetic damage.',
        apply: (player, game) => {
          player.magnetRadius = Math.min(500, (player.magnetRadius || 180) + 170);
          player.magnetSpeedBonus = Math.min(2.4, (player.magnetSpeedBonus || 1.0) * 1.85);
          player.gemSiphonEnergy = true;
          player.gemEnergySiphon = 1.5;
          player.gemShieldSiphon = 0.8;
          player.gemKineticDamage = 12;
          player.hasMagnetPower = true;
          if (player.triggerVacuumMagnet) {
            player.triggerVacuumMagnet(game || window.gameInstance, 1400, 1500, 'LEGENDARY APEX SINGULARITY!', '#ffb700', true);
          }
        }
      }
    ]
  },

  // 2. PHASE DASH MOBILITY (4 TIERS)
  dash: {
    id: 'dash',
    name: 'Phase Dash Mobility',
    category: 'mobility',
    iconSvg: '#icon-zap',
    tiers: [
      {
        treeId: 'dash',
        tier: 1,
        maxTier: 4,
        id: 'dash_t1',
        title: 'Reflex Thrusters',
        category: 'mobility',
        iconSvg: '#icon-zap',
        rarity: 'common',
        desc: 'Reduces Phase Dash cooldown by 18% and increases dash speed & distance by +20%.',
        apply: (player) => {
          player.dashCooldownMax *= 0.82;
          player.dashSpeedMult = (player.dashSpeedMult || 1) * 1.20;
        }
      },
      {
        treeId: 'dash',
        tier: 2,
        maxTier: 4,
        id: 'dash_t2',
        title: 'Decoy Afterburner',
        category: 'mobility',
        iconSvg: '#icon-zap',
        rarity: 'uncommon',
        desc: 'Reduces Phase Dash cooldown by 25% and leaves a holographic decoy at dash origin that draws enemy fire and detonates.',
        apply: (player) => {
          player.dashCooldownMax *= 0.75;
          player.hasDashDecoy = true;
        }
      },
      {
        treeId: 'dash',
        tier: 3,
        maxTier: 4,
        id: 'dash_t3',
        title: 'Ion Trail Scorch',
        category: 'mobility',
        iconSvg: '#icon-zap',
        rarity: 'rare',
        desc: 'Reduces Phase Dash cooldown by 32% and drops an ionized plasma trail scorching foes who pass through.',
        apply: (player) => {
          player.dashCooldownMax *= 0.68;
          player.hasDashPlasmaTrail = true;
        }
      },
      {
        treeId: 'dash',
        tier: 4,
        maxTier: 4,
        id: 'dash_t4',
        title: 'Lightning Arc Phase Shift',
        category: 'mobility',
        iconSvg: '#icon-zap',
        rarity: 'legendary',
        desc: 'Reduces Phase Dash cooldown by 45%. Drops crackling continuous high-voltage electricity and lightning arcs that shock, electrocute (140 DPS), and slow enemies!',
        apply: (player) => {
          player.dashCooldownMax *= 0.55;
          player.hasLightningDash = true;
          player.hasDashDecoy = true;
          player.hasDashPlasmaTrail = true;
        }
      }
    ]
  },

  // 3. MELEE KINETIC REACH & FORCE (4 TIERS)
  melee_reach: {
    id: 'melee_reach',
    name: 'Kinetic Reach',
    category: 'melee',
    iconSvg: '#icon-sword',
    tiers: [
      {
        treeId: 'melee_reach',
        tier: 1,
        maxTier: 4,
        id: 'reach_t1',
        title: 'Kinetic Reach',
        category: 'melee',
        iconSvg: '#icon-sword',
        rarity: 'common',
        desc: 'Increases all melee weapon strike range and arc by +20%.',
        apply: (player) => {
          player.meleeRangeMult = (player.meleeRangeMult || 1) * 1.20;
        }
      },
      {
        treeId: 'melee_reach',
        tier: 2,
        maxTier: 4,
        id: 'reach_t2',
        title: 'Plasma Edge',
        category: 'melee',
        iconSvg: '#icon-sword',
        rarity: 'uncommon',
        desc: 'Increases melee reach and strike arc by an additional +25% and boosts melee weapon damage by +18%.',
        apply: (player) => {
          player.meleeRangeMult = (player.meleeRangeMult || 1) * 1.25;
          player.meleeDamageMult = (player.meleeDamageMult || 1) * 1.18;
        }
      },
      {
        treeId: 'melee_reach',
        tier: 3,
        maxTier: 4,
        id: 'reach_t3',
        title: 'Vorpal Arc',
        category: 'melee',
        iconSvg: '#icon-sword',
        rarity: 'rare',
        desc: 'Melee slashes unleash a razor wave projectile dealing 50% damage downrange.',
        apply: (player) => {
          player.hasVorpalWave = true;
          player.meleeRangeMult = (player.meleeRangeMult || 1) * 1.15;
        }
      },
      {
        treeId: 'melee_reach',
        tier: 4,
        maxTier: 4,
        id: 'reach_t4',
        title: 'Apex Blade Mastery',
        category: 'melee',
        iconSvg: '#icon-sword',
        rarity: 'legendary',
        desc: 'Vorpal razor waves pierce infinitely through all enemies, and melee eliminations trigger an explosive kinetic nova dealing 60 damage.',
        apply: (player) => {
          player.vorpalInfinitePierce = true;
          player.meleeExplosiveNova = true;
          player.meleeDamageMult = (player.meleeDamageMult || 1) * 1.25;
        }
      }
    ]
  },

  // 4. MELEE PARRY & SIPHON DEFENSE (4 TIERS)
  melee_defense: {
    id: 'melee_defense',
    name: 'Parry & Siphon',
    category: 'melee',
    iconSvg: '#icon-shield',
    tiers: [
      {
        treeId: 'melee_defense',
        tier: 1,
        maxTier: 4,
        id: 'parry_t1',
        title: 'Kinetic Deflector',
        category: 'melee',
        iconSvg: '#icon-shield',
        rarity: 'common',
        desc: 'Deflected enemy projectiles travel +35% faster and deal +60% bonus deflection damage.',
        apply: (player) => {
          player.deflectSpeedMult = 1.35;
          player.deflectDamageBonus = (player.deflectDamageBonus || 1) * 1.6;
        }
      },
      {
        treeId: 'melee_defense',
        tier: 2,
        maxTier: 4,
        id: 'parry_t2',
        title: 'Nanite Siphon',
        category: 'melee',
        iconSvg: '#icon-heart',
        rarity: 'uncommon',
        desc: 'Melee weapon eliminations restore 8 Hull HP and 15 Shield immediately.',
        apply: (player) => {
          player.meleeLifesteal = (player.meleeLifesteal || 0) + 8;
        }
      },
      {
        treeId: 'melee_defense',
        tier: 3,
        maxTier: 4,
        id: 'parry_t3',
        title: 'Aegis Counterpulse',
        category: 'melee',
        iconSvg: '#icon-shield',
        rarity: 'rare',
        desc: 'Parrying hostile bullets releases an emergency EMP radial shockwave that clears nearby enemy fire.',
        apply: (player) => {
          player.deflectCounterPulse = true;
          player.meleeLifesteal = (player.meleeLifesteal || 0) + 4;
        }
      },
      {
        treeId: 'melee_defense',
        tier: 4,
        maxTier: 4,
        id: 'parry_t4',
        title: 'Parry Overclock',
        category: 'melee',
        iconSvg: '#icon-sparkles',
        rarity: 'legendary',
        desc: 'Deflected enemy projectiles deal 350% critical damage and violently explode on contact.',
        apply: (player) => {
          player.deflectAmplified = true;
          player.deflectExplosions = true;
        }
      }
    ]
  },

  // 5. RANGED FIREPOWER & MULTISHOT (4 TIERS)
  ranged_firepower: {
    id: 'ranged_firepower',
    name: 'Ranged Firepower',
    category: 'ranged',
    iconSvg: '#icon-crosshair',
    tiers: [
      {
        treeId: 'ranged_firepower',
        tier: 1,
        maxTier: 4,
        id: 'ranged_fp_t1',
        title: 'High Caliber Drill',
        category: 'ranged',
        iconSvg: '#icon-crosshair',
        rarity: 'common',
        desc: 'All ranged projectiles pierce through +1 additional enemy.',
        apply: (player) => {
          player.bonusPiercing = (player.bonusPiercing || 0) + 1;
        }
      },
      {
        treeId: 'ranged_firepower',
        tier: 2,
        maxTier: 4,
        id: 'ranged_fp_t2',
        title: 'Overclocked Accelerators',
        category: 'ranged',
        iconSvg: '#icon-crosshair',
        rarity: 'uncommon',
        desc: 'Ranged projectile velocity increased by +25% and ranged weapon damage increased by +18%.',
        apply: (player) => {
          player.projectileSpeedMult = (player.projectileSpeedMult || 1) * 1.25;
          player.rangedDamageMult = (player.rangedDamageMult || 1) * 1.18;
        }
      },
      {
        treeId: 'ranged_firepower',
        tier: 3,
        maxTier: 4,
        id: 'ranged_fp_t3',
        title: 'Twin Barrel Matrix',
        category: 'ranged',
        iconSvg: '#icon-crosshair',
        rarity: 'rare',
        desc: 'All ranged weapons fire +1 additional projectile per discharge.',
        apply: (player) => {
          player.extraProjectiles = (player.extraProjectiles || 0) + 1;
        }
      },
      {
        treeId: 'ranged_firepower',
        tier: 4,
        maxTier: 4,
        id: 'ranged_fp_t4',
        title: 'Cluster Warhead',
        category: 'ranged',
        iconSvg: '#icon-crosshair',
        rarity: 'legendary',
        desc: 'Seeker missiles and void orbs release homing mini-shards upon detonation, and projectiles pierce +1 extra enemy.',
        apply: (player) => {
          player.clusterExplosions = true;
          player.bonusPiercing = (player.bonusPiercing || 0) + 1;
        }
      }
    ]
  },

  // 6. RANGED BEAM & THERMAL PLASMA (3 TIERS)
  ranged_energy: {
    id: 'ranged_energy',
    name: 'Thermal Laser',
    category: 'ranged',
    iconSvg: '#icon-flame',
    tiers: [
      {
        treeId: 'ranged_energy',
        tier: 1,
        maxTier: 3,
        id: 'ranged_energy_t1',
        title: 'Ion Ionization',
        category: 'ranged',
        iconSvg: '#icon-flame',
        rarity: 'common',
        desc: 'Ranged hits inflict Vulnerability for +3.5 seconds, making enemies take +60% bonus Melee combo damage.',
        apply: (player) => {
          player.vulnerabilityBonus = 1.6;
          player.vulnerabilityDuration = 3.5;
        }
      },
      {
        treeId: 'ranged_energy',
        tier: 2,
        maxTier: 3,
        id: 'ranged_energy_t2',
        title: 'Thermal Efficiency',
        category: 'ranged',
        iconSvg: '#icon-flame',
        rarity: 'uncommon',
        desc: 'Reduces energy cost of all ranged weapons by 25% and expands beam impact width.',
        apply: (player) => {
          player.rangedEnergyDiscount = 0.75;
        }
      },
      {
        treeId: 'ranged_energy',
        tier: 3,
        maxTier: 3,
        id: 'ranged_energy_t3',
        title: 'Hyper Discharge',
        category: 'ranged',
        iconSvg: '#icon-flame',
        rarity: 'epic',
        desc: 'Railgun and ranged lasers leave a lingering crackling electric plasma trail that scorches enemies.',
        apply: (player) => {
          player.hasPlasmaTrail = true;
        }
      }
    ]
  },

  // 7. AEGIS CAPACITOR & HULL SHIELDS (4 TIERS)
  defense_shield: {
    id: 'defense_shield',
    name: 'Aegis Shields',
    category: 'defense',
    iconSvg: '#icon-shield',
    tiers: [
      {
        treeId: 'defense_shield',
        tier: 1,
        maxTier: 4,
        id: 'shield_t1',
        title: 'Aegis Capacitor',
        category: 'defense',
        iconSvg: '#icon-shield',
        rarity: 'common',
        desc: 'Increases max Shield by +40 and accelerates shield recharge delay by 15%.',
        apply: (player) => {
          player.maxShield += 40;
          player.shield = Math.min(player.shield + 40, player.maxShield);
          player.shieldRechargeDelay = Math.max(1.2, player.shieldRechargeDelay * 0.85);
        }
      },
      {
        treeId: 'defense_shield',
        tier: 2,
        maxTier: 4,
        id: 'shield_t2',
        title: 'Composite Plating',
        category: 'defense',
        iconSvg: '#icon-shield',
        rarity: 'uncommon',
        desc: 'Increases max Shield by +45, max Hull HP by +30, and boosts shield recharge speed by +25%.',
        apply: (player) => {
          player.maxShield += 45;
          player.maxHealth += 30;
          player.health = Math.min(player.health + 30, player.maxHealth);
          player.shield = Math.min(player.shield + 45, player.maxShield);
          player.shieldRechargeRate = (player.shieldRechargeRate || 45) * 1.25;
        }
      },
      {
        treeId: 'defense_shield',
        tier: 3,
        maxTier: 4,
        id: 'shield_t3',
        title: 'Kinetic Barrier',
        category: 'defense',
        iconSvg: '#icon-shield',
        rarity: 'rare',
        desc: 'Increases max Shield by +60, and breaking shields triggers a reactive knockback shockwave.',
        apply: (player) => {
          player.maxShield += 60;
          player.shield = Math.min(player.shield + 60, player.maxShield);
          player.hasShieldNova = true;
        }
      },
      {
        treeId: 'defense_shield',
        tier: 4,
        maxTier: 4,
        id: 'shield_t4',
        title: 'Bulwark Matrix',
        category: 'defense',
        iconSvg: '#icon-shield',
        rarity: 'epic',
        desc: 'Increases max Shield by +80 and shields regenerate even during combat fire at 50% rate.',
        apply: (player) => {
          player.maxShield += 80;
          player.shield = Math.min(player.shield + 80, player.maxShield);
          player.combatShieldRegen = true;
        }
      }
    ]
  },

  // 8. ENERGY REACTOR (3 TIERS)
  utility_reactor: {
    id: 'utility_reactor',
    name: 'Energy Reactor',
    category: 'utility',
    iconSvg: '#icon-zap',
    tiers: [
      {
        treeId: 'utility_reactor',
        tier: 1,
        maxTier: 3,
        id: 'reactor_t1',
        title: 'Capacitor Booster',
        category: 'utility',
        iconSvg: '#icon-zap',
        rarity: 'common',
        desc: 'Expands Energy capacity by +25 and boosts Energy recharge rate by +25%.',
        apply: (player) => {
          player.maxEnergy += 25;
          player.energy = Math.min(player.maxEnergy, player.energy + 25);
          player.energyRegenRate *= 1.25;
        }
      },
      {
        treeId: 'utility_reactor',
        tier: 2,
        maxTier: 3,
        id: 'reactor_t2',
        title: 'Plasma Reactor',
        category: 'utility',
        iconSvg: '#icon-zap',
        rarity: 'rare',
        desc: 'Expands Energy capacity by +35 and boosts Energy recharge speed by +50%.',
        apply: (player) => {
          player.maxEnergy += 35;
          player.energy = Math.min(player.maxEnergy, player.energy + 35);
          player.energyRegenRate *= 1.50;
        }
      },
      {
        treeId: 'utility_reactor',
        tier: 3,
        maxTier: 3,
        id: 'reactor_t3',
        title: 'Dark Matter Dynamo',
        category: 'utility',
        iconSvg: '#icon-sparkles',
        rarity: 'epic',
        desc: 'Expands Energy capacity by +50, boosts recharge by +75%, and reduces all weapon energy costs by 20%.',
        apply: (player) => {
          player.maxEnergy += 50;
          player.energy = Math.min(player.maxEnergy, player.energy + 50);
          player.energyRegenRate *= 1.75;
          player.globalEnergyCostMult = 0.8;
        }
      }
    ]
  },

  // 9. FLIGHT AGILITY & COMBAT SYNERGY (3 TIERS)
  utility_agility: {
    id: 'utility_agility',
    name: 'Thruster Agility',
    category: 'utility',
    iconSvg: '#icon-zap',
    tiers: [
      {
        treeId: 'utility_agility',
        tier: 1,
        maxTier: 3,
        id: 'agility_t1',
        title: 'Vectored Thrusters',
        category: 'utility',
        iconSvg: '#icon-zap',
        rarity: 'common',
        desc: 'Increases base triangle flight speed by +20% and handling agility.',
        apply: (player) => {
          player.speedMult = (player.speedMult || 1) * 1.20;
        }
      },
      {
        treeId: 'utility_agility',
        tier: 2,
        maxTier: 3,
        id: 'agility_t2',
        title: 'Slipstream Overdrive',
        category: 'utility',
        iconSvg: '#icon-zap',
        rarity: 'uncommon',
        desc: 'Flight speed increased by +25%, and continuous flight charges a speed slipstream.',
        apply: (player) => {
          player.speedMult = (player.speedMult || 1) * 1.25;
          player.hasSlipstream = true;
        }
      },
      {
        treeId: 'utility_agility',
        tier: 3,
        maxTier: 3,
        id: 'agility_t3',
        title: 'Resonance Driver',
        category: 'synergy',
        iconSvg: '#icon-sparkles',
        rarity: 'epic',
        desc: 'Alternating between melee and ranged strikes yields +75% bonus damage and grants a speed burst.',
        apply: (player) => {
          player.synergyBonus = (player.synergyBonus || 1) + 0.75;
        }
      }
    ]
  }
};

// Flattened pool for backwards compatibility and tests
const UPGRADE_POOL = [];
Object.values(UPGRADE_TREES).forEach(tree => {
  tree.tiers.forEach(tier => {
    UPGRADE_POOL.push(tier);
  });
});