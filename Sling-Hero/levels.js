/**
 * SLING HERO - LEVEL DEFINITIONS & PROGRESSION
 * 15 Handcrafted Adventure Chambers + Procedural Endless Mode
 */

const SLING_LEVELS = [
  // LEVEL 1: First Fling (Basics)
  {
    id: 1,
    name: 'First Fling',
    hint: 'Drag backward and release to launch your hero!',
    parShots: 2,
    playerStart: { x: 140, y: 440 },
    portal: { x: 860, y: 440 },
    stars: [
      { x: 380, y: 380, id: 0 },
      { x: 540, y: 340, id: 1 },
      { x: 700, y: 390, id: 2 }
    ],
    pegs: [],
    bumpers: [],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 480, y: 480, width: 80, height: 80, type: 'wall' }
    ],
    hazards: []
  },

  // LEVEL 2: Ricochet Ramp (Wall Bouncing)
  {
    id: 2,
    name: 'Ricochet Ramp',
    hint: 'Bounce off the top angled wall to reach the lower stars!',
    parShots: 2,
    playerStart: { x: 140, y: 480 },
    portal: { x: 860, y: 480 },
    stars: [
      { x: 380, y: 220, id: 0 },
      { x: 500, y: 150, id: 1 },
      { x: 640, y: 240, id: 2 }
    ],
    pegs: [],
    bumpers: [
      { x: 500, y: 80, radius: 28, power: 1.5 }
    ],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 300, y: 320, width: 400, height: 30, type: 'wall' }
    ],
    hazards: []
  },

  // LEVEL 3: Break the Crates (Destructibles)
  {
    id: 3,
    name: 'Break the Crates',
    hint: 'Slam directly into wooden crates with full power to shatter them!',
    parShots: 3,
    playerStart: { x: 140, y: 460 },
    portal: { x: 880, y: 460 },
    stars: [
      { x: 490, y: 380, id: 0 },
      { x: 490, y: 460, id: 1 },
      { x: 720, y: 440, id: 2 }
    ],
    pegs: [],
    bumpers: [],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      // Destructible wooden wall
      { x: 460, y: 480, width: 60, height: 80, type: 'wood', hp: 1 },
      { x: 460, y: 400, width: 60, height: 80, type: 'wood', hp: 1 },
      { x: 460, y: 320, width: 60, height: 80, type: 'wood', hp: 1 }
    ],
    hazards: []
  },

  // LEVEL 4: Anchor Pegs (Mid-Air Hooking & Re-aiming)
  {
    id: 4,
    name: 'Anchor Pegs',
    hint: 'Fly near the golden peg to latch on, then re-aim and sling again!',
    parShots: 2,
    playerStart: { x: 120, y: 440 },
    portal: { x: 880, y: 440 },
    stars: [
      { x: 320, y: 320, id: 0 },
      { x: 500, y: 190, id: 1 },
      { x: 700, y: 320, id: 2 }
    ],
    pegs: [
      { x: 500, y: 260, radius: 24 }
    ],
    bumpers: [],
    blocks: [
      { x: 0, y: 560, width: 280, height: 60, type: 'wall' },
      { x: 720, y: 560, width: 280, height: 60, type: 'wall' }
    ],
    hazards: [
      // Spike pit between platforms
      { x: 280, y: 580, width: 440, height: 40, type: 'spikes' }
    ]
  },

  // LEVEL 5: Pinball Bumper Alley
  {
    id: 5,
    name: 'Pinball Alley',
    hint: 'Electric bumpers launch you at turbo speed and boost score!',
    parShots: 3,
    playerStart: { x: 120, y: 460 },
    portal: { x: 880, y: 180 },
    stars: [
      { x: 380, y: 280, id: 0 },
      { x: 580, y: 220, id: 1 },
      { x: 740, y: 320, id: 2 }
    ],
    pegs: [],
    bumpers: [
      { x: 360, y: 360, radius: 32, power: 1.8 },
      { x: 560, y: 320, radius: 36, power: 2.0 },
      { x: 720, y: 420, radius: 30, power: 1.8 }
    ],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 0, y: 0, width: 1000, height: 30, type: 'wall' },
      { x: 800, y: 260, width: 200, height: 30, type: 'wall' }
    ],
    hazards: []
  },

  // LEVEL 6: Boost Rings & Gravity
  {
    id: 6,
    name: 'Cannon Boosters',
    hint: 'Fly through the glowing boost rings for supersonic forward thrust!',
    parShots: 2,
    playerStart: { x: 120, y: 460 },
    portal: { x: 900, y: 460 },
    stars: [
      { x: 300, y: 340, id: 0 },
      { x: 540, y: 320, id: 1 },
      { x: 760, y: 340, id: 2 }
    ],
    pegs: [],
    bumpers: [],
    boostRings: [
      { x: 360, y: 380, boostX: 520, boostY: -160, radius: 32 },
      { x: 640, y: 340, boostX: 540, boostY: 60, radius: 32 }
    ],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 460, y: 380, width: 50, height: 180, type: 'wall' }
    ],
    hazards: []
  },

  // LEVEL 7: Laser Gate & Switch
  {
    id: 7,
    name: 'Gatekeeper Switch',
    hint: 'Hit the glowing red switch to deactivate the energy barrier!',
    parShots: 3,
    playerStart: { x: 140, y: 480 },
    portal: { x: 880, y: 480 },
    stars: [
      { x: 440, y: 180, id: 0 },
      { x: 620, y: 460, id: 1 },
      { x: 760, y: 460, id: 2 }
    ],
    pegs: [
      { x: 380, y: 280, radius: 24 }
    ],
    bumpers: [],
    switches: [
      { x: 440, y: 120, radius: 22, gateId: 'gate1' }
    ],
    gates: [
      { id: 'gate1', x: 560, y: 340, width: 24, height: 220 }
    ],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 0, y: 0, width: 1000, height: 30, type: 'wall' },
      { x: 400, y: 180, width: 80, height: 20, type: 'wall' }
    ],
    hazards: []
  },

  // LEVEL 8: Target Smash (Defeat Slime Targets)
  {
    id: 8,
    name: 'Slime Demolition',
    hint: 'Smash all mischievous slimes to open the exit portal!',
    parShots: 3,
    playerStart: { x: 120, y: 460 },
    portal: { x: 880, y: 460, lockedUntilTargets: true },
    stars: [
      { x: 380, y: 460, id: 0 },
      { x: 560, y: 280, id: 1 },
      { x: 740, y: 460, id: 2 }
    ],
    targets: [
      { x: 440, y: 490, radius: 22, hp: 1, name: 'Green Slime' },
      { x: 620, y: 310, radius: 22, hp: 1, name: 'Blue Slime' },
      { x: 780, y: 490, radius: 24, hp: 1, name: 'Red Slime' }
    ],
    pegs: [
      { x: 520, y: 240, radius: 24 }
    ],
    bumpers: [],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 560, y: 360, width: 120, height: 25, type: 'wall' }
    ],
    hazards: []
  },

  // LEVEL 9: Triple Anchor Ascent
  {
    id: 9,
    name: 'Peg Tower Ascent',
    hint: 'Chain multiple grapple pegs to climb high above the spike floor!',
    parShots: 4,
    playerStart: { x: 100, y: 480 },
    portal: { x: 880, y: 140 },
    stars: [
      { x: 300, y: 360, id: 0 },
      { x: 520, y: 240, id: 1 },
      { x: 720, y: 140, id: 2 }
    ],
    pegs: [
      { x: 260, y: 400, radius: 24 },
      { x: 480, y: 280, radius: 24 },
      { x: 700, y: 180, radius: 24 }
    ],
    bumpers: [],
    blocks: [
      { x: 0, y: 560, width: 220, height: 60, type: 'wall' },
      { x: 820, y: 220, width: 180, height: 30, type: 'wall' }
    ],
    hazards: [
      { x: 220, y: 580, width: 780, height: 40, type: 'spikes' }
    ]
  },

  // LEVEL 10: Glass Maze
  {
    id: 10,
    name: 'Glass Cathedral',
    hint: 'Glass barriers shatter like crystals upon impact! Chain consecutive bounces.',
    parShots: 3,
    playerStart: { x: 120, y: 460 },
    portal: { x: 880, y: 460 },
    stars: [
      { x: 360, y: 320, id: 0 },
      { x: 520, y: 320, id: 1 },
      { x: 680, y: 320, id: 2 }
    ],
    pegs: [],
    bumpers: [
      { x: 500, y: 140, radius: 30, power: 1.9 }
    ],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 340, y: 260, width: 30, height: 300, type: 'glass', hp: 1 },
      { x: 500, y: 260, width: 30, height: 300, type: 'glass', hp: 1 },
      { x: 660, y: 260, width: 30, height: 300, type: 'glass', hp: 1 }
    ],
    hazards: []
  },

  // LEVEL 11: TNT Explosions
  {
    id: 11,
    name: 'Explosive Chamber',
    hint: 'Hit red TNT crates to blast clear huge pathways in stone blocks!',
    parShots: 3,
    playerStart: { x: 120, y: 460 },
    portal: { x: 880, y: 460 },
    stars: [
      { x: 360, y: 440, id: 0 },
      { x: 560, y: 360, id: 1 },
      { x: 740, y: 440, id: 2 }
    ],
    pegs: [
      { x: 360, y: 240, radius: 24 }
    ],
    bumpers: [],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 480, y: 360, width: 60, height: 200, type: 'stone', hp: 3 },
      { x: 480, y: 300, width: 60, height: 60, type: 'tnt', hp: 1 }
    ],
    hazards: []
  },

  // LEVEL 12: Narrow Spike Cavern
  {
    id: 12,
    name: 'Precision Cavern',
    hint: 'Delicate, controlled slingshots will safely navigate narrow passages.',
    parShots: 3,
    playerStart: { x: 100, y: 280 },
    portal: { x: 900, y: 280 },
    stars: [
      { x: 340, y: 280, id: 0 },
      { x: 540, y: 280, id: 1 },
      { x: 720, y: 280, id: 2 }
    ],
    pegs: [
      { x: 400, y: 280, radius: 22 },
      { x: 640, y: 280, radius: 22 }
    ],
    bumpers: [],
    blocks: [
      { x: 0, y: 140, width: 1000, height: 40, type: 'wall' },
      { x: 0, y: 420, width: 1000, height: 40, type: 'wall' }
    ],
    hazards: [
      { x: 180, y: 180, width: 640, height: 24, type: 'spikes' },
      { x: 180, y: 396, width: 640, height: 24, type: 'spikes' }
    ]
  },

  // LEVEL 13: Mega Bumper Pinball
  {
    id: 13,
    name: 'Mega Bumper Arena',
    hint: 'Chain ricochets through electric bumpers to trigger all switches!',
    parShots: 3,
    playerStart: { x: 120, y: 480 },
    portal: { x: 880, y: 480 },
    stars: [
      { x: 340, y: 180, id: 0 },
      { x: 500, y: 300, id: 1 },
      { x: 680, y: 180, id: 2 }
    ],
    pegs: [
      { x: 500, y: 220, radius: 24 }
    ],
    bumpers: [
      { x: 320, y: 320, radius: 34, power: 2.1 },
      { x: 680, y: 320, radius: 34, power: 2.1 },
      { x: 500, y: 440, radius: 38, power: 2.2 }
    ],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 0, y: 0, width: 1000, height: 30, type: 'wall' }
    ],
    hazards: []
  },

  // LEVEL 14: Fortified Slime Castle
  {
    id: 14,
    name: 'Slime Citadel',
    hint: 'Shatter barricades, defeat the garrison slimes, and breach the portal!',
    parShots: 4,
    playerStart: { x: 120, y: 460 },
    portal: { x: 900, y: 220, lockedUntilTargets: true },
    stars: [
      { x: 380, y: 360, id: 0 },
      { x: 600, y: 220, id: 1 },
      { x: 780, y: 360, id: 2 }
    ],
    targets: [
      { x: 540, y: 490, radius: 24, hp: 1, name: 'Squire Slime' },
      { x: 740, y: 490, radius: 26, hp: 1, name: 'Knight Slime' }
    ],
    pegs: [
      { x: 420, y: 260, radius: 24 },
      { x: 680, y: 260, radius: 24 }
    ],
    bumpers: [
      { x: 560, y: 140, radius: 32, power: 1.9 }
    ],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 460, y: 380, width: 40, height: 180, type: 'wood', hp: 2 },
      { x: 800, y: 300, width: 200, height: 30, type: 'wall' }
    ],
    hazards: []
  },

  // LEVEL 15: Grand Finale - Sling Champion Citadel
  {
    id: 15,
    name: 'Sling Champion Citadel',
    hint: 'Master every skill: boost rings, anchor pegs, bumpers, and target demolition!',
    parShots: 4,
    playerStart: { x: 120, y: 480 },
    portal: { x: 900, y: 140, lockedUntilTargets: true },
    stars: [
      { x: 340, y: 320, id: 0 },
      { x: 580, y: 200, id: 1 },
      { x: 800, y: 140, id: 2 }
    ],
    targets: [
      { x: 520, y: 490, radius: 28, hp: 2, name: 'Boss Slime King' }
    ],
    pegs: [
      { x: 340, y: 240, radius: 24 },
      { x: 640, y: 200, radius: 24 }
    ],
    bumpers: [
      { x: 480, y: 120, radius: 36, power: 2.2 }
    ],
    boostRings: [
      { x: 200, y: 400, boostX: 580, boostY: -180, radius: 34 }
    ],
    blocks: [
      { x: 0, y: 560, width: 1000, height: 60, type: 'wall' },
      { x: 0, y: 0, width: 1000, height: 30, type: 'wall' },
      { x: 440, y: 340, width: 50, height: 220, type: 'wood', hp: 2 },
      { x: 820, y: 220, width: 180, height: 30, type: 'wall' }
    ],
    hazards: [
      { x: 600, y: 540, width: 180, height: 24, type: 'spikes' }
    ]
  }
];

/**
 * Helper to generate infinite chunks for Endless Fling Tower Mode
 */
function generateEndlessFloor(floorNum, baseHeight) {
  const floorY = baseHeight - floorNum * 400;
  const items = {
    pegs: [],
    bumpers: [],
    stars: [],
    blocks: []
  };

  // Add 1 or 2 pegs
  const pegX = 200 + (floorNum * 170) % 600;
  items.pegs.push({ x: pegX, y: floorY + 180, radius: 24 });

  // Add bumper
  if (floorNum % 2 === 0) {
    items.bumpers.push({
      x: 1000 - pegX,
      y: floorY + 120,
      radius: 30,
      power: 2.0
    });
  }

  // Add stars
  items.stars.push({
    x: 300 + (floorNum * 120) % 400,
    y: floorY + 80,
    id: floorNum * 10
  });

  return items;
}


if (typeof window !== 'undefined') {
  window.SLING_LEVELS = SLING_LEVELS;
  window.generateEndlessFloor = generateEndlessFloor;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SLING_LEVELS, generateEndlessFloor };
}
